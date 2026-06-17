import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchWithAuth } from "../API/apiClient";
import defaultPlaylistCover from "../photos/playlist.png";

interface PlaylistItem {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  createdAt: string;
  likesCount: number;
  tracks?: any[];
  user?: { username: string };
}

export default function PlaylistsList() {
  const { t } = useTranslation();
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await fetchWithAuth("playlists");
        setPlaylists(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "100px 48px 48px" }}>
      <h1>All Playlists</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 24, marginTop: 24 }}>
        {playlists.map((pl) => (
          <Link to={`/playlist/${pl.id}`} key={pl.id}
            style={{
              textDecoration: "none", color: "inherit",
              background: "var(--white-dark)", borderRadius: 16,
              padding: 16, boxShadow: "0 4px 12px var(--shadow)",
              border: "1px solid var(--input-bg)",
            }}>
            <div style={{ width: "100%", height: 180, background: "var(--bg-deep, #1a1a2e)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, overflow: "hidden" }}>
              <img
                src={pl.coverUrl || defaultPlaylistCover}
                alt={pl.name}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <h3 style={{ margin: "12px 0 4px", fontSize: 18 }}>{pl.name}</h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>
              {pl.tracks?.length || 0} tracks • {pl.user?.username || "SoundGravity"}
            </p>
          </Link>
        ))}
        {playlists.length === 0 && <p>No playlists found</p>}
      </div>
    </div>
  );
}
