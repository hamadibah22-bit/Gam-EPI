
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Download, ChevronDown, FileText, FileCode, FileImage, Loader2, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Child, VaccinationRecord } from '../types';
import { format } from 'date-fns';

// Explicitly declare external libraries from CDN
declare var html2canvas: any;
declare var jspdf: any;

const Certificate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('Generating Document...');

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
    return record ? format(new Date(record.dateAdministered), 'dd-MM-yyyy') : '................';
  };

  const verificationUrl = `${window.location.origin}/#/child/${child.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verificationUrl)}`;

  const handlePrint = () => {
    setShowSaveDropdown(false);
    // Slight delay to allow dropdown to close before print dialog opens
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const saveAsPdf = async () => {
    const el = document.getElementById('certificate-to-export');
    if (!el) return;

    setIsExporting(true);
    setExportMessage('Generating PDF Document...');
    setShowSaveDropdown(false);

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const { jsPDF } = jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${child.fullName.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('PDF generation failed. This could be due to network restrictions or image load errors.');
    } finally {
      setIsExporting(false);
    }
  };

  const saveAsPng = async () => {
    const el = document.getElementById('certificate-to-export');
    if (!el) return;

    setIsExporting(true);
    setExportMessage('Generating Image File...');
    setShowSaveDropdown(false);

    try {
      const canvas = await html2canvas(el, {
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
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
      alert('Image generation failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const saveAsDocx = () => {
    const el = document.getElementById('certificate-to-export');
    if (!el) return;
    
    const content = el.innerHTML;
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

  return (
    <div className="min-h-screen bg-slate-500/10 p-4 sm:p-8 flex flex-col items-center font-serif relative">
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

      {/* Export Overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center space-y-4 animate-in zoom-in-95">
            <Loader2 size={48} className="text-blue-600 animate-spin" />
            <div className="text-center">
              <p className="font-black text-slate-900 uppercase tracking-widest text-sm">{exportMessage}</p>
              <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase">Please wait, do not close the window</p>
            </div>
          </div>
        </div>
      )}

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
            <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <button 
                onClick={saveAsPdf}
                className="w-full flex items-center space-x-3 px-4 py-4 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 transition-colors"
              >
                <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center"><FileText size={18} /></div>
                <div>
                  <p>PDF Document</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-tighter">Recommended for Mobile</p>
                </div>
              </button>
              <button 
                onClick={saveAsPng}
                className="w-full flex items-center space-x-3 px-4 py-4 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 transition-colors border-t border-slate-100"
              >
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><FileImage size={18} /></div>
                <div>
                  <p>Image File (.png)</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-tighter">High Resolution Image</p>
                </div>
              </button>
              <button 
                onClick={saveAsDocx}
                className="w-full flex items-center space-x-3 px-4 py-4 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 transition-colors border-t border-slate-100"
              >
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><FileCode size={18} /></div>
                <div>
                  <p>Word Document (.docx)</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-tighter">Editable Text Format</p>
                </div>
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

      {/* Main Certificate Content */}
      <div 
        id="certificate-to-export"
        className="certificate-container w-[210mm] h-[297mm] bg-white border border-slate-300 shadow-2xl p-[15mm] text-slate-900 flex flex-col relative print:border-none print:shadow-none"
      >
        <div className="flex justify-between items-start mb-10">
          <div className="flex flex-col items-start">
             <div className="w-24 h-16 shadow-sm mb-1 overflow-hidden rounded-sm border border-slate-100 bg-white">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_The_Gambia.svg/1024px-Flag_of_The_Gambia.svg.png" 
                  alt="Gambia Flag" 
                  className="w-full h-full object-cover" 
                  crossOrigin="anonymous"
                />
             </div>
             <p className="text-[8px] font-bold uppercase tracking-tight text-slate-400">Rep. of The Gambia</p>
          </div>
          
          <div className="flex-1 text-center">
            <h1 className="text-xl font-black border-b-2 border-slate-900 inline-block px-4 pb-0.5 uppercase tracking-tight">
              Certificate of Vaccination
            </h1>
            <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-[0.15em]">National EPI Registry</p>
          </div>

          <div className="w-32 h-32 flex flex-col items-center">
             <img 
               src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Coat_of_arms_of_the_Gambia.svg/1024px-Coat_of_arms_of_the_Gambia.svg.png" 
               alt="Gambia Coat of Arms" 
               className="w-full h-auto object-contain drop-shadow-sm" 
               crossOrigin="anonymous"
             />
          </div>
        </div>

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
              <span className="flex-1 border-b border-dotted border-slate-400 font-bold text-sm px-1">{format(new Date(child.dob), 'dd / MM / yyyy')}</span>
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

        <div className="text-center mb-6">
           <h2 className="text-sm font-black uppercase border-b border-slate-900 inline-block px-4 pb-0.5">
             Immunisation Record
           </h2>
        </div>

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

        <div className="mt-auto pt-8 border-t-2 border-slate-900 border-double">
          <div className="mb-10">
            <h3 className="font-black uppercase text-2xl mb-4 tracking-[0.1em] flex items-center text-slate-900">
              <CheckCircle2 size={32} className="mr-4 text-emerald-600" />
              Official Certification
            </h3>
            <p className="text-base font-bold leading-relaxed italic text-slate-700 max-w-4xl">
              Verified by the National EPI Registry. This document confirms the vaccination status of the child in accordance with The Gambia's Expanded Programme on Immunisation (EPI) standards. This is an official electronic record generated from the central health database.
            </p>
          </div>

          <div className="flex justify-between items-end pt-6">
            <div className="flex flex-col items-start">
               <div className="flex items-baseline space-x-2">
                 <span className="text-[10px] font-black uppercase whitespace-nowrap">Registry Stamp:</span>
                 <span className="w-48 border-b border-dotted border-slate-400 pb-0.5"></span>
               </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-white p-2 rounded-xl border-2 border-slate-900 shadow-sm mb-1">
                <img src={qrCodeUrl} alt="Verify QR" className="w-20 h-20" crossOrigin="anonymous" />
              </div>
              <p className="text-[8px] font-black uppercase text-slate-900 tracking-tighter">Scan to Verify</p>
            </div>

            <div className="flex flex-col items-end">
               <div className="flex items-baseline space-x-2">
                 <span className="text-[10px] font-black uppercase whitespace-nowrap">Issue Date:</span>
                 <span className="w-48 border-b border-dotted border-slate-400 font-bold text-center text-sm italic text-slate-900">
                   {format(new Date(), 'dd MMMM yyyy')}
                 </span>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-[8px] font-black uppercase text-slate-400 tracking-[0.4em]">
          Electronic Vaccination Record • GAM EPI Registry • Official Document
        </div>
      </div>
    </div>
  );
};

export default Certificate;
