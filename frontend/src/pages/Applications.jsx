import { useState, useEffect } from 'react';
import { applicationsAPI } from '../services/api';

const DEPARTMENTS = ['SSC', 'UPSC', 'IBPS', 'Railway', 'State PSC', 'Banking', 'Defence', 'Teaching', 'Private', 'Other'];
const STATUSES = ['APPLIED', 'ADMIT_CARD_RELEASED', 'EXAM_COMPLETED', 'RESULT_OUT', 'REJECTED', 'OTHER'];

const STATUS_COLORS = {
  APPLIED: 'bg-blue-100 text-blue-700',
  ADMIT_CARD_RELEASED: 'bg-amber-100 text-amber-700',
  EXAM_COMPLETED: 'bg-purple-100 text-purple-700',
  RESULT_OUT: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  OTHER: 'bg-gray-100 text-gray-600',
};

const formatStatus = (s) => s?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';

const EMPTY_FORM = {
  jobTitle: '', department: '', postName: '', applicationId: '',
  applicationDate: '', examDate: '', admitCardDate: '', resultDate: '',
  status: 'APPLIED', officialLink: '', notes: '', profileId: '',
};

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const res = await applicationsAPI.getAll();
      setApps(res.data.data || []);
    } catch { setError('Failed to load applications'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); setError(''); };
  const openEdit = (app) => {
    setForm({
      ...EMPTY_FORM,
      ...Object.fromEntries(Object.entries(app).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)])),
    });
    setEditId(app.id); setShowModal(true); setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.jobTitle.trim()) { setError('Job title is required'); return; }
    setSaving(true); setError('');
    const payload = {};
    for (const [k, v] of Object.entries(form)) { payload[k] = v === '' ? null : v; }
    if (payload.profileId) payload.profileId = parseInt(payload.profileId);
    try {
      if (editId) { await applicationsAPI.update(editId, payload); }
      else { await applicationsAPI.create(payload); }
      setShowModal(false); fetchAll();
    } catch (err) { setError(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try { await applicationsAPI.delete(id); setApps(apps.filter((a) => a.id !== id)); }
    catch { alert('Delete failed'); }
  };

  // Quick status update (improvement #6)
  const handleStatusChange = async (app, newStatus) => {
    try {
      await applicationsAPI.update(app.id, { ...app, status: newStatus });
      setApps(apps.map((a) => a.id === app.id ? { ...a, status: newStatus } : a));
    } catch { alert('Status update failed'); }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Filtering
  const filtered = apps.filter((a) => {
    if (filterStatus && a.status !== filterStatus) return false;
    if (filterDept && a.department !== filterDept) return false;
    if (search && !a.jobTitle.toLowerCase().includes(search.toLowerCase()) &&
        !(a.department || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 mt-1">{apps.length} total applications</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-sm">
          + Add Application
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search job title..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none w-48" />
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
        </select>
        {(filterStatus || filterDept || search) && (
          <button onClick={() => { setFilterStatus(''); setFilterDept(''); setSearch(''); }}
            className="text-sm text-gray-500 hover:text-red-500">✕ Clear</button>
        )}
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <span className="text-4xl mb-4 block">📝</span>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-500">Add your first job application to start tracking.</p>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map((app) => (
          <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900 truncate">{app.jobTitle}</h3>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[app.status] || STATUS_COLORS.OTHER}`}>
                    {formatStatus(app.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                  {app.department && <span>🏛️ {app.department}</span>}
                  {app.postName && <span>📋 {app.postName}</span>}
                  {app.examDate && <span>📅 Exam: {app.examDate}</span>}
                  {app.applicationId && <span>🆔 {app.applicationId}</span>}
                  {app.profileName && <span>👤 {app.profileName}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Quick status update (improvement #6) */}
                <select value={app.status} onChange={(e) => handleStatusChange(app, e.target.value)}
                  className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-white">
                  {STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
                </select>
                <button onClick={() => openEdit(app)}
                  className="text-sm text-primary-600 font-medium hover:text-primary-700 px-2">Edit</button>
                <button onClick={() => handleDelete(app.id)}
                  className="text-sm text-red-500 font-medium hover:text-red-700 px-2">Delete</button>
                {app.officialLink && (
                  <a href={app.officialLink} target="_blank" rel="noreferrer"
                    className="text-sm text-gray-400 hover:text-primary-600">🔗</a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Application' : 'Add Application'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input value={form.jobTitle} onChange={set('jobTitle')} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select value={form.department} onChange={set('department')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                      <option value="">Select...</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={set('status')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                      {STATUSES.map((s) => <option key={s} value={s}>{formatStatus(s)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Post Name</label>
                    <input value={form.postName} onChange={set('postName')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application / Roll ID</label>
                    <input value={form.applicationId} onChange={set('applicationId')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
                    <input type="date" value={form.applicationDate} onChange={set('applicationDate')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                    <input type="date" value={form.examDate} onChange={set('examDate')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admit Card Date</label>
                    <input type="date" value={form.admitCardDate} onChange={set('admitCardDate')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Result Date</label>
                    <input type="date" value={form.resultDate} onChange={set('resultDate')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Official Link</label>
                  <input type="url" value={form.officialLink} onChange={set('officialLink')} placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={set('notes')} rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors">
                    {saving ? 'Saving...' : (editId ? 'Update' : 'Add Application')}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
