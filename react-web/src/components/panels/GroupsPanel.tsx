import { useState } from "react";
import { ChevronDown, ChevronRight, Globe, Plus, Trash2, UserMinus, UserPlus, Users, X } from "lucide-react";
import {
  addGroupMember,
  createGroup,
  deleteGroup,
  getGroup,
  removeGroupMember,
} from "../../lib/api";
import type { Group, GroupVisibility } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface Props {
  groups: Group[];
  onRefresh: () => Promise<void>;
}

export function GroupsPanel({ groups, onRefresh }: Props) {
  const { user } = useAuth();

  // create modal state
  const [showCreate, setShowCreate]   = useState(false);
  const [newName, setNewName]         = useState("");
  const [newVis, setNewVis]           = useState<GroupVisibility>("PUBLIC");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // expanded group state
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<Group | null>(null);
  const [expandLoading, setExpandLoading] = useState(false);

  // add member state
  const [addUsername, setAddUsername] = useState("");
  const [addError, setAddError]       = useState<string | null>(null);
  const [addLoading, setAddLoading]   = useState(false);

  const openCreate = () => {
    setNewName("");
    setNewVis("PUBLIC");
    setCreateError(null);
    setShowCreate(true);
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreateLoading(true);
    setCreateError(null);
    try {
      await createGroup(name, newVis);
      setShowCreate(false);
      await onRefresh();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setCreateLoading(false);
    }
  };

  const toggleExpand = async (groupId: string) => {
    if (expandedId === groupId) {
      setExpandedId(null);
      setExpandedGroup(null);
      return;
    }
    setExpandedId(groupId);
    setExpandLoading(true);
    setAddError(null);
    setAddUsername("");
    try {
      const detail = await getGroup(groupId);
      setExpandedGroup(detail);
    } catch { /* non-fatal */ } finally {
      setExpandLoading(false);
    }
  };

  const refreshExpanded = async (groupId: string) => {
    try {
      const detail = await getGroup(groupId);
      setExpandedGroup(detail);
    } catch { /* non-fatal */ }
  };

  const handleAddMember = async (groupId: string) => {
    const username = addUsername.trim();
    if (!username) return;
    setAddLoading(true);
    setAddError(null);
    try {
      await addGroupMember(groupId, username);
      setAddUsername("");
      await refreshExpanded(groupId);
      await onRefresh();
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    try {
      await removeGroupMember(groupId, userId);
      await refreshExpanded(groupId);
      await onRefresh();
    } catch { /* non-fatal */ }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteGroup(groupId);
      setExpandedId(null);
      setExpandedGroup(null);
      await onRefresh();
    } catch { /* non-fatal */ }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-surface/95 backdrop-blur-sm border-l border-border/20 z-10 flex flex-col pt-10 sm:pt-24 pb-4">

      {/* header */}
      <div className="px-5 pb-3 border-b border-border/20 gap-3 flex items-center justify-start">
        <h3 className="text-text">Groups</h3>
        <button
          onClick={openCreate}
          className="ml-0 w-8 h-8 flex items-center justify-center rounded-full bg-brand text-light hover:opacity-90 transition-opacity"
          title="Create group"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* create group modal overlay */}
      {showCreate && (
        <div className="absolute inset-0 z-20 bg-surface/98 flex flex-col pt-10 sm:pt-24 pb-6 px-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-text font-semibold">New Group</h4>
            <button
              onClick={() => setShowCreate(false)}
              className="p-1.5 rounded-full hover:bg-surface-2 transition-colors"
            >
              <X size={16} className="text-muted" />
            </button>
          </div>

          <label className="text-xs text-muted mb-1.5">Group name</label>
          <input
            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border/30 text-text placeholder:text-muted text-sm focus:outline-none focus:border-brand transition-colors mb-4"
            placeholder="e.g. Weekend hikers"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setCreateError(null); }}
            onKeyDown={(e) => e.key === "Enter" && void handleCreate()}
            autoFocus
          />

          <label className="text-xs text-muted mb-2">Who can see group notes?</label>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => setNewVis("PUBLIC")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                newVis === "PUBLIC"
                  ? "bg-brand text-light"
                  : "bg-surface-2 text-muted hover:text-text"
              }`}
            >
              <Globe size={14} /> Public
            </button>
            <button
              onClick={() => setNewVis("FRIENDS_ONLY")}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                newVis === "FRIENDS_ONLY"
                  ? "bg-brand text-light"
                  : "bg-surface-2 text-muted hover:text-text"
              }`}
            >
              <Users size={14} /> Friends only
            </button>
          </div>

          {createError && (
            <p className="text-xs text-red-400 mb-3">{createError}</p>
          )}

          <button
            onClick={() => void handleCreate()}
            disabled={createLoading || !newName.trim()}
            className="w-full py-3 rounded-full bg-brand text-light font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {createLoading ? "Creating…" : "Create Group"}
          </button>
          <button
            onClick={() => setShowCreate(false)}
            className="w-full py-2 text-sm text-muted hover:text-text transition-colors mt-2"
          >
            Cancel
          </button>
        </div>
      )}

      {/* group list */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 space-y-2">
        {groups.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
            <Users size={40} className="text-muted/30" />
            <p className="text-muted text-sm">no groups yet</p>
            <button
              onClick={openCreate}
              className="text-xs text-brand underline hover:opacity-80"
            >
              create one
            </button>
          </div>
        )}

        {groups.map((group) => {
          const isOwner   = group.myRole === "OWNER";
          const canManage = group.myRole === "OWNER" || group.myRole === "ADMIN";
          const isExpanded = expandedId === group.id;

          return (
            <div key={group.id} className="bg-surface-2 rounded-2xl overflow-hidden">
              {/* group row */}
              <button
                onClick={() => void toggleExpand(group.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2/80 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#fab387]/20 flex items-center justify-center shrink-0">
                  <Users size={14} className="text-[#fab387]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text text-sm font-medium truncate">{group.name}</p>
                  <p className="text-muted text-xs">
                    {group.memberCount ?? "?"} member{(group.memberCount ?? 0) !== 1 ? "s" : ""}
                    {group.myRole && (
                      <span className="ml-1.5 text-[#fab387]/70">· {group.myRole.toLowerCase()}</span>
                    )}
                    {group.visibility === "FRIENDS_ONLY" && (
                      <span className="ml-1.5 text-muted/50">· friends only</span>
                    )}
                  </p>
                </div>
                {isExpanded
                  ? <ChevronDown size={14} className="text-muted shrink-0" />
                  : <ChevronRight size={14} className="text-muted shrink-0" />
                }
              </button>

              {/* expanded detail */}
              {isExpanded && (
                <div className="border-t border-border/20 px-4 py-3 space-y-3">
                  {expandLoading && (
                    <p className="text-muted text-xs">Loading members…</p>
                  )}

                  {/* member list */}
                  {expandedGroup?.id === group.id && expandedGroup.members && (
                    <div className="space-y-1.5">
                      {expandedGroup.members.map((m) => {
                        const isSelf = m.user_id === user?.id;
                        const isThisOwner = m.role === "OWNER";
                        return (
                          <div key={m.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center shrink-0">
                                <span className="text-[9px] text-muted uppercase font-bold">
                                  {m.user.username.charAt(0)}
                                </span>
                              </div>
                              <span className="text-xs text-text truncate">@{m.user.username}</span>
                              <span className="text-[9px] text-muted/50">{m.role.toLowerCase()}</span>
                            </div>
                            {!isThisOwner && (canManage || isSelf) && (
                              <button
                                onClick={() => void handleRemoveMember(group.id, m.user_id)}
                                className="p-1 rounded-full text-muted hover:text-red-400 transition-colors shrink-0"
                                title={isSelf ? "Leave group" : "Remove member"}
                              >
                                <UserMinus size={12} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* add member input — owner/admin only */}
                  {canManage && (
                    <div>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 px-3 py-1.5 rounded-full bg-surface border border-border/30 text-text placeholder:text-muted text-xs focus:outline-none focus:border-brand transition-colors"
                          placeholder="Add by username…"
                          value={addUsername}
                          onChange={(e) => { setAddUsername(e.target.value); setAddError(null); }}
                          onKeyDown={(e) => e.key === "Enter" && void handleAddMember(group.id)}
                        />
                        <button
                          onClick={() => void handleAddMember(group.id)}
                          disabled={addLoading || !addUsername.trim()}
                          className="px-2.5 py-1.5 rounded-full bg-brand/20 text-brand hover:bg-brand/30 disabled:opacity-50 transition-colors"
                        >
                          <UserPlus size={12} />
                        </button>
                      </div>
                      {addError && <p className="text-[11px] text-red-400 mt-1 px-1">{addError}</p>}
                    </div>
                  )}

                  {/* delete group — owner only */}
                  {isOwner && (
                    <button
                      onClick={() => void handleDeleteGroup(group.id)}
                      className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={11} /> Delete group
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
