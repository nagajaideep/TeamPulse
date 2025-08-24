// Shared utility functions for tasks and dashboards

export function getPriorityColor(priority) {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'text-red-600 bg-red-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'low':
      return 'text-green-600 bg-green-100';
    case 'critical':
      return 'text-red-700 bg-red-200';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function isOverdue(deadline) {
  if (!deadline) return false;
  const now = new Date();
  const due = new Date(deadline);
  return due < now;
}
