import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchWithAuth } from "../API/apiClient";
import FavoriteIcon from '@mui/icons-material/Favorite';
import defaultTrackCover from "../photos/track.png";
import defaultPlaylistCover from "../photos/playlist.png";

interface LikedTrack {
  id: string;
  title: string;
  genre?: string;
  coverUrl?: string;
  user?: { username: string };
}

interface LikedPlaylist {
  id: string;
  name: string;
  coverUrl?: string;
  tracks?: any[];
  user?: { username: string };
}

type Tab = "tracks" | "playlists";

export default function LikedPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("tracks");
  const [tracks, setTracks] = useState<LikedTrack[]>([]);
  const [playlists, setPlaylists] = useState<LikedPlaylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const [tracksData, playlistsData] = await Promise.allSettled([
          fetchWithAuth("tracks/liked"),
          fetchWithAuth("playlists/liked"),
        ]);
        if (tracksData.status === "fulfilled") {
          setTracks(Array.isArray(tracksData.value) ? tracksData.value : []);
        }
        if (playlistsData.status === "fulfilled") {
          setPlaylists(Array.isArray(playlistsData.value) ? playlistsData.value : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiked();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "100px 48px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: "100px 48px 48px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <FavoriteIcon style={{ color: "#ff4d6a", fontSize: 32 }} />
        <h1 style={{ margin: 0, color: "var(--text-main)", fontFamily: "var(--title-font)" }}>
          {t("liked.title")}
        </h1>
      </div>

      <div style={{
        display: "flex", gap: 4,
        background: "var(--g-ld)", borderRadius: 16, padding: 4,
        marginBottom: 24, border: "1px solid color-mix(in srgb, var(--text-muted) 12%, transparent)",
      }}>
        <button
          onClick={() => setActiveTab("tracks")}
          style={{
            flex: 1, padding: "12px 24px", border: "none", background: activeTab === "tracks" ? "var(--w-ld)" : "transparent",
            borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "var(--main-font)",
            color: activeTab === "tracks" ? "var(--main-color)" : "var(--text-muted)",
            cursor: "pointer", boxShadow: activeTab === "tracks" ? "0 2px 8px var(--shadow)" : "none",
          }}
        >
          {t("user.Tracks")}
        </button>
        <button
          onClick={() => setActiveTab("playlists")}
          style={{
            flex: 1, padding: "12px 24px", border: "none", background: activeTab === "playlists" ? "var(--w-ld)" : "transparent",
            borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "var(--main-font)",
            color: activeTab === "playlists" ? "var(--main-color)" : "var(--text-muted)",
            cursor: "pointer", boxShadow: activeTab === "playlists" ? "0 2px 8px var(--shadow)" : "none",
          }}
        >
          {t("user.Playlists")}
        </button>
      </div>

      {activeTab === "tracks" && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16,
        }}>
          {tracks.map((track) => (
            <Link to={`/track/${track.id}`} key={track.id}
              style={{
                textDecoration: "none", color: "inherit", borderRadius: 20, overflow: "hidden",
                background: "var(--w-ld)", boxShadow: "0 4px 16px var(--shadow)",
                border: "1px solid color-mix(in srgb, var(--text-muted) 12%, transparent)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
            >
              <img
                src={track.coverUrl || defaultTrackCover}
                alt={track.title}
                style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
              />
              <div style={{ padding: "14px 16px" }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-main)", fontFamily: "var(--main-font)" }}>
                  {track.title}
                </h4>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                  {track.user?.username || "Unknown"}
                </p>
              </div>
            </Link>
          ))}
          {tracks.length === 0 && (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
              {t("liked.emptyTracks")}
            </p>
          )}
        </div>
      )}

      {activeTab === "playlists" && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16,
        }}>
          {playlists.map((pl) => (
            <Link to={`/playlist/${pl.id}`} key={pl.id}
              style={{
                textDecoration: "none", color: "inherit", borderRadius: 20, overflow: "hidden",
                background: "var(--w-ld)", boxShadow: "0 4px 16px var(--shadow)",
                border: "1px solid color-mix(in srgb, var(--text-muted) 12%, transparent)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
            >
              <img
                src={pl.coverUrl || defaultPlaylistCover}
                alt={pl.name}
                style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
              />
              <div style={{ padding: "14px 16px" }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-main)", fontFamily: "var(--main-font)" }}>
                  {pl.name}
                </h4>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                  {pl.tracks?.length || 0} tracks • {pl.user?.username || "SoundGravity"}
                </p>
              </div>
            </Link>
          ))}
          {playlists.length === 0 && (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
              {t("liked.emptyPlaylists")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
