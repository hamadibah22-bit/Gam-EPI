
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RegisterChild from './pages/RegisterChild';
import ChildProfile from './pages/ChildProfile';
import Certificate from './pages/Certificate';
import Schedule from './pages/Schedule';
import Defaulters from './pages/Defaulters';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import CoverageMap from './pages/CoverageMap';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import { storageService } from './services/storageService';
import { User, UserRole, ApprovalStatus } from './types';
import { HEALTH_FACILITIES } from './constants';
import { ShieldCheck, MapPin, ArrowRight, RefreshCw } from 'lucide-react';

// Context to handle PWA installation globally
export const InstallContext = React.createContext<{
  deferredPrompt: any;
  showInstallButton: boolean;
  installApp: () => void;
}>({ deferredPrompt: null, showInstallButton: false, installApp: () => {} });

const AuthCard = ({ children, title, subtitle }: { children?: React.ReactNode; title: string; subtitle: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 w-full max-w-lg border border-slate-100 animate-in zoom-in-95 duration-500">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/30 mb-6">G</div>
        <h1 className="text-2xl font-black text-slate-900">{title}</h1>
        <p className="text-slate-500 font-medium">{subtitle}</p>
      </div>
      {children}
    </div>
  </div>
);

const GoogleButton = ({ label, onClick, loading }: { label: string, onClick: () => void, loading?: boolean }) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className="w-full flex items-center justify-center space-x-3 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 active:scale-[0.98] disabled:opacity-50"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
    <span>{label}</span>
  </button>
);

const LoginView = () => {
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('admin@health.gm');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const users = storageService.getUsers();
    const user = users.find(u => tab === 'email' ? u.email === email : u.phoneNumber === phone);

    if (user) {
      if (user.approvalStatus !== ApprovalStatus.APPROVED) {
        alert("Your account is pending approval. Please wait for an administrator to activate your access.");
      } else {
        storageService.setCurrentUser(user);
        navigate('/');
      }
    } else {
      alert("Worker profile not found. If you are new, please Sign Up first.");
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const users = storageService.getUsers();
    // Simulate successful Google Auth
    const user = users.find(u => u.email === 'admin@health.gm');
    if (user) {
      storageService.setCurrentUser(user);
      navigate('/');
    } else {
      alert("This Google account is not linked to an active worker profile. Please Sign Up.");
    }
    setLoading(false);
  };

  return (
    <AuthCard title="Worker Sign In" subtitle="Gambia Immunization Hub">
      <div className="space-y-6">
        <GoogleButton label="Continue with Google" onClick={handleGoogleAuth} loading={loading} />
        
        <div className="flex items-center space-x-4 py-2">
          <div className="flex-1 h-[1px] bg-slate-100"></div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or use credentials</span>
          <div className="flex-1 h-[1px] bg-slate-100"></div>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button onClick={() => setTab('email')} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${tab === 'email' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Email</button>
          <button onClick={() => setTab('phone')} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${tab === 'phone' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Phone</button>
        </div>

        <div className="space-y-4">
          {tab === 'email' ? (
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm" placeholder="Email Address" />
          ) : (
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm" placeholder="+220 XXXXXXX" />
          )}
          <button onClick={handleLogin} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2">
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
        <p className="text-center text-sm text-slate-500 font-medium">New worker? <Link to="/signup" className="text-blue-600 font-black">Sign Up</Link></p>
      </div>
    </AuthCard>
  );
};

const SignupView = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    facility: HEALTH_FACILITIES[0]
  });
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!formData.fullName.trim() || !formData.email.trim()) {
      alert("Please provide your full name and work email.");
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const newSignup: User = {
      id: `worker-${Date.now()}`,
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phone || '0000000',
      position: 'Health Worker',
      healthCenter: formData.facility,
      userRole: UserRole.NEW,
      approvalStatus: ApprovalStatus.PENDING,
      profileCompleted: false,
      accountDeletionRequested: false,
      updatedAt: new Date().toISOString()
    };

    // CRITICAL: Correctly persist to storage so admin sees it in Action Inbox
    storageService.addUser(newSignup);
    
    setLoading(false);
    setStep(2);
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    // Simulated Google OAuth response
    setFormData({
      ...formData,
      fullName: "Gambia Worker",
      email: "worker.test@health.gm"
    });
    setLoading(false);
    alert("Google credentials linked. Please select your facility and click 'Complete Sign Up'.");
  };

  return (
    <AuthCard title="Worker Sign Up" subtitle="Create Your Registry Profile">
      {step === 1 ? (
        <div className="space-y-4 text-left">
          <GoogleButton label="Sign Up with Google" onClick={handleGoogleSignup} loading={loading} />

          <div className="flex items-center space-x-4 py-1">
            <div className="flex-1 h-[1px] bg-slate-100"></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or manually</span>
            <div className="flex-1 h-[1px] bg-slate-100"></div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input type="text" placeholder="Worker Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
            <input type="email" placeholder="Work Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Facility</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
              <select 
                value={formData.facility}
                onChange={e => setFormData({...formData, facility: e.target.value})}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
              >
                {HEALTH_FACILITIES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleSignup} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 mt-4 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <span>Complete Sign Up</span>}
          </button>
          <p className="text-center text-[10px] font-bold text-slate-400 mt-4">Already signed up? <Link to="/login" className="text-blue-600 font-black">Sign In</Link></p>
        </div>
      ) : (
        <div className="text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center"><ShieldCheck size={40} /></div>
          <h2 className="text-xl font-bold">Registration Received</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your profile for <b>{formData.facility}</b> has been created. 
            An administrator must now approve your account before you can sign in.
          </p>
          <button onClick={() => navigate('/login')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">Return to Sign In</button>
        </div>
      )}
    </AuthCard>
  );
};

const ProtectedRoute = ({ role }: { role?: UserRole }) => {
  const currentUser = storageService.getCurrentUser();
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.approvalStatus !== ApprovalStatus.APPROVED) return <Navigate to="/login" />;
  if (role && currentUser.userRole !== role && currentUser.userRole !== UserRole.ADMIN) return <Navigate to="/" />;
  return <Layout><Outlet /></Layout>;
};

const App: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    storageService.initialize();
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
    });
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowInstallButton(false);
    setDeferredPrompt(null);
  };

  return (
    <InstallContext.Provider value={{ deferredPrompt, showInstallButton, installApp }}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/signup" element={<SignupView />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<RegisterChild />} />
            <Route path="/child/:id" element={<ChildProfile />} />
            <Route path="/certificate/:id" element={<Certificate />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/defaulters" element={<Defaulters />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route element={<ProtectedRoute role={UserRole.ADMIN} />}>
            <Route path="/users" element={<UserManagement />} />
            <Route path="/map" element={<CoverageMap />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </InstallContext.Provider>
  );
};

export default App;
