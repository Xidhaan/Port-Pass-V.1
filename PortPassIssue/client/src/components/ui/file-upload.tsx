import { useState } from "react";
import { CloudUpload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
  selectedFile?: File | null;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept = "*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  selectedFile,
  className,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    if (maxSize && file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    onFileSelect(null);
    setError(null);
  };

  if (selectedFile) {
    return (
      <div className={cn("flex items-center justify-between w-full p-3 border border-gray-300 rounded-md bg-gray-50", className)}>
        <div className="flex items-center space-x-2">
          <File className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-700 truncate">{selectedFile.name}</span>
          <span className="text-xs text-gray-500">
            ({Math.round(selectedFile.size / 1024)}KB)
          </span>
        </div>
        <button
          type="button"
          onClick={removeFile}
          className="text-red-500 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          "flex flex-col items-center justify-center w-full h-16 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        )}
      >
        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
          <div className="flex flex-col items-center justify-center pt-2 pb-2">
            <CloudUpload className="h-5 w-5 text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">
              Drop file here or click to upload
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileInput}
          />
        </label>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
