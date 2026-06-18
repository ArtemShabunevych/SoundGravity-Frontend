import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FavoriteIcon from '@mui/icons-material/Favorite';
import defaultPlaylistCover from "../../photos/playlist.png";
import {fetchWithAuth} from "../../API/apiClient";
import defaultTrackCover from "../../photos/track.png";
import styles from "./liked.module.css";

interface LikedTrack {
    id: string;
    title: string;
    genre: string;
    coverUrl?: string;
    user?: { username: string };
}

interface LikedPlaylist {
    id: string;
    name: string;
    genre: string;
    coverUrl?: string;
    tracks?: any[];
    user?: { username: string };
}

type Tab = "tracks" | "playlists";

export default function Liked() {
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
        return <div className={styles.loader}>Loading...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <FavoriteIcon className={styles.headerIcon} />
                <h1 className={styles.headerTitle}>{t("liked.title")}</h1>
            </div>

            <div className={styles.tabs}>
                <button
                    onClick={() => setActiveTab("tracks")}
                    className={`${styles.tab} ${activeTab === "tracks" ? styles.tabActive : styles.tabInactive}`}
                >
                    {t("user.Tracks")}
                </button>
                <button
                    onClick={() => setActiveTab("playlists")}
                    className={`${styles.tab} ${activeTab === "playlists" ? styles.tabActive : styles.tabInactive}`}
                >
                    {t("user.Playlists")}
                </button>
            </div>

            {activeTab === "tracks" && (
                <div className={styles.grid}>
                    {tracks.map((track) => (
                        <Link to={`/track/${track.id}`} key={track.id} className={styles.card}>
                            <img
                                src={track.coverUrl || defaultTrackCover}
                                alt={track.title}
                                className={styles.cardCover}
                            />
                            <div className={styles.cardBody}>
                                <h4 className={styles.cardTitle}>{track.title}</h4>
                                <p className={styles.cardGenre}>{track.genre}</p>
                                <p className={styles.cardUser}>{track.user?.username || "Unknown"}</p>
                            </div>
                        </Link>
                    ))}
                    {tracks.length === 0 && (
                        <p className={styles.empty}>{t("liked.emptyTracks")}</p>
                    )}
                </div>
            )}

            {activeTab === "playlists" && (
                <div className={styles.grid}>
                    {playlists.map((pl) => (
                        <Link to={`/playlist/${pl.id}`} key={pl.id} className={styles.card}>
                            <img
                                src={pl.coverUrl || defaultPlaylistCover}
                                alt={pl.name}
                                className={styles.cardCover}
                            />
                            <div className={styles.cardBody}>
                                <h4 className={styles.cardTitle}>{pl.name}</h4>
                                <p className={styles.cardGenre}>{pl.genre}</p>
                                <p className={styles.cardUser}>{pl.tracks?.length || 0} tracks • {pl.user?.username || "SoundGravity"}</p>
                            </div>
                        </Link>
                    ))}
                    {playlists.length === 0 && (
                        <p className={styles.empty}>{t("liked.emptyPlaylists")}</p>
                    )}
                </div>
            )}
        </div>
    );
}
