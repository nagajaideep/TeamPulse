import { 
  SquareUserRound, 
  UserRound, 
  KeySquare 
} from 'lucide-react';

// Role-based utility functions
export const getRoleIcon = (role) => {
  switch (role) {
    case 'student':
      return <SquareUserRound className="h-5 w-5" />;
    case 'mentor':
      return <UserRound className="h-5 w-5" />;
    case 'coach':
      return <KeySquare className="h-5 w-5" />;
    default:
      return <UserRound className="h-5 w-5" />;
  }
};

export const getRoleColor = (role) => {
  switch (role) {
    case 'student':
      return 'text-blue-600 bg-blue-100';
    case 'mentor':
      return 'text-green-600 bg-green-100';
    case 'coach':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Done': 
      return 'text-green-600 bg-green-100';
    case 'In Progress': 
      return 'text-blue-600 bg-blue-100';
    case 'Review': 
      return 'text-yellow-600 bg-yellow-100';
    default: 
      return 'text-gray-600 bg-gray-100';
  }
};

export const formatUserRole = (role) => {
  switch (role) {
    case 'student':
      return 'Student';
    case 'mentor':
      return 'Mentor';
    case 'coach':
      return 'Coach';
    default:
      return role;
  }
};

export const formatDashboardTitle = (role) => {
  switch (role) {
    case 'student':
      return 'Student Dashboard';
    case 'mentor':
      return 'Mentor Dashboard';
    case 'coach':
      return 'Coach Dashboard';
    default:
      return 'Dashboard';
  }
};
