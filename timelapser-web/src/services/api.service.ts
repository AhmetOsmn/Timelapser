import apiConfig from '../config/api.config';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

interface CreateTimelapseResponse {
    videoBlob: Blob;
}

class ApiService {
    private static instance: ApiService;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = apiConfig.baseUrl;
    }

    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    private getFullUrl(endpoint: string): string {
        return `${this.baseUrl}${endpoint}`;
    }

    private async handleBlobResponse(response: Response): Promise<ApiResponse<CreateTimelapseResponse>> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                error: errorData.message || 'Bir hata oluştu'
            };
        }

        const blob = await response.blob();
        return { 
            data: { 
                videoBlob: blob 
            } 
        };
    }

    public async createTimelapse(files: File[]): Promise<ApiResponse<CreateTimelapseResponse>> {
        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('files', file);
            });

            const response = await fetch(
                this.getFullUrl(apiConfig.endpoints.createTimelapse),
                {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                }
            );

            return this.handleBlobResponse(response);
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Bir hata oluştu'
            };
        }
    }

    public getVideoUrl(videoId: string): string {
        return this.getFullUrl(`${apiConfig.endpoints.getVideo}/${videoId}`);
    }
}

export const apiService = ApiService.getInstance();
export type { ApiResponse, CreateTimelapseResponse };

