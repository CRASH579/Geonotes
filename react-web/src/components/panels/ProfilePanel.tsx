import { LogOut, User2 } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import type { BackendNote, LegacyNote } from "../../types";

interface Props {
  legacyNotes: LegacyNote[];
  myNotes: BackendNote[];
  friendsCount: number;
  groupsCount: number;
}

export function ProfilePanel({ legacyNotes, myNotes, friendsCount, groupsCount }: Props) {
  const { user, firebaseUser } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-surface/95 backdrop-blur-sm border-l border-border/20 z-10 flex flex-col pt-10 sm:pt-24 pb-4 px-6">
      <h3 className="text-text mb-6">Profile</h3>

      <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mb-4 overflow-hidden">
        {firebaseUser?.photoURL ? (
          <img src={firebaseUser.photoURL} className="w-full h-full object-cover" alt="avatar" />
        ) : (
          <User2 size={38} className="text-muted" />
        )}
      </div>

      <p className="text-text font-semibold text-xl">@{user?.username ?? "—"}</p>
      <p className="text-muted text-sm mt-1">{user?.email}</p>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between items-center bg-surface-2 rounded-2xl px-4 py-3">
          <span className="text-muted text-sm">Your notes</span>
          <span className="text-text font-semibold">{myNotes.length}</span>
        </div>
        <div className="flex justify-between items-center bg-surface-2 rounded-2xl px-4 py-3">
          <span className="text-muted text-sm">Friends</span>
          <span className="text-text font-semibold">{friendsCount}</span>
        </div>
        <div className="flex justify-between items-center bg-surface-2 rounded-2xl px-4 py-3">
          <span className="text-muted text-sm">Groups</span>
          <span className="text-text font-semibold">{groupsCount}</span>
        </div>
        <div className="flex justify-between items-center bg-surface-2 rounded-2xl px-4 py-3">
          <span className="text-muted text-sm">Legacy notes</span>
          <span className="text-text font-semibold">{legacyNotes.length}</span>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        <button
          onClick={() => void handleSignOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-2 text-muted text-sm hover:text-text transition-colors"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
}
