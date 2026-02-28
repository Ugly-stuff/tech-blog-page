import React, { useState, useRef } from 'react';

const FileUpload = ({ onFileSelect, accept = "image/*,video/*" }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(null);
    const [fileName, setFileName] = useState("");
    const [fileSize, setFileSize] = useState("");
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef(null);
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const compressVideo = async (file) => {
        // For now, we'll implement a simpler approach using Blob API
        // For production, consider using libraries like ffmpeg.wasm or handbrake
        return file; // Return original file for now
        // Video compression would require FFmpeg.wasm integration
    };

    const processFile = async (file) => {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            alert(`File too large! Maximum size is 100MB. Your file is ${formatFileSize(file.size)}`);
            return;
        }

        setFileName(file.name);
        setFileSize(formatFileSize(file.size));

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            if (file.type.startsWith('image/')) {
                setPreview(e.target.result);
            } else if (file.type.startsWith('video/')) {
                // For videos, show a video preview icon
                setPreview(null);
            }
        };
        reader.readAsDataURL(file);

        // Check if video needs compression
        if (file.type.startsWith('video/') && file.size > 10 * 1024 * 1024) { // > 10MB
            setIsCompressing(true);
            const compressedFile = await compressVideo(file);
            setIsCompressing(false);
            onFileSelect(compressedFile);
        } else {
            onFileSelect(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleFileInput = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const clearFile = () => {
        setPreview(null);
        setFileName("");
        setFileSize("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onFileSelect(null);
    };

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileInput}
                    className="hidden"
                />

                {isCompressing ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="animate-spin text-3xl">⏳</div>
                        <p className="text-gray-600 font-medium">Compressing video...</p>
                    </div>
                ) : preview ? (
                    <div className="flex flex-col items-center justify-center gap-3">
                        <img src={preview} alt="preview" className="max-h-32 rounded" />
                        <div>
                            <p className="text-sm font-medium text-gray-700">{fileName}</p>
                            <p className="text-xs text-gray-500">{fileSize}</p>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                clearFile();
                            }}
                            className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                        >
                            Remove
                        </button>
                    </div>
                ) : fileName ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="text-4xl">🎬</div>
                        <p className="text-sm font-medium text-gray-700">{fileName}</p>
                        <p className="text-xs text-gray-500">{fileSize}</p>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                clearFile();
                            }}
                            className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="text-5xl">📁</div>
                        <p className="text-gray-700 font-medium">Drag and drop your file here</p>
                        <p className="text-sm text-gray-500">or click to select</p>
                        <p className="text-xs text-gray-400 mt-2">📸 Images or 🎬 Videos (Max 100MB)</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
