import { useState } from "react";
import styles from "./changeName.module.css";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../API/apiClient";

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
    const [newUsername, setNewUsername] = useState(user?.username || "");
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const handleSave = async () => {
        if (!newUsername.trim()) {
            toast.error(t("errors.EmptyUsername"));
            return;
        }

        try {
            setLoading(true);

            const data = await fetchWithAuth("users/update-username", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newUsername: newUsername.trim() }),
            });

            setUser((prev: any) => ({
                ...prev,
                username: data.username,
            }));

            setIsEditing(false);

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
    };

    if (isEditing) {
        return (
            <div className={styles.wrapper}>
                <input
                    className={styles.input}
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder={t("user.NewUsername")}
                    disabled={loading}
                    autoFocus
                />
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
            </div>
        );
    }

    return (
        <div className={styles.nameWrap}>
            <h1 className={styles.name}>{user.username}</h1>
            <div className={styles.nameOverlay} onClick={() => {
                setNewUsername(user?.username || "");
                setIsEditing(true);
            }}>
                {t("user.ChangeUsername")}
            </div>
        </div>
    );
}
