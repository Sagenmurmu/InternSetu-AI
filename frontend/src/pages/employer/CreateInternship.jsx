import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { internshipService } from '../../services/internshipService';
import InternshipForm from '../../components/employer/InternshipForm';

export default function CreateInternship() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await internshipService.create(formData, user.companyId);
      setSuccess(true);
      setTimeout(() => {
        navigate('/employer/dashboard');
      }, 2000);
    } catch (err) {
      alert(err.message || 'Failed to create internship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <PlusCircle className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Create New Internship</h1>
        </div>
        <p className="text-sm text-gray-500">
          Fill in the details below. AI matching will automatically rank candidates once posted.
        </p>
      </div>

      {success ? (
        <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-10 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Internship Created!</h2>
          <p className="text-gray-500">
            AI matching has been triggered automatically. Redirecting to dashboard...
          </p>
        </div>
      ) : (
        <InternshipForm onSubmit={handleSubmit} loading={loading} />
      )}
    </div>
  );
}
