
import React, { useState, useEffect } from 'react';
import { Users, Shield, CheckCircle2, XCircle, Search, Inbox, AlertTriangle, RefreshCw, Trash2, Mail, MapPin, MessageSquare } from 'lucide-react';
import { storageService } from '../services/storageService';
import { User, UserRole, ApprovalStatus } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'requests'>('requests');

  useEffect(() => {
    setUsers(storageService.getUsers());
  }, []);

  const handleStatusChange = (id: string, status: ApprovalStatus) => {
    const updatedUsers = users.map(u => {
      if (u.id === id) {
        const newUser = { ...u, approvalStatus: status };
        // If it's a facility change approval
        if (status === ApprovalStatus.APPROVED && (u as any).pendingFacility) {
          newUser.healthCenter = (u as any).pendingFacility;
          delete (newUser as any).pendingFacility;
        }
        storageService.updateUser(newUser);
        return newUser;
      }
      return u;
    });
    setUsers(updatedUsers);
  };

  const confirmDeletion = (userId: string) => {
    if (window.confirm("ARE YOU ABSOLUTELY SURE? This will permanently delete the health worker's profile and all their session tokens. This action is irreversible.")) {
      storageService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const rejectDeletion = (userId: string) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const newUser = { ...u, accountDeletionRequested: false, deletionReason: undefined };
        storageService.updateUser(newUser);
        return newUser;
      }
      return u;
    });
    setUsers(updatedUsers);
  };

  // Filter users who have pending actions
  const actionRequests = users.filter(u => 
    u.approvalStatus === ApprovalStatus.PENDING || 
    u.accountDeletionRequested || 
    (u as any).approvalStatus === 'pending_change'
  );

  const filteredUsers = (activeTab === 'requests' ? actionRequests : users).filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Control</h1>
          <p className="text-slate-500 font-medium">Manage health worker credentials and system requests</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2 ${
              activeTab === 'requests' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Inbox size={16} />
            <span>Action Inbox</span>
            {actionRequests.length > 0 && (
              <span className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] animate-pulse">
                {actionRequests.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2 ${
              activeTab === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Users size={16} />
            <span>Directory</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search health workers by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>
      </div>

      {activeTab === 'requests' && filteredUsers.length > 0 ? (
        <div className="space-y-6">
          {filteredUsers.map(user => {
            const isDeletion = user.accountDeletionRequested;
            const isFacilityChange = (user as any).approvalStatus === 'pending_change';
            const isNewAccess = user.approvalStatus === ApprovalStatus.PENDING;

            return (
              <div 
                key={user.id} 
                className={`bg-white rounded-[2.5rem] border p-8 transition-all hover:shadow-xl ${
                  isDeletion ? 'border-rose-100 shadow-rose-900/5 bg-rose-50/10' : 'border-slate-100'
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex items-center space-x-5 lg:w-1/3">
                    <img src={`https://ui-avatars.com/api/?name=${user.fullName}&background=random&size=128`} className="w-20 h-20 rounded-3xl shadow-lg object-cover" alt="avatar" />
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                         {isDeletion && <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">DELETION</span>}
                         {isFacilityChange && <span className="bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">MOVE REQ</span>}
                         {isNewAccess && <span className="bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">NEW USER</span>}
                      </div>
                      <h4 className="font-black text-slate-900 text-xl">{user.fullName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex items-center space-x-3 text-slate-500">
                          <Shield size={16} />
                          <span className="text-sm font-bold">{user.position}</span>
                       </div>
                       <div className="flex items-center space-x-3 text-slate-500">
                          <MapPin size={16} />
                          <span className="text-sm font-bold">{user.healthCenter}</span>
                       </div>
                    </div>

                    {/* The "Message" or "Reason" */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start space-x-4">
                       <MessageSquare className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Worker's Reason / Comments</p>
                          <p className="text-sm font-bold text-slate-700 italic leading-relaxed">
                            {isDeletion ? user.deletionReason : 
                             isFacilityChange ? `Requesting transfer to ${(user as any).pendingFacility}` : 
                             `New worker requesting access to ${user.healthCenter}.`}
                          </p>
                       </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col justify-end gap-3 min-w-[200px]">
                    {isDeletion ? (
                      <>
                        <button 
                          onClick={() => confirmDeletion(user.id)}
                          className="flex-1 bg-rose-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95 flex items-center justify-center space-x-2"
                        >
                          <Trash2 size={16} />
                          <span>Final Delete</span>
                        </button>
                        <button 
                          onClick={() => rejectDeletion(user.id)}
                          className="flex-1 bg-white border border-slate-200 text-slate-400 px-6 py-4 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
                        >
                          <XCircle size={16} />
                          <span>Reject Req</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleStatusChange(user.id, ApprovalStatus.APPROVED)}
                          className="flex-1 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center space-x-2"
                        >
                          <CheckCircle2 size={16} />
                          <span>Approve Access</span>
                        </button>
                        <button 
                          onClick={() => handleStatusChange(user.id, ApprovalStatus.REJECTED)}
                          className="flex-1 bg-white border border-rose-200 text-rose-500 px-6 py-4 rounded-2xl font-black uppercase text-[10px] hover:bg-rose-50 transition-all flex items-center justify-center space-x-2"
                        >
                          <XCircle size={16} />
                          <span>Deny Request</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : activeTab === 'all' ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-10 py-6">Health Worker</th>
                  <th className="px-10 py-6">Position & Facility</th>
                  <th className="px-10 py-6">Role</th>
                  <th className="px-10 py-6 text-center">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center space-x-5">
                        <img src={`https://ui-avatars.com/api/?name=${user.fullName}&background=random`} className="w-12 h-12 rounded-2xl shadow-sm" alt="avatar" />
                        <div>
                          <p className="font-black text-slate-900 text-base">{user.fullName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-sm font-bold text-slate-700">{user.position}</p>
                      <p className="text-[10px] font-black text-blue-600 uppercase mt-0.5 tracking-widest">{user.healthCenter}</p>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center text-xs font-black text-slate-500 uppercase tracking-widest">
                        <Shield size={14} className="mr-2 text-blue-500" />
                        {user.userRole}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.approvalStatus === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                        user.approvalStatus === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {user.approvalStatus}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <button className="text-slate-300 hover:text-blue-600 p-2 transition-colors">
                          <EditIcon size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
           <Inbox size={64} className="mx-auto text-slate-200 mb-6" />
           <h3 className="text-xl font-black text-slate-800">Your Action Inbox is Clear</h3>
           <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2">No pending worker requests, facility changes, or deletion notifications at this time.</p>
        </div>
      )}
    </div>
  );
};

const EditIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);

export default UserManagement;
