import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
  @Index()
    title: string;

  @Column()
  @Index()
    description: string;

  @Column({ default: 'new' })
    status: string;

  @Column({ type: 'timestamp' })
    deadline: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

  @UpdateDateColumn(
    { type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

  @ManyToOne(() => User, user => user.tasks)
    user: User;
}