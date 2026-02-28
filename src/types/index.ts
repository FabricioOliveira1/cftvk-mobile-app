import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'coach' | 'student';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan?: string;
  enrollmentActive?: boolean;
  phone?: string;
  birthDate?: string;
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

export type ReservationStatus = 'BOOKED' | 'CHECKED_IN' | 'NO_SHOW';

export interface Reservation {
  id: string;
  userId: string;
  classId: string;
  status: ReservationStatus;
  classDate?: string; // YYYY-MM-DD — denormalizado para checar se a aula já passou
  classTime?: string; // HH:mm    — denormalizado para checar se a aula já passou
  createdAt: Timestamp;
  checkedInAt?: Timestamp; // quando o check-in foi realizado (preenchido pela CF)
}

export type NewClassPayload = Omit<Class, 'id' | 'createdBy'>;

export type PRUnit = 'kg' | 'reps' | 'min';

export interface PR {
  id: string;
  userId: string;
  movement: string;
  value: string;
  unit: PRUnit;
  createdAt: Timestamp;
}
