import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'coach' | 'student';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
}

export interface Session {
  id: string;
  title: string;
  details: string;
}

export interface Class {
  id: string;
  title: string;
  coach: string;
  date: string;     // YYYY-MM-DD
  time: string;     // HH:mm
  capacity: number;
  createdBy: string;
  sessions?: Session[];
}

export interface Reservation {
  id: string;
  userId: string;
  classId: string;
  checkedIn: boolean;
  createdAt: Timestamp;
}

export type NewClassPayload = Omit<Class, 'id' | 'createdBy'>;
