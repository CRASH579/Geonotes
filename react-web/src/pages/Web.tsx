import { ChevronDown, FileText, Layers, Map as MapIcon, Plus, User2, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import {
  getFriends,
  getLegacyNotes,
  getMyGroups,
  getMyNotes,
  getNearbyNotes,
  getPendingReceived,
  type FriendEntry,
  type PendingRequest,
} from "../lib/api";
import type { BackendNote, Group, LegacyNote } from "../types";
import { CreateNoteModal } from "../components/CreateNoteModal";
import { NoteDetailDrawer, type DetailSubject } from "../components/NoteDetailDrawer";
import { NotePin, type PinType } from "../components/NotePin";
import { FriendsPanel } from "../components/panels/FriendsPanel";
import { GroupsPanel } from "../components/panels/GroupsPanel";
import { NotesPanel, type NoteFilter } from "../components/panels/NotesPanel";
import { ProfilePanel } from "../components/panels/ProfilePanel";
import { useAuth } from "../context/AuthContext";

// nav config
const APP_VIEWS = [
  { id: "map",     label: "Map",     icon: MapIcon  },
  { id: "notes",   label: "Notes",   icon: FileText },
  { id: "profile", label: "Profile", icon: User2    },
  { id: "friends", label: "Friends", icon: Users    },
  { id: "groups",  label: "Groups",  icon: Layers  },
] as const;

type AppView = (typeof APP_VIEWS)[number]["id"];

export const Web = () => {
  const { user } = useAuth();

  // view / ui
  const [activeView, setActiveView]         = useState<AppView>("map");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showModal, setShowModal]           = useState(false);
  const [clickedCoords, setClickedCoords]   = useState<{ lat: number; lng: number } | null>(null);
  const [editNote, setEditNote]             = useState<BackendNote | null>(null);
  const [selectedNote, setSelectedNote]     = useState<DetailSubject | null>(null);

  // nav click-outside ref
  const navRef = useRef<HTMLDivElement>(null);

  // notes filter (lifted from NotesPanel)
  const [noteFilter, setNoteFilter]     = useState("");
  const [sourceFilter, setSourceFilter] = useState<NoteFilter>("all");

  // location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // notes
  const [legacyNotes, setLegacyNotes] = useState<LegacyNote[]>([]);
  const [myNotes, setMyNotes]         = useState<BackendNote[]>([]);
  const [nearbyNotes, setNearbyNotes] = useState<BackendNote[]>([]);
  const [loading, setLoading]         = useState(true);

  // social
  const [friends, setFriends]   = useState<FriendEntry[]>([]);
  const [pending, setPending]   = useState<PendingRequest[]>([]);
  const [groups, setGroups]     = useState<Group[]>([]);
  const [showLegacy, setShowLegacy] = useState(false);

  const friendIds = useMemo(() => new Set(friends.map((f) => f.friend.id)), [friends]);

  // group_id → group name lookup
  const groupNames = useMemo<Record<string, string>>(
    () => Object.fromEntries(groups.map((g) => [g.id, g.name])),
    [groups],
  );

  // close nav dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // geolocation
  useEffect(() => {
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

  const fetchGroups = useCallback(async () => {
    try {
      setGroups(await getMyGroups());
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    void fetchLegacyNotes();
    void fetchMyNotes();
    void fetchFriends();
    void fetchGroups();
  }, [fetchLegacyNotes, fetchMyNotes, fetchFriends, fetchGroups]);

  // supplement with nearby notes — refresh on location change or when switching back to map
  const fetchNearbyNotes = useCallback(async () => {
    if (!userLocation) return;
    try {
      const data = await getNearbyNotes(userLocation.lat, userLocation.lng, 50_000);
      setNearbyNotes(data as BackendNote[]);
    } catch { /* non-fatal */ }
  }, [userLocation]);

  useEffect(() => { void fetchNearbyNotes(); }, [fetchNearbyNotes]);

  useEffect(() => {
    if (activeView === "map") void fetchNearbyNotes();
  }, [activeView, fetchNearbyNotes]);

  // derived: merge + deduplicate + tag source
  const allBackendNotes = useMemo(() => {
    const myIds        = new Set(myNotes.map((n) => n.id));
    const memberGroups = new Set(groups.map((g) => g.id));
    const deduped      = nearbyNotes.filter((n) => !myIds.has(n.id));

    const tag = (n: BackendNote): BackendNote => {
      if (n.owner_id === user?.id) return { ...n, _source: "mine" };
      if (n.visibility === "GROUP" && n.group_id && memberGroups.has(n.group_id))
        return { ...n, _source: "group" };
      if (friendIds.has(n.owner_id)) return { ...n, _source: "friend" };
      return { ...n, _source: "public" };
    };

    return [
      ...myNotes.map((n) => ({ ...n, _source: "mine" as const })),
      ...deduped.map(tag),
    ];
  }, [myNotes, nearbyNotes, user?.id, friendIds, groups]);

  // filtered notes for map pins — respects sourceFilter (legacy filter hides all backend pins)
  const filteredMapNotes = useMemo(() => {
    if (sourceFilter === "legacy") return [];
    if (sourceFilter === "all") return allBackendNotes;
    return allBackendNotes.filter((n) => n._source === sourceFilter);
  }, [allBackendNotes, sourceFilter]);

  // filtered legacy pins — hidden when legacy is disabled or a non-legacy source filter is active
  const filteredLegacyPins = useMemo(() => {
    if (!showLegacy) return [];
    if (sourceFilter === "all" || sourceFilter === "legacy") return legacyNotes;
    return [];
  }, [legacyNotes, sourceFilter, showLegacy]);

  // map click: if not in map view, switch to map; otherwise open create modal
  const handleMapClick = useCallback((e: MapMouseEvent) => {
    const ll = e.detail.latLng;
    if (!ll) return;
    if (activeView !== "map") {
      setActiveView("map");
      return;
    }
    setClickedCoords({ lat: ll.lat, lng: ll.lng });
    setShowModal(true);
  }, [activeView]);

  // FAB: open create modal using GPS (no clickedCoords — modal will call requestLocation)
  const openNewNote = useCallback(
    (coords?: { lat: number; lng: number } | null) => {
      setEditNote(null);
      setClickedCoords(coords ?? null);
      setShowModal(true);
    },
    [],
  );

  const openEditNote = useCallback((note: BackendNote) => {
    setSelectedNote(null);
    setEditNote(note);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setClickedCoords(null);
    setEditNote(null);
  }, []);

  const handleNoteCreated = useCallback(() => {
    void fetchMyNotes();
    void fetchNearbyNotes();
  }, [fetchMyNotes, fetchNearbyNotes]);

  const handleNoteDeleted = useCallback(() => {
    void fetchMyNotes();
    void fetchNearbyNotes();
  }, [fetchMyNotes, fetchNearbyNotes]);

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
          {/* legacy note pins */}
          {filteredLegacyPins.map((note) => (
            <AdvancedMarker
              key={`l-${note.id}`}
              position={{ lat: note.location._latitude, lng: note.location._longitude }}
              onClick={() => setSelectedNote({ kind: "legacy", note })}
            >
              <NotePin
                type="legacy"
                label={note.text}
              />
            </AdvancedMarker>
          ))}

          {/* backend note pins */}
          {filteredMapNotes.map((note) => {
            const pinType: PinType = note.visibility === "GROUP" ? "group" : (note._source ?? "public") as PinType;
            const isSelected =
              selectedNote?.kind === "backend" && selectedNote.note.id === note.id;
            const subtitle = note.visibility === "GROUP" && note.group_id
              ? (groupNames[note.group_id] ?? `@${note.owner_username}`)
              : `@${note.owner_username}`;
            return (
              <AdvancedMarker
                key={`b-${note.id}`}
                position={{ lat: note.latitude, lng: note.longitude }}
                onClick={() =>
                  setSelectedNote({
                    kind: "backend",
                    note,
                    isOwn: note._source === "mine",
                  })
                }
              >
                <NotePin
                  type={pinType}
                  selected={isSelected}
                  label={note.title}
                  subtitle={subtitle}
                />
              </AdvancedMarker>
            );
          })}

          {/* user location dot */}
          {userLocation && (
            <AdvancedMarker position={userLocation} title="You are here">
              <div className="w-6 h-6 rounded-full bg-blue-400 border-2 border-white shadow-lg" />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>

      {/* nav dropdown */}
      <div ref={navRef} className="fixed top-8 sm:top-22 right-5 z-20">
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

          {!showModal && !selectedNote && (
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
          backendNotes={allBackendNotes}
          legacyNotes={showLegacy ? legacyNotes : []}
          groupNames={groupNames}
          noteFilter={noteFilter}
          onFilterChange={setNoteFilter}
          sourceFilter={sourceFilter}
          onSourceFilterChange={setSourceFilter}
          onNewNote={() => openNewNote()}
          onSelectNote={setSelectedNote}
        />
      )}
      {activeView === "profile" && (
        <ProfilePanel
          legacyNotes={legacyNotes}
          myNotes={myNotes}
          friendsCount={friends.length}
          groupsCount={groups.length}
          showLegacy={showLegacy}
          onToggleLegacy={setShowLegacy}
        />
      )}
      {activeView === "friends" && (
        <FriendsPanel friends={friends} pending={pending} onRefresh={fetchFriends} />
      )}
      {activeView === "groups" && (
        <GroupsPanel groups={groups} onRefresh={fetchGroups} />
      )}

      {/* note detail drawer */}
      {selectedNote && (
        <NoteDetailDrawer
          subject={selectedNote}
          onClose={() => setSelectedNote(null)}
          onEdit={openEditNote}
          onDeleted={handleNoteDeleted}
          groupNames={groupNames}
        />
      )}

      {/* create / edit modal */}
      {showModal && (
        <CreateNoteModal
          initialCoords={clickedCoords ?? undefined}
          editNote={editNote ?? undefined}
          groups={groups}
          onClose={closeModal}
          onCreated={handleNoteCreated}
        />
      )}
    </div>
  );
};
