import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchWithAuth } from "../../API/apiClient";
import { FileUploadProgressBar, type UploadedFile } from "../FileUpload/FileUploadProgressBar";
import toast from "react-hot-toast";
import styles from "./create-playlist.module.css";

const GENRES = [
  "rock", "pop", "jazz", "electronic", "hiphop",
  "classical", "rnb", "folk", "metal", "blues", "reggae", "country", "other"
];

export default function CreatePlaylist() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private">("public");
    const [coverFiles, setCoverFiles] = useState<UploadedFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadCover = (file: File, playlistId: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("cover", file);
            const xhr = new XMLHttpRequest();
            const base = (import.meta.env.VITE_APP_API_URL || "http://localhost:3000/api/").replace(/\/+$/, "");
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    setUploadProgress(Math.round((e.loaded / e.total) * 100));
                }
            };
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve();
                else reject(new Error(`Upload failed: ${xhr.statusText}`));
            };
            xhr.onerror = () => reject(new Error("Upload failed"));
            xhr.open("PATCH", `${base}/playlists/${playlistId}/cover`);
            xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("JWT_TOKEN")}`);
            xhr.setRequestHeader("x-refresh-token", localStorage.getItem("JWT_ACCESS_TOKEN") || "");
            xhr.send(formData);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }
        if (!genre) {
            toast.error("Genre is required");
            return;
        }

        try {
            setLoading(true);
            setUploadProgress(0);

            const data = await fetchWithAuth("playlists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    genre,
                }),
            });

            const playlistId = data.id;

            if (coverFiles[0]?.fileObject) {
                try {
                    await uploadCover(coverFiles[0].fileObject, playlistId);
                } catch {
                    toast.error("Failed to upload cover image");
                }
            }

            toast.success(t("create.playlistCreated"));
            navigate(`/playlist/${playlistId}`);
        } catch (err: any) {
            if (err.message === "Session expired") {
                toast.error("Session expired");
                return;
            }
            toast.error(err.message || "Failed to create playlist");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>{t("create.createPlaylist")}</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                    <label className={styles.label}>{t("create.name")}</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("create.name")}
                        className={styles.input}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>{t("create.description")}</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t("create.description")}
                        rows={4}
                        className={styles.textarea}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>{t("create.selectGenres")}</label>
                    <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className={styles.input}
                        style={{ cursor: "pointer", appearance: "auto" }}
                    >
                        <option value="">{t("create.selectGenres")}</option>
                        {GENRES.map((g) => (
                            <option key={g} value={g}>{t(`genres.${g}`)}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>{t("create.visibility")}</label>
                    <div className={styles.radioGroup}>
                        <label className={styles.radio}>
                            <input
                                type="radio"
                                name="visibility"
                                value="public"
                                checked={visibility === "public"}
                                onChange={() => setVisibility("public")}
                            />
                            {t("create.public")}
                        </label>
                        <label className={styles.radio}>
                            <input
                                type="radio"
                                name="visibility"
                                value="private"
                                checked={visibility === "private"}
                                onChange={() => setVisibility("private")}
                            />
                            {t("create.private")}
                        </label>
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>{t("create.coverImage")}</label>
                    <FileUploadProgressBar
                        accept="image/*"
                        label="cover"
                        files={coverFiles}
                        onFilesChange={setCoverFiles}
                    />
                </div>

                {loading && (
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
                        <span className={styles.progressText}>{uploadProgress}%</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !name.trim() || !genre}
                    className={styles.submit}
                >
                    {loading ? `${t("create.uploading")} ${uploadProgress > 0 ? `${uploadProgress}%` : ""}` : t("create.createPlaylist")}
                </button>
            </form>
        </div>
    );
}
