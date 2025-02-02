"use client";

import { useRef } from "react";
import { ImageIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

export function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    onImageSelect(file);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <DropdownMenuItem 
        className="p-2.5 cursor-pointer rounded-xl"
        onSelect={(e) => {
          e.preventDefault();
          fileInputRef.current?.click();
        }}
      >
        <ImageIcon className="mr-2 h-4 w-4" />
        Upload image
      </DropdownMenuItem>
    </>
  );
} 