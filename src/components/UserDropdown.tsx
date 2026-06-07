import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleManagement = () => {
    navigate('/management');
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg border px-4 py-2 transition-all duration-200 hover:scale-105"
        style={{ backgroundColor: 'rgba(25, 18, 17, 0.68)', borderColor: 'rgba(239, 68, 68, 0.5)' }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border"
          style={{ backgroundColor: 'rgba(127, 29, 29, 0.35)', borderColor: 'rgba(239, 68, 68, 0.45)' }}
        >
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
          ) : (
            <User className="h-4 w-4 text-red-50" />
          )}
        </div>
        <span className="hidden text-sm font-medium text-red-50 sm:inline">
          {user.display_name || user.username}
        </span>
        <ChevronDown className={`h-4 w-4 text-red-100 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-72 rounded-lg border-2 shadow-xl animate-fade-in"
          style={{ backgroundColor: 'rgba(24, 18, 16, 0.98)', borderColor: 'rgba(185, 28, 28, 0.72)' }}
        >
          <div className="border-b border-red-900/40 p-4">
            <div className="flex items-center space-x-3">
              <div
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border"
                style={{ backgroundColor: 'rgba(127, 29, 29, 0.35)', borderColor: 'rgba(239, 68, 68, 0.45)' }}
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-red-50" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-stone-50">{user.display_name || user.username}</p>
                <p className="truncate text-sm text-red-100/80">Discord ID: {user.discord_id}</p>
                <span className="mt-2 inline-flex items-center rounded border border-red-500/40 bg-red-500/15 px-2 py-1 text-xs font-medium text-red-100">
                  <Shield className="mr-1 h-3 w-3" />
                  {user.role_name}
                </span>
              </div>
            </div>
          </div>

          <div className="py-2">
            {user.dashboard_access && (
              <button
                onClick={handleManagement}
                className="flex w-full items-center space-x-3 px-4 py-3 text-red-100 transition-colors hover:bg-red-950/35"
              >
                <Shield className="h-5 w-5" />
                <span>Management</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center space-x-3 border-t border-red-900/40 px-4 py-3 text-red-300 transition-colors hover:bg-red-500/15"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
