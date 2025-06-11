import React from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { config } from './settings'
import { routes } from './routes'
import { Modal, View } from 'react-native'
import { ApiClient } from './api-client'
import SnowText from './comp/snow-text'
import SnowTextButton from './comp/snow-text-button'

const styles = {
    prompt: {
        backgroundColor: 'black',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    }
}

const setStoredValue = (key, value) => {
    if (Platform.OS === 'web') {
        if (value === null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, value);
        }
    } else {
        if (value == null) {
            SecureStore.deleteItemAsync(key);
        } else {
            SecureStore.setItem(key, value);
        }
    }
}

const getStoredValue = (key) => {
    if (Platform.OS === 'web') {
        return localStorage.getItem(key)
    } else {
        return SecureStore.getItem(key)
    }
}

const AppContext = React.createContext({
    config: null,
    routes: null,
    session: null,
    isLoading: false,
    apiClient: null,
    isAdmin: false,
    displayName: null,
    message: null,
    setMessageDisplay: (message) => null,
    signIn: () => null,
    signOut: () => null,
    useStorageStage: () => null
});

export function useAppContext() {
    const value = React.useContext(AppContext);
    if (!value) {
        throw new Error('appContext must be wrapped in a <AppContextProvider />');
    }
    return value;
}

export function AppContextProvider(props) {
    const [apiError, setApiError] = React.useState(null)
    const [apiClient, setApiClient] = React.useState(null)
    const [message, setMessage] = React.useState("All is well")
    const [session, setSession] = React.useState(null)
    const [isAdmin, setIsAdmin] = React.useState(false)
    const [displayName, setDisplayName] = React.useState(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        if (!apiClient) {
            const storedSession = getStoredValue('session')
            setSession(storedSession)
            const storedAdmin = getStoredValue('isAdmin') === 'true'
            setIsAdmin(storedAdmin)
            setDisplayName(getStoredValue('displayName'))
            setIsLoading(false)
            setApiClient(new ApiClient(storedSession, storedAdmin, onApiError, logout))
        }
    })

    const onApiError = (err) => {
        if (!apiError) {
            setApiError(err)
        }
    }

    const login = (username, password) => {
        return new Promise(resolve => {
            if (!apiClient) {
                return resolve({ loading: true })
            }
            apiClient.login({ username: username, password: password })
                .then(loginResponse => {
                    if (loginResponse && loginResponse.failed) {
                        resolve(loginResponse)
                    } else {
                        setStoredValue('displayName', loginResponse.displayName)
                        setDisplayName(loginResponse.displayName)
                        setStoredValue('session', loginResponse.authToken);
                        setSession(loginResponse.authToken)
                        setStoredValue('isAdmin', loginResponse.isAdmin ? 'true' : 'false')
                        setIsAdmin(loginResponse.isAdmin)
                        resolve({ token: loginResponse.authToken })
                    }
                })
                .catch((err) => {
                    console.log({ err })
                    apiClient.debug()
                })

        })
    }

    const logout = () => {
        setStoredValue('session', null)
        setSession(null)
        setStoredValue('displayName', null)
        setDisplayName(null)
        setStoredValue('isAdmin', null)
        setIsAdmin(false)
        routes.reset()
    }

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


    if (!apiClient) {
        return null
    }
    const appContext = {
        config,
        routes,
        session,
        isLoading,
        apiClient,
        isAdmin: isAdmin === 'true',
        displayName,
        message,
        setMessageDisplay: setMessage,
        signIn: login,
        signOut: logout
    }

    return (
        <AppContext.Provider
            value={appContext}>
            {props.children}
        </AppContext.Provider>
    );
}

export default AppContextProvider