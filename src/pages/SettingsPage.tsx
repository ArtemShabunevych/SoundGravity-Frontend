import { useState } from "react";
import { useTranslation } from "react-i18next";

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
        <div style={{ padding: "120px 48px 48px", maxWidth: 600, margin: "0 auto" }}>
            <h1 style={{ color: "var(--text-main)", fontFamily: "var(--title-font)", fontSize: 28, marginBottom: 32 }}>
                Settings
            </h1>

            <div style={{
                background: "var(--white-dark)",
                borderRadius: 16,
                border: "1px solid var(--input-bg)",
                overflow: "hidden",
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                }}>
                    <div>
                        <div style={{ fontWeight: 600, color: "var(--text-main)", fontFamily: "var(--main-font)", fontSize: 15 }}>
                            Custom cursor
                        </div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--main-font)", marginTop: 2 }}>
                            {cursorEnabled ? "Enabled" : "Disabled"}
                        </div>
                    </div>
                    <button
                        onClick={toggleCursor}
                        style={{
                            width: 48,
                            height: 26,
                            borderRadius: 13,
                            border: "none",
                            background: cursorEnabled ? "var(--main-color)" : "var(--input-bg)",
                            cursor: "pointer",
                            position: "relative",
                            transition: "background 0.2s",
                        }}
                    >
                        <div style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "#fff",
                            position: "absolute",
                            top: 2,
                            left: cursorEnabled ? 24 : 2,
                            transition: "left 0.2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }} />
                    </button>
                </div>
            </div>
        </div>
    );
}
