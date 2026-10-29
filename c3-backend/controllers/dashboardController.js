import User from '../models/User.js';
import Session from '../models/Session.js';
import Event from '../models/Event.js';
import Application from '../models/Application.js';
import {
  calculateMemberAttendance,
  LOW_ATTENDANCE_THRESHOLD,
  getStartOfDayUTC,
  getAttendanceCutoff,
} from '../utils/attendanceStats.js';
import { getSessionAnnouncements } from '../utils/dateUtils.js';

const sanitizeSessionAnnouncement = (s) => {
  if (!s) return null;
  return {
    _id: s._id,
    topic: s.topic || '',
    handledBy: s.handledBy || '',
    time: s.time || '',
    startTime: s.startTime || '',
    endTime: s.endTime || '',
    venue: s.venue || '',
    message: s.message || '',
    status: s.status || 'scheduled',
    cancelReason: s.cancelReason || '',
    editedAt: s.editedAt || null,
    updatedAt: s.updatedAt || null,
    date: s.date || null,
  };
};

// Short-lived in-memory cache for club-wide public stats (15 seconds TTL)
let clubSharedCache = null;
let clubSharedCacheTime = 0;
const SHARED_CACHE_TTL = 15000;

async function getSharedClubStats(now) {
  const isFresh = clubSharedCache && (Date.now() - clubSharedCacheTime < SHARED_CACHE_TTL);
  if (isFresh) {
    return clubSharedCache;
  }

  const [
    upcomingEvents,
    recentEvents,
    totalSessions,
    totalEvents,
    totalMembers,
    coordinators,
  ] = await Promise.all([
    // upcoming events
    Event.find({ date: { $gte: now } })
      .sort({ date: 1 })
      .limit(3)
      .select('_id slug title date coverImage category')
      .lean(),
    // recent events
    Event.find({ date: { $lt: now } })
      .sort({ date: -1 })
      .limit(3)
      .select('_id slug title date coverImage category')
      .lean(),
    // total held sessions
    Session.countDocuments({ status: { $ne: 'cancelled' } }),
    // total events
    Event.countDocuments(),
    // total approved members
    User.countDocuments({ $or: [{ isApproved: true }, { role: 'admin' }] }),
    // active coordinators
    User.find({ role: 'coordinator', isApproved: true })
      .sort({ name: 1 })
      .select('_id name year section')
      .lean(),
  ]);

  clubSharedCache = {
    upcomingEvents,
    recentEvents,
    totalSessions,
    totalEvents,
    totalMembers,
    coordinators: coordinators || [],
  };
  clubSharedCacheTime = Date.now();
  return clubSharedCache;
}

