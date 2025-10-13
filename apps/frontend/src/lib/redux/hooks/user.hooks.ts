import { useDispatch } from 'react-redux';
import store, { AppDispatch } from '../store';
import type { UserLogin, UserState } from '@/types/user.interface';
import { loginUser } from '../features/userSlice';

/**
 * Utility functions to access user-related Redux state outside of React components
 * These can be used anywhere in your code, including non-React contexts like axios interceptors
 */

/**
 * Get the current auth state from Redux
 * @returns The current auth state
 */
export const getAuthState = (): UserState => {
    return store.getState().auth;
};

/**
 * Get the current access token from Redux
 * @returns The current access token or null
 */
export const getAccessToken = (): string | null => {
    return getAuthState().accessToken;
};

/**
 * Get the current refresh token from Redux
 * @returns The current refresh token or null
 */
export const getRefreshToken = (): string | null => {
    return getAuthState().refreshToken;
};

/**
 * Check if the user is authenticated based on Redux state
 * @returns True if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
    const { id, accessToken } = getAuthState();
    return Boolean(id && accessToken);
};

/**
 * Get the current user ID from Redux
 * @returns The current user ID or null
 */
export const getUserId = (): string | null => {
    return getAuthState().id;
};

/**
 * Get the user's full name from Redux
 * @returns The user's full name or empty string
 */
export const getUserFullName = (): string => {
    const { firstName, lastName } = getAuthState();
    if (firstName && lastName) {
        return `${firstName} ${lastName}`;
    } else if (firstName) {
        return firstName;
    } else if (lastName) {
        return lastName;
    }
    return '';
};

export const useUser = () => {
    const dispatch = useDispatch<AppDispatch>();


    const login = (credentials:UserLogin) => dispatch(loginUser(credentials))

    return {
        login
    }
}