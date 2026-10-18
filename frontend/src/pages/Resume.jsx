import { useState, useEffect } from 'react';
import { profilesAPI, resumeAPI } from '../services/api';

export default function Resume() {
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    profilesAPI.getAll()
      .then((res) => setProfiles(res.data.data || []))
      .catch(() => setError('Failed to load profiles'))
      .finally(() => setLoading(false));
  }, []);

  const selected = profiles.find((p) => p.id === parseInt(selectedId));

  // Check if profile has enough data for a meaningful resume
  const hasMinData = selected && (selected.fullName || selected.email || selected.phone);
  const fieldsCount = selected ? [
    selected.fullName, selected.fatherName, selected.motherName, selected.dateOfBirth,
    selected.gender, selected.category, selected.phone, selected.email, selected.address,
    selected.board, selected.marks, selected.skills, selected.certificates,
  ].filter(Boolean).length : 0;

  const handleGenerate = async () => {
    if (!selectedId) return;
    setGenerating(true); setError(''); setSuccess('');
    try {
      const res = await resumeAPI.generate(parseInt(selectedId));
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (selected?.fullName || selected?.profileName || 'resume').replace(/[^a-zA-Z0-9]/g, '_') + '_Resume.pdf';
      a.click();
      URL.revokeObjectURL(url);
      setSuccess('Resume downloaded successfully!');
    } catch (err) {
      if (err.response?.status === 403) setError('Access denied — this profile does not belong to you.');
      else setError(err.response?.data?.message || 'Failed to generate resume');
    } finally { setGenerating(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const Row = ({ label, value }) => value ? (
    <div className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[200px] truncate">{value}</span>
    </div>
  ) : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📄 Resume Builder</h1>
        <p className="text-gray-500 mt-1">Generate a professional PDF resume from your profile data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Profile</label>
            <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setError(''); setSuccess(''); }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none">
              <option value="">Choose a profile...</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.profileName}{p.isDefault ? ' ★' : ''}</option>
              ))}
            </select>

            {/* Warnings */}
            {selected && !hasMinData && (
              <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
                ⚠️ This profile has very little data. The resume may look empty. Consider filling in more fields first.
              </div>
            )}

            {selected && hasMinData && fieldsCount < 6 && (
              <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                ℹ️ Only {fieldsCount} fields filled. Adding more data (education, skills, certificates) will make a better resume.
              </div>
            )}

            {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            {success && <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">✅ {success}</div>}

            <button onClick={handleGenerate} disabled={!selectedId || generating}
              className="mt-6 w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating PDF...
                </span>
              ) : '📄 Generate & Download Resume'}
            </button>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">💡 Resume Tips</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• Fill in all personal details for a complete resume</li>
              <li>• Add skills as comma-separated values</li>
              <li>• Include certificates and courses</li>
              <li>• Add education details (board, marks, year)</li>
              <li>• LinkedIn URL adds a professional touch</li>
            </ul>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div>
          {selected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Resume Preview</h3>

              {/* Mock header */}
              <div className="text-center mb-4 pb-3 border-b-2 border-primary-500">
                <h2 className="text-xl font-bold text-gray-900">{selected.fullName || selected.profileName}</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {[selected.phone, selected.email, selected.state].filter(Boolean).join('  |  ')}
                </p>
              </div>

              {/* Section: Personal */}
              {(selected.fatherName || selected.motherName || selected.dateOfBirth || selected.gender || selected.category) && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Personal Details</h4>
                  <Row label="Father's Name" value={selected.fatherName} />
                  <Row label="Mother's Name" value={selected.motherName} />
                  <Row label="Date of Birth" value={selected.dateOfBirth} />
                  <Row label="Gender" value={selected.gender} />
                  <Row label="Category" value={selected.category} />
                  <Row label="Aadhaar" value={selected.aadhaarNumber} />
                </div>
              )}

              {/* Section: Education */}
              {(selected.board || selected.marks || selected.passingYear) && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Education</h4>
                  <Row label="Board" value={selected.board} />
                  <Row label="Marks" value={selected.marks} />
                  <Row label="Year" value={selected.passingYear} />
                </div>
              )}

              {/* Section: Skills */}
              {selected.skills && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Skills</h4>
                  <p className="text-sm text-gray-700">{selected.skills}</p>
                </div>
              )}

              {/* Section: Certificates */}
              {selected.certificates && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Certificates</h4>
                  <p className="text-sm text-gray-700">{selected.certificates}</p>
                </div>
              )}

              {!hasMinData && (
                <p className="text-sm text-gray-400 text-center py-4">Limited data available for this profile</p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center py-16">
              <span className="text-4xl mb-4 block">📄</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Profile</h3>
              <p className="text-gray-500 text-sm">Choose a profile from the dropdown to preview and generate your resume</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
