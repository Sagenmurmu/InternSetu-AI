// ============================================================
// InternSetu AI — Helper Functions
// ============================================================

export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateRemainingCapacity(capacity, selectedCount) {
  return Math.max(0, capacity - selectedCount);
}

export function getStatusColor(status) {
  const colors = {
    Applied: 'bg-blue-100 text-blue-800',
    Shortlisted: 'bg-purple-100 text-purple-800',
    Selected: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
    Waitlisted: 'bg-yellow-100 text-yellow-800',
    Recommended: 'bg-indigo-100 text-indigo-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusDotColor(status) {
  const colors = {
    Applied: 'bg-blue-500',
    Shortlisted: 'bg-purple-500',
    Selected: 'bg-green-500',
    Rejected: 'bg-red-500',
    Waitlisted: 'bg-yellow-500',
  };
  return colors[status] || 'bg-gray-500';
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getScoreColor(score) {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function getScoreBgColor(score) {
  if (score >= 90) return 'bg-green-50 border-green-200';
  if (score >= 75) return 'bg-blue-50 border-blue-200';
  if (score >= 60) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
}

export function generateId(prefix = 'ID') {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
