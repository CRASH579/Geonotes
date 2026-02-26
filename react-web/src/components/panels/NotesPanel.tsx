import { Plus } from "lucide-react";
import type { BackendNote, LegacyNote } from "../../types";

interface Props {
  loading: boolean;
  filteredBackend: BackendNote[];
  filteredLegacy: LegacyNote[];
  noteFilter: string;
  onFilterChange: (v: string) => void;
  onNewNote: () => void;
}

export function NotesPanel({
  loading,
  filteredBackend,
  filteredLegacy,
  noteFilter,
  onFilterChange,
  onNewNote,
}: Props) {
  return (
    <div className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-surface/95 backdrop-blur-sm border-l border-border/20 z-10 flex flex-col pt-10 sm:pt-24 pb-4">
      <div className="px-5 pb-3 border-b border-border/20">
        <h3 className="text-text mb-3">Notes</h3>
        <input
          className="w-full px-4 py-2 rounded-full bg-surface-2 border border-border/30 text-text placeholder:text-muted text-sm focus:outline-none focus:border-brand transition-colors"
          placeholder="Filter notes…"
          value={noteFilter}
          onChange={(e) => onFilterChange(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 space-y-2">
        {loading && <p className="text-muted text-sm px-1">Loading…</p>}

        {filteredBackend.map((note) => (
          <div key={note.id} className="bg-surface-2 rounded-2xl px-4 py-3">
            <p className="text-text text-sm font-medium">{note.title}</p>
            <p className="text-muted text-xs mt-1 line-clamp-2">{note.content}</p>
            <p className="text-xs text-muted/60 mt-2">
              {note.latitude.toFixed(4)}, {note.longitude.toFixed(4)}
            </p>
          </div>
        ))}

        {filteredLegacy.map((note) => (
          <div
            key={note.id}
            className="bg-surface-2/60 rounded-2xl px-4 py-3 border border-border/10"
          >
            <p className="text-text text-sm">{note.text}</p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted/60">
                {note.location._latitude.toFixed(4)},{" "}
                {note.location._longitude.toFixed(4)}
              </p>
              <span className="text-[10px] text-muted/40 bg-surface px-2 py-0.5 rounded-full">
                legacy
              </span>
            </div>
          </div>
        ))}

        {!loading && filteredLegacy.length === 0 && filteredBackend.length === 0 && (
          <p className="text-muted text-sm px-1 pt-6 text-center">No notes found.</p>
        )}
      </div>

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
