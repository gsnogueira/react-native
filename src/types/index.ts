export interface User {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
}

export interface Theme {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    status: number;
}

export type NavigationParams = {
    Home: undefined;
    Profile: { userId: string };
};