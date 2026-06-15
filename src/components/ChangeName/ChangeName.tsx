import { useState } from "react";
import styles from "./changeName.module.css";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

interface UserType {
    username: string;
    [key: string]: any;
}

interface ChangeUsernameProps {
    user: UserType;
    setUser: React.Dispatch<React.SetStateAction<any>>;
}

export default function ChangeUsername({ user, setUser }: ChangeUsernameProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [newUsername, setNewUsername] = useState(user?.username || "");
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const apiUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:5000/api/";

    const handleSave = async () => {
        if (!newUsername.trim()) {
            toast.error(t("errors.EmptyUsername"));
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("JWT_TOKEN");
            const accessToken = localStorage.getItem("JWT_ACCESS_TOKEN");

            if (!token || !accessToken) {
                throw new Error(t("errors.mustBeLoggedIn"));
            }

            const response = await fetch(
                `${apiUrl}users/update-username`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        "x-refresh-token": accessToken,
                    },
                    body: JSON.stringify({
                        newUsername: newUsername.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || t("errors.FailedToUpdateUsername"));
            }

            setUser((prev: any) => ({
                ...prev,
                username: data.username,
            }));

            setIsEditing(false);
            setShowActions(false);

            toast.success(t("user.UsernameUpdated"));
        } catch (error: any) {
            toast.error(error.message || t("errors.FailedToUpdateUsername"));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setNewUsername(user?.username || "");
        setIsEditing(false);
        setShowActions(false);
    };

    return (
        <div className={styles.wrapper}>
            {!isEditing ? (
                <button
                    className={styles.changeButton}
                    onClick={() => {
                        setNewUsername(user?.username || "");
                        setIsEditing(true);
                        setShowActions(true);
                    }}
                >
                    {t("user.ChangeUsername")}
                </button>
            ) : (
                <>
                    <input
                        className={styles.input}
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder={t("user.NewUsername")}
                        disabled={loading}
                    />

                    {showActions && (
                        <div className={styles.actions}>
                            <button
                                className={styles.saveButton}
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? t("common.Saving") : t("common.Save")}
                            </button>

                            <button
                                className={styles.cancelButton}
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                {t("common.Cancel")}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}