import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  BarChart3,
  Users,
  UserRound,
  KeySquare,
  SquareUserRound
} from 'lucide-react';

const RoleBasedNavigation = ({ sidebarOpen, setSidebarOpen }) => {
  // Call router hooks unconditionally (hooks must keep stable order)
  const navigate = useNavigate();
  const location = useLocation();

  // Guard useAuth in case this component is rendered outside AuthProvider (preview/test envs)
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user ?? null;
  } catch (err) {
    user = null;
  }

  // If no user available, render a minimal placeholder (previews may mount this component standalone)
  if (!user) {
    return (
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-semibold text-gray-900">TeamPulse</h1>
          </div>
          <div className="p-4 text-sm text-gray-500">Loading navigation...</div>
        </div>
      </div>
    );
  }

  const getNavigationItems = () => {
    const baseItems = [
      { 
        name: 'Dashboard', 
        href: `/dashboard/${user.role}`, 
        icon: LayoutDashboard,
        roles: ['student', 'mentor', 'coach']
      },
      { 
        name: user.role === 'student' ? 'My Tasks' : 'Tasks', 
        href: `/dashboard/${user.role}/tasks`, 
        icon: CheckSquare,
        roles: ['student', 'mentor', 'coach']
      },
      { 
        name: 'Calendar', 
        href: `/dashboard/${user.role}/calendar`, 
        icon: Calendar,
        roles: ['student', 'mentor', 'coach']
      },
      { 
        name: 'Feedback', 
        href: `/dashboard/${user.role}/feedback`, 
        icon: MessageSquare,
        roles: ['student', 'mentor', 'coach']
      }
    ];

    // Add role-specific items
    if (user.role === 'mentor') {
      baseItems.push({
        name: 'My Reports',
        href: `/dashboard/${user.role}/reports`,
        icon: BarChart3,
        roles: ['mentor']
      });
    }

    if (user.role === 'coach') {
      baseItems.push(
        {
          name: 'Team Reports',
          href: `/dashboard/${user.role}/reports`,
          icon: BarChart3,
          roles: ['coach']
        },
        {
          name: 'Manage Users',
          href: `/dashboard/${user.role}/users`,
          icon: Users,
          roles: ['coach']
        }
      );
    }

    return baseItems.filter(item => item.roles.includes(user.role));
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getRoleIcon = (role) => {
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

  const getRoleColor = (role) => {
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

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-gray-900">TeamPulse</h1>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                {getRoleIcon(user.role)}
                <span className="ml-1 capitalize">{user.role}</span>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-gray-900">TeamPulse</h1>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                {getRoleIcon(user.role)}
                <span className="ml-1 capitalize">{user.role}</span>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default RoleBasedNavigation;