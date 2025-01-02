import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    const validatePhotos = async (files: File[]): Promise<ValidationError[]> => {
        const errors: ValidationError[] = [];

        // Fotoğraf sayısı kontrolü
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

        // Her fotoğraf için kontroller
        for (const file of files) {
            // Dosya tipi kontrolü
            if (!ALLOWED_TYPES.includes(file.type)) {
                errors.push({
                    message: t('validationErrors.invalidType', { filename: file.name }),
                    type: 'error'
                });
                continue;
            }

            // Dosya boyutu kontrolü
            if (file.size > MAX_FILE_SIZE) {
                errors.push({
                    message: t('validationErrors.fileTooBig', { filename: file.name }),
                    type: 'error'
                });
            }
        }

        // Fotoğrafların sıralı olup olmadığını kontrol et
        const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));
        if (files.some((file, index) => file !== sortedFiles[index])) {
            errors.push({
                message: t('validationErrors.sequentialNames'),
                type: 'warning'
            });
        }

        return errors;
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const filesArray = Array.from(event.target.files);
            const validationErrors = await validatePhotos(filesArray);
            setErrors(validationErrors);
            
            // Sadece kritik hatalar varsa fotoğrafları kaydetme
            if (!validationErrors.some(error => error.type === 'error')) {
                setPhotos(filesArray);
            }
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (errors.some(error => error.type === 'error')) {
            return;
        }
        // Fotoğrafları işleme kodu buraya gelecek
    };

    return (
        <div className="w-full max-w-md">
            <form onSubmit={handleSubmit} className="flex flex-col items-center bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <input
                    type="file"
                    accept={ALLOWED_TYPES.join(',')}
                    multiple
                    onChange={handleFileChange}
                    className="mb-4 border border-gray-300 dark:border-gray-600 rounded p-2 w-full"
                />
                
                {/* Hata ve uyarı mesajları */}
                {errors.length > 0 && (
                    <div className="w-full mb-4">
                        {errors.map((error, index) => (
                            <div
                                key={index}
                                className={`p-2 mb-2 rounded ${
                                    error.type === 'error'
                                        ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200'
                                }`}
                            >
                                {error.message}
                            </div>
                        ))}
                    </div>
                )}

                {/* Seçilen fotoğraf sayısı */}
                {photos.length > 0 && (
                    <div className="w-full mb-4 text-center text-gray-600 dark:text-gray-300">
                        {t('photosSelected', { count: photos.length })}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={photos.length === 0 || errors.some(error => error.type === 'error')}
                    className={`w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200 ${
                        (photos.length === 0 || errors.some(error => error.type === 'error'))
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                    }`}
                >
                    {t('uploadButton')}
                </button>
            </form>
        </div>
    );
};

export default PhotoUpload;