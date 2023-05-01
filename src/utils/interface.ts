export interface IUser {
  id: number;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  isActive: boolean;
  activationCode: string;
}

export interface JwtPayload {
  userId?: string;
  email?: string;
  iat: number;
  exp: number;
}