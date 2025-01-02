interface ApiConfig {
    baseUrl: string;
    endpoints: {
        createTimelapse: string;
        getVideo: string;
    };
}

const apiConfig: ApiConfig = {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    endpoints: {
        createTimelapse: '/create-timelapse',
        getVideo: '/videos',
    }
};

export default apiConfig; 