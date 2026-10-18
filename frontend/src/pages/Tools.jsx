import { useState } from 'react';
import { toolsAPI } from '../services/api';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ═══ Tab 1: Photo & Signature Resizer ═══
function ResizerTab() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [maxKB, setMaxKB] = useState('50');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setError(''); }
  };

  const presets = [
    { label: '3.5×4.5 cm (413×531)', w: 413, h: 531 },
    { label: '200×230 px', w: 200, h: 230 },
    { label: '100×120 px', w: 100, h: 120 },
    { label: '150×200 px', w: 150, h: 200 },
  ];

  const handleResize = async () => {
    if (!file) { setError('Please select an image first'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (width) fd.append('width', width);
      if (height) fd.append('height', height);
      if (maxKB) fd.append('maxSizeKB', maxKB);
      const res = await toolsAPI.resize(fd);
      const blob = new Blob([res.data], { type: 'image/jpeg' });
      setResult({ url: URL.createObjectURL(blob), blob, size: blob.size });
    } catch (err) {
      setError(err.response?.data?.message || 'Resize failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Image</label>
        <input type="file" accept="image/*" onChange={handleFile}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-semibold hover:file:bg-primary-100 cursor-pointer" />
      </div>

      {/* Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button key={p.label} type="button"
              onClick={() => { setWidth(String(p.w)); setHeight(String(p.h)); }}
              className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-primary-50 hover:text-primary-700 rounded-lg border border-gray-200 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
          <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="auto"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="auto"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Size (KB)</label>
          <input type="number" value={maxKB} onChange={(e) => setMaxKB(e.target.value)} placeholder="50"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
        </div>
      </div>

      <button onClick={handleResize} disabled={loading || !file}
        className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors">
        {loading ? 'Resizing...' : 'Resize & Download'}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Preview */}
      {(preview || result) && (
        <div className="grid grid-cols-2 gap-6 mt-4">
          {preview && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">ORIGINAL</p>
              <img src={preview} alt="Original" className="max-h-48 rounded-lg border border-gray-200" />
            </div>
          )}
          {result && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">RESIZED ({(result.size / 1024).toFixed(1)} KB)</p>
              <img src={result.url} alt="Resized" className="max-h-48 rounded-lg border border-gray-200" />
              <button onClick={() => downloadBlob(result.blob, 'resized.jpg')}
                className="mt-2 text-sm text-primary-600 font-medium hover:underline">⬇ Download</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══ Tab 2: Aadhaar Combiner ═══
function AadhaarTab() {
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [outputType, setOutputType] = useState('IMAGE');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleFront = (e) => { const f = e.target.files[0]; if (f) { setFront(f); setFrontPreview(URL.createObjectURL(f)); } };
  const handleBack = (e) => { const f = e.target.files[0]; if (f) { setBack(f); setBackPreview(URL.createObjectURL(f)); } };

  const handleCombine = async () => {
    if (!front || !back) { setError('Please upload both front and back images'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const fd = new FormData();
      fd.append('front', front);
      fd.append('back', back);
      fd.append('outputType', outputType);
      const res = await toolsAPI.combineAadhaar(fd);
      const ext = outputType === 'PDF' ? 'pdf' : 'jpg';
      const type = outputType === 'PDF' ? 'application/pdf' : 'image/jpeg';
      const blob = new Blob([res.data], { type });
      downloadBlob(blob, `aadhaar_combined.${ext}`);
      setSuccess('Combined file downloaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Combine failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Front</label>
          <input type="file" accept="image/*" onChange={handleFront}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-semibold hover:file:bg-primary-100 cursor-pointer" />
          {frontPreview && <img src={frontPreview} alt="Front" className="mt-2 max-h-36 rounded-lg border" />}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Back</label>
          <input type="file" accept="image/*" onChange={handleBack}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-semibold hover:file:bg-primary-100 cursor-pointer" />
          {backPreview && <img src={backPreview} alt="Back" className="mt-2 max-h-36 rounded-lg border" />}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
        <div className="flex gap-4">
          {['IMAGE', 'PDF'].map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="outputType" value={t} checked={outputType === t}
                onChange={() => setOutputType(t)} className="text-primary-600 focus:ring-primary-500" />
              <span className="text-sm font-medium text-gray-700">{t === 'IMAGE' ? 'Image (JPG)' : 'PDF'}</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={handleCombine} disabled={loading || !front || !back}
        className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors">
        {loading ? 'Combining...' : 'Combine & Download'}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}
    </div>
  );
}

// ═══ Main Tools Page ═══
export default function Tools() {
  const [activeTab, setActiveTab] = useState('resize');

  const tabs = [
    { id: 'resize', label: '📸 Photo & Signature Resizer' },
    { id: 'aadhaar', label: '🪪 Aadhaar Combiner' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tools</h1>
        <p className="text-gray-500 mt-1">Image resize, compress, and Aadhaar combine utilities</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-primary-500'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'resize' && <ResizerTab />}
        {activeTab === 'aadhaar' && <AadhaarTab />}
      </div>
    </div>
  );
}
