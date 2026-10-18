import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { profilesAPI, documentsAPI, resumeAPI } from '../services/api';

const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'];
const CATEGORY_OPTIONS = ['General', 'OBC', 'SC', 'ST', 'EWS'];

const EMPTY_FORM = {
  profileName: '', fullName: '', fatherName: '', motherName: '', dateOfBirth: '',
  gender: '', category: '', aadhaarNumber: '', phone: '', email: '',
  address: '', state: '', pincode: '',
  photoPath: '', signaturePath: '', aadhaarFrontPath: '', aadhaarBackPath: '',
  rollNumber: '', rollCode: '', marks: '', board: '', passingYear: '',
  linkedinUrl: '', skills: '', certificates: '', bodyMarks: '',
};

const DOC_TYPES = [
  { key: 'PHOTO', label: 'Photo', icon: '📷', pathField: 'photoPath' },
  { key: 'SIGNATURE', label: 'Signature', icon: '✍️', pathField: 'signaturePath' },
  { key: 'AADHAAR_FRONT', label: 'Aadhaar Front', icon: '🪪', pathField: 'aadhaarFrontPath' },
  { key: 'AADHAAR_BACK', label: 'Aadhaar Back', icon: '🪪', pathField: 'aadhaarBackPath' },
];

export default function ProfileForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  // Document upload states
  const [uploadStatus, setUploadStatus] = useState({}); // { PHOTO: 'uploading'|'done'|'error' }
  const [uploadMsg, setUploadMsg] = useState({});
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeMsg, setResumeMsg] = useState('');

  useEffect(() => {
    if (isEdit) {
      profilesAPI.getById(id)
        .then((res) => {
          const p = res.data.data;
          setForm({
            ...EMPTY_FORM,
            ...Object.fromEntries(Object.entries(p).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)])),
            dateOfBirth: p.dateOfBirth || '',
          });
        })
        .catch(() => setError('Failed to load profile'))
        .finally(() => setFetching(false));
    }
  }, [id]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.profileName.trim()) { setError('Profile name is required'); return; }
    setLoading(true);
    const payload = {};
    for (const [k, v] of Object.entries(form)) { payload[k] = v === '' ? null : v; }
    try {
      if (isEdit) { await profilesAPI.update(id, payload); }
      else { await profilesAPI.create(payload); }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally { setLoading(false); }
  };

  // ── Document Upload Handler ──
  const handleDocUpload = async (docType, file) => {
    if (!isEdit) { setUploadMsg((p) => ({ ...p, [docType]: 'Save the profile first, then upload documents.' })); return; }
    setUploadStatus((p) => ({ ...p, [docType]: 'uploading' }));
    setUploadMsg((p) => ({ ...p, [docType]: '' }));
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', docType);
      await documentsAPI.upload(id, fd);
      setUploadStatus((p) => ({ ...p, [docType]: 'done' }));
      setUploadMsg((p) => ({ ...p, [docType]: 'Uploaded successfully!' }));
      // Update form path field to show badge
      const pathField = DOC_TYPES.find((d) => d.key === docType)?.pathField;
      if (pathField) setForm((f) => ({ ...f, [pathField]: 'uploaded' }));
    } catch (err) {
      setUploadStatus((p) => ({ ...p, [docType]: 'error' }));
      setUploadMsg((p) => ({ ...p, [docType]: err.response?.data?.message || 'Upload failed' }));
    }
  };

  const handleDocDownload = async (docType) => {
    try {
      const res = await documentsAPI.download(id, docType);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `${docType.toLowerCase()}.jpg`; a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Download failed — document may not exist yet.'); }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const Input = ({ label, name, type = 'text', required = false, placeholder = '' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input type={type} value={form[name]} onChange={set(name)} required={required} placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm" />
    </div>
  );

  const Select = ({ label, name, options, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={form[name]} onChange={set(name)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm bg-white">
        <option value="">{placeholder || 'Select...'}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-primary-600 mb-2 inline-flex items-center gap-1">
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Profile' : 'Create New Profile'}</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

      <form onSubmit={handleSubmit}>
        <Section title="Profile Identity">
          <Input label="Profile Name" name="profileName" required placeholder='e.g. "My SSC Profile"' />
        </Section>

        <Section title="Personal Details">
          <Input label="Full Name" name="fullName" placeholder="As on Aadhaar" />
          <Input label="Father's Name" name="fatherName" />
          <Input label="Mother's Name" name="motherName" />
          <Input label="Date of Birth" name="dateOfBirth" type="date" />
          <Select label="Gender" name="gender" options={GENDER_OPTIONS} />
          <Select label="Category" name="category" options={CATEGORY_OPTIONS} placeholder="Select category" />
          <Input label="Aadhaar Number" name="aadhaarNumber" placeholder="1234 5678 9012" />
          <Input label="Phone" name="phone" type="tel" placeholder="+91 9876543210" />
          <Input label="Email" name="email" type="email" placeholder="you@example.com" />
        </Section>

        <Section title="Address">
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
            <textarea value={form.address} onChange={set('address')} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm" />
          </div>
          <Input label="State" name="state" />
          <Input label="Pincode" name="pincode" />
        </Section>

        {/* ═══ Document Upload Section (only visible in Edit mode) ═══ */}
        {isEdit && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">📎 Upload Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {DOC_TYPES.map((dt) => {
                const hasDoc = !!form[dt.pathField];
                const status = uploadStatus[dt.key];
                return (
                  <div key={dt.key} className={`border rounded-lg p-4 ${hasDoc ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">{dt.icon} {dt.label}</span>
                      {hasDoc && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">UPLOADED</span>}
                    </div>
                    <input type="file" accept="image/jpeg,image/png"
                      onChange={(e) => e.target.files[0] && handleDocUpload(dt.key, e.target.files[0])}
                      className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium hover:file:bg-primary-100 cursor-pointer"
                      disabled={status === 'uploading'} />
                    {status === 'uploading' && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
                    {uploadMsg[dt.key] && (
                      <p className={`text-xs mt-1 ${status === 'error' ? 'text-red-600' : 'text-green-600'}`}>{uploadMsg[dt.key]}</p>
                    )}
                    {hasDoc && (
                      <button type="button" onClick={() => handleDocDownload(dt.key)}
                        className="text-xs text-primary-600 font-medium hover:underline mt-1">⬇ Download</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Section title="Education Details">
          <Input label="Roll Number" name="rollNumber" />
          <Input label="Roll Code" name="rollCode" />
          <Input label="Marks / Percentage" name="marks" placeholder="e.g. 85%" />
          <Input label="Board / University" name="board" />
          <Input label="Passing Year" name="passingYear" placeholder="e.g. 2023" />
        </Section>

        <Section title="Professional Details">
          <Input label="LinkedIn URL" name="linkedinUrl" type="url" />
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <textarea value={form.skills} onChange={set('skills')} rows={2} placeholder="e.g. Java, React, SQL"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificates</label>
            <textarea value={form.certificates} onChange={set('certificates')} rows={2} placeholder="e.g. AWS Certified"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm" />
          </div>
        </Section>

        <Section title="Other Details">
          <Input label="Body Marks / Identification" name="bodyMarks" placeholder="e.g. Mole on left cheek" />
        </Section>

        <div className="flex flex-wrap items-center gap-3 mt-6">
          <button type="submit" disabled={loading}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {loading ? 'Saving...' : (isEdit ? 'Update Profile' : 'Create Profile')}
          </button>
          {isEdit && (
            <button type="button" disabled={resumeLoading}
              onClick={async () => {
                setResumeLoading(true); setResumeMsg('');
                try {
                  const res = await resumeAPI.generate(parseInt(id));
                  const blob = new Blob([res.data], { type: 'application/pdf' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url;
                  a.download = (form.fullName || form.profileName || 'resume').replace(/[^a-zA-Z0-9]/g, '_') + '_Resume.pdf';
                  a.click(); URL.revokeObjectURL(url);
                  setResumeMsg('✅ Resume downloaded!');
                } catch { setResumeMsg('❌ Failed to generate resume'); }
                finally { setResumeLoading(false); }
              }}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors">
              {resumeLoading ? 'Generating...' : '📄 Generate Resume'}
            </button>
          )}
          <button type="button" onClick={() => navigate('/')}
            className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          {resumeMsg && <span className="text-sm font-medium ml-2">{resumeMsg}</span>}
        </div>
      </form>
    </div>
  );
}
