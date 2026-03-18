import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import {
  loginUser,
  registerUser,
  logoutUser,
} from '@/lib/redux/features/userSlice';
import { UserLogin, UserRegister } from '@/features/auth/types/user.interface';

/**
 * Hook to access and interact with the user state.
 * This is the primary way for React components to interact with auth.
 */
export const useUser = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);

  const login = (credentials: UserLogin) => dispatch(loginUser(credentials));
  const register = (credentials: UserRegister) =>
    dispatch(registerUser(credentials));
  const logout = () => dispatch(logoutUser());

  return {
    ...user,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user.id && user.accessToken),
    fullName:
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.lastName || '',
  };
};

/**
 * Standardized selectors for more granular subscriptions
 */
export const selectUser = (state: RootState) => state.user;
export const selectIsAuthenticated = (state: RootState) =>
  Boolean(state.user.id && state.user.accessToken);
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;
