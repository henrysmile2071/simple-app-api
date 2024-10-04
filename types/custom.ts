export type User = {
  id: string;
  email: string | null;
  isEmailVerified: boolean;
  token: string | null;
};
