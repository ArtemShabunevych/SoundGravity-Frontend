import { useContext, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./user.module.css";
import icon from "../../photos/user_icon.png";
import defaultTrackCover from "../../photos/track.png";
import defaultPlaylistCover from "../../photos/playlist.png";
import ChangeUsername from "../ChangeName/ChangeName.tsx";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../API/apiClient";
import { UserContext } from "../../context/UserContext";
import StarBackground from "../StarBackground/StarBackground";

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

type Tab = "tracks" | "playlists";

export default function UserPage() {
    const { username } = useParams();
    const { t } = useTranslation();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [tracks, setTracks] = useState<any[]>([]);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>("tracks");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);
    const [hoveredPlaylistId, setHoveredPlaylistId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { user: currentUser, fetchUser: fetchUserContext } = useContext(UserContext);

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

    useEffect(() => {
        if (!isOwner) return;
        if (!user) return;
    }, [user, isOwner]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingAvatar(true);
            const formData = new FormData();
            formData.append("avatar", file);

            await fetchWithAuth("users/avatar", {
                method: "PATCH",
                body: formData,
            });

            await fetchUserContext();
            toast.success("Avatar updated");
        } catch (err: any) {
            toast.error(err.message || "Failed to update avatar");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleDeleteTrack = async (trackId: string) => {
        try {
            await fetchWithAuth(`tracks/${trackId}`, { method: "DELETE" });
            setTracks(prev => prev.filter((t: any) => t.id !== trackId));
            toast.success("Track deleted");
        } catch (err: any) {
            toast.error(err.message || "Failed to delete track");
        }
    };

    const handleToggleTrackVisibility = async (trackId: string, currentVisibility: string) => {
        const newVisibility = currentVisibility === "private" ? "public" : "private";
        try {
            await fetchWithAuth(`tracks/${trackId}/visibility`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newVisibility }),
            });
            setTracks(prev => prev.map((t: any) =>
                t.id === trackId ? { ...t, visibility: newVisibility } : t
            ));
            toast.success(`Track is now ${newVisibility}`);
        } catch (err: any) {
            toast.error(err.message || "Failed to update visibility");
        }
    };

    const handleDeletePlaylist = async (playlistId: string) => {
        try {
            await fetchWithAuth(`playlists/${playlistId}`, { method: "DELETE" });
            setPlaylists(prev => prev.filter((p: any) => p.id !== playlistId));
            toast.success("Playlist deleted");
        } catch (err: any) {
            toast.error(err.message || "Failed to delete playlist");
        }
    };

    const handleTogglePlaylistVisibility = async (playlistId: string, currentVisibility: string) => {
        const newVisibility = currentVisibility === "private" ? "public" : "private";
        try {
            await fetchWithAuth(`playlists/${playlistId}/visibility`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newVisibility }),
            });
            setPlaylists(prev => prev.map((p: any) =>
                p.id === playlistId ? { ...p, visibility: newVisibility } : p
            ));
            toast.success(`Playlist is now ${newVisibility}`);
        } catch (err: any) {
            toast.error(err.message || "Failed to update visibility");
        }
    };

    const publicTracks = tracks.filter((t: any) => t.visibility === "public" || !t.visibility);
    const privateTracks = tracks.filter((t: any) => t.visibility === "private");
    const publicPlaylists = playlists.filter((p: any) => p.visibility === "public" || !p.visibility);
    const privatePlaylists = playlists.filter((p: any) => p.visibility === "private");

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <StarBackground bgColor="#05060d" contained />
                <div className={styles.heroContent}>
                    <div className={styles.avatarWrap}>
                        <label className={styles.avatarLabel}>
                            <img
                                src={`${user?.avatarUrl || icon}${user?.avatarUrl ? `?t=${Date.now()}` : ""}`}
                                alt={t("user.AvatarAlt")}
                                className={styles.avatar}
                            />
                            {isOwner && user && (
                                <div className={styles.avatarOverlay}>
                                    {uploadingAvatar ? "..." : t("user.ChangeAvatar")}
                                </div>
                            )}
                            {isOwner && (
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    hidden
                                />
                            )}
                        </label>
                    </div>
                    {user && (
                        <div className={styles.heroInfo}>
                            {isOwner ? (
                                <ChangeUsername user={user} setUser={setUser} />
                            ) : (
                                <h1 className={styles.name}>{user.username}</h1>
                            )}
                            <span className={styles.joinBadge}>
                                {t("user.RegisteredAt")}{" "}
                                {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.body}>
                <div className={styles.statsRow}>
                    <div className={styles.stat}>
                        <span className={styles.statNum}>{tracks.length}</span>
                        <span className={styles.statLabel}>{t("user.Tracks")}</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statNum}>{playlists.length}</span>
                        <span className={styles.statLabel}>{t("user.Playlists")}</span>
                    </div>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === "tracks" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("tracks")}
                    >
                        {t("user.Tracks")}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === "playlists" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("playlists")}
                    >
                        {t("user.Playlists")}
                    </button>
                </div>

                {activeTab === "tracks" && (
                    <div className={styles.contentGrid}>
                        {[...publicTracks, ...privateTracks].map((track: any) => (
                            <div
                                key={track.id}
                                className={styles.cardWrap}
                                onMouseEnter={() => setHoveredTrackId(track.id)}
                                onMouseLeave={() => setHoveredTrackId(null)}
                            >
                                <Link to={`/track/${track.id}`} className={styles.card}>
                                    <div className={styles.cardCover}>
                                        <img src={track.coverUrl || defaultTrackCover} alt={track.title} />
                                    </div>
                                    <div className={styles.cardBody}>
                                        <h4 className={styles.cardTitle}>{track.title}</h4>
                                    </div>
                                </Link>
                                {isOwner && hoveredTrackId === track.id && (
                                    <div className={styles.cardActions}>
                                        <button
                                            className={styles.cardActionBtn}
                                            onClick={() => handleToggleTrackVisibility(track.id, track.visibility)}
                                        >
                                            {track.visibility === "private" ? "Public" : "Private"}
                                        </button>
                                        <button
                                            className={`${styles.cardActionBtn} ${styles.cardActionDanger}`}
                                            onClick={() => handleDeleteTrack(track.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {tracks.length === 0 && (
                            <p className={styles.emptyState}>{t("user.NoTracks")}</p>
                        )}
                    </div>
                )}

                {activeTab === "playlists" && (
                    <div className={styles.contentGrid}>
                        {[...publicPlaylists, ...privatePlaylists].map((pl: any) => (
                            <div
                                key={pl.id}
                                className={styles.cardWrap}
                                onMouseEnter={() => setHoveredPlaylistId(pl.id)}
                                onMouseLeave={() => setHoveredPlaylistId(null)}
                            >
                                <Link to={`/playlist/${pl.id}`} key={pl.id} className={styles.card}>
                                    <div className={styles.cardCover}>
                                        <img src={pl.coverUrl || defaultPlaylistCover} alt={pl.name} />
                                    </div>
                                    <div className={styles.cardBody}>
                                        <h4 className={styles.cardTitle}>{pl.name}</h4>
                                    </div>
                                </Link>
                                {isOwner && hoveredPlaylistId === pl.id && (
                                    <div className={styles.cardActions}>
                                        <button
                                            className={styles.cardActionBtn}
                                            onClick={() => handleTogglePlaylistVisibility(pl.id, pl.visibility)}
                                        >
                                            {pl.visibility === "private" ? "Public" : "Private"}
                                        </button>
                                        <button
                                            className={`${styles.cardActionBtn} ${styles.cardActionDanger}`}
                                            onClick={() => handleDeletePlaylist(pl.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {playlists.length === 0 && (
                            <p className={styles.emptyState}>{t("user.NoPlaylists")}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
