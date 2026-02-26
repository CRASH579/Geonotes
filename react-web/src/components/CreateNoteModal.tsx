import { useEffect, useState } from "react";
import { LocateFixed, X } from "lucide-react";
import { createNote, type NoteVisibility } from "../lib/api";

type Props = {
  onClose: () => void;
  onCreated: () => void;
  /** When provided (e.g. from map click) we skip geolocation entirely */
  initialCoords?: { lat: number; lng: number };
};

export function CreateNoteModal({ onClose, onCreated, initialCoords }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<NoteVisibility>("PRIVATE");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialCoords ?? null
  );
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
      },
      (err) => {
        // code 1 = permission denied, code 2 = position unavailable (e.g. adblocker blocks network provider), code 3 = timeout
        const msg =
          err.code === 1
            ? "Location blocked. Enable it in browser settings (site permissions → location)."
            : err.code === 2
              ? "Location unavailable — your adblocker may be blocking the location provider. Whitelist this site or tap the map to pin instead."
              : "Location timed out. Tap the map to pin your note instead.";
        setGeoError(msg);
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (!initialCoords) {
      requestLocation();
    }
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    if (!coords) {
      setError("Location is required. Please allow location access.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await createNote({
        title: title.trim(),
        content: content.trim(),
        latitude: coords.lat,
        longitude: coords.lng,
        visibility,
      });
      onCreated();
      onClose();
    } catch {
      setError("Failed to create note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface border border-border/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3>New Note</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-2 transition-colors"
          >
            <X size={18} className="text-muted" />
          </button>
        </div>

        {/* location status */}
        {geoLoading ? (
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
        ) : null}

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

        <div className="flex gap-2 mb-6">
          {(["PRIVATE", "FRIENDS", "PUBLIC"] as NoteVisibility[]).map((v) => (
            <button
              key={v}
              onClick={() => setVisibility(v)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                visibility === v
                  ? "bg-brand text-light"
                  : "bg-surface-2 text-muted hover:text-text"
              }`}
            >
              {v === "PRIVATE" ? "Private" : v === "FRIENDS" ? "Friends" : "Public"}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !coords}
          className="w-full bg-brand text-light font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Saving…" : "Drop Note"}
        </button>
      </div>
    </div>
  );
}
