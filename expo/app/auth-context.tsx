import React from 'react';
import { Modal, View } from 'react-native'
import SnowText from './comp/snow-text'
import SnowTextButton from './comp/snow-text-button'
import { useStorageState } from './use-storage-state';
import { ApiClient } from './api-client'
const routes = require('./routes')


const AuthContext = React.createContext<{
    signIn: (username, password) => void;
    signOut: () => void;
    session?: string | null;
    isLoading: boolean;
    apiClient: ApiClient;
    isAdmin: boolean;
    displayName: string | null;
}>({
    signIn: () => null,
    signOut: () => null,
    session: null,
    isLoading: false,
    apiClient: null,
    isAdmin: false,
    displayName: null
});

// This hook can be used to access the user info.
export function useSession() {
    const value = React.useContext(AuthContext);
    if (!value) {
        throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
    return value;
}

const styles = {
    prompt: {
        backgroundColor: 'black',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    }
}

export function SessionProvider(props: React.PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('session');
    const [[loadAdmin, isAdmin], setIsAdmin] = useStorageState('is-admin')
    const [[loadDisplayName, displayName], setDisplayName] = useStorageState('displayName')
    const [apiError, setApiError] = React.useState(null)
    const [retryCount, setRetryCount] = React.useState(0)

    const onApiError = (err) => {
        if (!apiError) {
            setApiError(err)
        }
    }

    const logout = () => {
        setSession(null)
        setDisplayName(null)
        setIsAdmin(null)
        routes.reset()
    }

    const apiClient = new ApiClient(session, isAdmin, onApiError, logout)

    if (apiError) {
        return (
            <Modal>
                <View style={styles.prompt}>
                    <SnowText>Unable to communicate with Snowstream.</SnowText>
                    <SnowText>Check if your Wi-Fi is disconnected, ethernet unplugged, or if the Snowstream server is down.</SnowText>
                    <View>
                        <SnowTextButton title="Try to Reload" onPress={() => { setApiError(null) }} />
                    </View>
                </View>
            </Modal>
        )
    }
    return (
        <AuthContext.Provider
            value={{
                signIn: (username, password) => {
                    return new Promise(resolve => {
                        apiClient.login({ username: username, password: password })
                            .then(loginResponse => {
                                setDisplayName(loginResponse.displayName)
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
                    logout()
                    return true;
                },
                session,
                isLoading,
                apiClient,
                isAdmin: isAdmin === 'true',
                displayName
            }}>
            {props.children}
        </AuthContext.Provider>
    );
}
