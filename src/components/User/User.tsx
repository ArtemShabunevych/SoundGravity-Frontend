import  {useContext, useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";
import styles from "./user.module.css";
import icon from "../../photos/user_icon.png";
import ChangeUsername from "../ChangeName/ChangeName.tsx";
import {useTranslation} from "react-i18next";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../API/apiClient";
import {UserContext} from "../../context/UserContext";

interface UserProfile {
    id: string;
    username: string;
    email?: string;
    avatarUrl?: string;
    description?: string;
    createdAt: string;
    tracks?: any[];
    playlists?: any[];
}

export default function UserPage() {
    const {username} = useParams();
    const { t } = useTranslation();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [tracks, setTracks] = useState<any[]>([]);
    const [playlists, setPlaylists] = useState<any[]>([]);

    const { user: currentUser, token } = useContext(UserContext);

    const isOwner = !username || currentUser?.username === username;

    const getPublicApiUrl = () => {
        let url = import.meta.env.VITE_APP_API_URL || "http://localhost:3000/api/";
        if (!url.endsWith("/api/")) {
            url = url.endsWith("/") ? `${url}api/` : `${url}/api/`;
        }
        return url;
    };

    const fetchUser = async () => {
        try {
            let data;
            if (isOwner) {
                data = await fetchWithAuth("users/me");
            } else {
                const res = await fetch(`${getPublicApiUrl()}users/username/${username}`);
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.message || t("errors.UserNotFound"));
                }
                data = await res.json();
            }
            setUser(data);
        } catch (error: any) {
            toast.error(error.message || t("errors.UserNotFound"));
        }
    };

    const fetchTracks = async () => {
        try {
            let data;
            if (isOwner) {
                data = await fetchWithAuth("tracks/my-tracks");
            } else {
                const res = await fetch(`${getPublicApiUrl()}tracks/user/${username}`);
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.message || t("errors.TracksNotFound"));
                }
                data = await res.json();
            }
            const tracksArray = Array.isArray(data) ? data : data.tracks || [];
            setTracks(tracksArray);
        } catch (error: any) {
            console.error(error);
        }
    };

    const fetchPlaylists = async () => {
        try {
            let data;
            if (isOwner) {
                data = await fetchWithAuth("playlists/my-playlists");
            } else {
                const res = await fetch(`${getPublicApiUrl()}playlists/user/${username}`);
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.message || t("errors.PlaylistsNotFound"));
                }
                data = await res.json();
            }
            const playlistsArray = Array.isArray(data) ? data : data.playlists || [];
            setPlaylists(playlistsArray);
        } catch (error: any) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!username && !currentUser) return;
        fetchUser();
        fetchTracks();
        fetchPlaylists();
    }, [username, currentUser]);

    const publicTracks = tracks.filter((t: any) => t.visibility === "public" || !t.visibility);
    const privateTracks = tracks.filter((t: any) => t.visibility === "private");
    const publicPlaylists = playlists.filter((p: any) => p.visibility === "public" || !p.visibility);
    const privatePlaylists = playlists.filter((p: any) => p.visibility === "private");

    return (
        <div className={styles.userContent}>
            <div className={styles.userBlock}>
                <div className={styles.leftSide}>
                    <img
                        src={user?.avatarUrl || icon}
                        alt={t("user.AvatarAlt")}
                        className={styles.avatar}
                    />

                    {isOwner && user && (
                        <ChangeUsername user={user} setUser={setUser} />
                    )}
                </div>

                <div className={styles.rightSide}>
                    {user && (
                        <>
                            <h2 className={styles.name}>{user.username}</h2>

                            <p className={styles.createdAt}>
                                {t("user.RegisteredAt")}{" "}
                                {new Date(user.createdAt).toLocaleDateString()}
                            </p>

                            <div className={styles.stats}>
                                <div className={styles.statCard}>
                                    <span className={styles.statNumber}>{tracks.length}</span>
                                    <span className={styles.statLabel}>{t("user.Stories")}</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statNumber}>{playlists.length}</span>
                                    <span className={styles.statLabel}>{t("user.Playlists")}</span>
                                </div>
                            </div>

                            <div className={styles.sections}>
                                <div className={styles.section}>
                                    <h3>{t("user.Public")} {t("user.Stories")} ({publicTracks.length})</h3>
                                    <div className={styles.itemList}>
                                        {publicTracks.map((track: any) => (
                                            <Link to={`/track/${track.id}`} key={track.id} className={styles.item}>
                                                {track.title}
                                            </Link>
                                        ))}
                                        {publicTracks.length === 0 && <p className={styles.emptyText}>-</p>}
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <h3>{t("user.Private")} {t("user.Stories")} ({privateTracks.length})</h3>
                                    <div className={styles.itemList}>
                                        {privateTracks.map((track: any) => (
                                            <Link to={`/track/${track.id}`} key={track.id} className={styles.item}>
                                                {track.title}
                                            </Link>
                                        ))}
                                        {privateTracks.length === 0 && <p className={styles.emptyText}>-</p>}
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <h3>{t("user.Public")} {t("user.Playlists")} ({publicPlaylists.length})</h3>
                                    <div className={styles.itemList}>
                                        {publicPlaylists.map((pl: any) => (
                                            <Link to={`/playlist/${pl.id}`} key={pl.id} className={styles.item}>
                                                {pl.name}
                                            </Link>
                                        ))}
                                        {publicPlaylists.length === 0 && <p className={styles.emptyText}>-</p>}
                                    </div>
                                </div>

                                <div className={styles.section}>
                                    <h3>{t("user.Private")} {t("user.Playlists")} ({privatePlaylists.length})</h3>
                                    <div className={styles.itemList}>
                                        {privatePlaylists.map((pl: any) => (
                                            <Link to={`/playlist/${pl.id}`} key={pl.id} className={styles.item}>
                                                {pl.name}
                                            </Link>
                                        ))}
                                        {privatePlaylists.length === 0 && <p className={styles.emptyText}>-</p>}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}