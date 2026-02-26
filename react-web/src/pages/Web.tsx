import { List, Map as MapIcon, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdvancedMarker, APIProvider, Map, Pin } from "@vis.gl/react-google-maps";
import { getLegacyNotes } from "../lib/api";
import { CreateNoteModal } from "../components/CreateNoteModal";

type LegacyNote = {
  id: string;
  text: string;
  location: {
    _latitude: number;
    _longitude: number;
  };
};

export const Web = () => {
  const [notes, setNotes] = useState<LegacyNote[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLegacyNotes() as LegacyNote[];
      setNotes(data);
    } catch {
      setError("Failed to load notes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  return (
    <section className="mt-26 px-4 sm:px-6 lg:px-8 w-full">
      <div className={`bg-surface rounded-3xl w-full ${showMap ? "max-w-none" : "max-w-6xl mx-auto"} p-5`}>
        <div className="flex justify-between px-5">
          <h1 className="mb-8">Geonotes</h1>
          <button
            className="rounded-full p-4 m-5 text-black bg-linear-to-b from-text to-brand"
            onClick={() => setShowMap(!showMap)}
            aria-label="Toggle map view"
          >
            {showMap ? <List /> : <MapIcon />}
          </button>
        </div>

        {loading && (
          <div className="px-5 pb-5 text-muted text-sm">Loading notes…</div>
        )}

        {error && (
          <div className="mx-5 mb-5 px-4 py-3 rounded-xl bg-surface-2 border border-border text-sm text-text">
            {error}
          </div>
        )}

        {!loading && !error && showMap && (
          <div className="w-full">
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}>
              <Map
                defaultCenter={{ lat: 28.946278, lng: 77.724222 }}
                defaultZoom={12}
                disableDefaultUI={true}
                className="w-[calc(100vw-5rem)] h-[calc(100vh-18rem)] rounded-2xl"
                mapId="bd54733e09ef0083"
              >
                {notes.map((note) => (
                  <AdvancedMarker
                    key={note.id}
                    position={{
                      lat: note.location._latitude,
                      lng: note.location._longitude,
                    }}
                    title={note.text}
                  >
                    <Pin
                      background="#00feb5"
                      borderColor="#006425"
                      glyphColor="#333353"
                    />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          </div>
        )}

        {!loading && !error && !showMap && (
          <div>
            {notes.length === 0 && (
              <p className="px-5 pb-5">No notes yet. Drop your first one!</p>
            )}
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between bg-surface-2 px-5 py-3 mb-3 rounded-full"
              >
                <p className="text-text">{note.text}</p>
                <p className="text-xs text-muted whitespace-nowrap ml-4">
                  {note.location._latitude.toFixed(4)},{" "}
                  {note.location._longitude.toFixed(4)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-10 right-6 z-40 bg-brand text-light rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:opacity-90 transition-opacity"
        aria-label="Create note"
      >
        <Plus size={24} />
      </button>

      {showModal && (
        <CreateNoteModal
          onClose={() => setShowModal(false)}
          onCreated={() => void fetchNotes()}
        />
      )}
    </section>
  );
};
