import {useCallback, useContext, useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";
import styles from "./playlist.module.css";
import {useTranslation} from "react-i18next";
import toast from "react-hot-toast";
import {fetchWithAuth} from "../../API/apiClient";
import {UserContext} from "../../context/UserContext";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import defaultPlaylistCover from "../../photos/playlist.png";

interface TrackInPlaylist {
    id: string;
    title: string;
    genre: string;
    coverUrl?: string;
    user?: {
        username: string;
    };
}

interface PlaylistType {
    id: string;
    name: string;
    genre: string;
    description?: string;
    coverUrl?: string;
    tracks: TrackInPlaylist[];
    likesCount?: number;
    isLiked?: boolean;
    user?: {
        username: string;
    };
}

interface SearchTrack {
    id: string;
    title: string;
    genre: string;
    coverUrl?: string;
    user?: { username: string };
}

export default function Playlist() {
    const {id} = useParams<{ id: string }>();
    const {t} = useTranslation();
    const {user: currentUser} = useContext(UserContext);

    const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [showAddTrack, setShowAddTrack] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchTrack[]>([]);
    const [searching, setSearching] = useState(false);
    const [addingTrack, setAddingTrack] = useState(false);

    const isAuthor = !!playlist?.user?.username && !!currentUser?.username &&
        playlist.user.username === currentUser.username;

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

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await fetchWithAuth(`playlists/${id}/like-status`);
                setLiked(res.liked);
                if (res.likesCount !== undefined) setLikesCount(res.likesCount);
            } catch { /* ignore */ }
        })();
    }, [id]);

    useEffect(() => {
        if (!showAddTrack || !searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const delay = setTimeout(async () => {
            try {
                setSearching(true);
                const data = await fetchWithAuth("tracks");
                const allTracks: SearchTrack[] = Array.isArray(data) ? data : [];
                const q = searchQuery.toLowerCase();
                const filtered = allTracks.filter(
                    track => track.title.toLowerCase().includes(q) &&
                        !playlist?.tracks?.some(pt => pt.id === track.id)
                );
                setSearchResults(filtered.slice(0, 20));
            } catch {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(delay);
    }, [searchQuery, showAddTrack, playlist]);

    const handleLikePlaylist = async () => {
        const prevLiked = liked;
        try {
            const res = await fetchWithAuth(`playlists/${id}/like`, {method: "POST"});
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

    const handleLikeTrack = async (trackId: string) => {
        try {
            await fetchWithAuth(`tracks/${trackId}/like`, {method: "POST"});
        } catch (err: any) {
            toast.error(err.message || "Failed to update like");
        }
    };

    const handleAddTrack = async (trackId: string) => {
        try {
            setAddingTrack(true);
            const data = await fetchWithAuth(`playlists/${id}/tracks/${trackId}`, {
                method: "POST",
            });
            setPlaylist(data);
            setSearchResults(prev => prev.filter(t => t.id !== trackId));
            toast.success("Track added to playlist");
        } catch (err: any) {
            toast.error(err.message || "Failed to add track");
        } finally {
            setAddingTrack(false);
        }
    };

    const handleRemoveTrack = async (trackId: string) => {
        try {
            const data = await fetchWithAuth(`playlists/${id}/tracks/${trackId}`, {
                method: "DELETE",
            });
            setPlaylist(data);
            toast.success("Track removed from playlist");
        } catch (err: any) {
            toast.error(err.message || "Failed to remove track");
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
                        <span className={styles.genre}>{t("playlist.genre")} {playlist.genre}</span>
                        <div className={styles.meta}>
                            <span className={styles.author}>{playlist.user?.username || "SoundGravity"}</span>
                            <span className={styles.dot}>•</span>
                            <span>{playlist.tracks?.length || 0} tracks</span>
                            <span className={styles.dot}>•</span>
                            <span>{likesCount} likes</span>
                        </div>
                        <div className={styles.headerActions}>
                            <button onClick={handleLikePlaylist} className={styles.likeBtn}>
                                {liked ? (
                                    <FavoriteIcon className={styles.likedIcon} />
                                ) : (
                                    <FavoriteBorderIcon className={styles.notLikedIcon} />
                                )}
                                <span>{liked ? t("playlist.liked") : t("playlist.like")}</span>
                            </button>
                            {isAuthor && (
                                <button
                                    className={styles.addTrackBtn}
                                    onClick={() => setShowAddTrack(true)}
                                >
                                    + Add track
                                </button>
                            )}
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
                                            {t("playlist.author")}
                                            {track.user?.username || "Unknown Artist"}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.trackActions}>
                                    <button
                                        onClick={() => handleLikeTrack(track.id)}
                                        className={styles.trackLikeBtn}
                                    >
                                        <FavoriteBorderIcon className={styles.trackNotLikedIcon} />
                                    </button>
                                    {isAuthor && (
                                        <button
                                            className={styles.removeTrackBtn}
                                            onClick={() => handleRemoveTrack(track.id)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.empty}>
                            <p>This playlist has no tracks yet.</p>
                            {isAuthor && (
                                <button
                                    className={styles.addTrackBtn}
                                    onClick={() => setShowAddTrack(true)}
                                >
                                    + Add track
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showAddTrack && (
                <div className={styles.modal} onClick={() => setShowAddTrack(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Add track</h2>
                            <button
                                className={styles.modalClose}
                                onClick={() => setShowAddTrack(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <input
                            className={styles.modalSearch}
                            placeholder="Search tracks..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <div className={styles.modalResults}>
                            {searching ? (
                                <div className={styles.modalLoading}>Searching...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map(track => (
                                    <div key={track.id} className={styles.modalTrack}>
                                        <div className={styles.modalTrackInfo}>
                                            <strong>{track.title}</strong>
                                            <span>{track.user?.username}</span>
                                        </div>
                                        <button
                                            className={styles.modalAddBtn}
                                            onClick={() => handleAddTrack(track.id)}
                                            disabled={addingTrack}
                                        >
                                            {addingTrack ? "..." : "+"}
                                        </button>
                                    </div>
                                ))
                            ) : searchQuery.trim() ? (
                                <div className={styles.modalLoading}>No tracks found</div>
                            ) : (
                                <div className={styles.modalLoading}>Type to search tracks</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
