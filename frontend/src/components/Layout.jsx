import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/applications', label: 'Applications', icon: '📋' },
  { to: '/tools', label: 'Tools', icon: '🛠️' },
  { to: '/resume', label: 'Resume', icon: '📄' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    notificationsAPI.getUnreadCount()
      .then((res) => setUnreadCount(res.data.data || 0))
      .catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-extrabold text-lg">G</span>
              </div>
              <span className="text-xl font-extrabold text-gray-900 hidden sm:block">GovJobVault</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-5">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
                  {link.icon} {link.label}
                </NavLink>
              ))}

              <NavLink to="/notifications" className={linkClass}>
                <span className="relative">
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
              </NavLink>

              {/* User */}
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-sm">{user?.fullName?.charAt(0)?.toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden lg:block">{user?.fullName}</span>
                <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">Logout</button>
              </div>
            </div>

            {/* Mobile Hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }>
                  {link.icon} {link.label}
                </NavLink>
              ))}
              <NavLink to="/notifications" onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }>
                🔔 Notifications {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
              </NavLink>
              <div className="border-t border-gray-100 pt-2 mt-2 flex items-center justify-between px-3">
                <span className="text-sm text-gray-600">{user?.fullName}</span>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="text-sm text-red-500 font-medium">Logout</button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
