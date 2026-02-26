import { authFetch } from "./authFetch";

const API = import.meta.env.VITE_API_URL as string;

// auth
export async function backendLogin(token: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token }),
  });
  if (!res.ok) throw new Error("Backend login failed");
  return res.json();
}

//users
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  if (username.length < 3) return false;
  try {
    const res = await fetch(
      `${API}/api/users/check-username?username=${encodeURIComponent(username)}`,
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { available: boolean };
    return data.available;
  } catch {
    return false;
  }
}

export async function updateUsername(username: string) {
  const res = await authFetch(`${API}/api/users/me`, {
    method: "PATCH",
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error("Failed to update username");
  return res.json();
}

//notes
export type NoteVisibility = "PRIVATE" | "FRIENDS" | "GROUP" | "PUBLIC";

export type CreateNoteInput = {
  title: string;
  content: string;
  latitude: number;
  longitude: number;
  visibility?: NoteVisibility;
};

export async function createNote(data: CreateNoteInput) {
  const res = await authFetch(`${API}/api/notes`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

export async function getNearbyNotes(lat: number, lng: number, radius = 1000) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    radiusMeters: String(radius),
  });
  const res = await authFetch(`${API}/api/notes/nearby?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch nearby notes");
  return res.json();
}

export async function getLegacyNotes() {
  const res = await authFetch(`${API}/api/notes/legacy`);
  if (!res.ok) throw new Error("Failed to fetch legacy notes");
  return res.json();
}
