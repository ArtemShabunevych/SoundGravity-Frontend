import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./playlist.module.css";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../API/apiClient";

interface TrackInPlaylist {
    id: string;
    title: string;
    genre?: string;
    coverUrl?: string;
    user?: {
        username: string;
    };
}

interface PlaylistType {
    id: string;
    name: string;
    description?: string;
    coverUrl?: string;
    tracks: TrackInPlaylist[];
    user?: {
        username: string;
    };
}

export default function Playlist() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();

    const [playlist, setPlaylist] = useState<PlaylistType | null>(null);

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const data = await fetchWithAuth(`playlists/${id}`);
                setPlaylist(data);
            } catch (error: any) {
                toast.error(error.message || t("errors.PlaylistNotFound") || "Playlist not found");
            }
        };

        if (id) {
            fetchPlaylist();
        }
    }, [id, t]);

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
                <div className={styles.header}>
                    <div className={styles.coverWrapper}>
                        {playlist.coverUrl ? (
                            <img src={playlist.coverUrl} alt={playlist.name} className={styles.cover} />
                        ) : (
                            <div className={styles.placeholderCover}>
                                <i className="bx bx-music"></i>
                            </div>
                        )}
                    </div>
                    <div className={styles.info}>
                        <span className={styles.badge}>Playlist</span>
                        <h1 className={styles.title}>{playlist.name}</h1>
                        {playlist.description && <p className={styles.description}>{playlist.description}</p>}
                        <div className={styles.meta}>
                            <span className={styles.author}>{playlist.user?.username || "SoundGravity"}</span>
                            <span className={styles.dot}>•</span>
                            <span>{playlist.tracks?.length || 0} tracks</span>
                        </div>
                    </div>
                </div>

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
                                        <Link to={`/track/${track.id}`} className={styles.trackTitle}>
                                            {track.title}
                                        </Link>
                                        <span className={styles.trackArtist}>
                                            {track.user?.username || "Unknown Artist"}
                                        </span>
                                    </div>
                                </div>
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