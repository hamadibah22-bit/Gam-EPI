
export enum UserRole {
  ADMIN = 'Admin',
  PHO = 'Public Health Officer',
  NEW = 'New User'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum ChildStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  INACTIVE = 'inactive'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  position: string;
  healthCenter: string;
  otherHealthFacility?: string;
  userRole: UserRole;
  approvalStatus: ApprovalStatus;
  profileCompleted: boolean;
  profilePhoto?: string;
  location?: { lat: number; lng: number };
  accountDeletionRequested: boolean;
  deletionReason?: string;
  // Added updatedAt to fix type error in storageService and sync logic
  updatedAt?: string;
}

export interface Child {
  id: string;
  fullName: string;
  motherName: string;
  address: string;
  parentContact: string;
  mcNumber: string; // YYYY-NNN or YYYY-NNNN
  dob: string;
  gender: Gender;
  location: { lat: number; lng: number; healthCenter: string };
  status: ChildStatus;
  registeredBy: string;
  createdAt: string;
  // Added updatedAt to fix type error in sync logic
  updatedAt?: string;
}

export interface VaccinationRecord {
  id: string;
  childId: string;
  vaccineId: string;
  doseNumber: number;
  dateAdministered: string;
  nextDueDate?: string;
  administeredBy: string;
  healthCenter: string;
  batchNumber?: string;
  notes?: string;
  status: 'completed' | 'missed' | 'scheduled';
  notAdministered: boolean;
  reasonNotAdministered?: string;
  // Added updatedAt to fix type error in sync logic
  updatedAt?: string;
}

export interface Vaccine {
  id: string;
  name: string;
  doseNumber: number;
}

export interface VaccineGroup {
  id: string;
  name: string;
  ageDescription: string;
  vaccines: Vaccine[];
  scheduleWeeks: number;
  color: string;
}