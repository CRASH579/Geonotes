import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/logo.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/web", { replace: true });
  }, [user, navigate]);

  const handleEmailLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/web");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate("/web");
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center py-32">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-xl border border-border/20">
        <div className="flex items-center gap-3 mb-8">
          <img src={Logo} className="h-10" alt="Geonotes logo" />
          <span className="text-xl font-semibold text-text">Geonotes</span>
        </div>

        <h2 className="mb-2">Welcome back</h2>
        <p className="mb-8">Sign in to your account to continue.</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-surface-2 border border-border text-sm text-text">
            {error}
          </div>
        )}

        <input
          className="w-full mb-4 px-4 py-3 rounded-xl bg-surface-2 border border-border text-text placeholder:text-muted focus:outline-none focus:border-brand transition-colors"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-6 px-4 py-3 rounded-xl bg-surface-2 border border-border text-text placeholder:text-muted focus:outline-none focus:border-brand transition-colors"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void handleEmailLogin()}
        />

        <button
          onClick={handleEmailLogin}
          disabled={loading}
          className="w-full bg-brand text-light font-semibold py-3 rounded-full mb-3 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border/30" />
          <span className="text-xs text-muted">or</span>
          <div className="flex-1 h-px bg-border/30" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-surface-2 text-text font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 mb-6"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link to="/signup" className="text-brand hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
