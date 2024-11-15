import React from 'react';
import { useStorageState } from './use-storage-state';
import { ApiClient } from './api-client'

const AuthContext = React.createContext<{
    signIn: (username, password) => void;
    signOut: () => void;
    session?: string | null;
    isLoading: boolean;
    apiClient: ApiClient;
    isAdmin: boolean
}>({
    signIn: () => null,
    signOut: () => null,
    session: null,
    isLoading: false,
    apiClient: null,
    isAdmin: false
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
    const [[loadAdmin, isAdmin], setIsAdmin] = useStorageState('is-admin')
    const apiClient = new ApiClient(session, isAdmin)
    return (
        <AuthContext.Provider
            value={{
                signIn: (username, password) => {
                    return new Promise(resolve => {
                        apiClient.login({ username: username, password: password })
                            .then(loginResponse => {
                                setSession(loginResponse.authToken);
                                setIsAdmin(loginResponse.isAdmin ? 'true' : 'false')
                                resolve(loginResponse.authToken)
                            })
                            .catch((err) => {
                                //TODO Better central management off critical errors
                                console.log({ err })
                                apiClient.debug()
                            })

                    })
                },
                signOut: () => {
                    setSession(null);
                    setIsAdmin(null)
                    return true;
                },
                session,
                isLoading,
                apiClient,
                isAdmin: isAdmin === 'true'
            }}>
            {props.children}
        </AuthContext.Provider>
    );
}
