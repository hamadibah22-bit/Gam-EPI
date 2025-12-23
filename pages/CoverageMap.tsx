
import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { Child } from '../types';

const CoverageMap: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    setChildren(storageService.getChildren());
  }, []);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Coverage Geographic Map</h1>
        <p className="text-slate-500">Visualize distribution of vaccinations across the country</p>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px] relative">
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-lg max-w-xs">
          <h4 className="font-bold text-slate-800 text-sm mb-2">Map Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Health Facility</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Registered Child</span>
            </div>
          </div>
        </div>
        
        <div className="w-full h-full bg-slate-50 flex items-center justify-center p-20 text-center">
          <div>
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.488V5.512a2 2 0 011.553-1.944L9 1.764m0 18.236l6-3.14m-6 3.14V3.14m6 13.72l5.447 2.724A2 2 0 0021 17.764V7.764a2 2 0 00-1.553-1.944L15 3.14m0 13.72V3.14" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Geographic Visualization</h3>
            <p className="text-slate-500 mt-2 max-w-sm">Mapping children registered at facilities. Showing {children.length} locations.</p>
            <p className="text-xs text-slate-400 mt-4 italic underline cursor-pointer">Re-sync map data</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverageMap;
