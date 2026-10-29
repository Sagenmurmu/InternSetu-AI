/**
 * Utility to calculate real-time candidate profile completion and section checklists.
 */
export const calculateClientProfileCompletion = (formData = {}) => {
  const name = (formData.name || '').trim();
  const email = (formData.email || '').trim();
  const state = (formData.state || '').trim();
  const qualification = (formData.qualification || '').trim();
  const skills = Array.isArray(formData.skills) ? formData.skills : [];

  const requiredFields = [
    { name: 'Full Name', filled: Boolean(name) },
    { name: 'Email', filled: Boolean(email) },
    { name: 'State', filled: Boolean(state) },
    { name: 'Qualification', filled: Boolean(qualification) },
    { name: 'Skills', filled: skills.length > 0 },
  ];

  const optionalFields = [
    Boolean(formData.age),
    Boolean(formData.gender),
    Boolean(formData.category),
    Boolean(formData.ruralOrUrban),
    Boolean((formData.district || '').trim()),
    Boolean((formData.course || '').trim()),
    Boolean((formData.college || '').trim()),
    Boolean(formData.sectorInterest),
    Boolean((formData.locationPreference || '').trim()),
  ];

  const filledRequiredCount = requiredFields.filter((f) => f.filled).length;
  const filledOptionalCount = optionalFields.filter(Boolean).length;

  const totalTrackable = requiredFields.length + optionalFields.length; // 5 + 9 = 14
  const totalFilled = filledRequiredCount + filledOptionalCount;

  let percentage = Math.round((totalFilled / totalTrackable) * 100);

  // If any required field is missing, score cannot exceed 90% and NEVER 100%
  const allRequiredFilled = filledRequiredCount === requiredFields.length;
  if (!allRequiredFilled && percentage >= 90) {
    percentage = 90;
  }

  // Meaningful section-level progress checks
  const basicInfoFilled = Boolean(name && email);
  const educationFilled = Boolean(qualification);
  const skillsFilled = skills.length > 0;
  const locationFilled = Boolean(state);
  const fullProfile = allRequiredFilled && totalFilled === totalTrackable;

  return {
    percentage,
    allRequiredFilled,
    missingRequired: requiredFields.filter((f) => !f.filled).map((f) => f.name),
    sections: {
      basic: basicInfoFilled,
      education: educationFilled,
      skills: skillsFilled,
      location: locationFilled,
      fullProfile,
    },
  };
};

