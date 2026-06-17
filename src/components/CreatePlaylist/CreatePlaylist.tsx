import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchWithAuth } from "../../API/apiClient";
import { FileUploadProgressBar, type UploadedFile } from "../FileUpload/FileUploadProgressBar";
import toast from "react-hot-toast";
import styles from "./create-playlist.module.css";

const uploadFileWithProgress = (
  file: File,
  playlistId: string,
  onProgress: (p: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("cover", file);
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.statusText}`));
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    const base = (import.meta.env.VITE_APP_API_URL || "http://localhost:3000/api/").replace(/\/+$/, "");
    xhr.open("POST", `${base}/playlists/${playlistId}/cover`);
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("JWT_TOKEN")}`);
    xhr.setRequestHeader("x-refresh-token", localStorage.getItem("JWT_ACCESS_TOKEN") || "");
    xhr.send(formData);
  });
};

export default function CreatePlaylist() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private">("public");
    const [coverFiles, setCoverFiles] = useState<UploadedFile[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        try {
            setLoading(true);

            const data = await fetchWithAuth("playlists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    visibility,
                }),
            });

            const playlistId = data.id;

            const uploads = coverFiles.map((f) => {
                if (f.fileObject) {
                    const fileRef = f;
                    return uploadFileWithProgress(f.fileObject, playlistId, (p) => {
                        fileRef.progress = p;
                        setCoverFiles((prev) => [...prev]);
                    });
                }
                return Promise.resolve();
            });

            if (uploads.length > 0) {
                await Promise.all(uploads);
            }

            toast.success(t("create.playlistCreated"));
            navigate(`/playlist/${playlistId}`);
        } catch (err: any) {
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

                <button
                    type="submit"
                    disabled={loading}
                    className={styles.submit}
                >
                    {loading ? t("create.uploading") : t("create.createPlaylist")}
                </button>
            </form>
        </div>
    );
}
