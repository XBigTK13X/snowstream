import React from 'react';
import { useStorageState } from './use-storage-state';
import { ApiClient } from './api-client'

const AuthContext = React.createContext<{
    signIn: (username, password) => void;
    signOut: () => void;
    session?: string | null;
    isLoading: boolean;
    apiClient: ApiClient
}>({
    signIn: () => null,
    signOut: () => null,
    session: null,
    isLoading: false,
    apiClient: null
});

// This hook can be used to access the user info.
export function useSession() {
    const value = React.useContext(AuthContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
            throw new Error('useSession must be wrapped in a <SessionProvider />');
        }
    }

    return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('session');
    const apiClient = new ApiClient(session)
    return (
        <AuthContext.Provider
            value={{
                signIn: (username, password) => {
                    apiClient.login({ username: username, password: password })
                        .then(authToken => {
                            setSession(authToken);
                        })
                },
                signOut: () => {
                    setSession(null);
                },
                session,
                isLoading,
                apiClient
            }}>
            {props.children}
        </AuthContext.Provider>
    );
}
