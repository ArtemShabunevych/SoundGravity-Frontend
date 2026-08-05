import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { fetchWithAuth } from "../../API/apiClient";
import defaultPlaylistCover from "../../photos/playlist.png";
import defaultTrackCover from "../../photos/track.png";
import styles from "./liked.module.css";

interface LikedTrack {
    id: string;
    title: string;
    genre: string;
    coverUrl?: string;
    audioUrl?: string;
    duration?: number;
    likesCount?: number;
    user?: { username: string };
}

interface LikedPlaylist {
    id: string;
    name: string;
    genre: string;
    coverUrl?: string;
    tracks?: any[];
    likesCount?: number;
    user?: { username: string };
}

type Tab = "tracks" | "playlists";

function formatDuration(seconds?: number): string {
    if (seconds == null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

function truncate(text: string, max: number): string {
    return text.length > max ? text.slice(0, max) + "..." : text;
}

export default function Liked() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>("tracks");
    const [tracks, setTracks] = useState<LikedTrack[]>([]);
    const [playlists, setPlaylists] = useState<LikedPlaylist[]>([]);
    const [loading, setLoading] = useState(true);
    const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
    const [likedPlaylists, setLikedPlaylists] = useState<Set<string>>(new Set());

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
            } finally {
                setLoading(false);
            }
        };
        fetchLiked();
    }, []);

    const handleLikeTrack = useCallback(async (trackId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const wasLiked = likedTracks.has(trackId);
        const next = new Set(likedTracks);
        if (wasLiked) next.delete(trackId); else next.add(trackId);
        setLikedTracks(next);
        setTracks(prev => prev.map(t =>
            t.id === trackId
                ? { ...t, likesCount: (t.likesCount ?? 0) + (wasLiked ? -1 : 1) }
                : t
        ));
        try {
            await fetchWithAuth(`tracks/${trackId}/like`, { method: "POST" });
        } catch {
            setLikedTracks(likedTracks);
            setTracks(prev => prev.map(t =>
                t.id === trackId
                    ? { ...t, likesCount: (t.likesCount ?? 0) + (wasLiked ? 1 : -1) }
                    : t
            ));
        }
    }, [likedTracks]);

    const handleLikePlaylist = useCallback(async (playlistId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const wasLiked = likedPlaylists.has(playlistId);
        const next = new Set(likedPlaylists);
        if (wasLiked) next.delete(playlistId); else next.add(playlistId);
        setLikedPlaylists(next);
        setPlaylists(prev => prev.map(pl =>
            pl.id === playlistId
                ? { ...pl, likesCount: (pl.likesCount ?? 0) + (wasLiked ? -1 : 1) }
                : pl
        ));
        try {
            await fetchWithAuth(`playlists/${playlistId}/like`, { method: "POST" });
        } catch {
            setLikedPlaylists(likedPlaylists);
            setPlaylists(prev => prev.map(pl =>
                pl.id === playlistId
                    ? { ...pl, likesCount: (pl.likesCount ?? 0) + (wasLiked ? 1 : -1) }
                    : pl
            ));
        }
    }, [likedPlaylists]);

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

            <div className={styles.layout}>
                {activeTab === "tracks" && (
                    <div className={styles.trackList}>
                        <div className={styles.listHeader}>
                            <span className={styles.colIndex}>#</span>
                            <span />
                            <span className={styles.colInfo}>{t("create.title")}</span>
                            <span className={styles.colDuration}>{t("playlist.duration")}</span>
                            <span className={styles.colLikes}>{t("playlist.likesCount")}</span>
                        </div>
                        {tracks.map((track, index) => {
                            const duration = formatDuration(track.duration);
                            const liked = likedTracks.has(track.id);
                            return (
                                <div
                                    key={track.id}
                                    className={styles.trackItem}
                                    onClick={() => navigate(`/track/${track.id}`)}
                                >
                                    <span className={styles.trackIndex}>{index + 1}</span>
                                    {track.coverUrl ? (
                                        <img src={track.coverUrl} alt="" className={styles.trackCover} />
                                    ) : (
                                        <img src={defaultTrackCover} alt="" className={styles.trackCover} />
                                    )}
                                    <div className={styles.trackInfo}>
                                        <span className={styles.trackTitle}>{track.title}</span>
                                        {track.user?.username && (
                                            <Link
                                                to={`/user/${track.user.username}`}
                                                className={styles.trackArtist}
                                                onClick={e => e.stopPropagation()}
                                            >
                                                {track.user.username}
                                            </Link>
                                        )}
                                    </div>
                                    <span className={styles.trackDuration}>{duration}</span>
                                    <div className={styles.trackLikes}>
                                        <button
                                            className={styles.likeBtn}
                                            onClick={e => handleLikeTrack(track.id, e)}
                                        >
                                            {liked ? (
                                                <FavoriteIcon className={styles.likedIcon} />
                                            ) : (
                                                <FavoriteBorderIcon className={styles.notLikedIcon} />
                                            )}
                                        </button>
                                        <span className={styles.trackLikesCount}>{track.likesCount ?? 0}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {tracks.length === 0 && (
                            <p className={styles.empty}>{t("liked.emptyTracks")}</p>
                        )}
                    </div>
                )}

                {activeTab === "playlists" && (
                    <div className={styles.playlistList}>
                        <div className={styles.listHeader}>
                            <span className={styles.colIndex}>#</span>
                            <span className={styles.colCover} />
                            <span className={styles.colInfo}>{t("create.title")}</span>
                            <span className={styles.colTracks}>{t("playlist.tracksCount")}</span>
                            <span className={styles.colLikes}>{t("playlist.likesCount")}</span>
                        </div>
                        {playlists.map((pl, index) => {
                            const liked = likedPlaylists.has(pl.id);
                            const trackList = pl.tracks || [];
                            const visibleTracks = trackList.slice(0, 3);
                            const hasMoreTracks = trackList.length > 3;
                            return (
                                <div
                                    key={pl.id}
                                    className={styles.playlistItem}
                                    onClick={() => navigate(`/playlist/${pl.id}`)}
                                >
                                    <span className={styles.playlistIndex}>{index + 1}</span>
                                    {pl.coverUrl ? (
                                        <img src={pl.coverUrl} alt="" className={styles.playlistCover} />
                                    ) : (
                                        <img src={defaultPlaylistCover} alt="" className={styles.playlistCover} />
                                    )}
                                    <div className={styles.playlistInfo}>
                                        <span className={styles.playlistName}>{pl.name}</span>
                                        <Link
                                            to={`/user/${pl.user?.username}`}
                                            className={styles.playlistAuthor}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            {pl.user?.username || "SoundGravity"}
                                        </Link>
                                    </div>
                                    <div className={styles.trackNames}>
                                        {visibleTracks.map((track: any) => (
                                            <Link
                                                key={track.id}
                                                to={`/track/${track.id}`}
                                                className={styles.trackNameLink}
                                                onClick={e => e.stopPropagation()}
                                                title={track.title}
                                            >
                                                {truncate(track.title, 15)}
                                            </Link>
                                        ))}
                                        {hasMoreTracks && (
                                            <span className={styles.moreTracks}>...</span>
                                        )}
                                    </div>
                                    <div className={styles.likeCell}>
                                        <button
                                            className={styles.likeBtn}
                                            onClick={e => handleLikePlaylist(pl.id, e)}
                                        >
                                            {liked ? (
                                                <FavoriteIcon className={styles.likedIcon} />
                                            ) : (
                                                <FavoriteBorderIcon className={styles.notLikedIcon} />
                                            )}
                                        </button>
                                        <span className={styles.likesCount}>{pl.likesCount ?? 0}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {playlists.length === 0 && (
                            <p className={styles.empty}>{t("liked.emptyPlaylists")}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
