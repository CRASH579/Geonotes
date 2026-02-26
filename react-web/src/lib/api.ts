import { authFetch } from "./authFetch";
import type { Group, GroupMember, GroupVisibility } from "../types";

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
  group_id?: string;
};

export async function createNote(data: CreateNoteInput) {
  const res = await authFetch(`${API}/api/notes`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

export async function getMyNotes() {
  const res = await authFetch(`${API}/api/notes/mine`);
  if (!res.ok) throw new Error("Failed to fetch my notes");
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

export async function updateNote(
  id: string,
  data: { title?: string; content?: string; visibility?: NoteVisibility },
) {
  const res = await authFetch(`${API}/api/notes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return res.json();
}

export async function deleteNote(id: string) {
  const res = await authFetch(`${API}/api/notes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete note");
  return res.json();
}

export async function getLegacyNotes() {
  const res = await authFetch(`${API}/api/notes/legacy`);
  if (!res.ok) throw new Error("Failed to fetch legacy notes");
  return res.json();
}

// friends

export type FriendEntry = {
  friendshipId: string;
  friend: { id: string; username: string; avatar_url: string | null };
  since: string;
};

export type PendingRequest = {
  id: string;
  initiator: { id: string; username: string; avatar_url: string | null };
  created_at: string;
};

export async function sendFriendRequest(username: string) {
  const res = await authFetch(`${API}/api/friends/request`, {
    method: "POST",
    body: JSON.stringify({ username }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? "Failed to send request");
  }
  return res.json();
}

export async function respondFriendRequest(id: string, action: "ACCEPTED" | "REJECTED") {
  const res = await authFetch(`${API}/api/friends/${id}/respond`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error("Failed to respond");
  return res.json();
}

export async function getFriends(): Promise<FriendEntry[]> {
  const res = await authFetch(`${API}/api/friends`);
  if (!res.ok) throw new Error("Failed to fetch friends");
  return res.json() as Promise<FriendEntry[]>;
}

export async function getPendingReceived(): Promise<PendingRequest[]> {
  const res = await authFetch(`${API}/api/friends/pending/received`);
  if (!res.ok) throw new Error("Failed to fetch pending requests");
  return res.json() as Promise<PendingRequest[]>;
}

export async function removeFriend(friendshipId: string) {
  const res = await authFetch(`${API}/api/friends/${friendshipId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove friend");
  return res.json();
}

// ─── groups ──────────────────────────────────────────────────────────────────

export async function createGroup(name: string, visibility: GroupVisibility = 'PUBLIC'): Promise<Group> {
  const res = await authFetch(`${API}/api/groups`, {
    method: "POST",
    body: JSON.stringify({ name, visibility }),
  });
  if (!res.ok) throw new Error("Failed to create group");
  return res.json() as Promise<Group>;
}

export async function getMyGroups(): Promise<Group[]> {
  const res = await authFetch(`${API}/api/groups`);
  if (!res.ok) throw new Error("Failed to fetch groups");
  return res.json() as Promise<Group[]>;
}

export async function getGroup(id: string): Promise<Group> {
  const res = await authFetch(`${API}/api/groups/${id}`);
  if (!res.ok) throw new Error("Failed to fetch group");
  return res.json() as Promise<Group>;
}

export async function addGroupMember(groupId: string, username: string): Promise<GroupMember> {
  const res = await authFetch(`${API}/api/groups/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify({ username }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? "Failed to add member");
  }
  return res.json() as Promise<GroupMember>;
}

export async function removeGroupMember(groupId: string, userId: string) {
  const res = await authFetch(`${API}/api/groups/${groupId}/members/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove member");
  return res.json();
}

export async function deleteGroup(groupId: string) {
  const res = await authFetch(`${API}/api/groups/${groupId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete group");
  return res.json();
}
