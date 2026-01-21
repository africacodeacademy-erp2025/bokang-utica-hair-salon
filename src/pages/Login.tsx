import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { app } from "../firebase/config";
import "../index.css";

const auth = getAuth(app);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Admin logged in successfully ✅");
      navigate("/admin/dashboard");
    } catch (err) {
      setMessage("Login failed ❌ Check credentials.");
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card fade-up">
        <h2 className="fade-up delay-1">Admin Login</h2>
        <p className="fade-up delay-2">Welcome back! Please login to continue.</p>
        <form className="login-form fade-up delay-3" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </form>
        {message && <p className="login-message fade-up delay-4">{message}</p>}
      </div>
    </div>
  );
}
