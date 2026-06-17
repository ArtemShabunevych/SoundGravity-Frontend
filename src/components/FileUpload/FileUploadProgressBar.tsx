import { useState } from "react";
import { FileUpload, getReadableFileSize, type UploadedFile } from "./file-upload-base";

interface FileUploadProgressBarProps {
  isDisabled?: boolean;
  accept?: string;
  multiple?: boolean;
  label?: string;
  files?: UploadedFile[];
  onFilesChange?: (files: UploadedFile[]) => void;
}

export const FileUploadProgressBar = ({
  isDisabled,
  accept,
  multiple = true,
  label,
  files: externalFiles,
  onFilesChange,
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
      progress: 0,
      fileObject: f,
    }));
    setFiles([...files, ...mapped]);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const hasFiles = files.length > 0;
  const showDropZone = !isDisabled && !hasFiles;

  return (
    <FileUpload.Root>
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
