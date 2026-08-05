import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileUploadProgressBar, type UploadedFile } from "../FileUpload/FileUploadProgressBar";
import toast from "react-hot-toast";
import { getApiUrl } from "../../API/apiClient";
import styles from "./create-track.module.css";
import defaultTrackCover from "../../photos/track.png";

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

const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
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
    const audioUpdateRef = useRef<((pct: number) => void) | null>(null);

    const audioReady = audioFiles.length > 0 && !!audioFiles[0]?.fileObject;
    const canSubmit = title.trim() && audioReady && genre;

    const handleAudioUpload = (_file: UploadedFile, updateProgress: (pct: number) => void) => {
        audioUpdateRef.current = updateProgress;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error(t("toast.titleRequired"));
            return;
        }
        if (!audioFiles[0]?.fileObject) {
            toast.error(t("toast.audioRequired"));
            return;
        }
        if (!genre) {
            toast.error(t("toast.genreRequired"));
            return;
        }
        if (description.trim().length < 20) {
            toast.error(t("toast.descriptionMinLength"));
            return;
        }
        const userId = getUserIdFromToken();
        if (!userId) {
            toast.error(t("toast.notAuthenticated"));
            return;
        }

        try {
            setLoading(true);
            const base = getApiUrl().replace(/\/+$/, "");

            const formData = new FormData();
            formData.append("title", title.trim());
            formData.append("description", description.trim());
            formData.append("genre", genre);
            formData.append("audio", audioFiles[0].fileObject);
            formData.append("cover", coverFiles[0]?.fileObject
                ? await fileToBase64(coverFiles[0].fileObject)
                : await urlToBase64(defaultTrackCover));
            formData.append("userId", userId);

            const result = await new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        audioUpdateRef.current?.(Math.round((e.loaded / e.total) * 100));
                    }
                };
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        audioUpdateRef.current = null;
                        try { resolve(JSON.parse(xhr.responseText)); }
                        catch { reject(new Error(t("toast.invalidResponse"))); }
                    } else {
                        audioUpdateRef.current?.(0);
                        try {
                            const err = JSON.parse(xhr.responseText);
                            reject(new Error(err.message || t("toast.uploadFailed")));
                        } catch {
                            reject(new Error(t("toast.uploadFailed")));
                        }
                    }
                };
                xhr.onerror = () => {
                    audioUpdateRef.current?.(0);
                    reject(new Error(t("toast.networkError")));
                };
                xhr.open("POST", `${base}/tracks`);
                xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("JWT_TOKEN")}`);
                xhr.setRequestHeader("x-refresh-token", localStorage.getItem("JWT_REFRESH_TOKEN") || "");
                xhr.send(formData);
            });

            toast.success(t("create.trackCreated"));
            navigate(`/track/${result.id}`);
        } catch (err: any) {
            toast.error(err.message || t("toast.failedToCreateTrack"));
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
                        onUpload={handleAudioUpload}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !canSubmit}
                    className={styles.submit}
                >
                    {loading ? t("create.uploading") : t("create.createTrack")}
                </button>
            </form>
        </div>
    );
}
