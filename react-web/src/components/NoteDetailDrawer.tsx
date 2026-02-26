import { type ReactElement, useState } from "react";
import { Edit2, Globe, Lock, MapPin, Trash2, Users, X } from "lucide-react";
import { deleteNote } from "../lib/api";
import type { BackendNote, LegacyNote } from "../types";

type BackendSubject = { kind: "backend"; note: BackendNote; isOwn: boolean };
type LegacySubject  = { kind: "legacy";  note: LegacyNote };
export type DetailSubject = BackendSubject | LegacySubject;

interface Props {
  subject: DetailSubject;
  onClose: () => void;
  onEdit: (note: BackendNote) => void;
  onDeleted: () => void;
  groupNames?: Record<string, string>;
}

const VISIBILITY_ICON: Record<string, ReactElement> = {
  PRIVATE: <Lock size={12} />,
  FRIENDS: <Users size={12} />,
  GROUP:   <Users size={12} />,
  PUBLIC:  <Globe size={12} />,
};

const VISIBILITY_LABEL: Record<string, string> = {
  PRIVATE: "Private",
  FRIENDS: "Friends",
  GROUP:   "Group",
  PUBLIC:  "Public",
};

export function NoteDetailDrawer({ subject, onClose, onEdit, onDeleted, groupNames = {} }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (subject.kind !== "backend") return;
    if (!confirm("Delete this note?")) return;
    setDeleting(true);
    try {
      await deleteNote(subject.note.id);
      onDeleted();
      onClose();
    } catch {
      setDeleteError("Failed to delete. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* drawer — slides up from bottom on mobile, anchored right on desktop */}
      <div className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-auto sm:top-0 sm:right-0 sm:left-auto sm:h-full sm:w-96 bg-surface border-t sm:border-t-0 sm:border-l border-border/20 rounded-t-3xl sm:rounded-none shadow-2xl flex flex-col max-h-[80vh] sm:max-h-none animate-slide-up sm:animate-none pt-6 sm:pt-24 pb-8 sm:pb-6">

        {/* handle / close */}
        <div className="sm:hidden w-10 h-1 bg-border/40 rounded-full mx-auto mb-5" />
        <button
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-16 sm:right-5 p-2 rounded-full hover:bg-surface-2 transition-colors"
        >
          <X size={16} className="text-muted" />
        </button>

        {/* content */}
        <div className="flex-1 overflow-y-auto px-6">
          {subject.kind === "legacy" ? (
            <LegacyDetail note={subject.note} />
          ) : (
            <BackendDetail
              note={subject.note}
              isOwn={subject.isOwn}
              deleteError={deleteError}
              deleting={deleting}
              groupName={subject.note.group_id ? (groupNames[subject.note.group_id] ?? null) : null}
              onEdit={() => onEdit(subject.note)}
              onDelete={() => void handleDelete()}
            />
          )}
        </div>
      </div>
    </>
  );
}

// ─── backend note detail ──────────────────────────────────────────────────────
function BackendDetail({
  note,
  isOwn,
  deleteError,
  deleting,
  groupName,
  onEdit,
  onDelete,
}: {
  note: BackendNote;
  isOwn: boolean;
  deleteError: string | null;
  deleting: boolean;
  groupName: string | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const vis = note.visibility as string;

  return (
    <>
      {/* visibility + group badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 text-muted text-xs">
          {VISIBILITY_ICON[vis] ?? <Globe size={12} />}
          {VISIBILITY_LABEL[vis] ?? vis}
        </div>
        {vis === "GROUP" && groupName && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: "rgba(250,179,135,0.15)",
              color: "#fab387",
              border: "1px solid rgba(250,179,135,0.3)",
            }}
          >
            <Users size={11} />
            {groupName}
          </div>
        )}
      </div>

      <h2 className="text-text text-xl font-semibold mb-2 leading-snug">{note.title}</h2>

      <p className="text-muted text-xs mb-1">@{note.owner_username}</p>

      <p className="text-text/80 text-sm leading-relaxed mt-3 whitespace-pre-wrap">
        {note.content}
      </p>

      <div className="flex items-center gap-1.5 text-xs text-muted/60 mt-5">
        <MapPin size={11} />
        {note.latitude.toFixed(5)}, {note.longitude.toFixed(5)}
      </div>

      <p className="text-xs text-muted/40 mt-1">
        {new Date(note.created_at).toLocaleString()}
      </p>

      {deleteError && (
        <p className="text-xs text-red-400 mt-3">{deleteError}</p>
      )}

      {isOwn && (
        <div className="flex gap-2 mt-6">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-brand/10 text-brand text-sm font-medium hover:bg-brand/20 transition-colors"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-surface-2 text-muted text-sm hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </>
  );
}

// ─── legacy note detail ───────────────────────────────────────────────────────
function LegacyDetail({ note }: { note: LegacyNote }) {
  return (
    <>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 text-muted/60 text-xs mb-4">
        legacy note
      </div>
      <p className="text-text text-base leading-relaxed whitespace-pre-wrap">{note.text}</p>
      <div className="flex items-center gap-1.5 text-xs text-muted/60 mt-5">
        <MapPin size={11} />
        {note.location._latitude.toFixed(5)}, {note.location._longitude.toFixed(5)}
      </div>
    </>
  );
}
