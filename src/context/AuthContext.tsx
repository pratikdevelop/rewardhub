import { auth, db } from '@/firebase/firebaseAuth';
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';


// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type User = {
  uid: string;
  email: string;
  displayName: string;

  coins: number;
  level: number;
  xp: number;
  gamesPlayed: number;
};
type AuthContextType = {
  user: User | null;
  loading: boolean;

  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<void>;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;

  addCoins: (
    amount: number
  ) => Promise<void>;

  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);


  // ───────────────────────────────────────────────────────────
  // Register
  // ───────────────────────────────────────────────────────────

  const refreshUser = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setUser(null);
      return;
    }

    const userRef = doc(db, "users", currentUser.uid);

    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) return;

    const data = snapshot.data();

    setUser({
      uid: currentUser.uid,
      email: currentUser.email ?? "",
      displayName:
        currentUser.displayName ?? data.displayName,

      coins: data.coins,
      level: data.level,
      xp: data.xp,
      gamesPlayed: data.gamesPlayed,
    });
  };
  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          if (firebaseUser) {
            await refreshUser();
          } else {
            setUser(null);
          }

          setLoading(false);
        }
      );

    return unsubscribe;
  }, []);
  const forgotPassword = async (email: string) => {
    try {
    console.log(
      "email"
    );
    
    await sendPasswordResetEmail(auth, email);  
    } catch (error) {
      console.error("Password Reset failed, Error: ", error);
      
    }
    
  };
  const register = async (
    email: string,
    password: string,
    name: string
  ) => {
    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    await updateProfile(
      credential.user,
      {
        displayName: name,
      }
    );

    await setDoc(
      doc(db, "users", credential.user.uid),
      {
        displayName: name,
        email,

        coins: 50,

        level: 1,

        xp: 0,

        gamesPlayed: 0,

        createdAt: serverTimestamp(),
      }
    );

    await refreshUser();
  };
  // ───────────────────────────────────────────────────────────
  // Login
  // ───────────────────────────────────────────────────────────
  const login = async (
    email: string,
    password: string
  ) => {
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    await refreshUser();
  };

  // ───────────────────────────────────────────────────────────
  // Logout
  // ───────────────────────────────────────────────────────────

  const logout = async () => {
    await signOut(auth);

    setUser(null);
  };

  // ───────────────────────────────────────────────────────────
  // Add Coins
  // ───────────────────────────────────────────────────────────

  const addCoins = async (
    amount: number
  ) => {
    if (!auth.currentUser) return;

    const userRef = doc(
      db,
      "users",
      auth.currentUser.uid
    );

    await updateDoc(userRef, {
      coins: increment(amount),
    });

    await refreshUser();
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        forgotPassword,
        register,
        login,
        logout,

        addCoins,

        refreshUser,
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