
import { Child, User, VaccinationRecord, UserRole, ApprovalStatus, ChildStatus, Gender } from '../types';

const STORAGE_KEYS = {
  CHILDREN: 'epi_app_children',
  RECORDS: 'epi_app_records',
  USERS: 'epi_app_users',
  CURRENT_USER: 'epi_app_current_user',
  LAST_SYNC: 'epi_app_last_sync',
  VACCINATORS: 'epi_app_vaccinators'
};

export const storageService = {
  // Initialize default data if not present
  initialize: () => {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const mockAdmin: User = {
        id: '1',
        email: 'admin@health.gm',
        fullName: 'Dr. Bakary Jammeh',
        phoneNumber: '2345678',
        position: 'National EPI Director',
        healthCenter: 'Sukuta Health Centre',
        userRole: UserRole.ADMIN,
        approvalStatus: ApprovalStatus.APPROVED,
        profileCompleted: true,
        accountDeletionRequested: false,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([mockAdmin]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHILDREN)) localStorage.setItem(STORAGE_KEYS.CHILDREN, '[]');
    if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) localStorage.setItem(STORAGE_KEYS.RECORDS, '[]');
    if (!localStorage.getItem(STORAGE_KEYS.VACCINATORS)) localStorage.setItem(STORAGE_KEYS.VACCINATORS, '{}');
  },

  // Auth & User Management
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    window.dispatchEvent(new Event('auth-change'));
  },

  getUsers: (): User[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),

  addUser: (user: User) => {
    const users = storageService.getUsers();
    users.push({ ...user, updatedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  updateUser: (user: User) => {
    const users = storageService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = { ...user, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      const current = storageService.getCurrentUser();
      if (current?.id === user.id) storageService.setCurrentUser(users[index]);
    }
  },

  deleteUser: (userId: string) => {
    const users = storageService.getUsers();
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
  },

  // Child Management
  getChildren: (): Child[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CHILDREN) || '[]'),

  addChild: (child: Child) => {
    const children = storageService.getChildren();
    children.push({ ...child, updatedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
  },

  getChildById: (id: string): Child | undefined => {
    return storageService.getChildren().find(c => c.id === id);
  },

  updateChild: (child: Child) => {
    const children = storageService.getChildren();
    const index = children.findIndex(c => c.id === child.id);
    if (index !== -1) {
      children[index] = { ...child, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
    }
  },

  deleteChild: (childId: string) => {
    const children = storageService.getChildren();
    const filteredChildren = children.filter(c => c.id !== childId);
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(filteredChildren));

    const records = storageService.getRecords();
    const filteredRecords = records.filter(r => r.childId !== childId);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(filteredRecords));
    
    // Dispatch event so other components know data changed
    window.dispatchEvent(new Event('storage'));
  },

  // Record Management
  getRecords: (): VaccinationRecord[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS) || '[]'),

  getRecordsForChild: (childId: string): VaccinationRecord[] => {
    return storageService.getRecords().filter(r => r.childId === childId);
  },

  // Sync Management
  getLastSync: (): string | null => localStorage.getItem(STORAGE_KEYS.LAST_SYNC),

  setLastSync: (date: string) => localStorage.setItem(STORAGE_KEYS.LAST_SYNC, date),

  // Vaccinator Directory Management
  getVaccinatorsForFacility: (facility: string): string[] => {
    const vaccinators = JSON.parse(localStorage.getItem(STORAGE_KEYS.VACCINATORS) || '{}');
    return vaccinators[facility] || [];
  },

  addVaccinator: (facility: string, name: string) => {
    const vaccinators = JSON.parse(localStorage.getItem(STORAGE_KEYS.VACCINATORS) || '{}');
    if (!vaccinators[facility]) vaccinators[facility] = [];
    if (!vaccinators[facility].includes(name)) {
      vaccinators[facility].push(name);
      localStorage.setItem(STORAGE_KEYS.VACCINATORS, JSON.stringify(vaccinators));
    }
  }
};