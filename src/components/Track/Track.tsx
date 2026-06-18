import {useCallback, useContext, useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";
import styles from "./track.module.css";
import {useTranslation} from "react-i18next";
import toast from "react-hot-toast";
import {fetchWithAuth} from "../../API/apiClient";
import {PlayerContext} from "../../context/PlayerContext";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import PauseRounded from "@mui/icons-material/PauseRounded";
import defaultUserIcon from "../../photos/user_icon.png";
import defaultTrackCover from "../../photos/track.png";
import { hexToRgba, extractDominantColor } from "../../utils/color";

interface TrackType {
    id: string;
    title?: string;
    genre: string;
    description?: string;
    coverUrl?: string;
    audioUrl?: string;
    createdAt?: string;
    likesCount?: number;
    isLiked?: boolean;
    visibility?: string;
    dominantColor?: string;
    user?: { id: string; username: string; avatarUrl?: string };
}

interface UserPlaylist {
    id: string;
    name: string;
}

export default function Track() {
    const {id} = useParams<{ id: string }>();
    const {t} = useTranslation();
    const {currentTrack, paused, togglePlay, playTrack} = useContext(PlayerContext);
    const [track, setTrack] = useState<TrackType | null>(null);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
    const [playlistsLoading, setPlaylistsLoading] = useState(false);
    const [playlistSearchQuery, setPlaylistSearchQuery] = useState("");
    const [addingToPlaylist, setAddingToPlaylist] = useState(false);
    const [autoColor, setAutoColor] = useState<string | null>(null);

    useEffect(() => {
        if (track?.dominantColor) return;
        if (!track?.coverUrl) return;
        extractDominantColor(track.coverUrl).then(setAutoColor).catch(() => {});
    }, [track?.dominantColor, track?.coverUrl]);

    const isPlaying = currentTrack?.audioUrl === track?.audioUrl;

    const fetchTrack = useCallback(async () => {
        if (!id) return;
        try {
            const data = await fetchWithAuth(`tracks/${id}`);
            setTrack(data);
            if (data.isLiked !== undefined) {
                setLiked(data.isLiked);
            }
            setLikesCount(data.likesCount || 0);
        } catch (error: any) {
            toast.error(error.message || t("errors.TrackNotFound"));
        }
    }, [id, t]);

    useEffect(() => {
        fetchTrack();
    }, [fetchTrack]);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await fetchWithAuth(`tracks/${id}/like-status`);
                setLiked(res.liked);
                if (res.likesCount !== undefined) setLikesCount(res.likesCount);
            } catch { /* ignore */ }
        })();
    }, [id]);

    const handleLike = async () => {
        const prevLiked = liked;
        try {
            const res = await fetchWithAuth(`tracks/${id}/like`, {method: "POST"});
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

    const handlePlay = () => {
        if (!track?.audioUrl) return;
        if (isPlaying) {
            togglePlay();
        } else {
            playTrack({
                title: track.title,
                username: track.user?.username,
                coverUrl: track.coverUrl,
                audioUrl: track.audioUrl,
            });
        }
    };

    const handleOpenAddToPlaylist = async () => {
        setShowAddToPlaylist(true);
        setPlaylistSearchQuery("");
        setPlaylistsLoading(true);
        try {
            const data = await fetchWithAuth("playlists/my-playlists");
            const lists: UserPlaylist[] = Array.isArray(data) ? data.map((p: any) => ({id: p.id, name: p.name})) : [];
            const withTracks = await Promise.allSettled(
                lists.map(pl => fetchWithAuth(`playlists/${pl.id}`))
            );
            const trackId = id;
            const filtered = lists.filter((pl, i) => {
                const res = withTracks[i];
                if (res.status === "fulfilled") {
                    const plData: any = res.value;
                    return !plData.tracks?.some((t: any) => t.id === trackId);
                }
                return true;
            });
            setUserPlaylists(filtered);
        } catch {
            setUserPlaylists([]);
        } finally {
            setPlaylistsLoading(false);
        }
    };

    const handleAddToPlaylist = async (playlistId: string) => {
        try {
            setAddingToPlaylist(true);
            await fetchWithAuth(`playlists/${playlistId}/tracks/${id}`, {method: "POST"});
            toast.success(t("common.trackAdded"));
            setUserPlaylists(prev => prev.filter(p => p.id !== playlistId));
        } catch (err: any) {
            toast.error(err.message || t("common.failedToAdd"));
        } finally {
            setAddingToPlaylist(false);
        }
    };

    const filteredPlaylists = playlistSearchQuery.trim()
        ? userPlaylists.filter(p => p.name.toLowerCase().includes(playlistSearchQuery.toLowerCase()))
        : userPlaylists;

    if (!track) {
        return <div className={styles.loader}>Loading...</div>;
    }

    const dominantColor = autoColor || track.dominantColor || '#7c4dff';
    const gradientBg = `linear-gradient(180deg, ${hexToRgba(dominantColor, 0.3)} 0%, ${hexToRgba(dominantColor, 0.08)} 60%, transparent 100%), var(--bg-deep)`;

    return (
        <div className={styles.page} style={{ background: gradientBg }}>
            <div className={styles.layout}>
                <div className={styles.header}>
                    <div className={styles.coverWrapper}>
                        {track.coverUrl ? (
                            <img src={track.coverUrl} alt={track.title} className={styles.cover} />
                        ) : (
                            <img src={defaultTrackCover} alt={track.title} className={styles.cover} />
                        )}
                    </div>
                    <div className={styles.headerBody}>
                        <div className={styles.info}>
                            <span className={styles.badge}>Track</span>
                            <h1 className={styles.title}>{track.title}</h1>
                            <div className={styles.meta}>
                                {track.user && (
                                    <Link to={`/user/${track.user.username}`} className={styles.authorLink}>
                                        <img
                                            src={track.user.avatarUrl || defaultUserIcon}
                                            alt=""
                                            className={styles.authorAvatar}
                                        />
                                        {track.user.username}
                                    </Link>
                                )}
                                <span className={styles.dot}>•</span>
                                <span>{likesCount} {t("playlist.likesCount")}</span>
                            </div>
                        </div>

                        <div className={styles.headerActions}>
                            <button
                                className={styles.bigPlayBtn}
                                onClick={handlePlay}
                                title={paused ? t("common.Play") : t("common.Pause")}
                            >
                                {isPlaying && !paused ? (
                                    <PauseRounded fontSize="large" />
                                ) : (
                                    <PlayArrowRounded fontSize="large" />
                                )}
                            </button>
                            <button
                                className={styles.addTrackBtn}
                                onClick={handleOpenAddToPlaylist}
                            >
                                + {t("track.addToPlaylist")}
                            </button>
                            <button onClick={handleLike} className={styles.likeBtn}>
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

                <div className={styles.trackInfo}>
                    <span className={styles.infoLabel}>{t("common.about")}</span>
                    <span className={styles.genre}>{track.genre}</span>
                    {track.description &&
                        <p className={styles.description}>{track.description}</p>}
                </div>
            </div>

            {showAddToPlaylist && (
                <div className={styles.modal} onClick={() => setShowAddToPlaylist(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{t("track.addToPlaylist")}</h2>
                            <button className={styles.modalClose} onClick={() => setShowAddToPlaylist(false)}>
                                ✕
                            </button>
                        </div>
                        <input
                            className={styles.modalSearch}
                            placeholder={t("track.searchPlaylists")}
                            value={playlistSearchQuery}
                            onChange={e => setPlaylistSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <div className={styles.modalResults}>
                            {playlistsLoading ? (
                                <div className={styles.modalLoading}>{t("common.Loading")}</div>
                            ) : filteredPlaylists.length > 0 ? (
                                filteredPlaylists.map(pl => (
                                    <div key={pl.id} className={styles.modalTrack}>
                                        <div className={styles.modalTrackInfo}>
                                            <strong>{pl.name}</strong>
                                        </div>
                                        <button
                                            className={styles.modalAddBtn}
                                            onClick={() => handleAddToPlaylist(pl.id)}
                                            disabled={addingToPlaylist}
                                        >
                                            {addingToPlaylist ? "..." : "+"}
                                        </button>
                                    </div>
                                ))
                            ) : playlistSearchQuery.trim() ? (
                                <div className={styles.modalLoading}>{t("track.noPlaylists")}</div>
                            ) : (
                                <div className={styles.modalLoading}>{t("track.noPlaylists")}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}