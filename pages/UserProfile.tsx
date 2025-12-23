
import React, { useState } from 'react';
import { User, Phone, MapPin, Shield, Camera, Edit, Save, AlertCircle, Mail, RefreshCw, Trash2, X, AlertTriangle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { HEALTH_FACILITIES } from '../constants';
import { smartCapitalize, stripNumbers, stripNonNumeric } from '../utils/helpers';

const UserProfile: React.FC = () => {
  const currentUser = storageService.getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(currentUser ? { ...currentUser } : null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Deletion Request State
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionSubmitting, setDeletionSubmitting] = useState(false);

  if (!currentUser || !formData) return null;

  const handleSave = () => {
    setError(null);
    setSuccess(null);

    if (!formData.fullName.trim() || !formData.phoneNumber.trim() || !formData.email.trim()) {
      setError("Name, Email, and Phone Number are mandatory.");
      return;
    }

    if (formData.phoneNumber.length !== 7) {
      setError("Phone Number must be exactly 7 digits.");
      return;
    }

    const facilityChanged = formData.healthCenter !== currentUser.healthCenter;
    
    if (facilityChanged) {
      const requestData = {
        ...formData,
        healthCenter: currentUser.healthCenter, 
        pendingFacility: formData.healthCenter, 
        approvalStatus: 'pending_change' as any,
        updatedAt: new Date().toISOString()
      };
      storageService.updateUser(requestData);
      setSuccess("Profile updated. Facility change request sent for approval.");
    } else {
      storageService.updateUser(formData);
      setSuccess("Profile updated successfully.");
    }

    setIsEditing(false);
    setTimeout(() => setSuccess(null), 5000);
  };

  const submitDeletionRequest = async () => {
    if (!deletionReason.trim()) return;
    setDeletionSubmitting(true);
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    
    const updatedUser = {
      ...currentUser,
      accountDeletionRequested: true,
      deletionReason: deletionReason.trim(),
      updatedAt: new Date().toISOString()
    };
    
    storageService.updateUser(updatedUser);
    setDeletionSubmitting(false);
    setShowDeletionModal(false);
    setSuccess("Your account deletion request has been sent to the administrator.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center text-sm font-bold animate-in slide-in-from-top-2">
          <AlertCircle size={18} className="mr-2" /> {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center text-sm font-bold animate-in slide-in-from-top-2">
          <Shield size={18} className="mr-2" /> {success}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          {currentUser.accountDeletionRequested && (
            <div className="absolute top-4 right-4 bg-rose-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center">
              <AlertTriangle size={12} className="mr-2" /> Deletion Pending
            </div>
          )}
        </div>
        <div className="px-10 pb-10">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-8 -mt-20 mb-10">
            <div className="relative inline-block mx-auto md:mx-0">
              <img 
                src={currentUser.profilePhoto || `https://ui-avatars.com/api/?name=${currentUser.fullName}&size=200&background=random`} 
                className="w-40 h-40 rounded-[2.5rem] border-8 border-white shadow-2xl bg-slate-100 object-cover"
                alt="Profile" 
              />
              <button className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95">
                <Camera size={20} />
              </button>
            </div>
            <div className="flex-1 text-center md:text-left pt-8 md:pt-0">
              {isEditing ? (
                <div className="space-y-2 mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.fullName} 
                    onChange={e => setFormData({...formData, fullName: smartCapitalize(stripNumbers(e.target.value))})}
                    className="w-full text-2xl font-black text-slate-800 p-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              ) : (
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">{currentUser.fullName}</h2>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                <div className="flex items-center text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                  <Shield size={14} className="mr-2" />
                  {currentUser.userRole}
                </div>
                <div className="text-slate-400 text-sm font-bold">{currentUser.position}</div>
              </div>
            </div>
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`mt-8 md:mt-0 px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center space-x-2 shadow-xl transition-all active:scale-95 ${
                isEditing ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
              } text-white`}
            >
              {isEditing ? <Save size={18} /> : <Edit size={18} />}
              <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-50">
            <div className="space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-5 p-5 bg-slate-50 rounded-3xl border border-slate-100/50">
                  <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl shadow-sm flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full font-bold text-slate-800 p-1 bg-white border border-slate-100 rounded-lg outline-none"
                      />
                    ) : (
                      <p className="font-bold text-slate-800">{currentUser.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-5 p-5 bg-slate-50 rounded-3xl border border-slate-100/50">
                  <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl shadow-sm flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        maxLength={7}
                        value={formData.phoneNumber} 
                        onChange={e => setFormData({...formData, phoneNumber: stripNonNumeric(e.target.value).slice(0, 7)})}
                        className="w-full font-bold text-slate-800 p-1 bg-white border border-slate-100 rounded-lg outline-none"
                      />
                    ) : (
                      <p className="font-bold text-slate-800">+220 {currentUser.phoneNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Details</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-5 p-5 bg-slate-50 rounded-3xl border border-slate-100/50">
                  <div className="w-12 h-12 bg-white text-emerald-500 rounded-2xl shadow-sm flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Facility</p>
                    {isEditing ? (
                      <select 
                        value={formData.healthCenter} 
                        onChange={e => setFormData({...formData, healthCenter: e.target.value})}
                        className="w-full font-bold text-slate-800 p-1 bg-white border border-slate-100 rounded-lg outline-none"
                      >
                        {HEALTH_FACILITIES.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    ) : (
                      <div className="flex flex-col">
                        <p className="font-bold text-slate-800">{currentUser.healthCenter}</p>
                        {(currentUser as any).pendingFacility && (
                          <p className="text-[9px] text-amber-600 font-black mt-1 uppercase flex items-center">
                            <RefreshCw size={10} className="mr-1 animate-spin" /> 
                            Requested move to: {(currentUser as any).pendingFacility}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-xl shadow-rose-900/5 overflow-hidden">
        <div className="p-10">
          <div className="flex items-center space-x-4 mb-8">
             <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                <Trash2 size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900">Danger Zone</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Account Management</p>
             </div>
          </div>
          
          <div className="bg-rose-50 p-8 rounded-3xl border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex-1">
                <h4 className="font-black text-rose-900 text-lg mb-2">Request Account Deletion</h4>
                <p className="text-rose-700/70 text-sm font-medium leading-relaxed max-w-lg">
                  This will send a formal request to the National Health Registry Administrator to permanently remove your profile and access tokens. 
                  <b> Once confirmed, this action cannot be undone.</b>
                </p>
             </div>
             
             {currentUser.accountDeletionRequested ? (
               <div className="flex flex-col items-center space-y-2">
                 <div className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs flex items-center space-x-2">
                   <RefreshCw size={16} className="animate-spin" />
                   <span>Requested</span>
                 </div>
                 <p className="text-[9px] font-black text-rose-400 uppercase tracking-tighter">Awaiting Admin Response</p>
               </div>
             ) : (
               <button 
                onClick={() => setShowDeletionModal(true)}
                className="px-10 py-5 bg-white border-2 border-rose-600 text-rose-600 rounded-2xl font-black uppercase text-xs hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-200/50 active:scale-95"
               >
                 Delete Account
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Deletion Reason Modal */}
      {showDeletionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-rose-50/30">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-rose-600" size={24} />
                <h2 className="text-xl font-black text-slate-900">Reason for Deletion</h2>
              </div>
              <button onClick={() => setShowDeletionModal(false)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-10 space-y-6">
              <p className="text-slate-500 font-medium text-sm">
                To process your request, please provide a clear reason why you are leaving the program. This message will be sent to the administrator.
              </p>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Message/Reason*</label>
                <textarea 
                  rows={4}
                  value={deletionReason}
                  onChange={e => setDeletionReason(e.target.value)}
                  placeholder="e.g., Transferring to private practice, retirement, leaving the health sector..."
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-rose-500/10 font-bold"
                />
              </div>

              <div className="pt-4 flex flex-col space-y-3">
                <button 
                  onClick={submitDeletionRequest}
                  disabled={!deletionReason.trim() || deletionSubmitting}
                  className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs shadow-2xl shadow-rose-500/30 hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {deletionSubmitting ? <RefreshCw className="animate-spin" /> : <Trash2 size={18} />}
                  <span>{deletionSubmitting ? 'Submitting...' : 'Confirm Request'}</span>
                </button>
                <button 
                  onClick={() => setShowDeletionModal(false)}
                  className="w-full py-5 text-slate-400 font-black uppercase text-[10px] hover:text-slate-600 transition-colors"
                >
                  No, I changed my mind
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
