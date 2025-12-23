
import React, { useState, useEffect, useContext } from 'react';
import { 
  Users as UsersIcon, 
  Syringe, 
  Clock, 
  CheckCircle2, 
  Search, 
  ArrowRight,
  Plus,
  Activity,
  Smartphone,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { Child, VaccinationRecord } from '../types';
import { getVaccinationProgress } from '../utils/helpers';
import { format } from 'date-fns';
import { InstallContext } from '../App';

const StatCard = ({ icon: Icon, label, value, color, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer group animate-in slide-in-from-bottom-2 duration-500"
  >
    <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon size={28} />
    </div>
    <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{label}</h3>
    <p className="text-3xl font-black text-slate-900">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dismissInstall, setDismissInstall] = useState(false);
  const { showInstallButton, installApp } = useContext(InstallContext);
  
  const navigate = useNavigate();
  const currentUser = storageService.getCurrentUser();

  useEffect(() => {
    const fetchData = () => {
      const allChildren = storageService.getChildren();
      const allRecords = storageService.getRecords();
      setChildren(allChildren);
      setRecords(allRecords);
    };
    fetchData();
    window.addEventListener('storage', fetchData);
    return () => window.removeEventListener('storage', fetchData);
  }, []);

  const filteredChildren = children
    .filter(c => 
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.mcNumber.includes(searchTerm)
    )
    .slice(0, 6);

  const stats = {
    total: children.length,
    vaxThisMonth: records.filter(r => {
      const date = new Date(r.dateAdministered);
      return date.getMonth() === new Date().getMonth();
    }).length,
    completionRate: children.length > 0 
      ? Math.round(children.reduce((acc, c) => acc + getVaccinationProgress(c, records.filter(r => r.childId === c.id)), 0) / children.length)
      : 0
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Install Banner */}
      {showInstallButton && !dismissInstall && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-500/20 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="flex items-center space-x-5 relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
              <Smartphone size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black">Install the EPI App</h3>
              <p className="text-blue-100 font-medium">Add to home screen for faster registration and offline use.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 relative z-10">
            <button 
              onClick={() => setDismissInstall(true)}
              className="p-4 text-white/60 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <button 
              onClick={installApp}
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-black/10 flex items-center space-x-2"
            >
              <span>Install Now</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">EPI Command Center</h1>
          <p className="text-slate-500 font-medium">Monitoring coverage for <span className="text-blue-600 font-bold">{currentUser?.healthCenter}</span></p>
        </div>
        <Link 
          to="/register"
          className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all transform active:scale-95 flex items-center justify-center space-x-3"
        >
          <Plus size={20} />
          <span>Register Child</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={UsersIcon} label="Total Children" value={stats.total} color="bg-blue-500" onClick={() => navigate('/schedule')} />
        <StatCard icon={Syringe} label="Vax This Month" value={stats.vaxThisMonth} color="bg-emerald-500" onClick={() => navigate('/reports')} />
        <StatCard icon={CheckCircle2} label="Completion Rate" value={`${stats.completionRate}%`} color="bg-purple-500" onClick={() => navigate('/reports')} />
        <StatCard icon={Clock} label="Defaulters" value={children.length - (records.length / 15 | 0)} color="bg-rose-500" onClick={() => navigate('/defaulters')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">Recent Registrations</h2>
            <Link to="/schedule" className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center">
              View Database <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
          
          <div className="p-8">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find child by MC# or name..."
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="space-y-4">
              {filteredChildren.map(child => (
                <div 
                  key={child.id}
                  onClick={() => navigate(`/child/${child.id}`)}
                  className="flex items-center justify-between p-6 rounded-3xl hover:bg-blue-50/50 border border-slate-50 hover:border-blue-100 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {child.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg">{child.fullName}</h4>
                      <p className="text-xs font-black text-blue-500 uppercase tracking-widest">{child.mcNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Added On</p>
                      <p className="text-sm font-bold text-slate-700">{format(new Date(child.createdAt), 'dd MMM yyyy')}</p>
                    </div>
                    <ArrowRight className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
              {children.length === 0 && (
                <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                  <Plus className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No children registered yet.</p>
                  <Link to="/register" className="text-blue-600 font-black text-sm hover:underline mt-2 inline-block">Start Registration Now</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden text-white">
          <div className="p-8 border-b border-white/5 flex items-center space-x-3">
            <Activity className="text-blue-400" size={20} />
            <h2 className="font-black uppercase tracking-widest text-sm">System Pulse</h2>
          </div>
          <div className="flex-1 p-8 space-y-8 overflow-y-auto">
            {records.slice(0, 10).map((record) => {
              const child = children.find(c => c.id === record.childId);
              return (
                <div key={record.id} className="relative pl-8 border-l-2 border-white/10">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40" />
                  <p className="text-sm font-bold">
                    <span className="text-blue-400 uppercase">{record.vaccineId}</span> administered to {child?.fullName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                    {format(new Date(record.dateAdministered), 'HH:mm • dd MMM')}
                  </p>
                </div>
              );
            })}
            {records.length === 0 && <p className="text-center text-slate-500 py-20 font-bold text-xs uppercase">Awaiting activity...</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
