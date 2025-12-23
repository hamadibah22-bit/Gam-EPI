
import React, { useState, useEffect } from 'react';
import { AlertCircle, Phone, MapPin, Calendar, Clock } from 'lucide-react';
import { storageService } from '../services/storageService';
import { getDefaulterStatus } from '../utils/helpers';
import { format } from 'date-fns';

const Defaulters: React.FC = () => {
  const [defaulters, setDefaulters] = useState<any[]>([]);

  useEffect(() => {
    const children = storageService.getChildren();
    const records = storageService.getRecords();
    
    const list = children.map(child => {
      const missed = getDefaulterStatus(child, records.filter(r => r.childId === child.id));
      if (missed.length > 0) {
        return { child, missed };
      }
      return null;
    }).filter(Boolean);

    setDefaulters(list);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Defaulters List</h1>
          <p className="text-slate-500">Follow up with children who have missed scheduled doses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-200">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-rose-400 uppercase tracking-widest leading-none mb-1">Critical</p>
            <p className="text-2xl font-black text-rose-600 leading-none">{defaulters.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Child Information</th>
                <th className="px-6 py-4">Missed Vaccine</th>
                <th className="px-6 py-4">Days Overdue</th>
                <th className="px-6 py-4">Contact Detail</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {defaulters.map(({ child, missed }) => (
                <tr key={child.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                        {child.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{child.fullName}</p>
                        <p className="text-[10px] font-bold text-blue-600 uppercase">MC: {child.mcNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm font-semibold text-rose-600">
                      <Clock size={14} className="mr-2" />
                      {missed[0].name}
                    </div>
                    <p className="text-[10px] text-slate-400">Due: {format(new Date(missed[0].dueDate), 'dd/MM/yy')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">
                      {missed[0].daysOverdue} days
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-xs text-slate-600 font-medium">
                        <Phone size={12} className="mr-1.5 text-slate-400" />
                        {child.parentContact || 'No phone'}
                      </div>
                      <div className="flex items-center text-xs text-slate-600 font-medium">
                        <MapPin size={12} className="mr-1.5 text-slate-400" />
                        {child.address || 'No address'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">
                      Remind Parent
                    </button>
                  </td>
                </tr>
              ))}
              {defaulters.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No defaulters found. Excellent coverage!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Defaulters;
