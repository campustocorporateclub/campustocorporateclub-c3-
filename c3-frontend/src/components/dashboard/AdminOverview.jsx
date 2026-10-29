import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Send,
  Calendar,
  Bell,
  ArrowRight,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Award,
  ExternalLink,
  ChevronRight,
  Radio,
  UserCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Loader } from '../ui/Loader';
import CountUp from '../reactbits/CountUp';
import { DOMAIN_OPTIONS } from '../../constants/domains';
import { CoordinatorsCard } from './CoordinatorsCard';
import { InstallAppCard } from '../pwa/InstallAppCard';
import { OfflineState } from '../common/OfflineState';

const domainLabel = (value) => DOMAIN_OPTIONS.find((d) => d.value === value)?.label || value || 'General';

const getRelativeEditedTime = (editedAt) => {
  if (!editedAt) return null;
  const editedDate = new Date(editedAt);
  const diffMs = Date.now() - editedDate.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 0 || diffSec > 86400) return null;
  if (diffSec < 60) return 'Updated just now';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `Updated ${mins} min ago`;
  const hours = Math.floor(mins / 60);
  return `Updated ${hours}h ago`;
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const STATUS_BADGE = {
  draft: { variant: 'neutral', label: 'Draft' },
  pending: { variant: 'primary', label: 'Pending' },
  shortlisted: { variant: 'warning', label: 'Shortlisted' },
  accepted: { variant: 'success', label: 'Accepted' },
  rejected: { variant: 'danger', label: 'Rejected' },
};

