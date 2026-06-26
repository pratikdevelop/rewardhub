import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type User = {
  uid: string;
  email: string;
  displayName: string;
};

type AuthContextType = {
  user: User | null;
  coins: number;
  loading: boolean;

  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<User>;

  login: (
    email: string,
    password: string
  ) => Promise<User>;

  logout: () => Promise<void>;

  addCoins: (
    amount: number
  ) => Promise<void>;
};

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [coins, setCoins] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  // ───────────────────────────────────────────────────────────
  // Initial Auth Check
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // ───────────────────────────────────────────────────────────
  // Register
  // ───────────────────────────────────────────────────────────

  const register = async (
    email: string,
    password: string,
    name: string
  ) => {
    const mockUser: User = {
      uid: 'mock-uid',
      email,
      displayName: name,
    };

    setUser(mockUser);
    setCoins(0);

    return mockUser;
  };

  // ───────────────────────────────────────────────────────────
  // Login
  // ───────────────────────────────────────────────────────────

  const login = async (
    email: string,
    password: string
  ) => {
    const mockUser: User = {
      uid: 'mock-uid',
      email,
      displayName: 'User',
    };

    setUser(mockUser);
    setCoins(50);

    return mockUser;
  };

  // ───────────────────────────────────────────────────────────
  // Logout
  // ───────────────────────────────────────────────────────────

  const logout = async () => {
    setUser(null);
    setCoins(0);
  };

  // ───────────────────────────────────────────────────────────
  // Add Coins
  // ───────────────────────────────────────────────────────────

  const addCoins = async (
    amount: number
  ) => {
    setCoins((prev) => prev + amount);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        coins,
        loading,
        register,
        login,
        logout,
        addCoins,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
};