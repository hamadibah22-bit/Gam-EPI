
import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Globe, Shield, Info, Trash2, Smartphone, Share2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { storageService } from '../services/storageService';

const Settings: React.FC = () => {
  const currentUser = storageService.getCurrentUser();
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleDeletionRequest = async () => {
    if (!deletionReason.trim() || !currentUser) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    
    const updatedUser = {
      ...currentUser,
      accountDeletionRequested: true,
      deletionReason: deletionReason.trim(),
      updatedAt: new Date().toISOString()
    };
    
    storageService.updateUser(updatedUser);
    setSubmitting(false);
    setShowDeletionModal(false);
    alert("Request sent to administrator.");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">App Configuration</h1>
        <p className="text-slate-500 font-medium">Manage application preferences and system distribution</p>
      </div>

      {/* Account Management Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Account Safety</h3>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <Trash2 size={24} />
              </div>
              <div>
                <p className="font-black text-slate-800">Account Deletion</p>
                <p className="text-xs text-slate-400 font-medium">Request to permanently remove your worker profile</p>
              </div>
            </div>
            {currentUser?.accountDeletionRequested ? (
              <span className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Deletion Pending</span>
            ) : (
              <button 
                onClick={() => setShowDeletionModal(true)}
                className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-black text-xs uppercase hover:bg-rose-700 transition-all active:scale-95"
              >
                Request Deletion
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Distribution Guide for Workers */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200/50">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <Smartphone size={24} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider">Worker Distribution</h2>
        </div>
        <p className="text-blue-100 mb-8 font-medium leading-relaxed">
          To help your coworkers install this app on their Android devices correctly, follow these steps:
        </p>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 bg-white/10 p-4 rounded-2xl border border-white/10">
            <div className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">1</div>
            <p className="text-sm font-bold">Send them the App URL via WhatsApp or Email.</p>
          </div>
          <div className="flex items-start space-x-4 bg-white/10 p-4 rounded-2xl border border-white/10">
            <div className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">2</div>
            <p className="text-sm font-bold">Tell them to open the link in <b>Google Chrome</b>.</p>
          </div>
          <div className="flex items-start space-x-4 bg-white/10 p-4 rounded-2xl border border-white/10">
            <div className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">3</div>
            <p className="text-sm font-bold">They should click the "Install App" banner on the Dashboard or select <b>"Add to Home Screen"</b> from the Chrome menu.</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10">
          <button className="w-full flex items-center justify-center space-x-2 py-4 bg-white text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition-all">
            <Share2 size={18} />
            <span>Copy App Link to Share</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Preferences</h3>
        </div>
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Moon size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Dark Mode</p>
                <p className="text-xs text-slate-400 font-medium">Switch between light and dark themes</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Globe size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Offline Storage</p>
                <p className="text-xs text-slate-400 font-medium">Keep data cached for intermittent internet</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">System Data</h3>
        </div>
        <div className="p-8 space-y-4">
          <button className="w-full flex items-center justify-between p-6 border border-slate-100 rounded-3xl hover:border-blue-500 transition-all text-left group">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <DownloadIcon size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Download Local Backup</p>
                <p className="text-xs text-slate-400 font-medium">Export all registry data to JSON</p>
              </div>
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-6 border border-rose-100 rounded-3xl hover:bg-rose-50 transition-all text-left group">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Trash2 size={20} />
              </div>
              <div>
                <p className="font-bold text-rose-600 text-sm">Factory Reset Cache</p>
                <p className="text-xs text-rose-400 font-medium">Wipe local worker database</p>
              </div>
            </div>
          </button>
        </div>
      </div>
      
      {/* Deletion Modal */}
      {showDeletionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-rose-50/30">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-rose-600" size={24} />
                <h2 className="text-xl font-black text-slate-900">Deletion Request</h2>
              </div>
              <button onClick={() => setShowDeletionModal(false)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-10 space-y-6">
              <p className="text-slate-500 font-medium text-sm">Please state your reason for requesting account removal.</p>
              <textarea 
                rows={4}
                value={deletionReason}
                onChange={e => setDeletionReason(e.target.value)}
                placeholder="Why are you leaving the program?"
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-bold"
              />
              <button 
                onClick={handleDeletionRequest}
                disabled={!deletionReason.trim() || submitting}
                className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {submitting ? <RefreshCw className="animate-spin" /> : <Trash2 size={18} />}
                <span>{submitting ? 'Submitting...' : 'Confirm Request'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-100 p-8 rounded-[2.5rem] flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Info className="text-slate-400" />
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Version 1.0.8 (Registry Hub)</span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 italic">Gambia EPI Program</span>
      </div>
    </div>
  );
};

const DownloadIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

export default Settings;
