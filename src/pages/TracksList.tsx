import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchWithAuth } from "../API/apiClient";
import styles from "../components/Track/track.module.css";

interface TrackItem {
  id: string;
  title: string;
  genre?: string;
  description?: string;
  coverUrl?: string;
  audioUrl?: string;
  createdAt: string;
  likesCount: number;
  visibility?: string;
  user?: { username: string };
}

export default function TracksList() {
  const { t } = useTranslation();
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const data = await fetchWithAuth("tracks");
        setTracks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  if (loading) return <div className={styles.loader}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <h1>All Tracks</h1>
        <div className={styles.grid}>
          {tracks.map((track) => (
            <Link to={`/track/${track.id}`} key={track.id} className={styles.card}>
              {track.coverUrl && <img src={track.coverUrl} alt={track.title} className={styles.cover} />}
              <div className={styles.info}>
                <h3>{track.title}</h3>
                <p>{track.user?.username || "Unknown"}</p>
                <span className={styles.genre}>{track.genre}</span>
              </div>
            </Link>
          ))}
          {tracks.length === 0 && <p>No tracks found</p>}
        </div>
      </div>
    </div>
  );
}
