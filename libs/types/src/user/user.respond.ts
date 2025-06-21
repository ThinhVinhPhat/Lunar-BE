import { Role } from '@app/constant/role';
import { Respond } from '..';
import { UserResponseDto } from '@/domain/users/dto/user.respond';

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
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserResponse extends Respond {
  data: User;
}

export interface GetUserByIdResponse extends Respond {
  data: User;
}

export interface GetAllUserResponse extends Respond {
  data: UserResponseDto;
  total?: number;
}

export interface UpdateUserResponse extends Respond {
  data: UserResponseDto;
}
