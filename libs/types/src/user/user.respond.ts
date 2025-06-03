import { Role } from '@app/constant/role';
import { Respond } from '..';

export interface User {
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
  avatar?: string;
  status: boolean;
}

export interface CreateUserResponse extends Respond {
  data: User;
}

export interface GetUserByIdResponse extends Respond {
  data: User;
}

export interface GetAllUserResponse extends Respond {
  data: User[];
  total: number;
}

export interface UpdateUserResponse extends Respond {
  data: User;
}
