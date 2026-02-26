import { useEffect, useState } from "react";
import { ChevronDown, LocateFixed, X } from "lucide-react";
import { createNote, updateNote, type NoteVisibility } from "../lib/api";
import type { BackendNote, Group } from "../types";

type Props = {
  onClose: () => void;
  onCreated: () => void;
  /** Pre-pin from map click / user location */
  initialCoords?: { lat: number; lng: number };
  /** When set, component is in edit mode — skips geo, pre-fills fields */
  editNote?: BackendNote;
  /** User's groups — needed for GROUP visibility picker */
  groups?: Group[];
};

const VIS_LABELS: Record<NoteVisibility, string> = {
  PRIVATE: "Private",
  FRIENDS: "Friends",
  GROUP:   "Group",
  PUBLIC:  "Public",
};

export function CreateNoteModal({ onClose, onCreated, initialCoords, editNote, groups = [] }: Props) {
  const isEditing = Boolean(editNote);

  const [title, setTitle]           = useState(editNote?.title ?? "");
  const [content, setContent]       = useState(editNote?.content ?? "");
  const [visibility, setVisibility] = useState<NoteVisibility>(
    (editNote?.visibility as NoteVisibility) ?? "PRIVATE"
  );
  const [groupId, setGroupId]       = useState<string>(editNote?.group_id ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    editNote
      ? { lat: editNote.latitude, lng: editNote.longitude }
      : (initialCoords ?? null)
  );
  const [geoError, setGeoError]     = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // available visibility options (only show GROUP if user has groups)
  const visOptions: NoteVisibility[] = groups.length > 0
    ? ["PRIVATE", "FRIENDS", "GROUP", "PUBLIC"]
    : ["PRIVATE", "FRIENDS", "PUBLIC"];

  // auto-select first group when GROUP is picked and no groupId set
  useEffect(() => {
    if (visibility === "GROUP" && !groupId && groups.length > 0) {
      setGroupId(groups[0].id);
    }
    if (visibility !== "GROUP") {
      setGroupId("");
    }
  }, [visibility]); // eslint-disable-line react-hooks/exhaustive-deps

  const requestLocation = () => {
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
      },
      (err) => {
        const msg =
          err.code === 1
            ? "Location blocked. Enable it in browser settings."
            : err.code === 2
              ? "Location unavailable — try whitelisting this site in your adblocker, or tap the map to pin."
              : "Location timed out. Tap the map to pin instead.";
        setGeoError(msg);
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (!initialCoords && !isEditing) requestLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    if (!coords && !isEditing) {
      setError("Location is required.");
      return;
    }
    if (visibility === "GROUP" && !groupId) {
      setError("Please select a group.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (isEditing && editNote) {
        await updateNote(editNote.id, {
          title: title.trim(),
          content: content.trim(),
          visibility,
        });
      } else {
        await createNote({
          title: title.trim(),
          content: content.trim(),
          latitude: coords!.lat,
          longitude: coords!.lng,
          visibility,
          group_id: visibility === "GROUP" ? groupId : undefined,
        });
      }
      onCreated();
      onClose();
    } catch {
      setError(isEditing ? "Failed to update note." : "Failed to create note.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface border border-border/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3>{isEditing ? "Edit Note" : "New Note"}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-2 transition-colors"
          >
            <X size={18} className="text-muted" />
          </button>
        </div>

        {/* location status — hidden in edit mode */}
        {!isEditing && (
          geoLoading ? (
            <div className="mb-4 px-4 py-2 rounded-xl bg-surface-2 text-xs text-muted flex items-center gap-2">
              <LocateFixed size={13} className="animate-pulse" />
              getting your location…
            </div>
          ) : geoError ? (
            <div className="mb-4 px-4 py-2 rounded-xl bg-surface-2 text-sm text-muted flex items-center justify-between gap-3">
              <span className="text-xs">{geoError}</span>
              <button
                onClick={requestLocation}
                className="shrink-0 text-xs text-brand underline hover:opacity-80"
              >
                retry
              </button>
            </div>
          ) : coords ? (
            <div className="mb-4 px-4 py-2 rounded-xl bg-surface-2 text-xs text-brand flex items-center gap-2">
              <LocateFixed size={13} />
              {initialCoords ? "pinned from map" : "got your location"} · {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </div>
          ) : null
        )}

        {error && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-surface-2 border border-border text-sm text-text">
            {error}
          </div>
        )}

        <input
          className="w-full mb-3 px-4 py-3 rounded-xl bg-surface-2 border border-border text-text placeholder:text-muted focus:outline-none focus:border-brand transition-colors"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full mb-4 px-4 py-3 rounded-xl bg-surface-2 border border-border text-text placeholder:text-muted focus:outline-none focus:border-brand transition-colors resize-none h-28"
          placeholder="What do you want to say about this place?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* visibility picker */}
        <div className={`grid gap-2 mb-4 ${visOptions.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
          {visOptions.map((v) => (
            <button
              key={v}
              onClick={() => setVisibility(v)}
              className={`py-2 rounded-full text-xs font-semibold transition-all ${
                visibility === v
                  ? "bg-brand text-light"
                  : "bg-surface-2 text-muted hover:text-text"
              }`}
            >
              {VIS_LABELS[v]}
            </button>
          ))}
        </div>

        {/* group selector — only when GROUP visibility is selected */}
        {visibility === "GROUP" && groups.length > 0 && (
          <div className="mb-4 relative">
            <ChevronDown
              size={14}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-border text-text text-sm appearance-none focus:outline-none focus:border-brand transition-colors cursor-pointer pr-8"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || (!coords && !isEditing)}
          className="w-full bg-brand text-light font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Saving…" : isEditing ? "Save Changes" : "Drop Note"}
        </button>
      </div>
    </div>
  );
}
