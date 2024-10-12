import "reflect-metadata"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from "typeorm"
import bcrypt from 'bcrypt'

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  googleId!: string | null;

  @Column({ type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @Column({ type: 'int', default: 0 })
  loginCount!: number; 

  @Column({ type: 'timestamp', nullable: true })
  lastActiveSession!: Date; 

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    if (this.password) {
      return bcrypt.compare(candidatePassword, this.password);
    }
    return false;
  }
}
