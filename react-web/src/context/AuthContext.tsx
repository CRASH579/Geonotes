import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { backendLogin } from "@/lib/api";

type AppUser = {
  id: string;
  email: string;
  username: string;
};

type AuthContextType = {
  firebaseUser: User | null;
  user: AppUser | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        setFirebaseUser(fbUser);

        if (fbUser) {
          const token = await fbUser.getIdToken();
          const profile = await backendLogin(token);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth sync error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
