import { type ReactElement } from "react";
import { Globe, Lock, Plus, Users } from "lucide-react";
import type { BackendNote, LegacyNote, NoteSource } from "../../types";
import type { DetailSubject } from "../NoteDetailDrawer";

// ─── types ───────────────────────────────────────────────────────────────────
export type NoteFilter = "all" | NoteSource | "legacy";

const FILTER_TABS: { id: NoteFilter; label: string }[] = [
  { id: "all",    label: "All" },
  { id: "mine",   label: "Mine" },
  { id: "friend", label: "Friends" },
  { id: "group",  label: "Groups" },
  { id: "public", label: "Public" },
  { id: "legacy", label: "Legacy" },
];

const VIS_ICON: Record<string, ReactElement> = {
  PRIVATE: <Lock size={10} />,
  FRIENDS: <Users size={10} />,
  GROUP:   <Users size={10} />,
  PUBLIC:  <Globe size={10} />,
};

const SOURCE_DOT: Record<NoteSource, string> = {
  mine:   "bg-brand",
  friend: "bg-[#b4befe]",
  group:  "bg-[#fab387]",
  public: "bg-[#f38ba8]",
};

// ─── props ───────────────────────────────────────────────────────────────────
interface Props {
  loading: boolean;
  backendNotes: BackendNote[];
  legacyNotes: LegacyNote[];
  groupNames: Record<string, string>; // group_id → group name
  noteFilter: string;
  onFilterChange: (v: string) => void;
  sourceFilter: NoteFilter;
  onSourceFilterChange: (f: NoteFilter) => void;
  onNewNote: () => void;
  onSelectNote: (subject: DetailSubject) => void;
}

// ─── component ───────────────────────────────────────────────────────────────
export function NotesPanel({
  loading,
  backendNotes,
  legacyNotes,
  groupNames,
  noteFilter,
  onFilterChange,
  sourceFilter,
  onSourceFilterChange,
  onNewNote,
  onSelectNote,
}: Props) {
  const q = noteFilter.toLowerCase();

  const visibleBackend = backendNotes.filter((n) => {
    if (sourceFilter === "legacy") return false;
    if (sourceFilter !== "all" && n._source !== sourceFilter) return false;
    return n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
  });

  const visibleLegacy =
    sourceFilter === "all" || sourceFilter === "legacy"
      ? legacyNotes.filter((n) => n.text?.toLowerCase().includes(q))
      : [];

  const isEmpty = !loading && visibleBackend.length === 0 && visibleLegacy.length === 0;

  return (
    <div className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-surface/95 backdrop-blur-sm border-l border-border/20 z-10 flex flex-col pt-10 sm:pt-24 pb-4">

      {/* header */}
      <div className="px-5 pb-3 border-b border-border/20">
        <h3 className="text-text mb-3">Notes</h3>
        <input
          className="w-full px-4 py-2 rounded-full bg-surface-2 border border-border/30 text-text placeholder:text-muted text-sm focus:outline-none focus:border-brand transition-colors"
          placeholder="Search notes…"
          value={noteFilter}
          onChange={(e) => onFilterChange(e.target.value)}
        />
        {/* source filter chips */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {FILTER_TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onSourceFilterChange(id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sourceFilter === id
                  ? "bg-brand text-light"
                  : "bg-surface-2 text-muted hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* list */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 space-y-2">
        {loading && <p className="text-muted text-sm px-1">Loading…</p>}

        {visibleBackend.map((note) => (
          <BackendNoteCard
            key={note.id}
            note={note}
            groupName={note.group_id ? (groupNames[note.group_id] ?? null) : null}
            onClick={() =>
              onSelectNote({ kind: "backend", note, isOwn: note._source === "mine" })
            }
          />
        ))}

        {visibleLegacy.map((note) => (
          <LegacyNoteCard
            key={note.id}
            note={note}
            onClick={() => onSelectNote({ kind: "legacy", note })}
          />
        ))}

        {isEmpty && (
          <p className="text-muted text-sm px-1 pt-8 text-center">No notes found.</p>
        )}
      </div>

      {/* footer */}
      <div className="px-4 pt-3 border-t border-border/20">
        <button
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-brand text-light text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> New Note
        </button>
      </div>
    </div>
  );
}

// ─── card subcomponents ───────────────────────────────────────────────────────
function BackendNoteCard({
  note,
  groupName,
  onClick,
}: {
  note: BackendNote;
  groupName: string | null;
  onClick: () => void;
}) {
  const src = (note._source ?? "public") as NoteSource;
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface-2 rounded-2xl px-4 py-3 hover:bg-surface-2/80 active:scale-[0.98] transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-text text-sm font-medium leading-snug flex-1 line-clamp-1">
          {note.title}
        </p>
        <span className={`mt-[5px] w-2 h-2 rounded-full shrink-0 ${SOURCE_DOT[src]}`} />
      </div>
      <p className="text-muted text-xs mt-1 line-clamp-2">{note.content}</p>
      <div className="flex items-center justify-between mt-2 gap-2">
        <span className="text-xs text-muted/60 truncate">
          @{note.owner_username}
          {groupName && (
            <span className="ml-1.5 text-[#fab387]/80">· {groupName}</span>
          )}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted/50 shrink-0">
          {VIS_ICON[note.visibility] ?? null}
          {note.visibility.charAt(0) + note.visibility.slice(1).toLowerCase()}
        </span>
      </div>
    </button>
  );
}

function LegacyNoteCard({ note, onClick }: { note: LegacyNote; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface-2/60 rounded-2xl px-4 py-3 border border-border/10 hover:bg-surface-2/80 active:scale-[0.98] transition-all"
    >
      <p className="text-text text-sm line-clamp-2">{note.text}</p>
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-muted/60">
          {note.location._latitude.toFixed(4)}, {note.location._longitude.toFixed(4)}
        </p>
        <span className="text-[10px] text-muted/40 bg-surface px-2 py-0.5 rounded-full">
          legacy
        </span>
      </div>
    </button>
  );
}