export const getDashboardData = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const now = new Date();
    const userCutoff = getAttendanceCutoff(user);

    // Run shared cache retrieval along with member-specific queries in parallel
    const memberQueries = [
      // 0: member attendance (includes percentage, totalSessions, history, currentStreak)
      calculateMemberAttendance(user),

      // 1: announcements (broadcasts limited to latest 5)
      getSessionAnnouncements(5),

      // 2: latest 5 held sessions (not cancelled)
      Session.find({ status: { $ne: 'cancelled' } })
        .sort({ date: -1 })
        .limit(5)
        .select('_id date topic handledBy type absentees')
        .lean(),

      // 3: shared club stats (cached)
      getSharedClubStats(now),
    ];

    // If Admin, append admin queries to execute concurrently
    if (user.role === 'admin') {
      memberQueries.push(
        // 4: pending approvals count (excluding admins)
        User.countDocuments({ isApproved: false, role: { $ne: 'admin' } }),
        // 5: pending applications count (never drafts)
        Application.countDocuments({ status: 'pending' }),
        // 6: recent applications (latest 5 non-draft)
        Application.find({ status: { $ne: 'draft' } })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('fullName preferredDomain year status createdAt')
          .lean(),
        // 7: approved members for attendance calculation
        User.find({ $or: [{ isApproved: true }, { role: 'admin' }] })
          .select('_id name email section year role createdAt attendanceStartDate')
          .lean(),
        // 8: all held sessions for attendance calculation
        Session.find({ status: { $ne: 'cancelled' } })
          .select('_id date absentees')
          .lean()
      );
    }

    const results = await Promise.all(memberQueries);

    const attendance = results[0];
    const announcementsData = results[1];
    const rawRecentSessions = results[2];
    const sharedStats = results[3];

    const upcomingEvents = sharedStats.upcomingEvents;
    const recentEvents = sharedStats.recentEvents;
    let totalSessions = sharedStats.totalSessions;
    const totalEvents = sharedStats.totalEvents;
    let totalMembers = sharedStats.totalMembers;
    const coordinators = sharedStats.coordinators;

    const me = {
      name: user.name || '',
      year: user.year || null,
      section: user.section || '',
      role: user.role || 'member',
    };

    const recentSessions = (rawRecentSessions || []).map((s) => {
      const isBeforeAccount = new Date(s.date) < userCutoff;
      let myStatus = null;
      if (!isBeforeAccount) {
        const isAbsent = s.absentees?.some(
          (absId) => String(absId?._id ?? absId) === String(user._id)
        );
        myStatus = isAbsent ? 'absent' : 'present';
      }
      return {
        _id: s._id,
        date: s.date,
        topic: s.topic,
        handledBy: s.handledBy,
        type: s.type,
        myStatus,
      };
    });

    const events = {
      upcoming: upcomingEvents || [],
      recent: recentEvents || [],
    };

    const club = {
      totalSessions,
      totalEvents,
      totalMembers,
    };

    const todaySession = sanitizeSessionAnnouncement(announcementsData?.todaySession);
    const upcomingSession = sanitizeSessionAnnouncement(announcementsData?.upcomingSession);
    const broadcasts = announcementsData?.broadcasts || [];

    // Admin Payload
    if (user.role === 'admin') {
      const pendingApprovalsCount = results[4];
      const pendingApplicationsCount = results[5];
      const recentApplications = results[6];
      const approvedMembers = results[7] || [];
      const allHeldSessions = results[8] || [];

      if (approvedMembers.length > 0) {
        totalMembers = approvedMembers.length;
        club.totalMembers = totalMembers;
      }
      if (allHeldSessions.length > 0) {
        totalSessions = allHeldSessions.length;
        club.totalSessions = totalSessions;
      }

      let lowAttendanceMembers = [];
      if (allHeldSessions.length > 0 && approvedMembers.length > 0) {
        const attendanceResults = approvedMembers
          .map((member) => {
            const cutoff = getAttendanceCutoff(member);
            const eligible = allHeldSessions.filter((s) => new Date(s.date) >= cutoff);
            const total = eligible.length;
            if (total === 0) return null; // Skip members with null percentage (0 sessions)

            const absent = eligible.filter((s) =>
              s.absentees?.some((id) => String(id?._id ?? id) === String(member._id))
            ).length;
            const present = total - absent;
            const percentage = Number(((present / total) * 100).toFixed(1));

            return {
              _id: member._id,
              name: member.name,
              email: member.email,
              section: member.section || 'CSE',
              year: member.year,
              role: member.role || 'member',
              totalSessions: total,
              presentCount: present,
              absentCount: absent,
              percentage,
            };
          })
          .filter(Boolean);

        const belowThreshold = attendanceResults.filter(
          (m) => m.percentage < LOW_ATTENDANCE_THRESHOLD
        );

        belowThreshold.sort((a, b) => a.percentage - b.percentage);
        lowAttendanceMembers = belowThreshold;
      }

      return res.json({
        role: 'admin',
        me,
        attendance,
        todaySession,
        upcomingSession,
        broadcasts,
        recentSessions,
        events,
        club,
        coordinators,
        pending: {
          memberApprovals: pendingApprovalsCount,
          applications: pendingApplicationsCount,
        },
        recentApplications: recentApplications || [],
        lowAttendanceMembers,
        counts: {
          pendingApprovals: pendingApprovalsCount,
          pendingApplications: pendingApplicationsCount,
          totalSessions,
          totalEvents,
          totalMembers,
        },
      });
    }

    // Member / Staff Payload (strictly no pending, recentApplications, or lowAttendanceMembers)
    return res.json({
      role: user.role || 'member',
      me,
      attendance,
      todaySession,
      upcomingSession,
      broadcasts,
      recentSessions,
      events,
      club,
      coordinators,
    });
  } catch (err) {
    console.error('getDashboardData error:', err);
    res.status(500).json({ message: err.message || 'Failed to retrieve dashboard data' });
  }
};
