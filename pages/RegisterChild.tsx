
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, CreditCard, Calendar, Phone, MapPin, 
  CheckCircle2, Baby, AlertCircle 
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Gender, ChildStatus, Child } from '../types';
import { formatMCNumber, smartCapitalize, stripNumbers, stripNonNumeric, countWords, isValidPhone } from '../utils/helpers';
import { isAfter, isValid } from 'date-fns';

const RegisterChild: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = storageService.getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dobParts, setDobParts] = useState({
    day: '',
    month: '',
    year: '' // Last 2 digits
  });

  const [formData, setFormData] = useState({
    fullName: '',
    motherName: '',
    gender: Gender.MALE,
    mcNumber: '',
    parentContact: '',
    address: '',
    lat: 13.4432,
    lng: -15.3101
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate DOB parts
    const { day, month, year } = dobParts;
    if (!day || !month || !year || year.length !== 2) {
      setError("Please enter a valid 2-digit year (e.g., 24 for 2024)");
      return;
    }

    const constructedDobStr = `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    // Fixed: Using new Date instead of parseISO
    const dobDate = new Date(constructedDobStr);

    if (!isValid(dobDate)) {
      setError("Invalid Date of Birth provided. Please check the day and month.");
      return;
    }

    if (isAfter(dobDate, new Date())) {
      setError("Child birth date cannot be in the future.");
      return;
    }

    // Mandatory Field Checks
    if (!formData.fullName.trim() || !formData.motherName.trim() || !formData.mcNumber || !formData.parentContact) {
      setError("Full Name, Caregiver Name, MC#, Gender, and Phone are mandatory.");
      return;
    }

    if (!countWords(formData.fullName)) {
      setError("Child Full Name must contain at least two names (First and Surname)");
      return;
    }

    if (!countWords(formData.motherName)) {
      setError("Mother/Caregiver Name must contain at least two names");
      return;
    }

    if (!isValidPhone(formData.parentContact)) {
      setError("Parent Phone must be exactly 7 digits.");
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    const newChild: Child = {
      id: Date.now().toString(),
      fullName: smartCapitalize(formData.fullName),
      motherName: smartCapitalize(formData.motherName),
      address: smartCapitalize(formData.address),
      parentContact: formData.parentContact,
      mcNumber: formData.mcNumber,
      dob: constructedDobStr,
      gender: formData.gender,
      location: { 
        lat: formData.lat, 
        lng: formData.lng, 
        healthCenter: currentUser?.healthCenter || 'Assigned Facility' 
      },
      status: ChildStatus.ACTIVE,
      registeredBy: currentUser?.fullName || 'Health Worker',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.addChild(newChild);
    setLoading(false);
    navigate(`/child/${newChild.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-5 mb-10">
        <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
          <Baby size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Child Enrollment</h1>
          <p className="text-slate-500 font-medium italic">Record child biodata at <span className="text-blue-600 font-bold">{currentUser?.healthCenter}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 p-10 space-y-10">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center text-sm font-bold">
            <AlertCircle size={18} className="mr-2" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center">
              <User size={14} className="mr-2" /> Identity Details
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name* (2+ names)</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: smartCapitalize(stripNumbers(e.target.value))})}
                  placeholder="First and Surname"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mother/Caregiver Name* (2+ names)</label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => setFormData({...formData, motherName: smartCapitalize(stripNumbers(e.target.value))})}
                  placeholder="Parent Full Name"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Birth Date (DD/MM/20YY)*</label>
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="DD"
                    value={dobParts.day}
                    onChange={(e) => setDobParts({...dobParts, day: stripNonNumeric(e.target.value)})}
                    className="w-10 bg-transparent text-center font-bold outline-none"
                  />
                  <span className="text-slate-300 font-bold">/</span>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="MM"
                    value={dobParts.month}
                    onChange={(e) => setDobParts({...dobParts, month: stripNonNumeric(e.target.value)})}
                    className="w-10 bg-transparent text-center font-bold outline-none"
                  />
                  <span className="text-slate-300 font-bold">/</span>
                  <div className="flex items-center">
                    <span className="text-slate-400 font-bold">20</span>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="YY"
                      value={dobParts.year}
                      onChange={(e) => setDobParts({...dobParts, year: stripNonNumeric(e.target.value)})}
                      className="w-8 bg-transparent text-center font-bold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center">
              <CreditCard size={14} className="mr-2" /> System Details
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Identification/MC#*</label>
                <input
                  type="text"
                  value={formData.mcNumber}
                  onChange={(e) => setFormData({...formData, mcNumber: formatMCNumber(stripNonNumeric(e.target.value))})}
                  placeholder="XXX-XXXX"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-black tracking-widest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender*</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as Gender})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold"
                  >
                    <option value={Gender.MALE}>Male</option>
                    <option value={Gender.FEMALE}>Female</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Phone* (7 Digits)</label>
                  <input
                    type="tel"
                    maxLength={7}
                    value={formData.parentContact}
                    onChange={(e) => setFormData({...formData, parentContact: stripNonNumeric(e.target.value).slice(0, 7)})}
                    placeholder="7XXXXXX"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2">
                 <div className="p-4 bg-blue-50 rounded-2xl flex items-start space-x-3">
                   <MapPin size={18} className="text-blue-500 mt-1" />
                   <div>
                     <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Assigned Facility</p>
                     <p className="text-sm font-bold text-blue-700">{currentUser?.healthCenter}</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Home Address (Optional)</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: smartCapitalize(stripNumbers(e.target.value))})}
              placeholder="Full Residential Address"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold"
            />
          </div>
        </div>

        <div className="pt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-12 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-sm shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={20} />
                <span>Register Child</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterChild;