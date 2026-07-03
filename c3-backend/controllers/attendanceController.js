import Session from '../models/Session.js';
import User from '../models/User.js';

// Get attendance % for one member
export const getMemberAttendance = async (req, res) => {
  try {
    const memberId = req.params.memberId;

    const totalSessions = await Session.countDocuments();
    const absentCount = await Session.countDocuments({ absentees: memberId });

    const presentCount = totalSessions - absentCount;
    const percentage = totalSessions === 0 ? 0 : ((presentCount / totalSessions) * 100).toFixed(1);

    res.json({
      memberId,
      totalSessions,
      presentCount,
      absentCount,
      percentage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get attendance % for ALL approved members - admin view
export const getAllAttendance = async (req, res) => {
  try {
    const members = await User.find({ isApproved: true }).select('-password');
    const totalSessions = await Session.countDocuments();

    const results = await Promise.all(
      members.map(async (member) => {
        const absentCount = await Session.countDocuments({ absentees: member._id });
        const presentCount = totalSessions - absentCount;
        const percentage = totalSessions === 0 ? 0 : ((presentCount / totalSessions) * 100).toFixed(1);

        return {
          _id: member._id,
          name: member.name,
          email: member.email,
          totalSessions,
          presentCount,
          absentCount,
          percentage,
        };
      })
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};