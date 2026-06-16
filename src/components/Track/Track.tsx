import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./track.module.css";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../API/apiClient";

interface TrackType {
    id: string;
    title?: string;
    genre?: string;
    description?: string;
    coverUrl?: string;
    audioUrl?: string;
    createdAt?: string;
    likesCount?: number;
    visibility?: string;
    user?: { id: string; username: string };
}

export default function Track() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const [track, setTrack] = useState<TrackType | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchTrack = async () => {
            try {
                const data = await fetchWithAuth(`tracks/${id}`);
                setTrack(data);
            } catch (error: any) {
                toast.error(error.message || t("errors.TrackNotFound"));
            }
        };
        fetchTrack();
    }, [id, t]);

    if (!track) {
        return <div className={styles.loader}>Loading...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.layout}>
                <div className={styles.wrapper}>
                    <div className={styles.coverWrapper}>
                        {track.coverUrl ? (
                            <img src={track.coverUrl} alt={track.title} className={styles.cover} />
                        ) : (
                            <div className={styles.placeholderCover}>
                                <i className="bx bx-music"></i>
                            </div>
                        )}
                    </div>
                    <div className={styles.text}>
                        <h1>{track.title}</h1>
                        {track.user && <p className={styles.artist}>{track.user.username}</p>}
                        {track.genre && <span className={styles.genre}>{track.genre}</span>}
                        {track.description && <p>{track.description}</p>}
                        {track.likesCount !== undefined && <p>❤️ {track.likesCount}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}