export const AdminOverview = ({ data, loading, error, isOffline, onRetry }) => {
  if ((isOffline || (error && error.includes('offline'))) && !data) {
    return (
      <OfflineState
        onRetry={onRetry}
        title="You are offline"
        description="Please turn on your internet connection to view real-time club operations."
      />
    );
  }

  if (loading && !data) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader size="lg" label="Loading real-time club operations data..." />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 space-y-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <h3 className="font-semibold text-white text-base">Failed to load admin overview</h3>
        </div>
        <p className="text-xs text-red-300/80">{error}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="text-xs text-white border-white/20">
            Retry Connection
          </Button>
        )}
      </div>
    );
  }

  const counts = {
    pendingApprovals: data?.pending?.memberApprovals ?? data?.counts?.pendingApprovals ?? 0,
    pendingApplications: data?.pending?.applications ?? data?.counts?.pendingApplications ?? 0,
    totalSessions: data?.club?.totalSessions ?? data?.counts?.totalSessions ?? 0,
    totalEvents: data?.club?.totalEvents ?? data?.counts?.totalEvents ?? 0,
    totalMembers: data?.club?.totalMembers ?? data?.counts?.totalMembers ?? 0,
  };

  const todaySession = data?.todaySession || null;
  const upcomingSession = data?.upcomingSession || null;
  const broadcasts = data?.broadcasts || [];
  const lowAttendanceMembers = data?.lowAttendanceMembers || [];
  const recentApplications = data?.recentApplications || [];
  const latestHeldSession = data?.recentSessions?.[0] || null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Install PWA Prompt Banner */}
      <InstallAppCard />

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-white/[0.08] via-white/[0.03] to-transparent border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Operations Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Admin Overview
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Track pending registrations, junior applications, today's peer session, and club turnout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {latestHeldSession && (
              <Link to={`/admin/sessions/${latestHeldSession._id}/attendance`}>
                <Button
                  variant="emerald"
                  size="sm"
                  className="min-h-[48px] px-4 text-xs font-semibold"
                  leftIcon={<UserCheck className="w-4 h-4 shrink-0 text-white" />}
                >
                  Mark attendance
                </Button>
              </Link>
            )}
            <Link to="/admin/announcements">
              <Button variant="outline" size="sm" className="min-h-[48px] px-4 text-xs text-white border-white/20 hover:bg-white/5">
                <Bell className="w-3.5 h-3.5 mr-1.5" /> Manage Live Broadcasts
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Action Cards & Primary Queues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Action Card 1: Pending Member Approvals */}
        <Link
          to="/admin/members"
          className="group block p-5 sm:p-6 rounded-2xl bg-zinc-950/90 border border-white/10 hover:border-white/30 transition-all duration-300 shadow-xl relative overflow-hidden"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
                <Users className="w-4 h-4 text-white" />
                <span>Pending Member Approvals</span>
              </div>

              {counts.pendingApprovals === 0 ? (
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All caught up</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    No new member registration requests waiting for review.
                  </p>
                </div>
              ) : (
                <div className="pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
                      {counts.pendingApprovals}
                    </span>
                    <span className="text-xs font-mono text-amber-400 font-medium">awaiting review</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    New club registrations requiring admission authorization and welcome email dispatch.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-300 shrink-0 text-white">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Action Card 2: Applications to Review */}
        <Link
          to="/admin/applications"
          className="group block p-5 sm:p-6 rounded-2xl bg-zinc-950/90 border border-white/10 hover:border-white/30 transition-all duration-300 shadow-xl relative overflow-hidden"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
                <Send className="w-4 h-4 text-white" />
                <span>Applications to Review</span>
              </div>

              {counts.pendingApplications === 0 ? (
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All caught up</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    All junior recruitment applications have been evaluated.
                  </p>
                </div>
              ) : (
                <div className="pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
                      {counts.pendingApplications}
                    </span>
                    <span className="text-xs font-mono text-sky-400 font-medium">pending submissions</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    Junior CSE students awaiting interview shortlist or status updates.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-300 shrink-0 text-white">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Club Pulse Section (CountUp Stats) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
          <TrendingUp className="w-4 h-4 text-white" />
          <span>Club Pulse</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Pulse Card 1: Total Sessions */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-zinc-400">Sessions held</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
                <CountUp to={counts.totalSessions || 0} duration={1.5} />
              </div>
              <span className="text-[11px] text-zinc-500">Conducted knowledge sessions</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          {/* Pulse Card 2: Total Events */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-zinc-400">Club Events</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
                <CountUp to={counts.totalEvents || 0} duration={1.5} />
              </div>
              <span className="text-[11px] text-zinc-500">Workshops & hackathons</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          {/* Pulse Card 3: Active Members */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-zinc-400">Approved Members</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
                <CountUp to={counts.totalMembers || 0} duration={1.5} />
              </div>
              <span className="text-[11px] text-zinc-500">Active roster members</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Session Status & Low Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (7 cols): Today's Session + Low Attendance */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Session Status Card */}
          <Card className="bg-zinc-950/90 border border-white/10 p-5 sm:p-6 shadow-xl">
            <CardHeader className="p-0 pb-4 border-b border-white/10 flex flex-row items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Radio className={`w-4 h-4 ${todaySession?.status === 'cancelled' ? 'text-red-400' : todaySession ? 'text-emerald-400 animate-pulse' : 'text-zinc-400'}`} />
                {todaySession ? "Today's Session Status" : (upcomingSession ? "Scheduled Session" : "Today's Session Status")}
              </CardTitle>
              {todaySession ? (
                todaySession.status === 'cancelled' ? (
                  <Badge variant="danger">Cancelled</Badge>
                ) : (
                  <Badge variant="success" icon={<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}>
                    Live
                  </Badge>
                )
              ) : upcomingSession ? (
                upcomingSession.status === 'cancelled' ? (
                  <Badge variant="danger">Cancelled</Badge>
                ) : (
                  <Badge variant="neutral">
                    Scheduled &bull; {new Date(upcomingSession.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' })}
                  </Badge>
                )
              ) : (
                <Badge variant="warning">Not Set</Badge>
              )}
            </CardHeader>

            <CardContent className="p-0 pt-4 space-y-4">
              {todaySession || upcomingSession ? (
                (() => {
                  const session = todaySession || upcomingSession;
                  const isCancelled = session.status === 'cancelled';
                  const relativeTag = getRelativeEditedTime(session.editedAt);

                  return (
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`text-[10px] font-mono uppercase tracking-wider ${isCancelled ? 'text-red-400' : 'text-zinc-400'}`}>
                            {todaySession ? (isCancelled ? "Today's Session (Cancelled)" : "Session Topic") : (isCancelled ? "Upcoming Session (Cancelled)" : "Upcoming Topic")}
                          </span>
                          <h3 className={`text-lg font-bold text-white mt-0.5 leading-snug ${isCancelled ? 'line-through opacity-75' : ''}`}>
                            {session.topic}
                          </h3>
                        </div>
                        {relativeTag && (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                            {relativeTag}
                          </span>
                        )}
                      </div>

                      {isCancelled ? (
                        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 leading-relaxed space-y-1">
                          <span className="font-semibold text-red-200 block">Session Cancelled</span>
                          <span>{session.cancelReason || 'Session cancelled by coordinator.'}</span>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-white/5">
                              <User className="w-4 h-4 text-zinc-400 shrink-0" />
                              <div className="truncate">
                                <span className="text-[10px] font-mono text-zinc-500 block">Presenter</span>
                                <strong className="text-white truncate block">{session.handledBy}</strong>
                              </div>
                            </div>

                            {session.time && (
                              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-white/5">
                                <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                                <div className="truncate">
                                  <span className="text-[10px] font-mono text-zinc-500 block">Scheduled Time</span>
                                  <span className="text-white font-medium truncate block">
                                    {session.time}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {session.venue && (
                            <div className="text-xs text-zinc-400 flex items-center gap-1.5 pt-1">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span>{session.venue}</span>
                            </div>
                          )}

                          {session.message && (
                            <div className="p-3 rounded-xl bg-zinc-900/70 border border-white/10 text-xs text-zinc-300 leading-relaxed">
                              {session.message}
                            </div>
                          )}
                        </>
                      )}

                      {isCancelled && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-white/5 text-xs text-zinc-300">
                          <User className="w-4 h-4 text-zinc-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-[10px] font-mono text-zinc-500 block">Presenter</span>
                            <strong className="text-white truncate block">{session.handledBy}</strong>
                          </div>
                        </div>
                      )}

                      {todaySession && upcomingSession && (
                        <div className="text-xs text-zinc-400 flex items-center justify-between pt-1 border-t border-white/5">
                          <span className="text-[11px] font-mono text-zinc-500">Upcoming:</span>
                          <span className="text-zinc-300 truncate max-w-[220px]">
                            {upcomingSession.topic} ({new Date(upcomingSession.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' })})
                            {upcomingSession.status === 'cancelled' && ' (Cancelled)'}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-end">
                        <Link to="/admin/announcements">
                          <Button variant="outline" size="sm" className="text-xs text-white border-white/20">
                            Update in Session Manager <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-zinc-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Today's Peer Session Not Set</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                      Today's session topic, timing, and presenter haven't been published yet for club members.
                    </p>
                  </div>
                  <Link to="/admin/announcements" className="inline-block pt-1">
                    <Button variant="primary" size="sm" className="bg-white text-black font-semibold hover:bg-zinc-200 text-xs">
                      Set today's session
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low-Attendance Members Card */}
          <Card className="bg-zinc-950/90 border border-white/10 p-5 sm:p-6 shadow-xl">
            <CardHeader className="p-0 pb-4 border-b border-white/10 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Turnout Watchlist
                </CardTitle>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Members flagged below {75}% attendance across peer sessions
                </p>
              </div>

              <Link
                to="/admin/attendance"
                className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Full Matrix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-0 pt-3">
              {lowAttendanceMembers.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 font-mono text-xs space-y-1">
                  <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-400 mb-2" />
                  <p className="text-zinc-300 font-semibold">All members in good standing</p>
                  <p className="text-[11px] text-zinc-500">No members flagged for low attendance turnout.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {lowAttendanceMembers.map((m) => (
                    <div key={m._id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                          {m.role && m.role !== 'member' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-white/10 text-zinc-300 border border-white/20 shrink-0">
                              {m.role === 'admin' ? 'Admin' : m.role === 'coordinator' ? 'Coordinator' : m.role}
                            </span>
                          )}
                          {m.section && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/5 text-zinc-400 border border-white/10">
                              {m.section}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-zinc-500 truncate mt-0.5">{m.email}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
                          {m.presentCount} / {m.totalSessions} attended
                        </span>
                        <Badge
                          variant={
                            m.percentage >= 75
                              ? 'success'
                              : m.percentage >= 50
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {m.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols): Recent Applications + Latest Broadcasts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Applications Card */}
          <Card className="bg-zinc-950/90 border border-white/10 p-5 sm:p-6 shadow-xl">
            <CardHeader className="p-0 pb-3 border-b border-white/10 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-white" />
                Recent Applications
              </CardTitle>
              <Link
                to="/admin/applications"
                className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-0 pt-2">
              {recentApplications.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 font-mono text-xs">
                  No junior applications received yet.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentApplications.map((app) => {
                    const statusCfg = STATUS_BADGE[app.status] || STATUS_BADGE.pending;
                    return (
                      <Link
                        key={app._id}
                        to="/admin/applications"
                        className="py-3 block group hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white group-hover:text-zinc-200 truncate">
                              {app.fullName || 'Anonymous'}
                            </p>
                            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                              {domainLabel(app.preferredDomain)}
                              {app.year ? ` • Year ${app.year}` : ''}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {formatDate(app.createdAt)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Latest Broadcasts Card */}
          <Card className="bg-zinc-950/90 border border-white/10 p-5 sm:p-6 shadow-xl">
            <CardHeader className="p-0 pb-3 border-b border-white/10 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-white" />
                Latest Broadcasts
              </CardTitle>
              <Link
                to="/admin/announcements"
                className="text-xs font-mono text-white hover:underline flex items-center gap-1"
              >
                <span>Post broadcast</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent className="p-0 pt-2">
              {broadcasts.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 font-mono text-xs">
                  No announcements published yet.
                </div>
              ) : (
                <div className="divide-y divide-white/5 max-h-72 overflow-y-auto pr-1">
                  {broadcasts.map((b) => (
                    <div key={b._id} className="py-2.5 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-white truncate">{b.title}</p>
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                          {formatDate(b.createdAt || b.date)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{b.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coordinators Card */}
          <CoordinatorsCard coordinators={data?.coordinators || []} />
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
