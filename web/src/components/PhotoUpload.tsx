import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiLoaderAlt } from 'react-icons/bi';
import { FiX } from 'react-icons/fi';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { apiService } from '../services/api.service';
import useStore from '../store/useStore';

interface ValidationError {
    message: string;
    type: 'error' | 'warning';
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_PHOTOS = 2;
const MAX_PHOTOS = 100;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const PhotoUpload: React.FC = () => {
    const [photos, setPhotos] = useState<File[]>([]);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    // Video URL'ini temizle
    useEffect(() => {
        const { videoUrl } = useStore.getState();
        return () => {
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, []);

    const validatePhotos = async (files: File[]): Promise<ValidationError[]> => {
        const errors: ValidationError[] = [];

        if (files.length < MIN_PHOTOS) {
            errors.push({
                message: t('validationErrors.minPhotos', { min: MIN_PHOTOS }),
                type: 'error'
            });
        }
        if (files.length > MAX_PHOTOS) {
            errors.push({
                message: t('validationErrors.maxPhotos', { max: MAX_PHOTOS }),
                type: 'error'
            });
        }

        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                errors.push({
                    message: t('validationErrors.invalidType', { filename: file.name }),
                    type: 'error'
                });
                continue;
            }

            if (file.size > MAX_FILE_SIZE) {
                errors.push({
                    message: t('validationErrors.fileTooBig', { filename: file.name }),
                    type: 'error'
                });
            }
        }

        const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));
        if (files.some((file, index) => file !== sortedFiles[index])) {
            errors.push({
                message: t('validationErrors.sequentialNames'),
                type: 'warning'
            });
        }

        return errors;
    };

    const generatePreviews = async (files: File[]) => {
        const newPreviews = await Promise.all(
            files.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                });
            })
        );
        
        // Eski URL'leri temizle
        previews.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        setPreviews(newPreviews);
    };

    const handleFiles = async (files: File[]) => {
        setIsLoading(true);
        try {
            const validationErrors = await validatePhotos(files);
            setErrors(validationErrors);
            
            if (!validationErrors.some(error => error.type === 'error')) {
                setPhotos(files);
                await generatePreviews(files);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const filesArray = Array.from(event.target.files);
            await handleFiles(filesArray);
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        await handleFiles(files);
    };

    const removePhoto = (index: number) => {
        const newPhotos = [...photos];
        newPhotos.splice(index, 1);
        setPhotos(newPhotos);

        const newPreviews = [...previews];
        if (newPreviews[index].startsWith('blob:')) {
            URL.revokeObjectURL(newPreviews[index]);
        }
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);

        validatePhotos(newPhotos).then(setErrors);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (errors.some(error => error.type === 'error')) {
            return;
        }

        const { setIsProcessing, setVideoUrl } = useStore.getState();
        setIsProcessing(true);
        setVideoUrl(null);

        try {
            const response = await apiService.createTimelapse(photos);
            
            if (response.error) {
                console.error('Hata:', response.error);
                return;
            }

            if (response.data) {
                const videoUrl = URL.createObjectURL(response.data.videoBlob);
                setVideoUrl(videoUrl);
            }
        } catch (error) {
            console.error('Hata:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto px-4 sm:px-0">
            <form onSubmit={handleSubmit} className="flex flex-col items-center bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6">
                {/* Dosya yükleme alanı */}
                <div
                    className={`w-full mb-4 relative ${photos.length === 0 ? 'h-40 sm:h-48' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_TYPES.join(',')}
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isLoading}
                    />
                    
                    {isLoading ? (
                        <div className="absolute inset-0 bg-black/10 dark:bg-black/30 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                            <div className="flex flex-col items-center p-4">
                                <BiLoaderAlt className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                                    {t('upload.loading')}
                                </p>
                            </div>
                        </div>
                    ) : null}
                    
                    {photos.length === 0 ? (
                        <div
                            onClick={() => !isLoading && fileInputRef.current?.click()}
                            className={`h-full w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 p-4 ${
                                isDragging
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                            } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            <IoCloudUploadOutline className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500 mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                {t('upload.dragDropText')}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {t('upload.formatText')}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                            {previews.map((preview, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => !isLoading && removePhoto(index)}
                                        className={`absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 ${
                                            isLoading ? 'cursor-not-allowed' : ''
                                        }`}
                                        disabled={isLoading}
                                    >
                                        <FiX size={12} className="sm:w-3 sm:h-3" />
                                    </button>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
                                </div>
                            ))}
                            <div
                                onClick={() => !isLoading && fileInputRef.current?.click()}
                                className={`aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200 ${
                                    isLoading ? 'opacity-50 cursor-wait' : ''
                                }`}
                            >
                                <IoCloudUploadOutline className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Hata ve uyarı mesajları */}
                {errors.length > 0 && (
                    <div className="w-full mb-4 space-y-2">
                        {errors.map((error, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded text-sm ${
                                    error.type === 'error'
                                        ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200'
                                        : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-200'
                                }`}
                            >
                                {error.message}
                            </div>
                        ))}
                    </div>
                )}

                {/* Seçilen fotoğraf sayısı */}
                {photos.length > 0 && (
                    <div className="w-full mb-4 text-center text-sm sm:text-base text-gray-600 dark:text-gray-300">
                        {t('photosSelected', { count: photos.length })}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={photos.length === 0 || errors.some(error => error.type === 'error') || isLoading || useStore.getState().isProcessing}
                    className={`w-full bg-blue-500 text-white p-3 rounded-lg font-medium hover:bg-blue-600 transition duration-200 ${
                        (photos.length === 0 || errors.some(error => error.type === 'error') || isLoading || useStore.getState().isProcessing)
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                    }`}
                >
                    {useStore.getState().isProcessing ? (
                        <div className="flex items-center justify-center">
                            <BiLoaderAlt className="w-5 h-5 animate-spin mr-2" />
                            {t('processing')}
                        </div>
                    ) : (
                        t('uploadButton')
                    )}
                </button>
            </form>

            {/* Video Önizleme */}
            {useStore.getState().videoUrl && (
                <div className="mt-6 w-full">
                    <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                        {t('videoPreview')}
                    </h3>
                    <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-black">
                        <video
                            src={useStore.getState().videoUrl || undefined}
                            className="absolute inset-0 w-full h-full"
                            controls
                            autoPlay
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoUpload;