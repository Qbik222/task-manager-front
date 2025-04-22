import { store } from '../store/store.ts';

const BASE_URL = 'http://127.0.0.1:8000';

const state = store.getState();

const token = state.auth.tokens.access


type NewProjectPayload = {
    name: string;
    description: string;
    users: number[];
};

interface Column {
    name: string;
    project: number;
    order: number;
}


interface RegisterData {
    username: string;
    email: string;
    password: string;
}

interface ApiResponse {
    message?: string;
    [key: string]: any;
}

interface Project {
    id: number;
    name: string;
    description: string;
    users: number[];
}

interface Task {
    id: number;
    title: string;
    description: string;
    created_at: string;
    due_date: string;
    is_complete: boolean;
    assigned_to: number;
    project: number;
    labels: string[];
}

interface Users {
    id: number;
    username: string;
    email: string
}

export const createColumn = async (columnData):Promise<Column> =>{
    try {
        const formData = {
            name: columnData.name,
            project: columnData.projectId,
            order: columnData.order
        }
        const response = await fetch(`${BASE_URL}/api/columns/`,{
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }
    catch (error){
        console.error('Error fetching tasks:', error);
        throw error;
    }
}

export const getAllUsers = async (token: string): Promise<Users[]> => {
    try {
        const response = await fetch(`${BASE_URL}/api/users/`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
};


export const getTasks = async (token: string): Promise<Task[]> => {
    try {
        const response = await fetch(`${BASE_URL}/api/tasks/`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
};

export const getProjectById = async ( id: number): Promise<Project> => {
    try {
        const response = await fetch(`${BASE_URL}/project/${id}/full`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch project');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching project:', error);
        throw error;
    }
};


export const getProjects = async (token: string): Promise<Project[]> => {
    try {
        const response = await fetch(`${BASE_URL}/api/projects/`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
};

export const createProject = async (
    token: string,
    projectData: NewProjectPayload
): Promise<Project> => {
    try {
        const response = await fetch(`${BASE_URL}/api/projects/`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
};

export const verifyToken = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${BASE_URL}/api/token/verify/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });

        // Якщо статус 200 - токен валідний
        if (response.ok) {
            return true;
        }

        // Якщо статус 401 - токен невалідний
        if (response.status === 401) {
            return false;
        }

        // Інші помилки (наприклад, проблеми з мережею)
        throw new Error(`Token verification failed: ${response.statusText}`);
    } catch (error) {
        console.error('Token verification error:', error);
        return false;
    }
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
