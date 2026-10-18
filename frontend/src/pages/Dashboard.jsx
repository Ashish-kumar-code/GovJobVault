import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profilesAPI, applicationsAPI, notificationsAPI } from '../services/api';

const STATUS_COLORS = {
  APPLIED: 'bg-blue-100 text-blue-700',
  ADMIT_CARD_RELEASED: 'bg-amber-100 text-amber-700',
  EXAM_COMPLETED: 'bg-purple-100 text-purple-700',
  RESULT_OUT: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  OTHER: 'bg-gray-100 text-gray-600',
};

const formatStatus = (s) => s?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';

export default function Dashboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [allApps, setAllApps] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      profilesAPI.getAll().then((r) => setProfiles(r.data.data || [])).catch(() => {}),
      applicationsAPI.getUpcoming().then((r) => setUpcoming(r.data.data || [])).catch(() => {}),
      applicationsAPI.getAll().then((r) => setAllApps(r.data.data || [])).catch(() => {}),
      notificationsAPI.getUnreadCount().then((r) => setUnreadCount(r.data.data || 0)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this profile?')) return;
    try { await profilesAPI.delete(id); setProfiles(profiles.filter((p) => p.id !== id)); } catch {}
  };

  const handleSetDefault = async (id) => {
    try { await profilesAPI.setDefault(id); setProfiles(profiles.map((p) => ({ ...p, isDefault: p.id === id }))); } catch {}
  };

  const daysUntil = (date) => {
    const d = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (d <= 0) return 'Today';
    if (d === 1) return 'Tomorrow';
    return `${d} days`;
  };

  // Stats
  const totalApps = allApps.length;
  const applied = allApps.filter((a) => a.status === 'APPLIED').length;
  const examCompleted = allApps.filter((a) => a.status === 'EXAM_COMPLETED').length;
  const resultOut = allApps.filter((a) => a.status === 'RESULT_OUT').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
        <div className="skeleton h-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Welcome back, {user?.fullName?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's an overview of your job tracking dashboard</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/applications" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Apps</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalApps}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📋</div>
          </div>
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Upcoming</p>
              <p className="text-3xl font-extrabold text-amber-600 mt-1">{upcoming.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl">📅</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Results Out</p>
              <p className="text-3xl font-extrabold text-green-600 mt-1">{resultOut}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">🏆</div>
          </div>
        </div>
        <Link to="/notifications" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unread</p>
              <p className="text-3xl font-extrabold text-primary-600 mt-1">{unreadCount}</p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🔔</div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/profiles/new" className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm">
          + New Profile
        </Link>
        <Link to="/applications" className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">
          + Add Application
        </Link>
        <Link to="/tools" className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">
          📸 Resize Photo
        </Link>
        <Link to="/resume" className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">
          📄 Build Resume
        </Link>
      </div>

      {/* Upcoming Exams */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">📅 Upcoming Exams</h2>
            <Link to="/applications" className="text-sm text-primary-600 font-medium hover:underline">View All →</Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {upcoming.slice(0, 5).map((app) => (
              <div key={app.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{app.jobTitle}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {app.department}{app.postName ? ` · ${app.postName}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[app.status] || STATUS_COLORS.OTHER}`}>
                    {formatStatus(app.status)}
                  </span>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{app.examDate}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      daysUntil(app.examDate) === 'Today' ? 'bg-red-100 text-red-700' :
                      daysUntil(app.examDate) === 'Tomorrow' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {daysUntil(app.examDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profiles Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-bold text-gray-900">👤 My Profiles</h2>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No profiles yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
            Create your first profile to store all form-filling data for government and private job applications.
          </p>
          <Link to="/profiles/new" className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            + Create Your First Profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <div key={profile.id}
              className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all relative ${
                profile.isDefault ? 'border-primary-300 ring-2 ring-primary-50' : 'border-gray-200'
              }`}>
              {profile.isDefault && (
                <span className="absolute top-3 right-3 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>
              )}
              <h3 className="text-base font-bold text-gray-900 mb-0.5 pr-20">{profile.profileName}</h3>
              {profile.fullName && <p className="text-sm text-gray-500 mb-3">{profile.fullName}</p>}

              <div className="space-y-1 text-sm text-gray-500 mb-3">
                {profile.email && <p className="truncate">📧 {profile.email}</p>}
                {profile.phone && <p>📱 {profile.phone}</p>}
                {profile.state && <p>📍 {profile.state}</p>}
              </div>

              {/* Document Badges */}
              <div className="flex gap-1.5 mb-4">
                {profile.photoPath && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">📷 Photo</span>}
                {profile.signaturePath && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">✍️ Sign</span>}
                {(profile.aadhaarFrontPath || profile.aadhaarBackPath) && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">🪪 Aadhaar</span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <Link to={`/profiles/edit/${profile.id}`} className="text-sm text-primary-600 font-semibold hover:text-primary-700">Edit</Link>
                {!profile.isDefault && (
                  <button onClick={() => handleSetDefault(profile.id)} className="text-sm text-gray-500 font-medium hover:text-primary-600 ml-3">★ Default</button>
                )}
                <button onClick={() => handleDelete(profile.id)} className="text-sm text-red-500 font-medium hover:text-red-700 ml-auto">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
