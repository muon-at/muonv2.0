import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import '../styles/RightNavBar.css';

interface NavItem {
  emoji: string;
  label: string;
  path?: string;
  action?: () => void;
  requiresRole?: string[];
  requiresAdmin?: boolean;
  requiresTeamlead?: boolean;
}

export const RightNavBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    {
      emoji: '🚪',
      label: 'Logg ut',
      action: () => {
        logout();
        navigate('/login');
      },
    },
    {
      emoji: '⬅️',
      label: 'Tilbake',
      action: () => navigate(-1),
    },
    {
      emoji: '⚙️',
      label: 'Admin',
      path: '/admin',
      requiresRole: ['owner'],
    },
    {
      emoji: '👔',
      label: 'Teamlederpanel',
      path: '/teamleder',
      requiresRole: ['owner', 'teamlead'],
    },
    {
      emoji: '👤',
      label: 'Min Side',
      path: '/min-side',
    },
    {
      emoji: '🌐',
      label: 'Global Chat',
      path: '/chat',
    },
    {
      emoji: '🏢',
      label: user?.department || 'Avdeling',
      path: `/chat?channel=${user?.department}`,
    },
    {
      emoji: '💼',
      label: 'Allente',
      path: '/chat?channel=allente',
      requiresRole: ['owner', 'teamlead', 'employee'],
    },
    {
      emoji: '👥',
      label: 'Teamlederchat',
      path: '/chat?channel=teamledere',
      requiresRole: ['owner', 'teamlead'],
    },
    {
      emoji: '🔒',
      label: 'Adminchat',
      path: '/chat?channel=admin',
      requiresRole: ['owner'],
    },
  ];

  const isAccessible = (item: NavItem): boolean => {
    if (!user) return false;

    // Check role requirements
    if (item.requiresRole && !item.requiresRole.includes(user.role || '')) {
      return false;
    }

    return true;
  };

  const handleClick = (item: NavItem) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <nav className="right-nav-bar">
      <div className="nav-items">
        {navItems
          .filter((item) => isAccessible(item))
          .map((item, index) => (
            <button
              key={index}
              className="nav-button"
              onClick={() => handleClick(item)}
              title={item.label}
            >
              <span className="nav-emoji">{item.emoji}</span>
              <span className="nav-tooltip">{item.label}</span>
            </button>
          ))}
      </div>
    </nav>
  );
};
