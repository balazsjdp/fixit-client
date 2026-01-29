"use client";

import { cn } from "@/lib/utils";
import {
  useReportForm,
  useReportActions,
} from "@/store/report/report-store-provider";
import { Camera, X } from "lucide-react";
import { useRef } from "react";

export function ImageUpload() {
  const files = useReportForm().files;
  const { setFiles } = useReportActions();
  const inputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      e.target.value = "";
    }
  };

  const onRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div>
      <div
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-10 bg-gray-50 dark:bg-gray-800/50 group cursor-pointer hover:border-primary/50 transition-all"
        onClick={() => inputRef.current?.click()}
      >
        <Camera
          className="text-muted-foreground mb-3 group-hover:text-primary transition-colors"
          size={24}
        />
        <p className="text-base font-semibold text-[#101418] dark:text-white">
          Kattintson vagy húzza ide a képeket
        </p>
        <p className="text-sm text-[#5e758d] mt-1">
          PNG, JPG formátum maximum 10MB
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={inputRef}
          className="hidden"
          onChange={onFileChange}
        />
      </div>
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-25 h-auto rounded-lg"
              />
              <button
                onClick={() => onRemoveFile(index)}
                className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
