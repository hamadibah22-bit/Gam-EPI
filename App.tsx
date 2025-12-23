
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
import { User, UserRole } from './types';
import { HEALTH_FACILITIES } from './constants';
import { ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

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
      storageService.setCurrentUser(user);
      navigate('/');
    } else {
      alert("Worker not found. Try: admin@health.gm");
    }
    setLoading(false);
  };

  return (
    <AuthCard title="Worker Portal" subtitle="National Immunization Registry">
      <div className="space-y-6">
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button onClick={() => setTab('email')} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${tab === 'email' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Email</button>
          <button onClick={() => setTab('phone')} className={`flex-1 py-3 text-xs font-black uppercase rounded-xl transition-all ${tab === 'phone' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Phone</button>
        </div>

        <div className="space-y-4">
          {tab === 'email' ? (
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="Email Address" />
          ) : (
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="+220 XXXXXXX" />
          )}
          <button onClick={handleLogin} disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2">
            <span>{loading ? 'Entering...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
        <p className="text-center text-sm text-slate-500 font-medium">New? <Link to="/signup" className="text-blue-600 font-black">Request Access</Link></p>
      </div>
    </AuthCard>
  );
};

const SignupView = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    facility: HEALTH_FACILITIES[0]
  });
  const navigate = useNavigate();

  const handleSignup = () => {
    setStep(2);
  };

  return (
    <AuthCard title="Request Access" subtitle="National Health Worker Registry">
      {step === 1 ? (
        <div className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input type="text" placeholder="Worker Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
            <input type="email" placeholder="Work Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Health Facility Assignment*</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
              <select 
                value={formData.facility}
                onChange={e => setFormData({...formData, facility: e.target.value})}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                {HEALTH_FACILITIES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleSignup} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 mt-4">Continue Request</button>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center"><ShieldCheck size={40} /></div>
          <h2 className="text-xl font-bold">Request Sent</h2>
          <p className="text-slate-500">Your supervisor will receive an approval request for your assignment at <b>{formData.facility}</b> shortly.</p>
          <button onClick={() => navigate('/login')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">Back to Login</button>
        </div>
      )}
    </AuthCard>
  );
};

const ProtectedLayout = () => {
  const user = storageService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout><Outlet /></Layout>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(storageService.getCurrentUser());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    storageService.initialize();
    const handleAuth = () => setUser(storageService.getCurrentUser());
    window.addEventListener('auth-change', handleAuth);

    // PWA Install Logic
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('auth-change', handleAuth);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallButton(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <InstallContext.Provider value={{ deferredPrompt, showInstallButton, installApp }}>
      <Router>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginView />} />
          <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupView />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<RegisterChild />} />
            <Route path="/child/:id" element={<ChildProfile />} />
            <Route path="/certificate/:id" element={<Certificate />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/defaulters" element={<Defaulters />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/map" element={<CoverageMap />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </InstallContext.Provider>
  );
};

export default App;
