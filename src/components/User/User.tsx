import { useContext, useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import styles from "./user.module.css";
import icon from "../../photos/user_icon.png";

import ChangeUsername from "../ChangeName/ChangeName.tsx";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../API/apiClient";
import { UserContext } from "../../context/UserContext";
import { PlayerContext } from "../../context/PlayerContext";
import StarBackground from "../StarBackground/StarBackground";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';

const formatDuration = (seconds?: number): string => {
    if (seconds == null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
};

const truncate = (str: string, max: number): string =>
    str.length > max ? str.slice(0, max) + "…" : str;

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
    const [editingDescription, setEditingDescription] = useState(false);
    const [descriptionText, setDescriptionText] = useState("");
    const [savingDescription, setSavingDescription] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { user: currentUser, fetchUser: fetchUserContext } = useContext(UserContext);
    const { setQueue } = useContext(PlayerContext);
    const navigate = useNavigate();
    const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
    const [likedPlaylists, setLikedPlaylists] = useState<Set<string>>(new Set());

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

    const fetchLikeStatuses = async (items: any[], type: "tracks" | "playlists") => {
        const results = await Promise.allSettled(
            items.map((item: any) =>
                fetchWithAuth(`${type}/${item.id}/like-status`, { method: "GET" })
                    .then((res: any) => ({ id: item.id, liked: res.liked }))
            )
        );
        const liked = new Set<string>();
        results.forEach((r) => {
            if (r.status === "fulfilled" && r.value.liked) liked.add(r.value.id);
        });
        if (type === "tracks") setLikedTracks(liked);
        else setLikedPlaylists(liked);
    };

    const handleLikeTrack = async (trackId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const wasLiked = likedTracks.has(trackId);
        const next = new Set(likedTracks);
        if (wasLiked) next.delete(trackId); else next.add(trackId);
        setLikedTracks(next);
        setTracks(prev => prev.map((t: any) =>
            t.id === trackId ? { ...t, likesCount: t.likesCount + (wasLiked ? -1 : 1) } : t
        ));
        try {
            await fetchWithAuth(`tracks/${trackId}/like`, { method: "POST" });
        } catch {
            setLikedTracks(likedTracks);
            setTracks(prev => prev.map((t: any) =>
                t.id === trackId ? { ...t, likesCount: t.likesCount + (wasLiked ? 1 : -1) } : t
            ));
        }
    };

    const handleLikePlaylist = async (playlistId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const wasLiked = likedPlaylists.has(playlistId);
        const next = new Set(likedPlaylists);
        if (wasLiked) next.delete(playlistId); else next.add(playlistId);
        setLikedPlaylists(next);
        setPlaylists(prev => prev.map((p: any) =>
            p.id === playlistId ? { ...p, likesCount: p.likesCount + (wasLiked ? -1 : 1) } : p
        ));
        try {
            await fetchWithAuth(`playlists/${playlistId}/like`, { method: "POST" });
        } catch {
            setLikedPlaylists(likedPlaylists);
            setPlaylists(prev => prev.map((p: any) =>
                p.id === playlistId ? { ...p, likesCount: p.likesCount + (wasLiked ? 1 : -1) } : p
            ));
        }
    };

    const handleTrackClick = (track: any) => {
        setQueue(tracks, track.audioUrl);
        navigate(`/track/${track.id}`);
    };

    const handlePlaylistClick = (pl: any) => {
        navigate(`/playlist/${pl.id}`);
    };

    useEffect(() => {
        if (!username && !currentUser) return;
        fetchUser();
        fetchTracks();
        fetchPlaylists();
    }, [username, currentUser]);

    useEffect(() => {
        if (tracks.length > 0) fetchLikeStatuses(tracks, "tracks");
    }, [tracks.length]);

    useEffect(() => {
        if (playlists.length > 0) fetchLikeStatuses(playlists, "playlists");
    }, [playlists.length]);

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

    const handleSaveDescription = async () => {
        if (!descriptionText.trim()) {
            toast.error("Description cannot be empty");
            return;
        }
        if (descriptionText.trim().length < 20) {
            toast.error("Description must be at least 20 characters");
            return;
        }
        try {
            setSavingDescription(true);
            const data = await fetchWithAuth("users/description", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newDescription: descriptionText.trim() }),
            });
            setUser((prev: any) => ({ ...prev, description: data.description }));
            setEditingDescription(false);
            toast.success("Description updated");
        } catch (err: any) {
            toast.error(err.message || "Failed to update description");
        } finally {
            setSavingDescription(false);
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
                            {user.description && !editingDescription && (
                                <div className={styles.descWrap}>
                                    <p className={styles.description}>{user.description}</p>
                                    {isOwner && (
                                        <div className={styles.descOverlay} onClick={() => {
                                            setDescriptionText(user.description || "");
                                            setEditingDescription(true);
                                        }}>
                                            {t("user.ChangeDescription")}
                                        </div>
                                    )}
                                </div>
                            )}
                            {!user.description && isOwner && !editingDescription && (
                                <button
                                    className={styles.descAddBtn}
                                    onClick={() => {
                                        setDescriptionText("");
                                        setEditingDescription(true);
                                    }}
                                >
                                    {t("user.AddDescription")}
                                </button>
                            )}
                            {isOwner && editingDescription && (
                                <div className={styles.descEditWrap}>
                                    <textarea
                                        className={styles.descInput}
                                        value={descriptionText}
                                        onChange={e => setDescriptionText(e.target.value)}
                                        rows={3}
                                        disabled={savingDescription}
                                        autoFocus
                                    />
                                    <div className={styles.descActions}>
                                        <button
                                            className={styles.descSaveBtn}
                                            onClick={handleSaveDescription}
                                            disabled={savingDescription}
                                        >
                                            {savingDescription ? t("common.Saving") : t("common.Save")}
                                        </button>
                                        <button
                                            className={styles.descCancelBtn}
                                            onClick={() => setEditingDescription(false)}
                                            disabled={savingDescription}
                                        >
                                            {t("common.Cancel")}
                                        </button>
                                    </div>
                                </div>
                            )}
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
                    <div>
                        <div className={`${styles.listHeader} ${styles.listHeaderTracks}`}>
                            <span className={styles.listRowIndex}>#</span>
                            <span />
                            <span>{t("create.title")}</span>
                            <span className={styles.listColRight}>{t("playlist.duration")}</span>
                            <span className={styles.listColCenter}>{t("playlist.likesCount")}</span>
                            {isOwner && <span className={styles.listColCenter}>{t("user.Actions")}</span>}
                        </div>
                        {[...publicTracks, ...privateTracks].map((track: any, index: number) => {
                            const duration = formatDuration(track.duration);
                            const liked = likedTracks.has(track.id);
                            return (
                                <div
                                    key={track.id}
                                    className={`${styles.listRow} ${styles.listRowTracks}`}
                                    onClick={() => handleTrackClick(track)}
                                >
                                    <span className={styles.listRowIndex}>{index + 1}</span>
                                    {track.coverUrl ? (
                                        <img src={track.coverUrl} alt="" className={styles.listRowCover} />
                                    ) : (
                                        <div className={styles.listRowCoverFallback} />
                                    )}
                                    <div className={styles.listRowInfo}>
                                        <Link
                                            to={`/track/${track.id}`}
                                            className={styles.listRowTitle}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            {track.title}
                                        </Link>
                                        {track.user?.username && (
                                            <Link
                                                to={`/user/${track.user.username}`}
                                                className={styles.listRowArtist}
                                                onClick={e => e.stopPropagation()}
                                            >
                                                {track.user.username}
                                            </Link>
                                        )}
                                    </div>
                                    <span className={styles.listRowDuration}>{duration}</span>
                                    <div className={styles.listRowLikes}>
                                        <button
                                            className={styles.listRowLikeBtn}
                                            onClick={e => handleLikeTrack(track.id, e)}
                                        >
                                            {liked ? (
                                                <FavoriteIcon className={styles.likedIcon} />
                                            ) : (
                                                <FavoriteBorderIcon className={styles.notLikedIcon} />
                                            )}
                                        </button>
                                        <span className={styles.listRowLikesCount}>{track.likesCount}</span>
                                    </div>
                                    {isOwner && (
                                        <div className={styles.listRowActions}>
                                            <button
                                                className={styles.listRowIconBtn}
                                                onClick={e => { e.stopPropagation(); handleToggleTrackVisibility(track.id, track.visibility); }}
                                                title={track.visibility === "private" ? t("user.MakePublic") : t("user.MakePrivate")}
                                            >
                                                {track.visibility === "private" ? (
                                                    <VisibilityOffIcon className={styles.listRowIconPrivate} />
                                                ) : (
                                                    <VisibilityIcon className={styles.listRowIconPublic} />
                                                )}
                                            </button>
                                            <button
                                                className={styles.listRowIconBtn}
                                                onClick={e => { e.stopPropagation(); handleDeleteTrack(track.id); }}
                                                title={t("user.Delete")}
                                            >
                                                <DeleteIcon className={styles.listRowIconDanger} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {tracks.length === 0 && (
                            <p className={styles.emptyState}>{t("user.NoTracks")}</p>
                        )}
                    </div>
                )}

                {activeTab === "playlists" && (
                    <div>
                        <div className={`${styles.listHeader} ${styles.listHeaderPlaylists}`}>
                            <span className={styles.listRowIndex}>#</span>
                            <span />
                            <span>{t("create.title")}</span>
                            <span className={styles.listColLeft}>{t("playlist.tracksCount")}</span>
                            <span className={styles.listColCenter}>{t("playlist.likesCount")}</span>
                            {isOwner && <span className={styles.listColCenter}>{t("user.Actions")}</span>}
                        </div>
                        {[...publicPlaylists, ...privatePlaylists].map((pl: any, index: number) => {
                            const liked = likedPlaylists.has(pl.id);
                            const trackList = pl.tracks || [];
                            const visibleTracks = trackList.slice(0, 3);
                            const hasMoreTracks = trackList.length > 3;
                            return (
                                <div
                                    key={pl.id}
                                    className={`${styles.listRow} ${styles.listRowPlaylists}`}
                                    onClick={() => handlePlaylistClick(pl)}
                                >
                                    <span className={styles.listRowIndex}>{index + 1}</span>
                                    {pl.coverUrl ? (
                                        <img src={pl.coverUrl} alt="" className={styles.listRowCover} />
                                    ) : (
                                        <div className={styles.listRowCoverFallback} />
                                    )}
                                    <div className={styles.listRowInfo}>
                                        <Link
                                            to={`/playlist/${pl.id}`}
                                            className={styles.listRowPlaylistName}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            {pl.name}
                                        </Link>
                                        {pl.user?.username && (
                                            <Link
                                                to={`/user/${pl.user.username}`}
                                                className={styles.listRowArtist}
                                                onClick={e => e.stopPropagation()}
                                            >
                                                {pl.user.username}
                                            </Link>
                                        )}
                                    </div>
                                    <div className={styles.listRowTrackNames}>
                                        {visibleTracks.map((track: any, i: number) => (
                                            <Link
                                                key={i}
                                                to={`/track/${track.id}`}
                                                className={styles.listRowTrackNameLink}
                                                onClick={e => e.stopPropagation()}
                                            >
                                                {truncate(track.title, 15)}
                                            </Link>
                                        ))}
                                        {hasMoreTracks && <span className={styles.listRowMoreTracks}>...</span>}
                                    </div>
                                    <div className={styles.listRowLikes}>
                                        <button
                                            className={styles.listRowLikeBtn}
                                            onClick={e => handleLikePlaylist(pl.id, e)}
                                        >
                                            {liked ? (
                                                <FavoriteIcon className={styles.likedIcon} />
                                            ) : (
                                                <FavoriteBorderIcon className={styles.notLikedIcon} />
                                            )}
                                        </button>
                                        <span className={styles.listRowLikesCount}>{pl.likesCount}</span>
                                    </div>
                                    {isOwner && (
                                        <div className={styles.listRowActions}>
                                            <button
                                                className={styles.listRowIconBtn}
                                                onClick={e => { e.stopPropagation(); handleTogglePlaylistVisibility(pl.id, pl.visibility); }}
                                                title={pl.visibility === "private" ? t("user.MakePublic") : t("user.MakePrivate")}
                                            >
                                                {pl.visibility === "private" ? (
                                                    <VisibilityOffIcon className={styles.listRowIconPrivate} />
                                                ) : (
                                                    <VisibilityIcon className={styles.listRowIconPublic} />
                                                )}
                                            </button>
                                            <button
                                                className={styles.listRowIconBtn}
                                                onClick={e => { e.stopPropagation(); handleDeletePlaylist(pl.id); }}
                                                title={t("user.Delete")}
                                            >
                                                <DeleteIcon className={styles.listRowIconDanger} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {playlists.length === 0 && (
                            <p className={styles.emptyState}>{t("user.NoPlaylists")}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
