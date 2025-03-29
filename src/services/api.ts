const BASE_URL = 'http://127.0.0.1:8000';

interface RegisterData {
    username: string;
    email: string;
    password: string;
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface ApiResponse {
    message?: string;
    [key: string]: any;
}

export const verifyToken = async (token: string) => {
    const response = await fetch(`${BASE_URL}/auth/verify`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Invalid token');
    }

    return await response.json();
};

export const registerUser = async (data: RegisterData): Promise<ApiResponse> => {
    try {
        const response = await fetch(`${BASE_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to register');
        }

        return await response.json();
    } catch (error: any) {
        console.error('API Error:', error.message);
        throw error;
    }
};

export const loginUser = async (credentials: { password: string; username: string }): Promise<ApiResponse> => {
    try {
        const response = await fetch(`${BASE_URL}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to login');
        }

        return await response.json();
    } catch (error: any) {
        console.error('API Error:', error.message);
        throw error;
    }
};
