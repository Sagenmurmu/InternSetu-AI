import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Sparkles, X } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import Button from '../common/Button';

export default function ResumeParserBox({ onProfileDataParsed }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    // Constraints check: 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      setError("Unsupported format. Only PDF, DOCX, and TXT are supported.");
      return;
    }

    setFileName(file.name);
    setError('');
    setLoading(true);
    setParsedResult(null);

    try {
      const data = await candidateService.parseResume(file);
      setParsedResult(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Failed to parse resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleApply = () => {
    if (parsedResult) {
      onProfileDataParsed(parsedResult);
      setParsedResult(null);
      setFileName('');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-bold text-gray-900">AI Resume Profile Auto-Fill</h3>
      </div>
      <p className="text-xs text-gray-500">
        Upload your resume (PDF, DOCX, or TXT up to 5MB) to automatically parse qualifications and skills into your profile.
      </p>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
            : 'border-gray-300 hover:border-indigo-400 bg-gray-50/50 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={handleChange}
        />
        <UploadCloud className={`w-10 h-10 mb-3 transition-colors ${dragActive ? 'text-indigo-600' : 'text-gray-400'}`} />
        <p className="text-sm font-medium text-gray-700">
          Drag and drop your file here, or <span className="text-indigo-600 font-semibold">browse</span>
        </p>
        <p className="text-[10px] text-gray-400 mt-1">PDF, DOCX, TXT up to 5MB</p>
      </div>

      {/* Status Bar */}
      {loading && (
        <div className="flex items-center justify-center space-x-2 py-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
          <span className="text-xs font-semibold text-gray-600">Parsing "{fileName}" with AI...</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Parsed Result Verification Modal / Box */}
      {parsedResult && (
        <div className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100/80 space-y-3 relative">
          <button 
            onClick={() => setParsedResult(null)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-xs">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Successfully Extracted Fields!</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 font-medium">Name:</span>
              <p className="font-semibold text-gray-800">{parsedResult.name || 'Not detected'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-medium">Email:</span>
              <p className="font-semibold text-gray-800">{parsedResult.email || 'Not detected'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-medium">Phone:</span>
              <p className="font-semibold text-gray-800">{parsedResult.phone || 'Not detected'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-medium">Qualification:</span>
              <p className="font-semibold text-gray-800">{parsedResult.qualification}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <span className="text-gray-400 font-medium">Skills Extracted ({parsedResult.skills?.length || 0}):</span>
            {parsedResult.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {parsedResult.skills.map((skill) => (
                  <span key={skill} className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium text-[10px]">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No matching platform skills identified.</p>
            )}
          </div>

          {parsedResult.raw_text_preview && (
            <div className="space-y-1 text-xs">
              <span className="text-gray-400 font-medium">Text Preview:</span>
              <div className="bg-white p-2 rounded border border-gray-200 text-[10px] text-gray-500 font-mono line-clamp-3 overflow-hidden">
                {parsedResult.raw_text_preview}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button size="sm" onClick={handleApply} className="w-full sm:w-auto">
              Auto-Fill Form Fields
            </Button>
            <Button size="sm" variant="outline" onClick={() => setParsedResult(null)} className="w-full sm:w-auto">
              Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
