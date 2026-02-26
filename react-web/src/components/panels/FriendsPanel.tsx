import { useState } from "react";
import { Check, UserMinus, UserPlus, Users, X } from "lucide-react";
import {
  removeFriend,
  respondFriendRequest,
  sendFriendRequest,
  type FriendEntry,
  type PendingRequest,
} from "../../lib/api";

interface Props {
  friends: FriendEntry[];
  pending: PendingRequest[];
  onRefresh: () => Promise<void>;
}

export function FriendsPanel({ friends, pending, onRefresh }: Props) {
  const [addUsername, setAddUsername] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const resetAddState = () => {
    setAddError(null);
    setAddSuccess(false);
  };

  const handleSend = async () => {
    const u = addUsername.trim();
    if (!u) return;
    setAddLoading(true);
    resetAddState();
    try {
      await sendFriendRequest(u);
      setAddUsername("");
      setAddSuccess(true);
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setAddLoading(false);
    }
  };

  const handleRespond = async (id: string, action: "ACCEPTED" | "REJECTED") => {
    await respondFriendRequest(id, action).catch(() => {});
    await onRefresh();
  };

  const handleRemove = async (id: string) => {
    await removeFriend(id).catch(() => {});
    await onRefresh();
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-surface/95 backdrop-blur-sm border-l border-border/20 z-10 flex flex-col pt-10 sm:pt-24 pb-4">
      {/* add friend */}
      <div className="px-5 pb-3 border-b border-border/20">
        <h3 className="text-text mb-4">Friends</h3>
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 rounded-full bg-surface-2 border border-border/30 text-text placeholder:text-muted text-sm focus:outline-none focus:border-brand transition-colors"
            placeholder="username"
            value={addUsername}
            onChange={(e) => {
              setAddUsername(e.target.value);
              resetAddState();
            }}
            onKeyDown={(e) => e.key === "Enter" && void handleSend()}
          />
          <button
            onClick={() => void handleSend()}
            disabled={addLoading || !addUsername.trim()}
            className="px-3 py-2 rounded-full bg-brand text-light hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <UserPlus size={14} />
          </button>
        </div>
        {addError && <p className="text-xs text-red-400 mt-2 px-1">{addError}</p>}
        {addSuccess && <p className="text-xs text-brand mt-2 px-1">request sent!</p>}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 space-y-4">
        {/* incoming requests */}
        {pending.length > 0 && (
          <section>
            <p className="text-xs text-muted uppercase tracking-wide mb-2">requests</p>
            <div className="space-y-2">
              {pending.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between bg-surface-2 rounded-2xl px-4 py-3"
                >
                  <span className="text-text text-sm">@{req.initiator.username}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => void handleRespond(req.id, "ACCEPTED")}
                      className="p-1.5 rounded-full bg-brand/20 text-brand hover:bg-brand/30 transition-colors"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => void handleRespond(req.id, "REJECTED")}
                      className="p-1.5 rounded-full bg-surface text-muted hover:text-text transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* friends list */}
        {friends.length > 0 && (
          <section>
            <p className="text-xs text-muted uppercase tracking-wide mb-2">
              {friends.length} friend{friends.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-2">
              {friends.map((f) => (
                <div
                  key={f.friendshipId}
                  className="flex items-center justify-between bg-surface-2 rounded-2xl px-4 py-3"
                >
                  <span className="text-text text-sm">@{f.friend.username}</span>
                  <button
                    onClick={() => void handleRemove(f.friendshipId)}
                    className="p-1.5 rounded-full text-muted hover:text-red-400 transition-colors"
                    title="remove friend"
                  >
                    <UserMinus size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {friends.length === 0 && pending.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
            <Users size={40} className="text-muted/30" />
            <p className="text-muted text-sm">no friends yet — add one above</p>
          </div>
        )}
      </div>
    </div>
  );
}
