import { Role } from '@/constant/role';
import { BaseEntity } from '@/shared/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string;

  @Column({ type: 'boolean', default: true, nullable: true })
  status: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  isVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  code_id: string;
  
  @Column({ type: 'date', nullable: true })
  code_expried: Date;


}
