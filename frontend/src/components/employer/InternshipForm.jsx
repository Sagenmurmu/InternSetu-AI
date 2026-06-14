import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { SECTORS, QUALIFICATIONS, STATES, MODES, SKILLS } from '../../utils/constants';
import { validateRequired, validateCapacity, validateStipend } from '../../utils/validators';
import { Save } from 'lucide-react';

export default function InternshipForm({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sector: '',
    requiredSkills: [],
    requiredQualification: '',
    location: '',
    district: '',
    state: '',
    duration: '3 months',
    stipend: '',
    capacity: '',
    mode: 'Remote',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSkillToggle = (skill) => {
    setFormData((prev) => {
      const skills = prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter((s) => s !== skill)
        : [...prev.requiredSkills, skill];
      return { ...prev, requiredSkills: skills };
    });
  };

  const validate = () => {
    const errs = {};
    errs.title = validateRequired(formData.title, 'Title');
    errs.description = validateRequired(formData.description, 'Description');
    errs.sector = validateRequired(formData.sector, 'Sector');
    errs.requiredQualification = validateRequired(formData.requiredQualification, 'Qualification');
    errs.location = validateRequired(formData.location, 'Location');
    errs.state = validateRequired(formData.state, 'State');
    errs.stipend = validateStipend(formData.stipend);
    errs.capacity = validateCapacity(formData.capacity);

    Object.keys(errs).forEach((k) => { if (!errs[k]) delete errs[k]; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-4">Internship Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Title" name="title" value={formData.title} onChange={handleChange} error={errors.title} required placeholder="e.g., Full Stack Developer Intern" className="sm:col-span-2" />
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the role, responsibilities, and learning opportunities..."
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}`}
            />
            {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
          </div>
          <Select label="Sector" name="sector" value={formData.sector} onChange={handleChange} options={SECTORS} error={errors.sector} required />
          <Select label="Required Qualification" name="requiredQualification" value={formData.requiredQualification} onChange={handleChange} options={QUALIFICATIONS} error={errors.requiredQualification} required />
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-4">Required Skills</h3>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => {
            const selected = formData.requiredSkills.includes(skill);
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

      {/* Location & Logistics */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-4">Location & Logistics</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="City / Location" name="location" value={formData.location} onChange={handleChange} error={errors.location} required placeholder="e.g., Bengaluru" />
          <Select label="State" name="state" value={formData.state} onChange={handleChange} options={STATES} error={errors.state} required />
          <Select label="Mode" name="mode" value={formData.mode} onChange={handleChange} options={MODES} />
          <Input label="Duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 3 months" />
          <Input label="Stipend (₹/month)" name="stipend" type="number" value={formData.stipend} onChange={handleChange} error={errors.stipend} required placeholder="e.g., 15000" />
          <Input label="Capacity (seats)" name="capacity" type="number" value={formData.capacity} onChange={handleChange} error={errors.capacity} required placeholder="e.g., 10" />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button type="submit" disabled={loading} icon={Save} size="lg">
          {loading ? 'Creating...' : 'Create Internship'}
        </Button>
      </div>
    </form>
  );
}
