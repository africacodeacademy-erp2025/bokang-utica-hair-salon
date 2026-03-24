// src/firebase/auth.ts
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from "./config";

const auth = getAuth(app);

// Admin login
export const loginAdmin = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Admin logout
export const logoutAdmin = () => {
  return signOut(auth);
};

export { auth };
