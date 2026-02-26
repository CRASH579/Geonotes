import { ChevronDown, FileText, Map as MapIcon, Plus, User2, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import {
  getFriends,
  getLegacyNotes,
  getMyNotes,
  getNearbyNotes,
  getPendingReceived,
  type FriendEntry,
  type PendingRequest,
} from "../lib/api";
import type { BackendNote, LegacyNote } from "../types";
import { CreateNoteModal } from "../components/CreateNoteModal";
import { FriendsPanel } from "../components/panels/FriendsPanel";
import { NotesPanel } from "../components/panels/NotesPanel";
import { ProfilePanel } from "../components/panels/ProfilePanel";

// nav config 
const APP_VIEWS = [
  { id: "map",     label: "Map",     icon: MapIcon  },
  { id: "notes",   label: "Notes",   icon: FileText },
  { id: "profile", label: "Profile", icon: User2    },
  { id: "friends", label: "Friends", icon: Users    },
] as const;

type AppView = (typeof APP_VIEWS)[number]["id"];

export const Web = () => {
  // view 
  const [activeView, setActiveView]         = useState<AppView>("map");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showModal, setShowModal]           = useState(false);
  const [clickedCoords, setClickedCoords]   = useState<{ lat: number; lng: number } | null>(null);

  // location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // notes
  const [legacyNotes, setLegacyNotes] = useState<LegacyNote[]>([]);
  const [myNotes, setMyNotes]         = useState<BackendNote[]>([]);
  const [nearbyNotes, setNearbyNotes] = useState<BackendNote[]>([]);
  const [loading, setLoading]         = useState(true);
  const [noteFilter, setNoteFilter]   = useState("");

  // friends
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);

  // geolocation 
  useEffect(() => {
    // enableHighAccuracy:false avoids the Google network location provider
    // which adblockers block — IP/WiFi location still works fine
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  // fetchers
  const fetchLegacyNotes = useCallback(async () => {
    setLoading(true);
    try {
      setLegacyNotes((await getLegacyNotes()) as LegacyNote[]);
    } catch { /* non-fatal */ } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyNotes = useCallback(async () => {
    try {
      setMyNotes((await getMyNotes()) as BackendNote[]);
    } catch { /* non-fatal */ }
  }, []);

  const fetchFriends = useCallback(async () => {
    try {
      const [f, p] = await Promise.all([getFriends(), getPendingReceived()]);
      setFriends(f);
      setPending(p);
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    void fetchLegacyNotes();
    void fetchMyNotes();
    void fetchFriends();
  }, [fetchLegacyNotes, fetchMyNotes, fetchFriends]);

  // supplement with nearby public notes once location is available
  useEffect(() => {
    if (!userLocation) return;
    getNearbyNotes(userLocation.lat, userLocation.lng, 50_000)
      .then((data) => {
        const nearby = data as BackendNote[];
        setNearbyNotes(nearby.filter((n) => !myNotes.some((m) => m.id === n.id)));
      })
      .catch(() => {});
  }, [userLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  const allBackendNotes = useMemo(
    () => [...myNotes, ...nearbyNotes],
    [myNotes, nearbyNotes],
  );

  const q = noteFilter.toLowerCase();
  const filteredBackend = useMemo(
    () => allBackendNotes.filter(
      (n) => n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)
    ),
    [allBackendNotes, q],
  );
  const filteredLegacy = useMemo(
    () => legacyNotes.filter((n) => n.text?.toLowerCase().includes(q)),
    [legacyNotes, q],
  );

  const handleMapClick = useCallback((e: MapMouseEvent) => {
    const ll = e.detail.latLng;
    if (!ll) return;
    setClickedCoords({ lat: ll.lat, lng: ll.lng });
    setShowModal(true);
  }, []);

  const openNewNote = useCallback(
    (coords?: { lat: number; lng: number } | null) => {
      setClickedCoords(coords ?? userLocation);
      setShowModal(true);
    },
    [userLocation],
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
    setClickedCoords(null);
  }, []);

  const handleNoteCreated = useCallback(() => {
    void fetchLegacyNotes();
    void fetchMyNotes();
  }, [fetchLegacyNotes, fetchMyNotes]);

  const activeNavItem = APP_VIEWS.find((v) => v.id === activeView)!;
  const ActiveIcon = activeNavItem.icon;

  return (
    <div className="fixed inset-0 bg-bg overflow-hidden">

      {/* fullscreen map */}
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}>
        <Map
          defaultCenter={userLocation ?? { lat: 28.946278, lng: 77.724222 }}
          defaultZoom={12}
          disableDefaultUI
          className="w-full h-full"
          mapId="bd54733e09ef0083"
          onClick={handleMapClick}
          gestureHandling="greedy"
        >
          {legacyNotes.map((note) => (
            <AdvancedMarker
              key={`l-${note.id}`}
              position={{ lat: note.location._latitude, lng: note.location._longitude }}
              title={note.text}
            >
              <Pin background="#00feb5" borderColor="#006425" glyphColor="#333353" />
            </AdvancedMarker>
          ))}

          {allBackendNotes.map((note) => (
            <AdvancedMarker
              key={`b-${note.id}`}
              position={{ lat: note.latitude, lng: note.longitude }}
              title={note.title}
            >
              <Pin background="#b4befe" borderColor="#333353" glyphColor="#11111b" />
            </AdvancedMarker>
          ))}

          {userLocation && (
            <AdvancedMarker position={userLocation} title="You are here">
              <div className="w-6 h-6 rounded-full bg-blue-400 border-2 border-white shadow-lg" />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>

      {/* geonotes nav dropdown */}
      <div className="fixed top-8 sm:top-22 right-5 z-20">
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
          <div className="mt-2 rounded-2xl bg-surface/95 backdrop-blur-sm border border-border/20 shadow-2xl overflow-hidden">
            {APP_VIEWS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveView(id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-surface-2 ${
                  activeView === id ? "text-brand font-medium" : "text-text"
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* add note FAB — map view only */}
      {activeView === "map" && (
        <>
          <button
            onClick={() => openNewNote()}
            className="fixed bottom-8 left-6 z-20 bg-brand text-light rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:opacity-90 transition-opacity"
            aria-label="Add note"
          >
            <Plus size={24} />
          </button>

          {!showModal && (
            <p className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-surface/80 backdrop-blur-sm text-muted text-xs pointer-events-none select-none whitespace-nowrap">
              tap map to pin · or press +
            </p>
          )}
        </>
      )}

      {/* panels */}
      {activeView === "notes" && (
        <NotesPanel
          loading={loading}
          filteredBackend={filteredBackend}
          filteredLegacy={filteredLegacy}
          noteFilter={noteFilter}
          onFilterChange={setNoteFilter}
          onNewNote={() => openNewNote()}
        />
      )}
      {activeView === "profile" && (
        <ProfilePanel legacyNotes={legacyNotes} myNotes={myNotes} />
      )}
      {activeView === "friends" && (
        <FriendsPanel friends={friends} pending={pending} onRefresh={fetchFriends} />
      )}

      {/* create note modal */}
      {showModal && (
        <CreateNoteModal
          initialCoords={clickedCoords ?? undefined}
          onClose={closeModal}
          onCreated={handleNoteCreated}
        />
      )}
    </div>
  );
};
