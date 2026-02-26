import { useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { backendLogin, checkUsernameAvailable, updateUsername } from "../lib/api";
import Logo from "../assets/logo.svg";

const generateUsername = (email: string) =>
  email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 20);

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (user) navigate("/web", { replace: true });
  }, [user, navigate]);

  // Auto-generate username from email
  useEffect(() => {
    if (email) setUsername(generateUsername(email));
  }, [email]);

  // Debounced uniqueness check
  const handleUsernameChange = (val: string) => {
    setUsername(val);
    if (val.length < 3) {
      setUsernameStatus("invalid");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(val)) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    if (checkTimer.current) clearTimeout(checkTimer.current);
    checkTimer.current = setTimeout(async () => {
      const available = await checkUsernameAvailable(val);
      setUsernameStatus(available ? "available" : "taken");
    }, 500);
  };

  const handleSignup = async () => {
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (usernameStatus === "taken") {
      setError("That username is already taken.");
      return;
    }
    if (usernameStatus === "invalid" || username.length < 3) {
      setError("Username must be at least 3 characters (letters, numbers, underscores).");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      // Create user in DB (auto-generates username from email)
      await backendLogin(token);
      // Patch to the user's chosen username if different
      const autoUsername = generateUsername(email);
      if (username !== autoUsername) {
        await updateUsername(username);
      }
      navigate("/web");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) {
        setError("An account with this email already exists. Sign in instead.");
      } else if (msg.includes("weak-password")) {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
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

  const usernameHint = () => {
    if (usernameStatus === "checking") return { text: "Checking…", color: "text-muted" };
    if (usernameStatus === "available") return { text: "✓ Available", color: "text-brand" };
    if (usernameStatus === "taken") return { text: "✗ Already taken", color: "text-red-400" };
    if (usernameStatus === "invalid") return { text: "3–20 chars, letters / numbers / underscores only", color: "text-muted" };
    return null;
  };

  const hint = usernameHint();

  return (
    <div className="flex w-full items-center justify-center py-32">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-xl border border-border/20">
        <div className="flex items-center gap-3 mb-8">
          <img src={Logo} className="h-10" alt="Geonotes logo" />
          <span className="text-xl font-semibold text-text">Geonotes</span>
        </div>

        <h2 className="mb-2">Create account</h2>
        <p className="mb-8">Join Geonotes and start leaving your mark.</p>

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
          className="w-full mb-4 px-4 py-3 rounded-xl bg-surface-2 border border-border text-text placeholder:text-muted focus:outline-none focus:border-brand transition-colors"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 px-4 py-3 rounded-xl bg-surface-2 border border-border text-text placeholder:text-muted focus:outline-none focus:border-brand transition-colors"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {/* Username field */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm select-none">@</span>
            <input
              className="w-full pl-8 pr-4 py-3 rounded-xl bg-surface-2 border border-border text-text placeholder:text-muted focus:outline-none focus:border-brand transition-colors"
              placeholder="username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
            />
          </div>
          {hint && (
            <p className={`mt-1 text-xs pl-1 ${hint.color}`}>{hint.text}</p>
          )}
        </div>

        <button
          onClick={handleSignup}
          disabled={loading || usernameStatus === "taken" || usernameStatus === "checking"}
          className="w-full bg-brand text-light font-semibold py-3 rounded-full mb-3 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border/30" />
          <span className="text-xs text-muted">or</span>
          <div className="flex-1 h-px bg-border/30" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full bg-surface-2 text-text font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 mb-6"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
