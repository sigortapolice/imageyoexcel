import React, { useState, useCallback } from 'react';
import { UploadIcon, HistoryIcon } from './IconComponents';

interface FileUploadProps {
    onFileChange: (file: File) => void;
    onHistoryClick: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, onHistoryClick }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                onFileChange(file);
            } else {
                alert('Please select an image file.');
            }
        }
    };

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    }, [onFileChange]);

    return (
        <div className="text-center p-6">
            <p className="text-[#e2e2e2]/90 mb-6 sm:mb-8 text-lg sm:text-xl">Tek bir tıklamayla görüntüleri Excel'e dönüştürün.</p>
            
            <label
                htmlFor="file-upload"
                className={`relative block w-full max-w-2xl mx-auto bg-black/10 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-colors duration-300 border-2 border-dashed border-[#e2e2e2]/40 ${isDragging ? 'bg-blue-500/20' : 'hover:bg-black/20'}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center">
                    <UploadIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[#e2e2e2]/60 mb-3 sm:mb-4" />
                    <span className="text-lg sm:text-xl text-[#e2e2e2]">Görseli Sürükleyin veya dosya seçin</span>
                    <p className="text-sm sm:text-base text-[#e2e2e2]/70 mt-2">JPG, PNG, WEBP, TIFF desteklenir</p>
                </div>
                <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/png, image/jpeg, image/webp, image/tiff"
                    onChange={(e) => handleFileSelect(e.target.files)}
                />
            </label>

            <button 
                onClick={onHistoryClick}
                className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-[#e2e2e2]/70 hover:text-[#e2e2e2] transition-colors w-full"
            >
                <HistoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Geçmiş taramalarınız</span>
            </button>
        </div>
    );
};
