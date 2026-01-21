import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from "./config";

const auth = getAuth(app);

export const loginAdmin = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutAdmin = () => {
  return signOut(auth);
};

export { auth };
