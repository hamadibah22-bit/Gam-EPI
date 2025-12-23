
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRight, User } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Child, VaccinationRecord } from '../types';
import { getVaccinationProgress } from '../utils/helpers';
import { format } from 'date-fns';

const Schedule: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const all = storageService.getChildren();
    const recs = storageService.getRecords();
    setChildren(all);
    setRecords(recs);
  }, []);

  const filtered = children.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.mcNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">EPI Schedule Tracking</h1>
          <p className="text-slate-500">Monitor vaccination progress of all registered children</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, MC number or caregiver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200">
          <Filter size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(child => {
          const progress = getVaccinationProgress(child, records.filter(r => r.childId === child.id));
          return (
            <div 
              key={child.id}
              onClick={() => navigate(`/child/${child.id}`)}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {child.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{child.fullName}</h3>
                  <p className="text-xs text-slate-400">MC: <span className="font-bold text-blue-600">{child.mcNumber}</span></p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-slate-700">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">DOB: {format(new Date(child.dob), 'dd/MM/yy')}</span>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
              <User size={40} />
            </div>
            <p className="text-slate-400 font-medium">No children records matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
