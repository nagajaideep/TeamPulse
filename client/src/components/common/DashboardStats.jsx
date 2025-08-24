import React from 'react';
import { 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Users, 
  UserCheck,
  TrendingUp
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
            {subtitle && (
              <dd className="text-xs text-gray-400 mt-1">{subtitle}</dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const DashboardStats = ({ userRole, stats }) => {
  const getStatsForRole = () => {
    switch (userRole) {
      case 'student':
        return [
          {
            title: 'Active Tasks',
            value: stats.activeTasks || 0,
            icon: CheckSquare,
            color: 'text-blue-600',
            subtitle: 'Currently assigned'
          },
          {
            title: 'Completed Tasks',
            value: stats.completedTasks || 0,
            icon: CheckSquare,
            color: 'text-green-600',
            subtitle: 'This week'
          },
          {
            title: 'Upcoming Meetings',
            value: stats.upcomingMeetings || 0,
            icon: Calendar,
            color: 'text-yellow-600',
            subtitle: 'Next 7 days'
          },
          {
            title: 'Pending Feedback',
            value: stats.pendingFeedback || 0,
            icon: MessageSquare,
            color: 'text-purple-600',
            subtitle: 'To provide'
          }
        ];

      case 'mentor':
        return [
          {
            title: 'Assigned Tasks',
            value: stats.assignedTasks || 0,
            icon: CheckSquare,
            color: 'text-blue-600',
            subtitle: 'Tasks you created'
          },
          {
            title: 'Students Managed',
            value: stats.studentsManaged || 0,
            icon: Users,
            color: 'text-green-600',
            subtitle: 'Under your guidance'
          },
          {
            title: 'Upcoming Meetings',
            value: stats.upcomingMeetings || 0,
            icon: Calendar,
            color: 'text-yellow-600',
            subtitle: 'With students'
          },
          {
            title: 'Feedback Provided',
            value: stats.feedbackProvided || 0,
            icon: MessageSquare,
            color: 'text-purple-600',
            subtitle: 'This week'
          }
        ];

      case 'coach':
        return [
          {
            title: 'Total Tasks',
            value: stats.totalTasks || 0,
            icon: CheckSquare,
            color: 'text-blue-600',
            subtitle: 'Across all projects'
          },
          {
            title: 'Total Students',
            value: stats.totalStudents || 0,
            icon: UserCheck,
            color: 'text-green-600',
            subtitle: 'Active learners'
          },
          {
            title: 'Total Mentors',
            value: stats.totalMentors || 0,
            icon: Users,
            color: 'text-yellow-600',
            subtitle: 'Active mentors'
          },
          {
            title: 'Completion Rate',
            value: `${stats.completionRate || 0}%`,
            icon: TrendingUp,
            color: 'text-purple-600',
            subtitle: 'Overall progress'
          }
        ];

      default:
        return [];
    }
  };

  const statsData = getStatsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          subtitle={stat.subtitle}
        />
      ))}
    </div>
  );
};

export default DashboardStats;