
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, UserPlus, Calendar, AlertCircle, BarChart3, 
  Users, Map as MapIcon, Settings, LogOut, Menu, X, Bell, 
  Search, User as UserIcon, Wifi, WifiOff, RefreshCw, Check
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { syncService } from '../services/syncService';
import { UserRole, ApprovalStatus } from '../types';

// Define the interface for navigation items to support optional badge counts
interface NavItem {
  to: string;
  icon: any;
  label: string;
  badgeCount?: number;
}

const SidebarLink = ({ to, icon: Icon, label, active, onClick, badgeCount }: any) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    <div className="flex items-center space-x-3">
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
    {badgeCount > 0 && (
      <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
        {badgeCount}
      </span>
    )}
  </Link>
);

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = storageService.getCurrentUser();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for pending requests
    const updateRequestsCount = () => {
      const users = storageService.getUsers();
      const count = users.filter(u => 
        u.approvalStatus === ApprovalStatus.PENDING || 
        u.accountDeletionRequested || 
        (u as any).approvalStatus === 'pending_change'
      ).length;
      setPendingRequestsCount(count);
    };
    
    updateRequestsCount();
    window.addEventListener('storage', updateRequestsCount);
    window.addEventListener('auth-change', updateRequestsCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', updateRequestsCount);
      window.removeEventListener('auth-change', updateRequestsCount);
    };
  }, [currentUser]);

  const navItems: NavItem[] = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/register', icon: UserPlus, label: 'Register Child' },
    { to: '/schedule', icon: Calendar, label: 'EPI Schedule' },
    { to: '/defaulters', icon: AlertCircle, label: 'Defaulters' },
    { to: '/reports', icon: BarChart3, label: 'Analytics' },
  ];

  if (currentUser?.userRole === UserRole.ADMIN) {
    navItems.push(
      { to: '/users', icon: Users, label: 'User Management', badgeCount: pendingRequestsCount },
      { to: '/map', icon: MapIcon, label: 'Coverage Map' }
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-x-hidden font-sans">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col overflow-y-auto">
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">G</div>
              <h1 className="font-black text-slate-800 tracking-tight leading-none">GAM EPI</h1>
            </div>
            <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <SidebarLink 
                key={item.to} 
                {...item} 
                active={location.pathname === item.to} 
                onClick={() => setIsSidebarOpen(false)} 
                badgeCount={item.badgeCount}
              />
            ))}
          </nav>

          <div className="p-6 border-t border-slate-50 space-y-2">
            <SidebarLink 
              to="/settings" 
              icon={Settings} 
              label="Settings" 
              active={location.pathname === '/settings'} 
              onClick={() => setIsSidebarOpen(false)}
            />
            
            <SidebarLink 
              to="/profile" 
              icon={UserIcon} 
              label="My Profile" 
              active={location.pathname === '/profile'} 
              onClick={() => setIsSidebarOpen(false)}
            />
            
            <button 
              onClick={() => { storageService.setCurrentUser(null); navigate('/login'); }} 
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 font-medium transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-2 bg-slate-100 text-slate-600 rounded-lg" onClick={() => setIsSidebarOpen(true)}><Menu size={20} /></button>
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600 animate-pulse'}`}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 lg:space-x-6">
            <button 
              onClick={() => currentUser?.userRole === UserRole.ADMIN ? navigate('/users') : navigate('/')}
              className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative group"
            >
              <Bell size={20} />
              {pendingRequestsCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full group-hover:animate-ping"></span>
              )}
            </button>

            <div 
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800">{currentUser?.fullName}</span>
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{currentUser?.healthCenter}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-inner">
                <img src={currentUser?.profilePhoto || `https://ui-avatars.com/api/?name=${currentUser?.fullName}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10 overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
