import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./playlist.module.css";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

// Інтерфейс для треків, які знаходяться всередині плейліста
interface TrackInPlaylist {
    id: string;
    title: string;
    duration?: string | number;
    cover?: string;
    artist?: {
        username: string;
    };
}

// Головний інтерфейс для самого плейліста
interface PlaylistType {
    id: string;
    title: string;
    description?: string;
    cover?: string;
    tracks: TrackInPlaylist[];
    user?: {
        username: string;
    };
}

export default function Playlist() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();

    const [playlist, setPlaylist] = useState<PlaylistType | null>(null);

    const apiUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:3000/api/";

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const token = localStorage.getItem("JWT_TOKEN");
                const accessToken = localStorage.getItem("JWT_ACCESS_TOKEN");

                if (!token || !accessToken) {
                    throw new Error(t("errors.mustBeLoggedIn"));
                }

                const response = await fetch(`${apiUrl}playlists/${id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "x-refresh-token": accessToken,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || t("errors.PlaylistNotFound") || "Playlist not found");
                }

                setPlaylist(data);
            } catch (error: any) {
                toast.error(error.message || t("errors.PlaylistNotFound") || "Playlist not found");
            }
        };

        if (id) {
            fetchPlaylist();
        }
    }, [id, t, apiUrl]);

    if (!playlist) {
        return (
            <div className={styles.loader}>
                Loading Playlist...
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.layout}>
                {/* Шапка плейліста з обкладинкою та інформацією */}
                <div className={styles.header}>
                    <div className={styles.coverWrapper}>
                        {playlist.cover ? (
                            <img src={playlist.cover} alt={playlist.title} className={styles.cover} />
                        ) : (
                            <div className={styles.placeholderCover}>
                                <i className="bx bx-music"></i>
                            </div>
                        )}
                    </div>
                    <div className={styles.info}>
                        <span className={styles.badge}>Playlist</span>
                        <h1 className={styles.title}>{playlist.title}</h1>
                        {playlist.description && <p className={styles.description}>{playlist.description}</p>}
                        <div className={styles.meta}>
                            <span className={styles.author}>{playlist.user?.username || "SoundGravity"}</span>
                            <span className={styles.dot}>•</span>
                            <span>{playlist.tracks?.length || 0} tracks</span>
                        </div>
                    </div>
                </div>

                {/* Список треків */}
                <div className={styles.tracksList}>
                    {playlist.tracks && playlist.tracks.length > 0 ? (
                        playlist.tracks.map((track, index) => (
                            <div key={track.id} className={styles.trackItem}>
                                <div className={styles.trackIndex}>{index + 1}</div>
                                <div className={styles.trackMain}>
                                    <div className={styles.trackIcon}>
                                        <i className="bx bx-play-circle"></i>
                                    </div>
                                    <div className={styles.trackDetails}>
                                        <Link to={`/tracks/${track.id}`} className={styles.trackTitle}>
                                            {track.title}
                                        </Link>
                                        <span className={styles.trackArtist}>
                                            {track.artist?.username || "Unknown Artist"}
                                        </span>
                                    </div>
                                </div>
                                {track.duration && <div className={styles.trackDuration}>{track.duration}</div>}
                            </div>
                        ))
                    ) : (
                        <div className={styles.empty}>
                            <p>This playlist has no tracks yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}