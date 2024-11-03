// src/services/authService.ts
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebaseConfig";
import useAppStore, { User } from "../stores/useAppStore";

export const signInWithGoogle = async (): Promise<void> => {
    const setUser = useAppStore.getState().setUser;
  
    try {
      console.log("Attempting Google sign-in...");
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
  
      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || "",
        email: firebaseUser.email || "",
      };
  
      console.log("Google sign-in successful:", user);
      setUser(user);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };
  

export const signOutUser = async (): Promise<void> => {
  const setUser = useAppStore.getState().setUser;

  try {
    await signOut(auth);
    setUser(null);
    console.log("User signed out");
  } catch (error) {
    console.error("Sign-Out Error:", error);
  }
};
