import { Role } from '@/constant/role';

export interface userRespond {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address?: string;
  phone?: string;
  images?: string;
  city?: string;
  company: string;
  role: Role;
}

export interface createRespond {
  status?: number;
  data: userRespond;
  message?: string;
}
