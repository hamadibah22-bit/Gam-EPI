
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Syringe, Calendar, Printer, ArrowLeft, 
  CheckCircle2, Clock, Plus, X, ClipboardList, 
  Edit3, Save, AlertTriangle, Phone, MapPin, Search,
  RefreshCw, Info, FileText, Trash2
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { HEALTH_FACILITIES, VACCINE_SCHEDULE } from '../constants';
import { Child, VaccinationRecord, VaccineGroup, Gender } from '../types';
import { format, differenceInWeeks, isAfter, isValid } from 'date-fns';
import { getVaccinationProgress, smartCapitalize, validateVaccinationDate, formatMCNumber, stripNumbers, stripNonNumeric, countWords, isValidPhone } from '../utils/helpers';

const CORRECTION_REASONS = [
  "Previous data entry error",
  "Incorrect date recorded",
  "Correction of provider details",
  "Update to vaccine batch information",
  "Incorrect vaccine series selected previously",
  "Other (see notes)"
];

const ChildProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [isEditingBio, setIsEditingBio] = useState(false);
  
  const [bioForm, setBioForm] = useState<any>(null);
  const [bioDobParts, setBioDobParts] = useState({ day: '', month: '', year: '' });
  const [bioError, setBioError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<VaccineGroup | null>(null);

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const currentUser = storageService.getCurrentUser();
  const facilityVaccinators = storageService.getVaccinatorsForFacility(currentUser?.healthCenter || '');

  const [vaxForm, setVaxForm] = useState({
    selectedIds: [] as string[],
    date: format(new Date(), 'yyyy-MM-dd'),
    administeredBy: currentUser?.fullName || '',
    isUnknown: false,
    notes: '',
    correctionReason: CORRECTION_REASONS[0],
    error: null as string | null
  });

  // Scroll lock effect
  useEffect(() => {
    if (showModal || showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal, showDeleteModal]);

  useEffect(() => {
    if (id) {
      const found = storageService.getChildById(id);
      if (found) {
        setChild(found);
        setBioForm(found);
        
        const dateObj = new Date(found.dob);
        setBioDobParts({
          day: format(dateObj, 'dd'),
          month: format(dateObj, 'MM'),
          year: format(dateObj, 'yy')
        });
        
        setRecords(storageService.getRecordsForChild(id));
      }
    }
  }, [id]);

  if (!child || !bioForm) return null;

  const progress = getVaccinationProgress(child, records);
  const ageWeeks = differenceInWeeks(new Date(), new Date(child.dob));

  const handleSaveBio = () => {
    setBioError(null);

    const { day, month, year } = bioDobParts;
    if (!day || !month || !year || year.length !== 2) {
      setBioError("Please enter a valid 2-digit year (e.g., 24 for 2024)");
      return;
    }
    const dobStr = `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const dobDate = new Date(dobStr);

    if (!isValid(dobDate)) {
      setBioError("Invalid Date of Birth. Please check inputs.");
      return;
    }

    if (isAfter(dobDate, new Date())) {
      setBioError("Birth date cannot be in the future.");
      return;
    }

    if (!bioForm.fullName.trim() || !bioForm.motherName.trim() || !bioForm.mcNumber || !bioForm.parentContact) {
      setBioError("All fields except Address are mandatory.");
      return;
    }

    if (!countWords(bioForm.fullName)) {
      setBioError("Child Full Name must contain at least two names.");
      return;
    }

    if (!countWords(bioForm.motherName)) {
      setBioError("Mother Name must contain at least two names.");
      return;
    }

    if (!isValidPhone(bioForm.parentContact)) {
      setBioError("Phone must be exactly 7 digits.");
      return;
    }

    const updated = { ...bioForm, dob: dobStr, updatedAt: new Date().toISOString() };
    storageService.updateChild(updated);
    setChild(updated);
    setIsEditingBio(false);
  };

  const handleDeleteChild = async () => {
    if (!deletionReason.trim()) return;
    setIsDeleting(true);
    
    // Simulate slight delay for effect
    await new Promise(r => setTimeout(r, 800));
    
    storageService.deleteChild(child.id);
    setIsDeleting(false);
    setShowDeleteModal(false);
    navigate('/schedule');
  };

  const handleOpenVax = (group: VaccineGroup) => {
    const existingIds = records.map(r => r.vaccineId);
    setSelectedGroup(group);
    
    setVaxForm({
      selectedIds: group.vaccines.map(v => v.id).filter(id => !existingIds.includes(id)),
      date: format(new Date(), 'yyyy-MM-dd'),
      administeredBy: currentUser?.fullName || '',
      isUnknown: false,
      notes: '',
      correctionReason: CORRECTION_REASONS[0],
      error: null
    });
    setShowModal(true);
  };

  const handleVaxSubmit = async () => {
    const dateError = validateVaccinationDate(vaxForm.date, child.dob, selectedGroup?.scheduleWeeks || 0);
    if (dateError) {
      setVaxForm(prev => ({ ...prev, error: dateError }));
      return;
    }

    if (vaxForm.selectedIds.length === 0) {
      setVaxForm(prev => ({ ...prev, error: "Select at least one vaccine." }));
      return;
    }

    const vaccinator = vaxForm.isUnknown ? "Unknown" : vaxForm.administeredBy.trim();
    if (!vaccinator) {
      setVaxForm(prev => ({ ...prev, error: "Please provide the name of the vaccinator." }));
      return;
    }

    const isCorrection = vaxForm.selectedIds.some(id => records.some(r => r.vaccineId === id));
    const finalNotes = isCorrection 
      ? `[CORRECTION: ${vaxForm.correctionReason}] ${vaxForm.notes}`.trim()
      : vaxForm.notes;

    const existingRecords = storageService.getRecords();
    const otherRecords = existingRecords.filter(r => 
      !(r.childId === child.id && vaxForm.selectedIds.includes(r.vaccineId))
    );

    const newRecords: VaccinationRecord[] = vaxForm.selectedIds.map(vid => ({
      id: Math.random().toString(36).substr(2, 9),
      childId: child.id,
      vaccineId: vid,
      doseNumber: selectedGroup?.vaccines.find(v => v.id === vid)?.doseNumber || 1,
      dateAdministered: vaxForm.date,
      administeredBy: vaccinator,
      healthCenter: currentUser?.healthCenter || 'Facility',
      status: 'completed',
      notAdministered: false,
      notes: finalNotes,
      updatedAt: new Date().toISOString()
    }));

    if (!vaxForm.isUnknown) {
      storageService.addVaccinator(currentUser?.healthCenter || '', vaccinator);
    }

    localStorage.setItem('epi_app_records', JSON.stringify([...otherRecords, ...newRecords]));
    setRecords(storageService.getRecordsForChild(child.id));
    setShowModal(false);
  };

  const hasCorrectionSelected = vaxForm.selectedIds.some(id => records.some(r => r.vaccineId === id));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 font-bold transition-all">
          <ArrowLeft size={20} /> <span>Back</span>
        </button>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate(`/certificate/${child.id}`)}
            className="bg-white border border-blue-100 px-4 py-2.5 rounded-xl text-blue-600 font-bold hover:bg-blue-50 shadow-sm flex items-center space-x-2"
          >
            <FileText size={20} /> <span>View Certificate</span>
          </button>
          {!isEditingBio ? (
            <button onClick={() => setIsEditingBio(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-xl hover:bg-slate-800 transition-all">
              <Edit3 size={18} /> <span>Edit Bio</span>
            </button>
          ) : (
            <button onClick={handleSaveBio} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-xl hover:bg-emerald-700 transition-all">
              <Save size={18} /> <span>Save Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="flex flex-col space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex justify-between items-start">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-blue-100"><User size={40} className="text-slate-200" /></div>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                ID: {child.mcNumber}
              </div>
            </div>
            <div className="p-8 space-y-6">
              {!isEditingBio ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">{child.fullName}</h2>
                    <p className="text-sm font-bold text-blue-600 mt-1 uppercase tracking-wider">{child.gender}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Calendar size={18} /></div>
                      <div><p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Birth Date</p><p className="font-bold">{format(new Date(child.dob), 'dd MMM yyyy')}</p></div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><User size={18} /></div>
                      <div><p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Caregiver</p><p className="font-bold">{child.motherName}</p></div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Phone size={18} /></div>
                      <div><p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Contact</p><p className="font-bold">{child.parentContact || '---'}</p></div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><MapPin size={18} /></div>
                      <div><p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Address</p><p className="font-bold text-sm leading-snug">{child.address || 'No address recorded'}</p></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  {bioError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase flex items-center">
                      <AlertTriangle size={14} className="mr-2" /> {bioError}
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Child Full Name* (2+ names)</label>
                    <input 
                      type="text" 
                      value={bioForm.fullName} 
                      onChange={e => setBioForm({...bioForm, fullName: smartCapitalize(stripNumbers(e.target.value))})} 
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Mother Name* (2+ names)</label>
                    <input 
                      type="text" 
                      value={bioForm.motherName} 
                      onChange={e => setBioForm({...bioForm, motherName: smartCapitalize(stripNumbers(e.target.value))})} 
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Birth Date (DD/MM/20YY)*</label>
                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                      <input type="text" maxLength={2} placeholder="DD" value={bioDobParts.day} onChange={e => setBioDobParts({...bioDobParts, day: stripNonNumeric(e.target.value)})} className="w-8 bg-transparent text-center font-bold outline-none" />
                      <span className="text-slate-300 font-bold">/</span>
                      <input type="text" maxLength={2} placeholder="MM" value={bioDobParts.month} onChange={e => setBioDobParts({...bioDobParts, month: stripNonNumeric(e.target.value)})} className="w-8 bg-transparent text-center font-bold outline-none" />
                      <span className="text-slate-300 font-bold">/</span>
                      <div className="flex items-center">
                        <span className="text-slate-400 font-bold text-sm">20</span>
                        <input type="text" maxLength={2} placeholder="YY" value={bioDobParts.year} onChange={e => setBioDobParts({...bioDobParts, year: stripNonNumeric(e.target.value)})} className="w-6 bg-transparent text-center font-bold outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ID/MC#*</label>
                      <input 
                        type="text" 
                        value={bioForm.mcNumber} 
                        onChange={e => setBioForm({...bioForm, mcNumber: formatMCNumber(stripNonNumeric(e.target.value))})} 
                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Phone* (7 Digits)</label>
                      <input 
                        type="text" 
                        maxLength={7}
                        value={bioForm.parentContact} 
                        onChange={e => setBioForm({...bioForm, parentContact: stripNonNumeric(e.target.value).slice(0, 7)})} 
                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Address (Optional)</label>
                    <textarea 
                      value={bioForm.address} 
                      onChange={e => setBioForm({...bioForm, address: smartCapitalize(stripNumbers(e.target.value))})} 
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold" 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone for Child Deletion */}
          <div className="bg-white rounded-[2rem] border border-rose-100 shadow-xl shadow-rose-900/5 p-8 flex flex-col space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
               <Trash2 size={20} />
               <h3 className="font-black text-sm uppercase tracking-widest">Danger Zone</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">Permanently remove this child's record and all associated history from the registry.</p>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl font-black uppercase text-[10px] hover:bg-rose-600 hover:text-white transition-all active:scale-95"
            >
              Delete Child Record
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl shadow-blue-900/10">
            <div>
              <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Immunization Status</p>
              <p className="text-4xl font-black">{progress}% Completed</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs font-bold uppercase mb-1">Child Age</p>
              <p className="text-xl font-black">{ageWeeks} Weeks</p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Vaccination Schedule</h3>
              <div className="flex space-x-4">
                <span className="flex items-center text-[10px] font-black uppercase text-emerald-500"><CheckCircle2 size={12} className="mr-1" /> Done</span>
                <span className="flex items-center text-[10px] font-black uppercase text-rose-500"><Clock size={12} className="mr-1" /> Overdue</span>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {VACCINE_SCHEDULE.map(group => {
                const groupRecords = records.filter(r => group.vaccines.some(v => v.id === r.vaccineId));
                const isGroupCompleted = groupRecords.length === group.vaccines.length;
                const isOverdue = !isGroupCompleted && ageWeeks > group.scheduleWeeks;

                return (
                  <div key={group.id} className="p-8 hover:bg-slate-50/50 transition-all group/row">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-2xl ${group.color} bg-opacity-10 text-${group.color.split('-')[1]}-600 flex items-center justify-center flex-shrink-0`}>
                          <ClipboardList size={22} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-lg flex items-center">
                            {group.name}
                            {isGroupCompleted && <CheckCircle2 size={16} className="text-emerald-500 ml-2" />}
                            {isOverdue && <AlertTriangle size={16} className="text-rose-500 ml-2 animate-pulse" />}
                          </h4>
                          <p className="text-xs font-bold text-slate-400">{group.ageDescription}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 md:max-w-[40%]">
                        {group.vaccines.map(v => {
                          const isDone = records.some(r => r.vaccineId === v.id);
                          return (
                            <span key={v.id} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${isDone ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                              {v.name}
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleOpenVax(group)}
                          className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase transition-all shadow-lg active:scale-95 ${
                            isGroupCompleted ? 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-blue-50' : 
                            isOverdue ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-blue-600 text-white shadow-blue-100'
                          }`}
                        >
                          {isGroupCompleted ? 'Update Series' : 'Record Series'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Child Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-rose-50/30">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-rose-600" size={24} />
                <h2 className="text-xl font-black text-slate-900">Delete Record?</h2>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-10 space-y-6">
              <div className="space-y-2">
                <p className="text-slate-900 font-black text-base">You are about to permanently delete:</p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="font-bold text-slate-700">{child.fullName}</p>
                  <p className="text-[10px] font-black text-blue-600 uppercase">MC# {child.mcNumber}</p>
                </div>
                <p className="text-slate-500 font-medium text-xs leading-relaxed">
                  Warning: This action will also delete <span className="text-rose-600 font-bold">{records.length} vaccination records</span> associated with this child. This cannot be undone.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Deletion*</label>
                <textarea 
                  rows={3}
                  value={deletionReason}
                  onChange={e => setDeletionReason(e.target.value)}
                  placeholder="e.g., Duplicate record, data entry error, family relocated..."
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 font-bold text-sm"
                />
              </div>

              <div className="pt-4 flex flex-col space-y-3">
                <button 
                  onClick={handleDeleteChild}
                  disabled={!deletionReason.trim() || isDeleting}
                  className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs shadow-2xl shadow-rose-500/30 hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isDeleting ? <RefreshCw className="animate-spin" /> : <Trash2 size={18} />}
                  <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
                </button>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-5 text-slate-400 font-black uppercase text-[10px] hover:text-slate-600 transition-colors"
                >
                  Cancel and Keep Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vaccination Record Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Record {selectedGroup?.name}</h2>
                <p className="text-sm font-medium text-slate-500">Select vaccines given and administration details</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
            </div>

            <div className="p-10 space-y-8">
              {vaxForm.error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-black flex items-center">
                  <AlertTriangle size={14} className="mr-2" /> {vaxForm.error}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Vaccines Given</label>
                  <span className="text-[9px] font-bold text-amber-600 flex items-center uppercase"><RefreshCw size={10} className="mr-1" /> Re-select to edit existing</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {selectedGroup?.vaccines.map(v => {
                    const isAlreadyDone = records.some(r => r.vaccineId === v.id);
                    const isSelected = vaxForm.selectedIds.includes(v.id);
                    
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          const newIds = isSelected 
                            ? vaxForm.selectedIds.filter(id => id !== v.id)
                            : [...vaxForm.selectedIds, v.id];
                          setVaxForm({ ...vaxForm, selectedIds: newIds, error: null });
                        }}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          isSelected ? (isAlreadyDone ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-inner' : 'bg-blue-50 border-blue-600 text-blue-600 shadow-inner') :
                          isAlreadyDone ? 'bg-slate-50 border-slate-200 text-slate-400 border-dashed' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">{v.name}</span>
                          {isSelected && <CheckCircle2 size={16} />}
                          {!isSelected && isAlreadyDone && <div className="px-1.5 py-0.5 bg-slate-100 rounded-md text-[8px] font-black text-slate-400 uppercase">Recorded</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {hasCorrectionSelected && (
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center space-x-2 text-amber-700 font-black text-[10px] uppercase">
                    <RefreshCw size={14} />
                    <span>Correction Required</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-amber-600/70 uppercase tracking-widest ml-1">Reason for update*</label>
                    <select
                      value={vaxForm.correctionReason}
                      onChange={e => setVaxForm({...vaxForm, correctionReason: e.target.value})}
                      className="w-full p-3 bg-white border border-amber-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      {CORRECTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administration Date</label>
                  <input
                    type="date"
                    max={format(new Date(), 'yyyy-MM-dd')}
                    value={vaxForm.date}
                    onChange={e => setVaxForm({ ...vaxForm, date: e.target.value, error: null })}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vaccinated By</label>
                    <label className="flex items-center space-x-2 text-[10px] font-black text-blue-600 uppercase cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded" 
                        checked={vaxForm.isUnknown} 
                        onChange={e => setVaxForm({...vaxForm, isUnknown: e.target.checked})}
                      />
                      <span>Unknown</span>
                    </label>
                  </div>
                  {!vaxForm.isUnknown ? (
                    <div className="relative group/vax">
                      <input 
                        list="vaccinators-list"
                        type="text"
                        placeholder="Type name..."
                        value={vaxForm.administeredBy}
                        onChange={e => setVaxForm({...vaxForm, administeredBy: smartCapitalize(stripNumbers(e.target.value))})}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
                      />
                      <datalist id="vaccinators-list">
                        {facilityVaccinators.map(name => <option key={name} value={name} />)}
                      </datalist>
                    </div>
                  ) : (
                    <div className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-500 italic">
                      Administered by Unknown Worker
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observation Notes (Optional)</label>
                <textarea
                  value={vaxForm.notes}
                  onChange={e => setVaxForm({ ...vaxForm, notes: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none h-20"
                  placeholder="Reaction, refusal reason, etc."
                />
              </div>
            </div>

            <div className="p-10 bg-slate-50/50 flex justify-end space-x-4">
              <button 
                onClick={() => setShowModal(false)}
                className="px-8 py-5 bg-white border border-slate-200 text-slate-600 rounded-[1.5rem] font-black uppercase text-sm hover:bg-slate-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleVaxSubmit}
                className={`px-12 py-5 rounded-[1.5rem] font-black uppercase text-sm shadow-2xl transition-all active:scale-95 text-white ${
                  hasCorrectionSelected ? 'bg-amber-600 shadow-amber-500/30 hover:bg-amber-700' : 'bg-blue-600 shadow-blue-500/30 hover:bg-blue-700'
                }`}
              >
                {hasCorrectionSelected ? 'Save Corrections' : 'Save Records'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildProfile;
