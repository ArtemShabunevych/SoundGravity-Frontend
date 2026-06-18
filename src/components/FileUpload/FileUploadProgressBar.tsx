import { useState } from "react";
import { FileUpload, type UploadedFile } from "./file-upload-base";

interface FileUploadProgressBarProps {
  isDisabled?: boolean;
  accept?: string;
  multiple?: boolean;
  label?: string;
  files?: UploadedFile[];
  onFilesChange?: (files: UploadedFile[]) => void;
  onUpload?: (file: UploadedFile, updateProgress: (pct: number) => void, markDone: (serverUrl: string) => void, markFailed: () => void) => void;
}

export const FileUploadProgressBar = ({
                                        isDisabled,
                                        accept,
                                        multiple = true,
                                        label,
                                        files: externalFiles,
                                        onFilesChange,
                                        onUpload,
                                      }: FileUploadProgressBarProps) => {
  const [internalFiles, setInternalFiles] = useState<UploadedFile[]>([]);
  const files = externalFiles ?? internalFiles;
  const setFiles = onFilesChange ?? setInternalFiles;

  const addFiles = (newFiles: FileList) => {
    const mapped: UploadedFile[] = Array.from(newFiles).map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      type: f.type,
      size: f.size,
      progress: accept?.includes("audio") ? 0 : 100,
      fileObject: f,
    }));

    const updatedFiles = [...files, ...mapped];
    setFiles(updatedFiles);

    mapped.forEach((file) => {
      if (accept?.includes("audio")) {
        onUpload?.(
            file,
            (pct) => {
              setFiles((prev: any) =>
                  prev.map((f: any) => (f.id === file.id ? { ...f, progress: pct } : f))
              );
            },
            (serverUrl) => {
              setFiles((prev: any) =>
                  prev.map((f: any) => (f.id === file.id ? { ...f, progress: 100, serverUrl } : f))
              );
            },
            () => {
              setFiles((prev: any) =>
                  prev.map((f: any) => (f.id === file.id ? { ...f, failed: true } : f))
              );
            }
        );
      }
    });
  };

  const removeFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const hasFiles = files.length > 0;
  const showDropZone = !isDisabled && !hasFiles;

  return (
      <FileUpload.Root externalFiles={files}>
        {showDropZone && (
            <FileUpload.DropZone
                isDisabled={isDisabled}
                onDropFiles={addFiles}
                accept={accept}
                multiple={multiple}
                label={label}
            />
        )}
        <FileUpload.List>
          {files.map((file) => (
              <FileUpload.ListItemProgressBar
                  key={file.id}
                  {...file}
                  size={file.size}
                  onDelete={() => removeFile(file.id)}
                  onRetry={(id) => {
                    const f = files.find((x) => x.id === id);
                    if (!f?.fileObject) return;
                  }}
              />
          ))}
        </FileUpload.List>
      </FileUpload.Root>
  );
};

export type { UploadedFile };