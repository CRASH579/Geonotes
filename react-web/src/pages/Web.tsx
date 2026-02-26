import {
  FileText,
  Map as MapIcon,
  Plus,
  User2,
  Users,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import { getLegacyNotes, getNearbyNotes } from "../lib/api";
import { CreateNoteModal } from "../components/CreateNoteModal";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

// types
type LegacyNote = {
  id: string;
  text: string;
  location: { _latitude: number; _longitude: number };
};

type BackendNote = {
  id: string;
  title: string;
  content: string;
  latitude: number;
  longitude: number;
  visibility: string;
  created_at: string;
  distance_meters?: number;
};

// app views
const APP_VIEWS = [
  { id: "map", label: "Map", icon: MapIcon },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "profile", label: "Profile", icon: User2 },
  { id: "friends", label: "Friends", icon: Users },
] as const;

type AppView = (typeof APP_VIEWS)[number]["id"];
export const Web = () => {
  const { user, firebaseUser } = useAuth();
  const [activeView, setActiveView] = useState<AppView>("map");
  const [legacyNotes, setLegacyNotes] = useState<LegacyNote[]>([]);
  const [backendNotes, setBackendNotes] = useState<BackendNote[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [noteFilter, setNoteFilter] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  //geolocation 
  useEffect(() => {
    // enableHighAccuracy: false avoids the Google network location provider
    // which gets blocked by adblockers - ip/wifi location still works
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 }
    );
  }, []);

  //fetch notes
  const fetchLegacyNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await getLegacyNotes()) as LegacyNote[];
      setLegacyNotes(data);
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLegacyNotes();
  }, [fetchLegacyNotes]);

  useEffect(() => {
    if (!userLocation) return;
    getNearbyNotes(userLocation.lat, userLocation.lng, 50_000)
      .then((data) => setBackendNotes(data as BackendNote[]))
      .catch(() => {});
  }, [userLocation]);

  //map click
  const handleMapClick = useCallback((e: MapMouseEvent) => {
    const latLng = e.detail.latLng;
    if (!latLng) return;
    setClickedCoords({ lat: latLng.lat, lng: latLng.lng });
    setShowModal(true);
  }, []);

  const handleAddNote = () => {
    setClickedCoords(userLocation);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setClickedCoords(null);
  };

  const handleNoteCreated = () => {
    void fetchLegacyNotes();
    if (userLocation) {
      getNearbyNotes(userLocation.lat, userLocation.lng, 50_000)
        .then((data) => setBackendNotes(data as BackendNote[]))
        .catch(() => {});
    }
  };

  //notes filtering
  const filteredLegacy = legacyNotes.filter((n) =>
    n.text?.toLowerCase().includes(noteFilter.toLowerCase())
  );
  const filteredBackend = backendNotes.filter(
    (n) =>
      n.title?.toLowerCase().includes(noteFilter.toLowerCase()) ||
      n.content?.toLowerCase().includes(noteFilter.toLowerCase())
  );

  const activeNavItem = APP_VIEWS.find((v) => v.id === activeView)!;
  const ActiveIcon = activeNavItem.icon;

  return (
    <div className="fixed inset-0 bg-bg overflow-hidden">
      {/*Fullscreen Map*/}
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}>
        <Map
          defaultCenter={userLocation ?? { lat: 28.946278, lng: 77.724222 }}
          defaultZoom={12}
          disableDefaultUI={true}
          className="w-full h-full"
          mapId="bd54733e09ef0083"
          onClick={handleMapClick}
          gestureHandling="greedy"
        >
          {/* Legacy (Firestore) notes */}
          {legacyNotes.map((note) => (
            <AdvancedMarker
              key={`legacy-${note.id}`}
              position={{ lat: note.location._latitude, lng: note.location._longitude }}
              title={note.text}
            >
              <Pin background="#00feb5" borderColor="#006425" glyphColor="#333353" />
            </AdvancedMarker>
          ))}

          {/* Backend (PostGIS) notes */}
          {backendNotes.map((note) => (
            <AdvancedMarker
              key={`backend-${note.id}`}
              position={{ lat: note.latitude, lng: note.longitude }}
              title={note.title}
            >
              <Pin background="#b4befe" borderColor="#333353" glyphColor="#11111b" />
            </AdvancedMarker>
          ))}

          {/* User location dot */}
          {userLocation && (
            <AdvancedMarker position={userLocation} title="You are here">
              <div className="w-4 h-4 rounded-full bg-brand border-2 border-white shadow-lg" />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>

      {/* geonotes in-app nav - dropdown, all screen sizes */}
      <div className="fixed top-8 sm:top-22 right-5 z-20 pointer-events-auto">
        <button
          onClick={() => setMobileMenuOpen((p) => !p)}
          className="flex items-center w-33 gap-2 px-4 py-3 rounded-full bg-surface/90 backdrop-blur-sm text-text shadow-xl border border-border/20"
        >
          <ActiveIcon size={15} />
          <span className="text-sm font-medium">{activeNavItem.label}</span>
          <ChevronDown
            size={13}
            className={`transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {mobileMenuOpen && (
          <div className="mt-2  rounded-2xl bg-surface/95 backdrop-blur-sm border border-border/20 shadow-2xl overflow-hidden">
            {APP_VIEWS.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => {
                    setActiveView(view.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-surface-2 ${
                    activeView === view.id ? "text-brand font-medium" : "text-text"
                  }`}
                >
                  <Icon size={15} />
                  {view.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* add note button - bottom left so it doesn't clash with right panels */}
      {activeView === "map" && (
        <button
          onClick={handleAddNote}
          className="fixed bottom-8 left-6 z-20 bg-brand text-light rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:opacity-90 transition-opacity"
          aria-label="Add note"
        >
          <Plus size={24} />
        </button>
      )}

      {/* tap hint */}
      {activeView === "map" && !showModal && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-surface/80 backdrop-blur-sm text-muted text-xs pointer-events-none select-none whitespace-nowrap">
          tap map to pin a note, or press +
        </div>
      )}

      {/* notes panel */}
      {activeView === "notes" && (
        <div className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-surface/95 backdrop-blur-sm border-l border-border/20 z-10 flex flex-col pt-10 sm:pt-24 pb-4">
          <div className="px-5 pb-3 border-b border-border/20">
            <h3 className="text-text mb-3">Notes</h3>
            <input
              className="w-full px-4 py-2 rounded-full bg-surface-2 border border-border/30 text-text placeholder:text-muted text-sm focus:outline-none focus:border-brand transition-colors"
              placeholder="Filter notes…"
              value={noteFilter}
              onChange={(e) => setNoteFilter(e.target.value)}
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
              onClick={() => {
                setClickedCoords(userLocation);
                setShowModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-brand text-light text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus size={16} /> New Note
            </button>
          </div>
        </div>
      )}

      {/* profile panel */}
      {activeView === "profile" && (
        <div className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-surface/95 backdrop-blur-sm border-l border-border/20 z-10 flex flex-col pt-10 sm:pt-24 pb-4 px-6">
          <h3 className="text-text mb-6">Profile</h3>

          <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mb-4 overflow-hidden">
            {firebaseUser?.photoURL ? (
              <img
                src={firebaseUser.photoURL}
                className="w-full h-full object-cover"
                alt="avatar"
              />
            ) : (
              <User2 size={38} className="text-muted" />
            )}
          </div>

          <p className="text-text font-semibold text-xl">@{user?.username ?? "—"}</p>
          <p className="text-muted text-sm mt-1">{user?.email}</p>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-center bg-surface-2 rounded-2xl px-4 py-3">
              <span className="text-muted text-sm">Legacy notes</span>
              <span className="text-text font-semibold">{legacyNotes.length}</span>
            </div>
            <div className="flex justify-between items-center bg-surface-2 rounded-2xl px-4 py-3">
              <span className="text-muted text-sm">Your notes (nearby)</span>
              <span className="text-text font-semibold">{backendNotes.length}</span>
            </div>
          </div>

          <div className="mt-auto space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-2 text-muted text-sm hover:text-text transition-colors">
              <Settings size={15} /> Settings
            </button>
            <button
              onClick={async () => {
                await signOut(auth);
                window.location.href = "/login";
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-2 text-muted text-sm hover:text-text transition-colors"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* friends panel */}
      {activeView === "friends" && (
        <div className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-surface/95 backdrop-blur-sm border-l border-border/20 z-10 flex flex-col pt-10 sm:pt-24 pb-4 px-6">
          <h3 className="text-text mb-4">Friends</h3>
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <Users size={48} className="text-muted/40" />
            <p className="text-muted text-sm">Friends &amp; groups are coming soon.</p>
          </div>
        </div>
      )}

      {/*Create Note Modal*/}
      {showModal && (
        <CreateNoteModal
          initialCoords={clickedCoords ?? undefined}
          onClose={handleCloseModal}
          onCreated={handleNoteCreated}
        />
      )}
    </div>
  );
};
