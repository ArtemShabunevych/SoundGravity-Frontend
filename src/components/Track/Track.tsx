import {useCallback, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import styles from "./track.module.css";
import {useTranslation} from "react-i18next";
import toast from "react-hot-toast";
import {fetchWithAuth} from "../../API/apiClient";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import defaultTrackCover from "../../photos/track.png";

interface TrackType {
    id: string;
    title?: string;
    genre?: string;
    description?: string;
    coverUrl?: string;
    audioUrl?: string;
    createdAt?: string;
    likesCount?: number;
    isLiked?: boolean;
    visibility?: string;
    user?: { id: string; username: string };
}

export default function Track() {
    const {id} = useParams<{ id: string }>();
    const {t} = useTranslation();
    const [track, setTrack] = useState<TrackType | null>(null);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

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

    const handleLike = async () => {
        const prevLiked = liked;
        try {
            const res = await fetchWithAuth(`likes/track/${id}`, {method: "POST"});
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

    if (!track) {
        return <div className={styles.loader}>Loading...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.layout}>
                <div className={styles.wrapper}>
                    <div className={styles.coverWrapper}>
                        <img
                            src={track.coverUrl || defaultTrackCover}
                            alt={track.title}
                            className={styles.cover}
                        />
                    </div>
                    <div className={styles.text}>
                        <h1>{track.title}</h1>
                        {track.user && <p className={styles.artist}>{t("track.author")} {track.user.username}</p>}
                        {track.genre && <span className={styles.genre}>{t("track.genre")} {track.genre}</span>}
                        {track.description &&
                            <span className={styles.description}> {t("track.description")} <p>{track.description}</p> </span>}
                        <div className={styles.likeRow}>
                            <button onClick={handleLike} className={styles.likeBtn}>
                                {liked ? (
                                    <FavoriteIcon className={styles.likedIcon} />
                                ) : (
                                    <FavoriteBorderIcon className={styles.notLikedIcon} />
                                )}
                            </button>
                            <span className={styles.likesCount}>{likesCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
