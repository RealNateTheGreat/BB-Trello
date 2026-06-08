import React, { useEffect, useState } from 'react';
import { Award, FolderKanban, Home, LogIn, Megaphone, Menu, Shield, X } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnnouncementsModal from './AnnouncementsModal';
import LoginModal from './LoginModal';
import UserDropdown from './UserDropdown';

const DISCORD_INVITE = import.meta.env.VITE_DISCORD_INVITE_URL || 'https://discord.gg/8QeE9RPtcA';

const TopNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAnnouncementsModalOpen, setIsAnnouncementsModalOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openDiscord = () => {
    window.open(DISCORD_INVITE, '_blank', 'noopener,noreferrer');
    setIsMobileMenuOpen(false);
  };

  const navButtonStyle = {
    backgroundColor: 'rgba(25, 18, 17, 0.68)',
    borderColor: 'rgba(239, 68, 68, 0.5)'
  };

  const navButtonClass =
    'flex h-10 shrink-0 items-center justify-center space-x-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium text-red-50 transition-all duration-200 hover:-translate-y-0.5 hover:text-white hover:bg-red-900/30';

  return (
    <>
      <nav
        className={`hidden md:block fixed top-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ${
          scrolled ? 'backdrop-blur-md' : 'backdrop-blur-sm'
        }`}
      >
        <div
          className="flex items-center space-x-3 rounded-lg border-2 px-5 py-3 shadow-2xl"
          style={{
            backgroundColor: scrolled ? 'rgba(12, 10, 10, 0.82)' : 'rgba(24, 18, 16, 0.94)',
            borderColor: 'rgba(185, 28, 28, 0.72)'
          }}
        >
          {!isHomePage && (
            <Link to="/" className={navButtonClass} style={navButtonStyle}>
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          )}

          <button onClick={openDiscord} className={`${navButtonClass} min-w-[13rem]`} style={navButtonStyle}>
            <FaDiscord className="w-4 h-4" />
            <span>Broken Blade Discord</span>
          </button>

          <Link to="/boards" className={`${navButtonClass} min-w-[8.5rem]`} style={navButtonStyle}>
            <FolderKanban className="w-4 h-4" />
            <span>Boards</span>
          </Link>

          <Link to="/credits" className={`${navButtonClass} min-w-[8.5rem]`} style={navButtonStyle}>
            <Award className="w-4 h-4" />
            <span>Credits</span>
          </Link>

          <button
            onClick={() => setIsAnnouncementsModalOpen(true)}
            className={`${navButtonClass} relative min-w-[11.5rem]`}
            style={navButtonStyle}
          >
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.95)]">
              <span className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping" />
            </span>
            <Megaphone className="w-4 h-4" />
            <span>Announcements</span>
          </button>

          {user ? (
            <UserDropdown />
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className={`${navButtonClass} min-w-[8rem]`} style={navButtonStyle}>
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </nav>

      <nav className="md:hidden fixed top-0 left-0 right-0 z-50">
        <div
          className={`border-b-2 px-4 py-3 shadow-xl transition-all duration-500 ${
            scrolled ? 'backdrop-blur-md' : 'backdrop-blur-sm'
          }`}
          style={{
            backgroundColor: scrolled ? 'rgba(12, 10, 10, 0.9)' : 'rgba(24, 18, 16, 0.96)',
            borderColor: 'rgba(185, 28, 28, 0.72)'
          }}
        >
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
              <div
                className="rounded-lg border p-2"
                style={{ backgroundColor: 'rgba(127, 29, 29, 0.25)', borderColor: '#7F1D1D' }}
              >
                <Shield className="h-6 w-6 text-red-100" />
              </div>
              <span className="text-red-50 font-bold text-lg">Broken Blade</span>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg border p-2 transition-all duration-200"
              style={{ backgroundColor: 'rgba(25, 18, 17, 0.68)', borderColor: '#7F1D1D' }}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-red-50" /> : <Menu className="w-6 h-6 text-red-50" />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="mt-4 space-y-2 pb-4 animate-fade-in">
              {!isHomePage && (
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={navButtonClass + ' w-full justify-start'}
                  style={navButtonStyle}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
              )}

              <button onClick={openDiscord} className={navButtonClass + ' w-full justify-start'} style={navButtonStyle}>
                <FaDiscord className="w-5 h-5" />
                <span>Broken Blade Discord</span>
              </button>

              <Link
                to="/boards"
                onClick={() => setIsMobileMenuOpen(false)}
                className={navButtonClass + ' w-full justify-start'}
                style={navButtonStyle}
              >
                <FolderKanban className="w-5 h-5" />
                <span>Boards</span>
              </Link>

              <Link
                to="/credits"
                onClick={() => setIsMobileMenuOpen(false)}
                className={navButtonClass + ' w-full justify-start'}
                style={navButtonStyle}
              >
                <Award className="w-5 h-5" />
                <span>Credits</span>
              </Link>

              <button
                onClick={() => {
                  setIsAnnouncementsModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className={navButtonClass + ' relative w-full justify-start'}
                style={navButtonStyle}
              >
                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.95)]">
                  <span className="absolute inset-0 rounded-full bg-red-400 opacity-75 animate-ping" />
                </span>
                <Megaphone className="w-5 h-5" />
                <span>Announcements</span>
              </button>

              {user ? (
                <div className="pt-2 border-t border-red-900/40">
                  <UserDropdown />
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className={navButtonClass + ' w-full justify-start'}
                  style={navButtonStyle}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <AnnouncementsModal isOpen={isAnnouncementsModalOpen} onClose={() => setIsAnnouncementsModalOpen(false)} />
    </>
  );
};

export default TopNav;
