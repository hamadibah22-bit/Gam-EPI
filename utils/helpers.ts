
import { format, differenceInWeeks, addWeeks, isAfter, isBefore, startOfDay } from 'date-fns';
import { VACCINE_SCHEDULE } from '../constants';
import { VaccinationRecord, Child } from '../types';

export const stripNumbers = (text: string) => text.replace(/[0-9]/g, '');
export const stripLetters = (text: string) => text.replace(/[^0-9-]/g, ''); // Allows dash for MC# formatting
export const stripNonNumeric = (text: string) => text.replace(/\D/g, '');

export const countWords = (text: string) => {
  const words = text.trim().split(/\s+/);
  return words.length >= 2 && words[0] !== '';
};

export const isValidPhone = (phone: string) => {
  const clean = phone.replace(/\D/g, '');
  return clean.length === 7;
};

export const formatMCNumber = (value: string) => {
  const clean = value.replace(/\D/g, '').slice(0, 8);
  if (clean.length <= 3) return clean;
  if (clean.length <= 7) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return `${clean.slice(0, 4)}-${clean.slice(4)}`;
};

export const smartCapitalize = (text: string) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Fixed: Using new Date instead of parseISO to resolve build errors
export const validateVaccinationDate = (adminDate: string, birthDate: string, minWeeks: number) => {
  const aDate = startOfDay(new Date(adminDate));
  const bDate = startOfDay(new Date(birthDate));
  const minDate = addWeeks(bDate, minWeeks);

  if (isBefore(aDate, bDate)) return "Cannot record vaccine before birth date.";
  if (isBefore(aDate, minDate)) return `Child must be at least ${minWeeks} weeks old for this vaccine.`;
  if (isAfter(aDate, new Date())) return "Cannot record future dates.";
  
  return null;
};

export const getVaccinationProgress = (child: Child, records: VaccinationRecord[]) => {
  if (!child) return 0;
  const totalVaccines = VACCINE_SCHEDULE.reduce((acc, group) => acc + group.vaccines.length, 0);
  const completedVaccines = records.filter(r => r.status === 'completed' && !r.notAdministered).length;
  return Math.round((completedVaccines / totalVaccines) * 100);
};

// Fixed: Using new Date instead of parseISO to resolve build errors
export const getDefaulterStatus = (child: Child, records: VaccinationRecord[]) => {
  if (!child || !child.dob) return [];
  const birthDate = new Date(child.dob);
  const completedIds = new Set(records.filter(r => r.status === 'completed').map(r => r.vaccineId));
  
  const missedVaccines: any[] = [];
  
  VACCINE_SCHEDULE.forEach(group => {
    const dueDate = addWeeks(birthDate, group.scheduleWeeks);
    if (isAfter(new Date(), dueDate)) {
      group.vaccines.forEach(v => {
        if (!completedIds.has(v.id)) {
          missedVaccines.push({
            ...v,
            group: group.name,
            dueDate,
            daysOverdue: Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          });
        }
      });
    }
  });

  return missedVaccines.sort((a, b) => b.daysOverdue - a.daysOverdue);
};