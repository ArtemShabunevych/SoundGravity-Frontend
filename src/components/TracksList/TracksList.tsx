import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchWithAuth } from "../../API/apiClient";
import { PlayerContext } from "../../context/PlayerContext";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import styles from "./tracks-list.module.css";

interface TrackItem {
    id: string;
    title: string;
    genre: string;
    description?: string;
    coverUrl?: string;
    audioUrl?: string;
    duration?: number;
    createdAt: string;
    likesCount: number;
    isLiked?: boolean;
    visibility?: string;
    user?: { username: string };
}

function formatDuration(seconds?: number): string {
    if (seconds == null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TracksList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setQueue } = useContext(PlayerContext);
    const [allTracks, setAllTracks] = useState<TrackItem[]>([]);
    const [visibleCount, setVisibleCount] = useState(20);
    const [loading, setLoading] = useState(true);
    const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
    const [likedFetched, setLikedFetched] = useState<Set<string>>(new Set());
    const sentinelRef = useRef<HTMLDivElement>(null);

    const PAGE_SIZE = 20;

    useEffect(() => {
        (async () => {
            try {
                const data = await fetchWithAuth("tracks");
                setAllTracks(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const tracks = allTracks.slice(0, visibleCount);
    const hasMore = visibleCount < allTracks.length;

    useEffect(() => {
        if (loading || tracks.length === 0) return;
        const ids = tracks.filter(t => !likedFetched.has(t.id)).map(t => t.id);
        if (ids.length === 0) return;
        (async () => {
            const results = await Promise.allSettled(
                ids.map(id => fetchWithAuth(`tracks/${id}/like-status`))
            );
            const next = new Set(likedFetched);
            const liked = new Set(likedTracks);
            results.forEach((res, i) => {
                next.add(ids[i]);
                if (res.status === "fulfilled" && (res.value as any).liked) {
                    liked.add(ids[i]);
                }
            });
            setLikedFetched(next);
            setLikedTracks(liked);
        })();
    }, [loading, tracks.length, visibleCount]);

    useEffect(() => {
        if (loading || !sentinelRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMore) {
                    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, allTracks.length));
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [loading, hasMore, allTracks.length]);

    const handleTrackClick = (track: TrackItem) => {
        const queueTracks = allTracks
            .filter(t => t.audioUrl)
            .map(t => ({
                title: t.title,
                username: t.user?.username,
                coverUrl: t.coverUrl,
                audioUrl: t.audioUrl!,
            }));
        setQueue(queueTracks, track.audioUrl!);
        navigate(`/track/${track.id}`);
    };

    const handleLikeTrack = useCallback(async (trackId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const wasLiked = likedTracks.has(trackId);
        const next = new Set(likedTracks);
        if (wasLiked) next.delete(trackId); else next.add(trackId);
        setLikedTracks(next);
        setAllTracks(prev => prev.map(t =>
            t.id === trackId
                ? { ...t, likesCount: t.likesCount + (wasLiked ? -1 : 1) }
                : t
        ));
        try {
            await fetchWithAuth(`tracks/${trackId}/like`, { method: "POST" });
        } catch {
            setLikedTracks(likedTracks);
            setAllTracks(prev => prev.map(t =>
                t.id === trackId
                    ? { ...t, likesCount: t.likesCount + (wasLiked ? 1 : -1) }
                    : t
            ));
        }
    }, [likedTracks]);

    return (
        <div className={styles.page}>
            <div className={styles.layout}>
                <h1>{t("tracks.all")}</h1>
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
                                onClick={() => handleTrackClick(track)}
                            >
                                <span className={styles.trackIndex}>{index + 1}</span>
                                {track.coverUrl ? (
                                    <img src={track.coverUrl} alt="" className={styles.trackCover} />
                                ) : (
                                    <div className={styles.trackCoverFallback} />
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
                                    <span className={styles.trackLikesCount}>{track.likesCount}</span>
                                </div>
                            </div>
                        );
                    })}
                    {tracks.length === 0 && !loading && (
                        <p className={styles.empty}>{t("tracks.none")}</p>
                    )}
                </div>
                {loading && <div className={styles.loader}>Loading...</div>}
                {hasMore && !loading && <div ref={sentinelRef} className={styles.sentinel} />}
            </div>
        </div>
    );
}