import "reflect-metadata"
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm"
import bcrypt from 'bcrypt'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  email!: string

  @Column({ nullable: true })
  password?: string

  @Column({ nullable: true })
  googleId?: string

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10)
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    if (this.password) {
      return bcrypt.compare(candidatePassword, this.password)
    }
    return false
  }
}