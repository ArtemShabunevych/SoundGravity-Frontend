import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./settings.module.css";

export default function SettingsPage() {
    const { t } = useTranslation();
    const [cursorEnabled, setCursorEnabled] = useState(
        localStorage.getItem("cursor_enabled") !== "false"
    );

    const toggleCursor = () => {
        const next = !cursorEnabled;
        setCursorEnabled(next);
        localStorage.setItem("cursor_enabled", String(next));
        window.location.reload();
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>{t("settings.settings")}</h1>

            <div className={styles.card}>
                <div className={styles.row}>
                    <div>
                        <div className={styles.label}>{t("settings.custom")}</div>
                        <div className={styles.status}>{cursorEnabled ? t("settings.enabled") : t("settings.disabled")}</div>
                    </div>
                    <button
                        onClick={toggleCursor}
                        className={`${styles.toggle} ${cursorEnabled ? styles.toggleOn : styles.toggleOff}`}
                    >
                        <div className={styles.toggleDot} style={{ left: cursorEnabled ? 24 : 2 }} />
                    </button>
                </div>
            </div>
        </div>
    );
}
