import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchWithAuth } from "../../API/apiClient";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import styles from "./playlist-list.module.css";
import defaultPlaylistCover from "../../photos/playlist.png";

interface PlaylistItem {
    id: string;
    name: string;
    genre: string;
    description?: string;
    coverUrl?: string;
    createdAt: string;
    likesCount: number;
    tracks?: { id: string; title: string }[];
    tracksCount?: number;
    user?: { username: string };
}

function trackCount(pl: PlaylistItem): number {
    if (pl.tracksCount !== undefined) return pl.tracksCount;
    if (Array.isArray(pl.tracks)) return pl.tracks.length;
    return 0;
}

function truncate(text: string, max: number): string {
    return text.length > max ? text.slice(0, max) + "..." : text;
}

export default function PlaylistsList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [allPlaylists, setAllPlaylists] = useState<PlaylistItem[]>([]);
    const [visibleCount, setVisibleCount] = useState(20);
    const [loading, setLoading] = useState(true);
    const [likedPlaylists, setLikedPlaylists] = useState<Set<string>>(new Set());
    const [likedFetched, setLikedFetched] = useState<Set<string>>(new Set());
    const sentinelRef = useRef<HTMLDivElement>(null);

    const PAGE_SIZE = 20;

    useEffect(() => {
        (async () => {
            try {
                const data = await fetchWithAuth("playlists");
                if (Array.isArray(data)) {
                    setAllPlaylists(data);
                } else if (data && Array.isArray(data.data)) {
                    setAllPlaylists(data.data);
                } else if (data && Array.isArray(data.playlists)) {
                    setAllPlaylists(data.playlists);
                } else {
                    console.warn("Unexpected playlists response format", data);
                    setAllPlaylists([]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const playlists = allPlaylists.slice(0, visibleCount);
    const hasMore = visibleCount < allPlaylists.length;

    useEffect(() => {
        if (loading || playlists.length === 0) return;
        const ids = playlists.filter(pl => !likedFetched.has(pl.id)).map(pl => pl.id);
        if (ids.length === 0) return;
        (async () => {
            const results = await Promise.allSettled(
                ids.map(id => fetchWithAuth(`playlists/${id}/like-status`))
            );
            const next = new Set(likedFetched);
            const liked = new Set(likedPlaylists);
            results.forEach((res, i) => {
                next.add(ids[i]);
                if (res.status === "fulfilled" && (res.value as any).liked) {
                    liked.add(ids[i]);
                }
            });
            setLikedFetched(next);
            setLikedPlaylists(liked);
        })();
    }, [loading, playlists.length, visibleCount]);

    useEffect(() => {
        if (loading || !sentinelRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMore) {
                    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, allPlaylists.length));
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [loading, hasMore, allPlaylists.length]);

    const handleLikePlaylist = useCallback(async (playlistId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const wasLiked = likedPlaylists.has(playlistId);
        const next = new Set(likedPlaylists);
        if (wasLiked) next.delete(playlistId); else next.add(playlistId);
        setLikedPlaylists(next);
        setAllPlaylists(prev => prev.map(pl =>
            pl.id === playlistId
                ? { ...pl, likesCount: pl.likesCount + (wasLiked ? -1 : 1) }
                : pl
        ));
        try {
            await fetchWithAuth(`playlists/${playlistId}/like`, { method: "POST" });
        } catch {
            setLikedPlaylists(likedPlaylists);
            setAllPlaylists(prev => prev.map(pl =>
                pl.id === playlistId
                    ? { ...pl, likesCount: pl.likesCount + (wasLiked ? 1 : -1) }
                    : pl
            ));
        }
    }, [likedPlaylists]);

    return (
        <div className={styles.page}>
            <div className={styles.layout}>
                <h1>{t("playlist.all")}</h1>
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
                                    <span className={styles.likesCount}>{pl.likesCount}</span>
                                </div>
                            </div>
                        );
                    })}
                    {playlists.length === 0 && !loading && <p className={styles.empty}>{t("playlist.no")}</p>}
                </div>
                {loading && <div className={styles.loader}>Loading...</div>}
                {hasMore && !loading && <div ref={sentinelRef} className={styles.sentinel} />}
            </div>
        </div>
    );
}