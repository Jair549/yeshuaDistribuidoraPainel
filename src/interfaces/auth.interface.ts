export interface LoginCredentials {
    email: string;
    username?: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}