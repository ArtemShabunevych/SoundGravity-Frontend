import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import styles from "./track.module.css";
import {useTranslation} from "react-i18next";
import toast from "react-hot-toast";

interface TrackType {
    id: string;
    title?: string;
    description?: string;
    cover: string;
}

export default function Track() {
    const {id} = useParams<{ id: string }>();
    const {t} = useTranslation();

    const [story, setStory] = useState<TrackType | null>(null);

    const apiUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:3000/api/";

    useEffect(() => {
        const fetchTrack = async () => {
            try {
                const token = localStorage.getItem("JWT_TOKEN");
                const accessToken = localStorage.getItem("JWT_ACCESS_TOKEN");

                if (!token || !accessToken) {
                    throw new Error(t("errors.mustBeLoggedIn"));
                }

                const response = await fetch(`${apiUrl}tracks/${id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "x-refresh-token": accessToken,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || t("errors.TrackNotFound"));
                }

                setStory(data);
            } catch (error: any) {
                toast.error(error.message || t("errors.TrackNotFound"));
            }
        };

        if (id) {
            fetchTrack();
        }
    }, [id, t, apiUrl]);

    if (!story) {
        return (
            <div className={styles.loader}>
                Loading...
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.layout}>
                <div className={styles.wrapper}>
                    <div className={styles.text}>

                        <h1>{story.title}</h1>
                        <p>{story.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}