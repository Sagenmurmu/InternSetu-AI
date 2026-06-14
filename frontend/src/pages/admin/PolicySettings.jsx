import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Sliders, RefreshCw, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function PolicySettings() {
  const [weights, setWeights] = useState({
    skill_weight: 0.35,
    qualification_weight: 0.20,
    location_weight: 0.15,
    sector_weight: 0.15,
    fairness_weight: 0.15,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchWeights();
  }, []);

  const fetchWeights = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPolicyWeights();
      setWeights({
        skill_weight: data.skill_weight,
        qualification_weight: data.qualification_weight,
        location_weight: data.location_weight,
        sector_weight: data.sector_weight,
        fairness_weight: data.fairness_weight,
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to retrieve policy weights.' });
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (key, value) => {
    const floatVal = parseFloat(value) / 100;
    setWeights((prev) => ({
      ...prev,
      [key]: isNaN(floatVal) ? 0 : parseFloat(floatVal.toFixed(3)),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (Math.abs(totalSum - 100) > 0.1) {
      setMessage({ type: 'error', text: 'Sum of weights must equal exactly 100% before saving.' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      await adminService.updatePolicyWeights(weights);
      setMessage({ type: 'success', text: 'Matching weights updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update weights.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await adminService.resetPolicyWeights();
      await fetchWeights();
      setMessage({ type: 'success', text: 'Matching weights reset to defaults.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to reset weights.' });
    } finally {
      setSaving(false);
    }
  };

  const totalSum = Math.round(
    (weights.skill_weight +
      weights.qualification_weight +
      weights.location_weight +
      weights.sector_weight +
      weights.fairness_weight) *
      100
  );

  const isValid = Math.abs(totalSum - 100) < 0.1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI Matching Policy Settings</h1>
          <p className="mt-2 text-sm text-gray-500">
            Dynamically adjust matching weights used in the platform recommendation formula. Changes apply in real-time.
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md flex items-start space-x-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Card */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-950 flex items-center">
            <Sliders className="h-5 w-5 text-indigo-600 mr-2" />
            Adjust Matching Weights
          </h2>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Skill weight */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <label htmlFor="skill_weight">Skill Alignment Weight</label>
                <span className="text-indigo-600 font-bold">{Math.round(weights.skill_weight * 100)}%</span>
              </div>
              <input
                type="range"
                id="skill_weight"
                min="0"
                max="100"
                value={Math.round(weights.skill_weight * 100)}
                onChange={(e) => handleWeightChange('skill_weight', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Qualification weight */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <label htmlFor="qualification_weight">Academic Qualification Weight</label>
                <span className="text-indigo-600 font-bold">{Math.round(weights.qualification_weight * 100)}%</span>
              </div>
              <input
                type="range"
                id="qualification_weight"
                min="0"
                max="100"
                value={Math.round(weights.qualification_weight * 100)}
                onChange={(e) => handleWeightChange('qualification_weight', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Location weight */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <label htmlFor="location_weight">Location Proximity Weight</label>
                <span className="text-indigo-600 font-bold">{Math.round(weights.location_weight * 100)}%</span>
              </div>
              <input
                type="range"
                id="location_weight"
                min="0"
                max="100"
                value={Math.round(weights.location_weight * 100)}
                onChange={(e) => handleWeightChange('location_weight', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Sector weight */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <label htmlFor="sector_weight">Sector Interest Alignment Weight</label>
                <span className="text-indigo-600 font-bold">{Math.round(weights.sector_weight * 100)}%</span>
              </div>
              <input
                type="range"
                id="sector_weight"
                min="0"
                max="100"
                value={Math.round(weights.sector_weight * 100)}
                onChange={(e) => handleWeightChange('sector_weight', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Fairness weight */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <label htmlFor="fairness_weight">Demographic Fairness Weight</label>
                <span className="text-indigo-600 font-bold">{Math.round(weights.fairness_weight * 100)}%</span>
              </div>
              <input
                type="range"
                id="fairness_weight"
                min="0"
                max="100"
                value={Math.round(weights.fairness_weight * 100)}
                onChange={(e) => handleWeightChange('fairness_weight', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !isValid}
              className="mt-4 w-full flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Match Policy Weights
            </button>
          </form>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-950">Formula Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Skill Match:</span>
                <span className="font-semibold">{Math.round(weights.skill_weight * 100)}%</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Academic Match:</span>
                <span className="font-semibold">{Math.round(weights.qualification_weight * 100)}%</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Location Proximity:</span>
                <span className="font-semibold">{Math.round(weights.location_weight * 100)}%</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sector Alignment:</span>
                <span className="font-semibold">{Math.round(weights.sector_weight * 100)}%</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Demographic Fairness:</span>
                <span className="font-semibold">{Math.round(weights.fairness_weight * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-5 mt-6">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-gray-900">Total Sum:</span>
              <span
                className={`text-xl font-extrabold ${
                  isValid ? 'text-green-600' : 'text-red-500 animate-pulse'
                }`}
              >
                {totalSum}%
              </span>
            </div>
            {!isValid && (
              <p className="mt-2 text-xs text-red-500 font-medium">
                The total sum must equal exactly 100%. Currently it is {totalSum}%.
              </p>
            )}
            {isValid && (
              <p className="mt-2 text-xs text-green-600 font-medium flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Sum is valid and ready to save.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
