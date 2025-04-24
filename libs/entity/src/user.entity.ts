import { Comment } from '@app/entity/comment.entity';
import { Role } from '@app/constant/role';
import { Order } from '@app/entity/order.entity';
import { BaseEntity } from '@app/shared/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Discount } from '@app/entity/discount.entity';
import { UserDiscount } from '@/domain/discount/entities/user-discount.entity';

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

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

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

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken: string;

  @Column({ type: 'date', nullable: true })
  code_expried: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => UserDiscount, (discount) => discount.user)
  userDiscounts: Discount[];
}
