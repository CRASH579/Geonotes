import { ChevronDown, FileText, Layers, Map as MapIcon, Plus, SlidersHorizontal, User2, Users } from "lucide-react";
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
  getSocialNotes,
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
import { SettingsPanel, loadSettings, saveSettings, type NoteSettings } from "../components/panels/SettingsPanel";
import { useAuth } from "../context/AuthContext";

// nav config
const APP_VIEWS = [
  { id: "map",      label: "Map",      icon: MapIcon           },
  { id: "notes",    label: "Notes",    icon: FileText          },
  { id: "profile",  label: "Profile",  icon: User2             },
  { id: "friends",  label: "Friends",  icon: Users             },
  { id: "groups",   label: "Groups",   icon: Layers            },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
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
  const [noteFilter, setNoteFilter]       = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<NoteFilter>>(() => new Set(["all"]));

  // settings (persisted to localStorage)
  const [settings, setSettings] = useState<NoteSettings>(loadSettings);

  // location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // notes
  const [legacyNotes, setLegacyNotes] = useState<LegacyNote[]>([]);
  const [myNotes, setMyNotes]         = useState<BackendNote[]>([]);
  const [socialNotes, setSocialNotes] = useState<BackendNote[]>([]);
  const [nearbyNotes, setNearbyNotes] = useState<BackendNote[]>([]);
  const [loading, setLoading]         = useState(true);

  // social
  const [friends, setFriends]   = useState<FriendEntry[]>([]);
  const [pending, setPending]   = useState<PendingRequest[]>([]);
  const [groups, setGroups]     = useState<Group[]>([]);

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

  const fetchSocialNotes = useCallback(async () => {
    try {
      setSocialNotes((await getSocialNotes()) as BackendNote[]);
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    void fetchLegacyNotes();
    void fetchMyNotes();
    void fetchSocialNotes();
    void fetchFriends();
    void fetchGroups();
  }, [fetchLegacyNotes, fetchMyNotes, fetchSocialNotes, fetchFriends, fetchGroups]);

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
    if (activeView === "map") {
      void fetchSocialNotes();
      void fetchNearbyNotes();
    }
  }, [activeView, fetchSocialNotes, fetchNearbyNotes]);

  // poll for new social notes and friend requests every 30 s
  useEffect(() => {
    const id = setInterval(() => {
      void fetchSocialNotes();
      void fetchFriends();
    }, 30_000);
    return () => clearInterval(id);
  }, [fetchSocialNotes, fetchFriends]);

  // derived: merge + deduplicate + tag source
  // Order: mine → social (FRIENDS/GROUP/PUBLIC, no location needed) → nearby (anything in radius, deduped)
  const allBackendNotes = useMemo(() => {
    const myIds     = new Set(myNotes.map((n) => n.id));
    const socialIds = new Set(socialNotes.map((n) => n.id));

    const dedupedSocial = socialNotes.filter((n) => !myIds.has(n.id));
    const dedupedNearby = nearbyNotes.filter((n) => !myIds.has(n.id) && !socialIds.has(n.id));

    // /social returns FRIENDS, GROUP, and PUBLIC (from other users) — tag by visibility
    const tagSocial = (n: BackendNote): BackendNote => {
      if (n.visibility === "GROUP")   return { ...n, _source: "group" };
      if (n.visibility === "FRIENDS") return { ...n, _source: "friend" };
      return { ...n, _source: "public" };
    };

    // /nearby supplements with spatially-nearby notes — tag by ownership/relationship
    const tagNearby = (n: BackendNote): BackendNote => {
      if (n.owner_id === user?.id) return { ...n, _source: "mine" };
      if (n.visibility === "GROUP") return { ...n, _source: "group" };
      if (friendIds.has(n.owner_id)) return { ...n, _source: "friend" };
      return { ...n, _source: "public" };
    };

    return [
      ...myNotes.map((n) => ({ ...n, _source: "mine" as const })),
      ...dedupedSocial.map(tagSocial),
      ...dedupedNearby.map(tagNearby),
    ];
  }, [myNotes, socialNotes, nearbyNotes, user?.id, friendIds]);

  // filtered notes for map pins — multi-select activeFilters
  const filteredMapNotes = useMemo(() => {
    if (activeFilters.has("all")) return allBackendNotes;
    return allBackendNotes.filter((n) => {
      if (activeFilters.has("private") && n._source === "mine" && n.visibility === "PRIVATE") return true;
      if (activeFilters.has("mine")    && n._source === "mine") return true;
      if (activeFilters.has("friend")  && n._source === "friend") return true;
      if (activeFilters.has("group")   && n._source === "group") return true;
      if (activeFilters.has("public")  && n._source === "public") return true;
      return false;
    });
  }, [allBackendNotes, activeFilters]);

  // legacy pins  gated by settings toggle only (not by filter chips)
  const filteredLegacyPins = useMemo(() => {
    if (!settings.showLegacy) return [];
    return legacyNotes;
  }, [legacyNotes, settings.showLegacy]);

  const toggleFilter = useCallback((f: NoteFilter) => {
    setActiveFilters((prev) => {
      if (f === "all") return new Set(["all"]);
      const next = new Set(prev);
      next.delete("all");
      if (next.has(f)) {
        next.delete(f);
        if (next.size === 0) return new Set(["all"]);
      } else {
        next.add(f);
      }
      return next;
    });
  }, []);

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
    void fetchSocialNotes();
    void fetchNearbyNotes();
  }, [fetchMyNotes, fetchSocialNotes, fetchNearbyNotes]);

  const handleNoteDeleted = useCallback(() => {
    void fetchMyNotes();
    void fetchSocialNotes();
    void fetchNearbyNotes();
  }, [fetchMyNotes, fetchSocialNotes, fetchNearbyNotes]);

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
          legacyNotes={settings.showLegacy ? legacyNotes : []}
          groupNames={groupNames}
          noteFilter={noteFilter}
          onFilterChange={setNoteFilter}
          activeFilters={activeFilters}
          onToggleFilter={toggleFilter}
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
        />
      )}
      {activeView === "friends" && (
        <FriendsPanel friends={friends} pending={pending} onRefresh={fetchFriends} />
      )}
      {activeView === "groups" && (
        <GroupsPanel groups={groups} onRefresh={fetchGroups} />
      )}
      {activeView === "settings" && (
        <SettingsPanel
          settings={settings}
          userRole={user?.role ?? "USER"}
          onChange={(s) => { setSettings(s); saveSettings(s); }}
        />
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
