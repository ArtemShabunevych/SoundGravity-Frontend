import  {useContext, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import styles from "./user.module.css";
import icon from "../../photos/user_icon.png";
import ChangeUsername from "../ChangeName/ChangeName.tsx";
import {useTranslation} from "react-i18next";
import toast from "react-hot-toast";
import {UserContext} from "../../context/UserContext";

export default function UserPage() {
    const {username} = useParams();
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [Tracks, setTracks] = useState([]);

    const { user: currentUser } = useContext(UserContext);

    const isOwner = !username || currentUser?.username === username;

    const fetchUser = async () => {
        try {
            const url = isOwner
                ? `${process.env.VITE_APP_API_URL}users/me`
                : `${process.env.VITE_APP_API_URL}users/username/${username}`;

            let token = null;
            let access_token = null;

            if (isOwner) {
                token = localStorage.getItem("JWT_TOKEN");
                access_token = localStorage.getItem("JWT_ACCESS_TOKEN");

                if (!token || !access_token) {
                    throw new Error(t("errors.NotLoggedIn"));
                }
            }

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    ...(isOwner && {
                        Authorization: `Bearer ${token}`,
                        "x-refresh-token": `${access_token}`,
                    }),
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || t("errors.UserNotFound"));
            }

            setUser(data);
        } catch (error) {
            toast.error(error.message || t("errors.UserNotFound"));
        }
    };

    const fetchTracks = async () => {
        try {
            const url = isOwner
                ? `${process.env.VITE_APP_API_URL}tracks/my-tracks`
                : `${process.env.VITE_APP_API_URL}tracks/user/${username}`;


            let token = null;
            let access_token = null;

            if (isOwner) {
                token = localStorage.getItem("JWT_TOKEN");
                access_token = localStorage.getItem("JWT_ACCESS_TOKEN");

                if (!token || !access_token) {
                    throw new Error(t("errors.NotLoggedIn"));
                }
            }

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    ...(isOwner && {
                        Authorization: `Bearer ${token}`,
                        "x-refresh-token": access_token,
                    }),
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || t("errors.StoriesNotFound"));
            }

            const TracksArray = data.tracks || data || [];
            setTracks(TracksArray);
        } catch (error) {
            toast.error(error.message || t("errors.StoriesNotFound"));
        }
    };

    useEffect(() => {
        if (!username && !currentUser) return;

        fetchUser();
        fetchTracks();
    }, [username, currentUser]);

    return (
        <div className={styles.userContent}>
            <div className={styles.userBlock}>
                <div className={styles.leftSide}>
                    <img src={icon} alt={t("user.AvatarAlt")} className={styles.avatar} />

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



                        </>
                    )}
                </div>
            </div>
        </div>
    );
}