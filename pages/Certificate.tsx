
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Download, ChevronDown, FileText, Image as ImageIcon, FileCode, FileImage, Loader2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Child, VaccinationRecord } from '../types';
import { format, parseISO } from 'date-fns';

// Explicitly declare html2canvas as it's loaded via script tag in index.html
declare var html2canvas: any;

const Certificate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (id) {
      const found = storageService.getChildById(id);
      if (found) {
        setChild(found);
        setRecords(storageService.getRecordsForChild(id));
      }
    }
  }, [id]);

  if (!child) return null;

  const getVaxDate = (vaccineId: string) => {
    const record = records.find(r => r.vaccineId === vaccineId);
    return record ? format(parseISO(record.dateAdministered), 'dd-MM-yyyy') : '................';
  };

  const verificationUrl = `${window.location.origin}/#/child/${child.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verificationUrl)}`;

  const handlePrint = () => {
    window.print();
    setShowSaveDropdown(false);
  };

  const saveAsDocx = () => {
    const el = document.getElementById('certificate-to-export');
    if (!el) return;
    
    const content = el.innerHTML;
    // Word handles HTML-based files with the docx extension if the MIME type is correct
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
          "xmlns:w='urn:schemas-microsoft-com:office:word' " +
          "xmlns='http://www.w3.org/TR/REC-html40'>" +
          "<head><meta charset='utf-8'><title>Vaccination Certificate</title><style>" +
          "body { font-family: 'Times New Roman', serif; padding: 40px; color: #1e293b; width: 210mm; }" +
          "h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px; text-transform: uppercase; font-size: 20pt; }" +
          "p { margin: 10px 0; }" +
          "</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${child.fullName.replace(/\s+/g, '_')}_Certificate.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowSaveDropdown(false);
  };

  const saveAsPng = async () => {
    const el = document.getElementById('certificate-to-export');
    if (!el) return;

    setIsExporting(true);
    setShowSaveDropdown(false);

    try {
      // Use html2canvas to capture the certificate
      const canvas = await html2canvas(el, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794, // Approx 210mm in pixels at 96dpi
        onclone: (clonedDoc: any) => {
          const clonedEl = clonedDoc.getElementById('certificate-to-export');
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.border = 'none';
        }
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${child.fullName.replace(/\s+/g, '_')}_Certificate.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to export as image. Please try another format.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-500/10 p-4 sm:p-8 flex flex-col items-center font-serif">
      <style>{`
        @media print {
          body { margin: 0; padding: 0; background: white; }
          .no-print { display: none !important; }
          .certificate-container { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 !important; 
            padding: 10mm !important;
            width: 210mm !important;
            height: 297mm !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      {/* Controls */}
      <div className="no-print flex flex-wrap justify-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 sticky top-4 z-[100]">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center space-x-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
        >
          <ArrowLeft size={18} /> <span>Exit</span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowSaveDropdown(!showSaveDropdown)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all"
          >
            <Download size={18} /> <span>Save As...</span> <ChevronDown size={16} className={`transition-transform ${showSaveDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showSaveDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <button 
                onClick={handlePrint}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 transition-colors"
              >
                <FileText size={16} className="text-blue-500" /> <span>PDF (Standard Print)</span>
              </button>
              <button 
                onClick={saveAsDocx}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 transition-colors border-t border-slate-100"
              >
                <FileCode size={16} className="text-blue-500" /> <span>Word Document (.docx)</span>
              </button>
              <button 
                onClick={saveAsPng}
                disabled={isExporting}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 transition-colors border-t border-slate-100 disabled:opacity-50"
              >
                {isExporting ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <FileImage size={16} className="text-blue-500" />}
                <span>Image File (.png)</span>
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={handlePrint} 
          className="flex items-center space-x-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Printer size={18} /> <span>Print Now</span>
        </button>
      </div>

      {isExporting && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center space-y-4">
            <Loader2 size={40} className="text-blue-600 animate-spin" />
            <p className="font-black text-slate-900 uppercase tracking-widest text-sm">Processing Certificate...</p>
          </div>
        </div>
      )}

      {/* Main Certificate Content - Strict A4 Dimensions */}
      <div 
        id="certificate-to-export"
        className="certificate-container w-[210mm] h-[297mm] bg-white border border-slate-300 shadow-2xl p-[15mm] text-slate-900 flex flex-col relative print:border-none print:shadow-none"
      >
        {/* Top Header */}
        <div className="flex justify-between items-start mb-10">
          <div className="flex flex-col items-start">
             <div className="w-24 h-14 relative border border-slate-300 mb-1 overflow-hidden">
                <div className="h-1/3 w-full bg-[#CE1126]"></div>
                <div className="h-[5%] w-full bg-white"></div>
                <div className="h-[23%] w-full bg-[#0032A0]"></div>
                <div className="h-[5%] w-full bg-white"></div>
                <div className="h-1/3 w-full bg-[#3A7728]"></div>
             </div>
             <p className="text-[8px] font-bold uppercase tracking-tight text-slate-400">Rep. of The Gambia</p>
          </div>
          
          <div className="flex-1 text-center">
            <h1 className="text-xl font-black border-b-2 border-slate-900 inline-block px-4 pb-0.5 uppercase tracking-tight">
              Certificate of Vaccination
            </h1>
            <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-[0.15em]">National EPI Registry</p>
          </div>

          <div className="w-24 h-24 flex flex-col items-center">
             <img 
               src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Coat_of_arms_of_the_Gambia.svg/1024px-Coat_of_arms_of_the_Gambia.svg.png" 
               alt="Gambia Coat of Arms" 
               className="w-full h-auto" 
             />
          </div>
        </div>

        {/* Biodata Section */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-[10px] font-black uppercase whitespace-nowrap">Full Name:</span>
              <span className="flex-1 border-b border-dotted border-slate-400 font-bold text-sm px-1 italic truncate">{child.fullName}</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-[10px] font-black uppercase whitespace-nowrap">MyChild #:</span>
              <span className="flex-1 border-b border-dotted border-slate-400 font-bold text-sm px-1">{child.mcNumber}</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-[10px] font-black uppercase whitespace-nowrap">Date of Birth:</span>
              <span className="flex-1 border-b border-dotted border-slate-400 font-bold text-sm px-1">{format(parseISO(child.dob), 'dd / MM / yyyy')}</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-[10px] font-black uppercase whitespace-nowrap">Gender:</span>
              <span className="flex-1 border-b border-dotted border-slate-400 font-bold text-sm px-1 capitalize italic">{child.gender}</span>
            </div>
            <div className="flex items-baseline space-x-2 col-span-2">
              <span className="text-[10px] font-black uppercase whitespace-nowrap">Caregiver Name:</span>
              <span className="flex-1 border-b border-dotted border-slate-400 font-bold text-sm px-1 italic">{child.motherName}</span>
            </div>
          </div>
        </div>

        {/* Antigen Section Title */}
        <div className="text-center mb-6">
           <h2 className="text-sm font-black uppercase border-b border-slate-900 inline-block px-4 pb-0.5">
             Immunisation Record
           </h2>
        </div>

        {/* Vaccination Grid - Compressed for A4 */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 border-b border-slate-100 pb-6">
            <div className="space-y-2.5">
               <div className="text-[9px] font-black uppercase text-slate-400 mb-0.5">Birth or later</div>
               <div className="flex justify-between font-bold text-xs"><span>BCG Injection:</span> <span>{getVaxDate('bcg')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>Hepatitis B:</span> <span>{getVaxDate('hepb')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>Oral Polio 0:</span> <span>{getVaxDate('opv0')}</span></div>
            </div>
            <div className="space-y-2.5">
               <div className="text-[9px] font-black uppercase text-slate-400 mb-0.5">2 Months or later</div>
               <div className="flex justify-between font-bold text-xs"><span>Oral Polio 1:</span> <span>{getVaxDate('opv1')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>Pentavalent 1:</span> <span>{getVaxDate('penta1')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>Pneumo 1:</span> <span>{getVaxDate('pneumo1')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>Rota 1:</span> <span>{getVaxDate('rota1')}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6 border-b border-slate-100 pb-6">
            <div className="space-y-2.5">
               <div className="text-[9px] font-black uppercase text-slate-400 mb-0.5">3 Months or later</div>
               <div className="flex justify-between font-bold text-xs"><span>Oral Polio 2:</span> <span>{getVaxDate('opv2')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>Pentavalent 2:</span> <span>{getVaxDate('penta2')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>Pneumo 2:</span> <span>{getVaxDate('pneumo2')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>Rota 2:</span> <span>{getVaxDate('rota2')}</span></div>
            </div>
            <div className="space-y-2.5">
               <div className="text-[9px] font-black uppercase text-slate-400 mb-0.5">4 Months or later</div>
               <div className="flex justify-between font-bold text-xs"><span>Oral Polio 3:</span> <span>{getVaxDate('opv3')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>Pentavalent 3:</span> <span>{getVaxDate('penta3')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>Pneumo 3:</span> <span>{getVaxDate('pneumo3')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>IPV:</span> <span>{getVaxDate('ipv')}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2.5">
               <div className="text-[9px] font-black uppercase text-slate-400 mb-0.5">9 Months or later</div>
               <div className="flex justify-between font-bold text-xs"><span>Oral Polio 4:</span> <span>{getVaxDate('opv4')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>MR 1:</span> <span>{getVaxDate('mr1')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>Yellow Fever:</span> <span>{getVaxDate('yf')}</span></div>
               
               <div className="text-[9px] font-black uppercase text-slate-400 mt-2 mb-0.5">1 Year</div>
               <div className="flex justify-between font-bold text-xs"><span>Meningitis A:</span> <span>{getVaxDate('mena')}</span></div>
            </div>
            <div className="space-y-2.5">
               <div className="text-[9px] font-black uppercase text-slate-400 mb-0.5">Booster Doses</div>
               <div className="flex justify-between font-bold text-xs"><span>DPT Booster:</span> <span>{getVaxDate('dpt_b')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>Polio Booster:</span> <span>{getVaxDate('opv_b')}</span></div>
               <div className="flex justify-between font-bold text-xs"><span>MR 2:</span> <span>{getVaxDate('mr2')}</span></div>
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div className="mt-auto pt-8">
          <div className="mb-10">
            <h3 className="font-black uppercase text-[10px] mb-2 tracking-widest">Official Certification</h3>
            <p className="text-[9px] font-medium leading-relaxed italic text-slate-500">
              Verified by the National EPI Registry. This document confirms the vaccination status of the child in accordance with The Gambia's Expanded Programme on Immunisation.
            </p>
          </div>

          <div className="flex justify-between items-end border-t border-slate-100 pt-6">
            <div className="flex flex-col items-start">
               <div className="flex items-baseline space-x-2">
                 <span className="text-[9px] font-black uppercase">Registry Stamp:</span>
                 <span className="w-32 border-b border-dotted border-slate-300 pb-0.5"></span>
               </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm mb-1">
                <img src={qrCodeUrl} alt="Verify QR" className="w-16 h-16" />
              </div>
              <p className="text-[7px] font-black uppercase text-slate-400 tracking-tighter">Scan to Verify</p>
            </div>

            <div className="flex flex-col items-end">
               <div className="flex items-baseline space-x-2">
                 <span className="text-[9px] font-black uppercase">Issue Date:</span>
                 <span className="w-32 border-b border-dotted border-slate-300 font-bold text-center text-xs italic">{format(new Date(), 'dd/MM/yyyy')}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-[7px] font-black uppercase text-slate-300 tracking-[0.3em]">
          Electronic Vaccination Record • GAM EPI Registry • Official Document
        </div>
      </div>
    </div>
  );
};

export default Certificate;
