export interface IUser {
  id: number;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  isActive: boolean;
  activationCode: string;
}