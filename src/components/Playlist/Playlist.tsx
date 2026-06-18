import {useCallback, useContext, useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";
import styles from "./playlist.module.css";
import {useTranslation} from "react-i18next";
import toast from "react-hot-toast";
import {fetchWithAuth} from "../../API/apiClient";
import {UserContext} from "../../context/UserContext";
import {PlayerContext} from "../../context/PlayerContext";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PauseRounded from "@mui/icons-material/PauseRounded";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import defaultUserIcon from "../../photos/user_icon.png";
import defaultPlaylistCover from "../../photos/playlist.png";
import { hexToRgba, extractDominantColor } from "../../utils/color";

interface TrackInPlaylist {
    id: string;
    title: string;
    genre: string;
    coverUrl?: string;
    audioUrl?: string;
    duration?: number;
    likesCount?: number;
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
    dominantColor?: string;
    tracks: TrackInPlaylist[];
    likesCount?: number;
    isLiked?: boolean;
    user?: {
        username: string;
        avatarUrl?: string;
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
    const {currentTrack, paused, playTrack, togglePlay, setQueue} = useContext(PlayerContext);

    const [playlist, setPlaylist] = useState<PlaylistType | null>(null);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [showAddTrack, setShowAddTrack] = useState(false);
    const [autoColor, setAutoColor] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchTrack[]>([]);
    const [searching, setSearching] = useState(false);
    const [addingTrack, setAddingTrack] = useState(false);
    const [likedTracks, setLikedTracks] = useState<Set<string>>(() => {
        try {
            const saved = id ? localStorage.getItem(`liked_tracks_${id}`) : null;
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });

    const isAuthor = !!playlist?.user?.username && !!currentUser?.username &&
        playlist.user.username === currentUser.username;

    const isTrackPlaying = (trackId: string) =>
        currentTrack?.audioUrl && playlist?.tracks.find(t => t.id === trackId)?.audioUrl === currentTrack.audioUrl;

    const handlePlayTrack = (track: TrackInPlaylist) => {
        const trackWithAudio = playlist?.tracks.find(t => t.id === track.id);
        if (!trackWithAudio) return;
        const isSame = currentTrack?.audioUrl && trackWithAudio.audioUrl === currentTrack.audioUrl;
        if (isSame) {
            togglePlay();
        } else {
            const queueTracks = playlist?.tracks
                .filter(t => t.audioUrl)
                .map(t => ({
                    title: t.title,
                    username: t.user?.username,
                    coverUrl: t.coverUrl,
                    audioUrl: t.audioUrl,
                })) || [];
            setQueue(queueTracks, trackWithAudio.audioUrl);
            playTrack({
                title: trackWithAudio.title,
                username: trackWithAudio.user?.username,
                coverUrl: trackWithAudio.coverUrl,
                audioUrl: trackWithAudio.audioUrl,
            });
        }
    };

    const fetchPlaylist = useCallback(async () => {
        try {
            const data = await fetchWithAuth(`playlists/${id}`);
            setPlaylist(data);
            if (data.isLiked !== undefined) {
                setLiked(data.isLiked);
            }
            setLikesCount(data.likesCount || 0);
            if (data.tracks?.length) {
                const results = await Promise.allSettled(
                    data.tracks.map((t: any) => fetchWithAuth(`tracks/${t.id}/like-status`))
                );
                const liked = new Set<string>();
                results.forEach((res, i) => {
                    if (res.status === "fulfilled" && (res.value as any).liked) {
                        liked.add(data.tracks[i].id);
                    }
                });
                setLikedTracks(liked);
                if (id) {
                    localStorage.setItem(`liked_tracks_${id}`, JSON.stringify([...liked]));
                }
            }
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
        if (playlist?.dominantColor) return;
        if (!playlist?.coverUrl) return;
        extractDominantColor(playlist.coverUrl).then(setAutoColor).catch(() => {});
    }, [playlist?.dominantColor, playlist?.coverUrl]);

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
            toast.error(err.message || t("common.failedToLike"));
        }
    };

    const handleLikeTrack = async (trackId: string) => {
        const wasLiked = likedTracks.has(trackId);
        const nextLiked = new Set(likedTracks);
        if (wasLiked) nextLiked.delete(trackId);
        else nextLiked.add(trackId);
        setLikedTracks(nextLiked);
        if (id) localStorage.setItem(`liked_tracks_${id}`, JSON.stringify([...nextLiked]));
        setPlaylist(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                tracks: prev.tracks.map(t =>
                    t.id === trackId
                        ? { ...t, likesCount: Math.max(0, (t.likesCount || 0) + (wasLiked ? -1 : 1)) }
                        : t
                )
            };
        });
        try {
            await fetchWithAuth(`tracks/${trackId}/like`, {method: "POST"});
        } catch (err: any) {
            const revertLiked = new Set(likedTracks);
            if (wasLiked) revertLiked.add(trackId);
            else revertLiked.delete(trackId);
            setLikedTracks(revertLiked);
            if (id) localStorage.setItem(`liked_tracks_${id}`, JSON.stringify([...revertLiked]));
            setPlaylist(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    tracks: prev.tracks.map(t =>
                        t.id === trackId
                            ? { ...t, likesCount: Math.max(0, (t.likesCount || 0) + (wasLiked ? 1 : -1)) }
                            : t
                    )
                };
            });
            toast.error(err.message || t("common.failedToLike"));
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
            toast.success(t("common.trackAdded"));
        } catch (err: any) {
            toast.error(err.message || t("common.failedToAdd"));
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
            toast.success(t("common.trackRemoved"));
        } catch (err: any) {
            toast.error(err.message || "Failed to remove track");
        }
    };

    if (!playlist) {
        return (
            <div className={styles.loader}>
                {t("common.Loading")}
            </div>
        );
    }

    const handlePlayFirst = () => {
        const first = playlist?.tracks?.find(t => t.audioUrl);
        if (!first) return;
        const isSame = currentTrack?.audioUrl === first.audioUrl;
        if (isSame) {
            togglePlay();
        } else {
            const queueTracks = playlist?.tracks
                .filter(t => t.audioUrl)
                .map(t => ({
                    title: t.title,
                    username: t.user?.username,
                    coverUrl: t.coverUrl,
                    audioUrl: t.audioUrl,
                })) || [];
            setQueue(queueTracks, first.audioUrl);
            playTrack({
                title: first.title,
                username: first.user?.username,
                coverUrl: first.coverUrl,
                audioUrl: first.audioUrl,
            });
        }
    };

    const isPlayingPlaylist = currentTrack?.audioUrl && playlist?.tracks?.some(t => t.audioUrl === currentTrack.audioUrl);

    const dominantColor = playlist?.dominantColor || '#7c4dff';
    const gradientBg = `linear-gradient(180deg, ${hexToRgba(dominantColor, 0.3)} 0%, ${hexToRgba(dominantColor, 0.08)} 60%, transparent 100%), var(--bg-deep)`;

    return (
        <div className={styles.page} style={{ background: gradientBg }}>
            <div className={styles.layout}>
                <div className={styles.header}>
                    <div className={styles.coverWrapper}>
                        {playlist.coverUrl ? (
                            <img src={playlist.coverUrl} alt={playlist.name} className={styles.cover} />
                        ) : (
                            <img src={defaultPlaylistCover} alt={playlist.name} className={styles.cover} />
                        )}
                    </div>
                    <div className={styles.headerBody}>
                        <div className={styles.info}>
                            <span className={styles.badge}>Playlist</span>
                            <h1 className={styles.title}>{playlist.name}</h1>
                            <div className={styles.meta}>
                                {playlist.user?.username ? (
                                    <Link to={`/user/${playlist.user.username}`} className={styles.authorLink}>
                                        <img
                                            src={playlist.user.avatarUrl || defaultUserIcon}
                                            alt=""
                                            className={styles.authorAvatar}
                                        />
                                        {playlist.user.username}
                                    </Link>
                                ) : (
                                    <span className={styles.author}>SoundGravity</span>
                                )}
                                <span className={styles.dot}>•</span>
                                <span>{playlist.tracks?.length || 0} {t("playlist.tracksCount")}</span>
                                <span className={styles.dot}>•</span>
                                <span>{likesCount} {t("playlist.likesCount")}</span>
                            </div>
                        </div>

                        <div className={styles.headerActions}>
                            <button
                                className={styles.bigPlayBtn}
                                onClick={handlePlayFirst}
                                title={isPlayingPlaylist && !paused ? t("common.Pause") : t("common.Play")}
                            >
                                {isPlayingPlaylist && !paused ? (
                                    <PauseRounded fontSize="large" />
                                ) : (
                                    <PlayArrowRounded fontSize="large" />
                                )}
                            </button>
                            {isAuthor && (
                                <button
                                    className={styles.addTrackBtn}
                                    onClick={() => setShowAddTrack(true)}
                                >
                                    + {t("playlist.addTrack")}
                                </button>
                            )}
                            <button onClick={handleLikePlaylist} className={styles.likeBtn}>
                                {liked ? (
                                    <FavoriteIcon className={styles.likedIcon} />
                                ) : (
                                    <FavoriteBorderIcon className={styles.notLikedIcon} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.gradientDivider} />

                <div className={styles.tracksList}>
                    {playlist.tracks && playlist.tracks.length > 0 ? (
                        playlist.tracks.map((track, index) => (
                            <div
                                key={track.id}
                                className={`${styles.trackItem} ${isTrackPlaying(track.id) ? styles.activeTrack : ""}`}
                                onClick={() => handlePlayTrack(track)}
                            >
                                <div className={styles.trackIndex}>{index + 1}</div>
                                <img
                                    src={track.coverUrl || defaultTrackCover}
                                    alt=""
                                    className={styles.trackCover}
                                />
                                <div className={styles.trackMeta}>
                                    <span className={styles.trackTitle}>{track.title}</span>
                                    <span className={styles.trackAuthor}>{track.user?.username}</span>
                                </div>
                                <div className={styles.trackGenre}>{track.genre}</div>
                                <div className={styles.trackActions} onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleLikeTrack(track.id)}
                                        className={styles.trackLikeBtn}
                                    >
                                        {likedTracks.has(track.id) ? (
                                            <FavoriteIcon fontSize="small" className={styles.likedIcon} />
                                        ) : (
                                            <FavoriteBorderIcon fontSize="small" />
                                        )}
                                    </button>
                                    {isAuthor && (
                                        <button
                                            onClick={() => handleRemoveTrack(track.id)}
                                            className={styles.trackDeleteBtn}
                                            title="Remove from playlist"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>{t("playlist.empty")}</div>
                    )}
                </div>
            </div>

            {showAddTrack && (
                <div className={styles.modal} onClick={() => setShowAddTrack(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{t("playlist.addTrack")}</h2>
                            <button className={styles.modalClose} onClick={() => setShowAddTrack(false)}>✕</button>
                        </div>
                        <input
                            className={styles.modalSearch}
                            placeholder={t("playlist.searchTracks")}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <div className={styles.modalResults}>
                            {searching ? (
                                <div className={styles.modalLoading}>{t("common.Loading")}</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map(track => (
                                    <div key={track.id} className={styles.modalTrack}>
                                        <img src={track.coverUrl || defaultTrackCover} alt="" />
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
                                <div className={styles.modalLoading}>{t("playlist.noTracksFound")}</div>
                            ) : (
                                <div className={styles.modalLoading}>{t("playlist.startTyping")}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}