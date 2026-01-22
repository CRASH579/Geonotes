import { List, Map as MapIcon} from "lucide-react";
import { useEffect, useState } from "react";
import { AdvancedMarker, APIProvider, Map, Marker, Pin } from "@vis.gl/react-google-maps";

export const Web = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      const res = await fetch("http://localhost:3000/api/notes");
      const data = await res.json();
      setNotes(data);
    };
    fetchNotes();
  }, []);
  return (
    <section className="mt-26 px-4 sm:px-6 lg:px-8">
      <div className={`bg-surface rounded-3xl w-full ${showMap ? "max-w-none" : "max-w-6xl mx-auto"} p-5`}>
        <div className="flex justify-between px-5">
          <h1 className="mb-8">Geonotes</h1>
          <button
            className="rounded-full p-4 m-5 text-black bg-linear-to-b from-text to-brand"
            onClick={() => setShowMap(!showMap)}
          >
            {showMap ? <List /> : <MapIcon />}
          </button>
        </div>

        {showMap ? (
          <div className="w-full">
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
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
                      background={"#00feb5"}
                      borderColor={"#006425"}
                      glyphColor={"#333353"}
                    />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          </div>
        ) : (
          <div>
            {notes.map((note: any) => (
              <div className="flex items-center justify-between bg-surface-2 px-5 py-3 mb-3 rounded-full">
                <p>{note.text}</p>{" "}
                <p>
                  {note.location._latitude}, {note.location._longitude}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
