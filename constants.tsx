
import React from 'react';
import { VaccineGroup } from './types';

export const HEALTH_FACILITIES = [
  "Wullinkama Community Clinic",
  "Wellingara Community Clinic",
  "Sukuta Health Centre",
  "Sinchu Baliya Community Clinic",
  "Sheikh Zaid Regional Eye Care Hospital",
  "Sere Kunda Health Centre",
  "Poly Clinic",
  "Old Jeshwang Community Clinic",
  "New Yundum Health Centre",
  "New Jeshwang Community Clinic",
  "Nemakunku Community Clinic",
  "Mandinaring Community Clinic",
  "Makumbaya Community Clinic",
  "Leman Street",
  "Kanifing General Hospital",
  "Fajikunda Health Centre",
  "Edward Francis Small Teaching Hospital",
  "Busumbala Community Clinic",
  "Bundung Maternal and Child Health Hospital",
  "Brufut Health Centre",
  "Banjulinding Health Centre",
  "Bakau Health Centre",
  "Ahamdia Hospital",
  "Other"
];

export const VACCINE_SCHEDULE: VaccineGroup[] = [
  {
    id: 'birth',
    name: 'Birth or later',
    ageDescription: 'At birth',
    scheduleWeeks: 0,
    color: 'bg-emerald-500',
    vaccines: [
      { id: 'bcg', name: 'BCG Injection', doseNumber: 1 },
      { id: 'hepb', name: 'Hepatitis B', doseNumber: 1 },
      { id: 'opv0', name: 'Oral Polio 0', doseNumber: 1 },
    ]
  },
  {
    id: '2months',
    name: '2 Months or later',
    ageDescription: 'At 2 months',
    scheduleWeeks: 8,
    color: 'bg-blue-500',
    vaccines: [
      { id: 'opv1', name: 'Oral Polio 1', doseNumber: 1 },
      { id: 'penta1', name: 'Pentavalent 1', doseNumber: 1 },
      { id: 'pneumo1', name: 'Pneumo 1', doseNumber: 1 },
      { id: 'rota1', name: 'Rota 1', doseNumber: 1 },
    ]
  },
  {
    id: '3months',
    name: '3 Months or later',
    ageDescription: 'At 3 months',
    scheduleWeeks: 12,
    color: 'bg-indigo-500',
    vaccines: [
      { id: 'opv2', name: 'Oral Polio 2', doseNumber: 2 },
      { id: 'penta2', name: 'Pentavalent 2', doseNumber: 2 },
      { id: 'pneumo2', name: 'Pneumo 2', doseNumber: 2 },
      { id: 'rota2', name: 'Rota 2', doseNumber: 2 },
    ]
  },
  {
    id: '4months',
    name: '4 Months or later',
    ageDescription: 'At 4 months',
    scheduleWeeks: 16,
    color: 'bg-violet-500',
    vaccines: [
      { id: 'opv3', name: 'Oral Polio 3', doseNumber: 3 },
      { id: 'penta3', name: 'Pentavalent 3', doseNumber: 3 },
      { id: 'pneumo3', name: 'Pneumo 3', doseNumber: 3 },
      { id: 'ipv', name: 'IPV', doseNumber: 1 },
    ]
  },
  {
    id: '9months',
    name: '9 Months or later',
    ageDescription: 'At 9 months',
    scheduleWeeks: 39,
    color: 'bg-fuchsia-500',
    vaccines: [
      { id: 'opv4', name: 'Oral Polio 4', doseNumber: 4 },
      { id: 'mr1', name: 'MR 1', doseNumber: 1 },
      { id: 'yf', name: 'Yellow Fever', doseNumber: 1 },
    ]
  },
  {
    id: '1year',
    name: '1 Year',
    ageDescription: 'At 12 months',
    scheduleWeeks: 52,
    color: 'bg-cyan-500',
    vaccines: [
      { id: 'mena', name: 'Meningitis A', doseNumber: 1 },
    ]
  },
  {
    id: '1year_penta3',
    name: '1 Year after Penta 3',
    ageDescription: '12 months after Penta 3',
    scheduleWeeks: 68, // Roughly 16 months (4m + 12m)
    color: 'bg-amber-500',
    vaccines: [
      { id: 'dpt_b', name: 'DPT Booster', doseNumber: 1 },
    ]
  },
  {
    id: '18months',
    name: '18 Months or later',
    ageDescription: 'At 18 months',
    scheduleWeeks: 78,
    color: 'bg-rose-500',
    vaccines: [
      { id: 'opv_b', name: 'Polio Booster', doseNumber: 1 },
      { id: 'mr2', name: 'MR 2', doseNumber: 2 },
    ]
  }
];
