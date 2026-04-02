export interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
  settings: UserSettings;
}

export interface UserSettings {
  currency: 'TRY' | 'USD' | 'EUR';
  startingBalance: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
}
