import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileUploadProgressBar, type UploadedFile } from "../FileUpload/FileUploadProgressBar";
import toast from "react-hot-toast";
import styles from "./create-track.module.css";

const GENRES = [
  "rock", "pop", "jazz", "electronic", "hiphop",
  "classical", "rnb", "folk", "metal", "blues", "reggae", "country", "other"
];

const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem("JWT_TOKEN");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || payload.sub || null;
  } catch {
    return null;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function CreateTrack() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
    const [coverFiles, setCoverFiles] = useState<UploadedFile[]>([]);
    const [audioFiles, setAudioFiles] = useState<UploadedFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (audioFiles.length === 0 || !audioFiles[0]?.fileObject) {
            toast.error("Audio file is required");
            return;
        }
        if (coverFiles.length === 0 || !coverFiles[0]?.fileObject) {
            toast.error("Cover image is required");
            return;
        }

        const userId = getUserIdFromToken();
        if (!userId) {
            toast.error("User not authenticated");
            return;
        }

        try {
            setLoading(true);
            setUploadProgress(0);

            const coverBase64 = await fileToBase64(coverFiles[0].fileObject);

            const formData = new FormData();
            formData.append("audio", audioFiles[0].fileObject);
            formData.append("title", title.trim());
            formData.append("genre", genre);
            formData.append("description", description.trim());
            formData.append("cover", coverBase64);
            formData.append("userId", userId);

            const base = (import.meta.env.VITE_APP_API_URL || "http://localhost:3000/api/").replace(/\/+$/, "");

            const result = await new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const pct = Math.round((e.loaded / e.total) * 100);
                        setUploadProgress(pct);
                        audioFiles[0].progress = pct;
                        setAudioFiles([...audioFiles]);
                    }
                };
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch {
                            reject(new Error("Invalid response"));
                        }
                    } else {
                        try {
                            const err = JSON.parse(xhr.responseText);
                            reject(new Error(err.message || "Upload failed"));
                        } catch {
                            reject(new Error(`Upload failed: ${xhr.statusText}`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error("Network error"));
                xhr.open("POST", `${base}/tracks`);
                xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("JWT_TOKEN")}`);
                xhr.setRequestHeader("x-refresh-token", localStorage.getItem("JWT_ACCESS_TOKEN") || "");
                xhr.send(formData);
            });

            toast.success(t("create.trackCreated"));
            navigate(`/track/${result.id}`);
        } catch (err: any) {
            toast.error(err.message || "Failed to create track");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>{t("create.createTrack")}</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                    <label className={styles.label}>{t("create.title")}</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t("create.title")}
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
                        className={styles.select}
                    >
                        <option value="">{t("create.selectGenres")}</option>
                        {GENRES.map((g) => (
                            <option key={g} value={g}>{t(`genres.${g}`)}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>{t("create.coverImage")}</label>
                    <FileUploadProgressBar
                        accept="image/*"
                        label="cover"
                        multiple={false}
                        files={coverFiles}
                        onFilesChange={setCoverFiles}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>{t("create.audioFile")}</label>
                    <FileUploadProgressBar
                        accept="audio/*"
                        label="audio"
                        multiple={false}
                        files={audioFiles}
                        onFilesChange={setAudioFiles}
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
                    disabled={loading}
                    className={styles.submit}
                >
                    {loading ? `${t("create.uploading")} ${uploadProgress}%` : t("create.createTrack")}
                </button>
            </form>
        </div>
    );
}
