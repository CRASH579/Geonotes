export type LegacyNote = {
  id: string;
  text: string;
  location: { _latitude: number; _longitude: number };
};

export type NoteSource = 'mine' | 'friend' | 'group' | 'public';

export type BackendNote = {
  id: string;
  owner_id: string;
  owner_username: string;
  group_id: string | null;
  title: string;
  content: string;
  latitude: number;
  longitude: number;
  visibility: string;
  created_at: string;
  distance_meters?: number;
  _source?: NoteSource; // client-tagged
};

export type GroupMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type GroupVisibility = 'PUBLIC' | 'FRIENDS_ONLY';

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupMemberRole;
  user: { id: string; username: string; avatar_url: string | null };
};

export type Group = {
  id: string;
  name: string;
  owner_id: string;
  visibility?: GroupVisibility;
  created_at: string;
  updated_at: string;
  myRole?: GroupMemberRole;
  memberCount?: number;
  noteCount?: number;
  members?: GroupMember[];
};
