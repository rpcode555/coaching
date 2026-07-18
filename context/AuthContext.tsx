"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
  ) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
      return "No account found with this email. Please sign up first.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Popup was blocked by browser. Trying redirect sign-in...";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    default:
      return "An error occurred. Please try again.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process redirect sign-in result if redirect fallback was triggered
    getRedirectResult(auth).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string; name?: string };

      // Gracefully handle when user closes popup, aborts request, or cancels
      const isAbort =
        firebaseError.name === "AbortError" ||
        firebaseError.message?.toLowerCase().includes("aborted") ||
        firebaseError.code === "auth/popup-closed-by-user" ||
        firebaseError.code === "auth/cancelled-popup-request" ||
        firebaseError.code === "auth/user-cancelled";

      if (isAbort) {
        setError(null);
        return;
      }

      // If popup is blocked by browser, try redirect sign-in as fallback
      if (firebaseError.code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch {
          setError("Popup blocked by browser. Please allow popups for this site.");
          return;
        }
      }

      const msg =
        getErrorMessage(firebaseError.code || "") ||
        firebaseError.message ||
        "Failed to sign in with Google";
      setError(msg);
    }
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: unknown) {
        const firebaseError = err as { code?: string };
        setError(getErrorMessage(firebaseError.code || ""));
        throw err;
      }
    },
    [],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        setError(null);
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(result.user, { displayName: name });
        // Force a re-read of the user so displayName is picked up
        setUser({ ...result.user });
      } catch (err: unknown) {
        const firebaseError = err as { code?: string };
        setError(getErrorMessage(firebaseError.code || ""));
        throw err;
      }
    },
    [],
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      setError(
        getErrorMessage(firebaseError.code || "") ||
          firebaseError.message ||
          "Failed to send password reset email",
      );
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err: unknown) {
      const firebaseError = err as { message?: string };
      setError(firebaseError.message || "Failed to sign out");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
