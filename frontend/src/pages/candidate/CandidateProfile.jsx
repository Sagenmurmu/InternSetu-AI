import React, { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { candidateService } from '../../services/candidateService';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import ProfileCompletionCard from '../../components/candidate/ProfileCompletionCard';
import ResumeParserBox from '../../components/candidate/ResumeParserBox';
import { STATES, QUALIFICATIONS, SECTORS, GENDERS, CATEGORIES, RURAL_URBAN, SKILLS } from '../../utils/constants';

export default function CandidateProfile() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fromParser, setFromParser] = useState(false);

  useEffect(() => {
    if (user?.candidateData) {
      setFormData({ ...user.candidateData });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSaved(false);
  };

  const handleSkillToggle = (skill) => {
    setFormData((prev) => {
      const skills = (prev.skills || []).includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...(prev.skills || []), skill];
      return { ...prev, skills };
    });
    setSaved(false);
  };

  const handleProfileDataParsed = (parsed) => {
    setFormData((prev) => {
      const existingSkills = prev.skills || [];
      const parsedSkills = parsed.skills || [];
      const mergedSkills = Array.from(new Set([...existingSkills, ...parsedSkills]));

      return {
        ...prev,
        name: parsed.name || prev.name,
        qualification: parsed.qualification || prev.qualification,
        skills: mergedSkills,
      };
    });
    setFromParser(true);
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await candidateService.updateProfile(user.id, formData, fromParser);
      updateProfile(formData);
      setSaved(true);
      setFromParser(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Keep your profile updated for better AI recommendations
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Completion & AI Parser */}
        <div className="space-y-6">
          <ProfileCompletionCard percentage={formData.profileCompletion || 0} />
          <ResumeParserBox onProfileDataParsed={handleProfileDataParsed} />
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                <Input label="Email" name="email" value={formData.email || ''} onChange={handleChange} disabled />
                <Input label="Age" name="age" type="number" value={formData.age || ''} onChange={handleChange} />
                <Select label="Gender" name="gender" value={formData.gender || ''} onChange={handleChange} options={GENDERS} />
                <Select label="Category" name="category" value={formData.category || ''} onChange={handleChange} options={CATEGORIES} />
                <Select label="Rural / Urban" name="ruralOrUrban" value={formData.ruralOrUrban || ''} onChange={handleChange} options={RURAL_URBAN} />
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Location</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="District" name="district" value={formData.district || ''} onChange={handleChange} />
                <Select label="State" name="state" value={formData.state || ''} onChange={handleChange} options={STATES} required />
              </div>
            </div>

            {/* Education */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Education</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Select label="Qualification" name="qualification" value={formData.qualification || ''} onChange={handleChange} options={QUALIFICATIONS} required />
                <Input label="Course / Branch" name="course" value={formData.course || ''} onChange={handleChange} />
                <Input label="College" name="college" value={formData.college || ''} onChange={handleChange} className="sm:col-span-2" />
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => {
                  const selected = (formData.skills || []).includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selected
                          ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Preferences</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Select label="Sector Interest" name="sectorInterest" value={formData.sectorInterest || ''} onChange={handleChange} options={SECTORS} />
                <Input label="Location Preference" name="locationPreference" value={formData.locationPreference || ''} onChange={handleChange} placeholder="e.g., Bengaluru" />
              </div>
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  name="willingToRelocate"
                  checked={formData.willingToRelocate || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Willing to relocate</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving} icon={saved ? CheckCircle : Save}>
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
              </Button>
              {saved && <p className="text-sm text-green-600 font-medium">Profile updated successfully!</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
