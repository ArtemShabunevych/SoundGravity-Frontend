import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchWithAuth } from "../../API/apiClient";
import defaultPlaylistCover from "../../photos/playlist.png";
import styles from "./playlist-list.module.css";

interface PlaylistItem {
    id: string;
    name: string;
    genre: string;
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

    if (loading) return <div className={styles.empty}>Loading...</div>;

    return (
        <div className={styles.page}>
            <h1>All Playlists</h1>
            <div className={styles.grid}>
                {playlists.map((pl) => (
                    <Link to={`/playlist/${pl.id}`} key={pl.id} className={styles.card}>
                        <div className={styles.coverWrap}>
                            <img
                                src={pl.coverUrl || defaultPlaylistCover}
                                alt={pl.name}
                                className={styles.cover}
                            />
                        </div>
                        <h3 className={styles.title}>{pl.name}</h3>
                        <p className={styles.genre}>{pl.genre}</p>
                        <p className={styles.meta}>
                            {pl.tracks?.length || 0} tracks • {pl.user?.username || "SoundGravity"}
                        </p>
                    </Link>
                ))}
                {playlists.length === 0 && <p className={styles.empty}>{t("playlist.no")}</p>}
            </div>
        </div>
    );
}
