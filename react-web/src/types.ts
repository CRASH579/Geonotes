export type LegacyNote = {
  id: string;
  text: string;
  location: { _latitude: number; _longitude: number };
};

export type BackendNote = {
  id: string;
  title: string;
  content: string;
  latitude: number;
  longitude: number;
  visibility: string;
  created_at: string;
  distance_meters?: number;
};
