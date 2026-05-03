import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'coach' | 'student';

export type PlanType = 'mensal' | 'trimestral' | 'semestral';

export const PLAN_CONFIG: Record<PlanType, { label: string; days: number }> = {
  mensal:     { label: 'Mensal',     days: 30  },
  trimestral: { label: 'Trimestral', days: 90  },
  semestral:  { label: 'Semestral',  days: 180 },
};

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan?: string;
  planType?: PlanType;
  planExpiresAt?: Timestamp;
  enrollmentActive?: boolean;
  phone?: string;
  birthDate?: string;
  mustChangePassword?: boolean;
  photoURL?: string;
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
  wellhubSlotId?: string; // ID do slot no Wellhub após sincronização
}

export type ReservationStatus = 'BOOKED' | 'CHECKED_IN' | 'NO_SHOW';

export type ReservationSource = 'app' | 'wellhub';

export interface Reservation {
  id: string;
  userId: string;
  classId: string;
  status: ReservationStatus;
  classDate?: string;          // YYYY-MM-DD — denormalizado para checar se a aula já passou
  classTime?: string;          // HH:mm      — denormalizado para checar se a aula já passou
  source?: ReservationSource;  // origem da reserva (ausente = 'app' para dados legados)
  wellhubBookingNumber?: string; // ex: "BK-ABC123" — usado para cancelamentos
  wellhubUserName?: string;    // nome do usuário Wellhub para exibir na lista
  wellhubUserId?: string;      // unique_token do usuário no Wellhub
  createdAt: Timestamp;
}

export type NewClassPayload = Omit<Class, 'id' | 'createdBy'>;

export interface Wod {
  id: string;   // = date string YYYY-MM-DD
  date: string;
  sessions: Session[];
  createdBy: string;
}

export type PRUnit = 'kg' | 'reps' | 'min';

export interface PR {
  id: string;
  userId: string;
  movement: string;
  value: string;
  unit: PRUnit;
  createdAt: Timestamp;
}
