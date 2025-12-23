
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, PieChart } from 'lucide-react';
import { storageService } from '../services/storageService';
import { VACCINE_SCHEDULE } from '../constants';

const Reports: React.FC = () => {
  const [stats, setStats] = useState<any>({
    byVaccine: [],
    monthly: []
  });

  useEffect(() => {
    const children = storageService.getChildren();
    const records = storageService.getRecords();
    
    // Simple mock stats calculation
    const vaccineStats = VACCINE_SCHEDULE.flatMap(g => g.vaccines).map(v => {
      const count = records.filter(r => r.vaccineId === v.id).length;
      return { name: v.name, count, percent: children.length ? Math.round((count / children.length) * 100) : 0 };
    });

    setStats({ byVaccine: vaccineStats });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-500">Comprehensive immunization data overview</p>
        </div>
        <button className="bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-slate-700 flex items-center space-x-2 shadow-sm hover:bg-slate-50 transition-all">
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coverage Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 flex items-center">
              <BarChart3 className="text-blue-600 mr-2" size={20} />
              Vaccine Coverage Analysis
            </h3>
            <div className="flex space-x-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Administered</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {stats.byVaccine.slice(0, 6).map((v: any) => (
              <div key={v.name} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span className="text-slate-500">{v.name}</span>
                  <span className="text-blue-600">{v.percent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${v.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/20" />
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Target Achievement</p>
            <h4 className="text-4xl font-black mb-4">84%</h4>
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-sm font-medium">Monthly goal is 100 new registrations. Currently at 84.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <PieChart className="text-emerald-500 mr-2" size={20} />
              Age Distribution
            </h3>
            <div className="space-y-3">
              {[
                { label: '0-6 Months', count: '45%', color: 'bg-emerald-500' },
                { label: '6-12 Months', count: '30%', color: 'bg-blue-500' },
                { label: '12-18+ Months', count: '25%', color: 'bg-indigo-500' }
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 ${item.color} rounded-full`} />
                    <span className="text-xs font-bold text-slate-600">{item.label}</span>
                  </div>
                  <span className="text-xs font-black text-slate-800">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
