import {useCallback, useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";
import styles from "./playlist.module.css";
import {useTranslation} from "react-i18next";
import toast from "react-hot-toast";
import {fetchWithAuth} from "../../API/apiClient";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import defaultPlaylistCover from "../../photos/playlist.png";

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
    likesCount?: number;
    isLiked?: boolean;
    user?: {
        username: string;
    };
}

export default function Playlist() {
    const {id} = useParams<{ id: string }>();
    const {t} = useTranslation();

    const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    const fetchPlaylist = useCallback(async () => {
        try {
            const data = await fetchWithAuth(`playlists/${id}`);
            setPlaylist(data);
            if (data.isLiked !== undefined) {
                setLiked(data.isLiked);
            }
            setLikesCount(data.likesCount || 0);
        } catch (error: any) {
            toast.error(error.message || t("errors.PlaylistNotFound") || "Playlist not found");
        }
    }, [id, t]);

    useEffect(() => {
        if (id) {
            fetchPlaylist();
        }
    }, [id, fetchPlaylist]);

    const handleLikePlaylist = async () => {
        const prevLiked = liked;
        try {
            const res = await fetchWithAuth(`likes/playlist/${id}`, {method: "POST"});
            if (res && typeof res.liked === "boolean") {
                setLiked(res.liked);
                setLikesCount(res.likesCount ?? likesCount);
            } else {
                setLiked(!prevLiked);
                setLikesCount(prev => prevLiked ? Math.max(0, prev - 1) : prev + 1);
            }
        } catch (err: any) {
            setLiked(prevLiked);
            toast.error(err.message || "Failed to update like");
        }
    };

    const handleLikeTrack = async (trackId: string, trackLiked: boolean) => {
        try {
            const res = await fetchWithAuth(`likes/track/${trackId}`, {method: "POST"});
            let nowLiked = !trackLiked;
            if (res && typeof res.liked === "boolean") {
                nowLiked = res.liked;
            }
            setPlaylist(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    tracks: prev.tracks.map(t =>
                        t.id === trackId ? {...t} : t
                    )
                };
            });
        } catch (err: any) {
            toast.error(err.message || "Failed to update like");
        }
    };

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
                        <img
                            src={playlist.coverUrl || defaultPlaylistCover}
                            alt={playlist.name}
                            className={styles.cover}
                        />
                    </div>
                    <div className={styles.info}>
                        <span className={styles.badge}>Playlist</span>
                        <h1 className={styles.title}>{playlist.name}</h1>
                        {playlist.description && <p className={styles.description}>{playlist.description}</p>}
                        <div className={styles.meta}>
                            <span className={styles.author}>{playlist.user?.username || "SoundGravity"}</span>
                            <span className={styles.dot}>•</span>
                            <span>{playlist.tracks?.length || 0} tracks</span>
                            <span className={styles.dot}>•</span>
                            <span>{likesCount} likes</span>
                        </div>
                        <button onClick={handleLikePlaylist} className={styles.likeBtn}>
                            {liked ? (
                                <FavoriteIcon className={styles.likedIcon} />
                            ) : (
                                <FavoriteBorderIcon className={styles.notLikedIcon} />
                            )}
                            <span>{liked ? t("playlist.liked") : t("playlist.like")}</span>
                        </button>
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
                                            {t("playlist.author")}
                                            {track.user?.username || "Unknown Artist"}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleLikeTrack(track.id, false)}
                                    className={styles.trackLikeBtn}
                                >
                                    <FavoriteBorderIcon className={styles.trackNotLikedIcon} />
                                </button>
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
