import React, { createContext, useContext, useCallback, useState, type ReactNode } from "react";

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  progress: number;
  failed?: boolean;
  fileObject?: File;
}

export function getReadableFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

interface FileUploadContextType {
  files: UploadedFile[];
  addFiles: (files: File[]) => void;
  updateFile: (id: string, data: Partial<UploadedFile>) => void;
  removeFile: (id: string) => void;
}

export const FileUploadContext = createContext<FileUploadContextType | null>(null);

function useFileUpload() {
  const ctx = useContext(FileUploadContext);
  if (!ctx) throw new Error("FileUpload components must be used within FileUpload.Root");
  return ctx;
}

function Root({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const addFiles = useCallback((newFiles: File[]) => {
    const mapped: UploadedFile[] = newFiles.map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      type: f.type,
      size: f.size,
      progress: 0,
      fileObject: f,
    }));
    setFiles((prev) => [...prev, ...mapped]);
  }, []);

  const updateFile = useCallback((id: string, data: Partial<UploadedFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <FileUploadContext.Provider value={{ files, addFiles, updateFile, removeFile }}>
      {children}
    </FileUploadContext.Provider>
  );
}

function DropZone({
  isDisabled,
  onDropFiles,
  accept,
  multiple = true,
  label,
}: {
  isDisabled?: boolean;
  onDropFiles?: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
}) {
  const { addFiles } = useFileUpload();
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (isDisabled) return;
      const files = e.dataTransfer.files;
      if (files.length) {
        if (onDropFiles) {
          onDropFiles(files);
        } else {
          addFiles(Array.from(files));
        }
      }
    },
    [isDisabled, onDropFiles, addFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files?.length) {
        if (onDropFiles) {
          onDropFiles(files);
        } else {
          addFiles(Array.from(files));
        }
      }
      e.target.value = "";
    },
    [onDropFiles, addFiles]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isDisabled && document.getElementById(`fu-input-${label}`)?.click()}
      style={{
        border: `2px dashed ${dragging ? "var(--main-color)" : "var(--input-bg)"}`,
        borderRadius: 12,
        padding: "32px 24px",
        textAlign: "center",
        cursor: isDisabled ? "not-allowed" : "pointer",
        background: dragging ? "color-mix(in srgb, var(--main-color) 8%, transparent)" : "transparent",
        transition: "all 0.2s",
        color: "var(--text-muted)",
        fontFamily: "var(--main-font)",
        fontSize: 14,
      }}
    >
      <input
        id={`fu-input-${label}`}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        hidden
        disabled={isDisabled}
      />
      {dragging ? "Release to drop files" : (label || "Drop files here or click to browse")}
    </div>
  );
}

function List({ children }: { children?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
      {children}
    </div>
  );
}

function ListItemProgressBar({
  id,
  name,
  size,
  progress,
  failed,
  onDelete,
  onRetry,
}: UploadedFile & {
  onDelete?: (id: string) => void;
  onRetry?: (id: string) => void;
}) {
  const { removeFile } = useFileUpload();

  const handleDelete = () => {
    if (onDelete) onDelete(id);
    else removeFile(id);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderRadius: 10,
        background: "var(--g-ld)",
        border: failed ? "1px solid #ff4d6a" : "1px solid var(--input-bg)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-main)",
              fontFamily: "var(--main-font)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--main-font)", flexShrink: 0, marginLeft: 8 }}>
            {getReadableFileSize(size)}
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: 4,
            borderRadius: 2,
            background: "var(--input-bg)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: 2,
              background: failed ? "#ff4d6a" : progress === 100 ? "#4caf50" : "var(--main-color)",
              transition: "width 0.3s",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--main-font)" }}>
            {progress}%
          </span>
          {failed && (
            <span style={{ fontSize: 11, color: "#ff4d6a", fontFamily: "var(--main-font)" }}>
              Failed
            </span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        {failed && onRetry && (
          <button
            onClick={() => onRetry(id)}
            style={{
              background: "none",
              border: "1px solid var(--input-bg)",
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: 12,
              color: "var(--text-main)",
              cursor: "pointer",
              fontFamily: "var(--main-font)",
            }}
          >
            Retry
          </button>
        )}
        <button
          onClick={handleDelete}
          style={{
            background: "none",
            border: "1px solid var(--input-bg)",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 12,
            color: "var(--text-muted)",
            cursor: "pointer",
            fontFamily: "var(--main-font)",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export const FileUpload = { Root, DropZone, List, ListItemProgressBar };
