import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── When you add Firebase, replace the mock below ───────────────────────────
// import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children } : any) {
  const [user, setUser]       = useState(null);   // Firebase user object
  const [coins, setCoins]     = useState(0);       // user's coin balance
  const [loading, setLoading] = useState(true);    // splash / auth check

  // ── On mount: check if a session already exists ──────────────────────────
  useEffect(() => {
    // MOCK — replace with Firebase auth listener:
    // const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
    //   if (firebaseUser) {
    //     setUser(firebaseUser);
    //     const doc = await firestore().collection('users').doc(firebaseUser.uid).get();
    //     setCoins(doc.data()?.coins ?? 0);
    //   } else {
    //     setUser(null);
    //   }
    //   setLoading(false);
    // });
    // return unsubscribe;

    // MOCK: simulate a quick auth check
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // ── Register with email + password ───────────────────────────────────────
  const register = async (email, password, name) => {
    // MOCK — replace with:
    // const cred = await auth().createUserWithEmailAndPassword(email, password);
    // await firestore().collection('users').doc(cred.user.uid).set({
    //   name, email, coins: 0, createdAt: firestore.FieldValue.serverTimestamp(),
    // });
    // setUser(cred.user);

    // MOCK
    const mockUser = { uid: 'mock-uid', email, displayName: name };
    setUser(mockUser);
    setCoins(0);
    return mockUser;
  };

  // ── Login with email + password ───────────────────────────────────────────
  const login = async (email, password) => {
    // MOCK — replace with:
    // const cred = await auth().signInWithEmailAndPassword(email, password);
    // const doc  = await firestore().collection('users').doc(cred.user.uid).get();
    // setCoins(doc.data()?.coins ?? 0);
    // setUser(cred.user);

    // MOCK
    const mockUser = { uid: 'mock-uid', email, displayName: 'User' };
    setUser(mockUser);
    setCoins(50);
    return mockUser;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    // await auth().signOut();
    setUser(null);
    setCoins(0);
  };

  // ── Add coins (called after every game win) ───────────────────────────────
  const addCoins = async (amount) => {
    const newTotal = coins + amount;
    setCoins(newTotal);

    // REPLACE with:
    // await firestore().collection('users').doc(user.uid).update({
    //   coins: firestore.FieldValue.increment(amount),
    // });
  };

  return (
    <AuthContext.Provider value={{ user, coins, loading, register, login, logout, addCoins }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
