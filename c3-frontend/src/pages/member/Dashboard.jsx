import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatsCard } from '../../components/ui/StatsCard';
import { Button } from '../../components/ui/Button';
import {
  UserCheck,
  BookOpen,
  Calendar,
  Flame,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Plus,
  Bell,
} from 'lucide-react';
import axios from '../../api/axios';

import { AdminOverview } from '../../components/dashboard/AdminOverview';
import { TodaySessionCard } from '../../components/dashboard/TodaySessionCard';
import { AttendanceTrend } from '../../components/dashboard/AttendanceTrend';
import { RecentSessions } from '../../components/dashboard/RecentSessions';
import { EventsCard } from '../../components/dashboard/EventsCard';
import { BroadcastsCard } from '../../components/dashboard/BroadcastsCard';
import { ClubPulse } from '../../components/dashboard/ClubPulse';
import { CoordinatorsCard } from '../../components/dashboard/CoordinatorsCard';
import { DashboardSkeleton } from '../../components/dashboard/DashboardSkeleton';
import { InstallAppCard } from '../../components/pwa/InstallAppCard';
import { OfflineState } from '../../components/common/OfflineState';

const getCacheKey = (userId) => `c3_dash_cache_${userId || 'guest'}`;

const getInitialCachedData = (userId) => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(getCacheKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const userId = user?._id || user?.id || '';

  const [dashboardData, setDashboardData] = useState(() => getInitialCachedData(userId));
  const [loading, setLoading] = useState(() => !getInitialCachedData(userId));
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);

  // Monitor online/offline events for instantaneous responsiveness
  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const fetchDashboard = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
      setError('You are offline. Turn on your internet connection to continue.');
      setLoading(false);
      return;
    }

    setIsOffline(false);
    // If we already have cached data rendered, don't show skeleton again to prevent UI jump
    if (!dashboardData) {
      setLoading(true);
    }
    setError('');

    try {
      const res = await axios.get('/dashboard');
      setDashboardData(res.data);
      if (typeof window !== 'undefined' && userId) {
        try {
          sessionStorage.setItem(getCacheKey(userId), JSON.stringify(res.data));
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      if (err.isOffline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        setIsOffline(true);
      }
      setError(
        err.isOffline || !navigator.onLine
          ? 'You are offline. Turn on your internet to continue.'
          : err.response?.data?.message || 'Failed to connect to dashboard service'
      );
    } finally {
      setLoading(false);
    }
  }, [dashboardData, userId]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Keep admin strictly on /admin - if admin accesses /dashboard, redirect to /admin
  if (user?.role === 'admin' && location.pathname === '/dashboard') {
    return <Navigate to="/admin" replace />;
  }

  // Render Admin Overview desk if admin
  if (user?.role === 'admin') {
    return (
      <AdminOverview
        data={dashboardData}
        loading={loading}
        error={error}
        isOffline={isOffline}
        onRetry={fetchDashboard}
      />
    );
  }

  // If totally offline and no cached data to display, render clean offline screen immediately
  if ((isOffline || error.includes('offline')) && !dashboardData) {
    return (
      <OfflineState
        onRetry={fetchDashboard}
        title="You are offline"
        description="Please turn on your internet connection to view the dashboard."
      />
    );
  }

  // Regular Member Loading Skeleton (only on first ever visit with no cache)
  if (loading && !dashboardData) {
    return <DashboardSkeleton />;
  }

  // Error State with Retry (when not offline or when offline with no cache)
  if (error && !dashboardData) {
    return (
      <div className="p-6 sm:p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <h3 className="font-semibold text-white text-base">Failed to load member dashboard</h3>
        </div>
        <p className="text-xs sm:text-sm text-red-300/80 leading-relaxed">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboard}
          className="text-xs text-white border-white/20 hover:bg-white/10"
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  const name = dashboardData?.me?.name || user?.name || 'Member';
  const attendance = dashboardData?.attendance;
  const eventsCount = dashboardData?.events?.upcoming?.length ?? 0;

  const subline =
    attendance && attendance.totalSessions > 0
      ? `You've attended ${attendance.presentCount} of ${attendance.totalSessions} sessions${
          attendance.currentStreak > 0 ? ` · ${attendance.currentStreak}-session streak` : ''
        }`
      : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Install PWA Prompt Banner */}
      <InstallAppCard />

      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-transparent border border-white/10 relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            {user?.role === 'coordinator' ? 'Staff Workspace' : 'Member Overview'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
            Hello, {name} 👋
          </h1>
          {subline && (
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-mono">
              {subline}
            </p>
          )}
        </div>
      </div>

      {/* Staff Tools Card (Coordinators) */}
      {user?.role === 'coordinator' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white">Staff Operational Tools</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Coordinator
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Quick operational shortcuts to run day-to-day club sessions, attendance, and announcements.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <Link
              to={
                dashboardData?.recentSessions?.[0]?._id
                  ? `/staff/sessions/${dashboardData.recentSessions[0]._id}/attendance`
                  : '/staff/sessions'
              }
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/80 border border-white/10 hover:border-amber-500/40 hover:bg-zinc-900 transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                    Mark Attendance
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400 truncate">
                    {dashboardData?.recentSessions?.[0]?.topic
                      ? `Latest: ${dashboardData.recentSessions[0].topic}`
                      : 'Latest held session'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>

            <Link
              to="/staff/announcements"
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/80 border border-white/10 hover:border-amber-500/40 hover:bg-zinc-900 transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 text-sky-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                    Post Announcement
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400 truncate">
                    Today / upcoming sessions & broadcasts
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>

            <Link
              to="/staff/sessions/new"
              className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/80 border border-white/10 hover:border-amber-500/40 hover:bg-zinc-900 transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                    Add Session
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400 truncate">
                    Log new peer learning session
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          </div>
        </div>
      )}

      {/* Four Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Attendance Rate"
          value={
            attendance?.percentage !== null && attendance?.percentage !== undefined
              ? `${attendance.percentage}%`
              : '—'
          }
          description={
            attendance && attendance.totalSessions > 0
              ? `${attendance.presentCount} of ${attendance.totalSessions} eligible sessions`
              : 'No sessions recorded yet'
          }
          icon={UserCheck}
          color="primary"
        />

        <StatsCard
          title="Sessions Attended"
          value={
            attendance && attendance.totalSessions > 0
              ? `${attendance.presentCount} / ${attendance.totalSessions}`
              : '0 / 0'
          }
          description={
            attendance && attendance.totalSessions > 0
              ? `${attendance.absentCount} missed sessions`
              : 'Since joining club'
          }
          icon={BookOpen}
          color="accent"
        />

        <StatsCard
          title="Current Streak"
          value={`${attendance?.currentStreak ?? 0} ${
            (attendance?.currentStreak ?? 0) === 1 ? 'session' : 'sessions'
          }`}
          description={
            (attendance?.currentStreak ?? 0) > 0
              ? 'Consecutive attendances'
              : 'Attend consecutive sessions'
          }
          icon={Flame}
          color="warning"
        />

        <StatsCard
          title="Upcoming Events"
          value={`${eventsCount}`}
          description={
            eventsCount > 0 ? 'Upcoming club workshops' : 'No upcoming events'
          }
          icon={Calendar}
          color="success"
        />
      </div>

      {/* Row 1: Today's Peer Session & Attendance Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <TodaySessionCard
          todaySession={dashboardData?.todaySession}
          upcomingSession={dashboardData?.upcomingSession}
        />
        <AttendanceTrend attendance={attendance} />
      </div>

      {/* Row 2: Recent Sessions, Events, Broadcasts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <RecentSessions recentSessions={dashboardData?.recentSessions || []} />
        <EventsCard events={dashboardData?.events} />
        <BroadcastsCard broadcasts={dashboardData?.broadcasts || []} />
      </div>

      {/* Row 3: Coordinators & Club Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <CoordinatorsCard coordinators={dashboardData?.coordinators || []} />
        </div>
        <div className="lg:col-span-2">
          <ClubPulse club={dashboardData?.club} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
