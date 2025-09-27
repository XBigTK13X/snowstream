import React from 'react';
import Snow from 'react-native-snowui'
import { Platform, useTVEventHandler, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';

import util from './util'
import { config } from './settings'
import { routes } from './routes'
import { ApiClient } from './api-client'

const setStoredValue = (key, value) => {
    return new Promise(resolve => {
        if (Platform.OS === 'web') {
            if (value === null) {
                localStorage.removeItem(key);
                return resolve(true)
            } else {
                localStorage.setItem(key, value);
                return resolve(true)
            }
        } else {
            if (value == null) {
                SecureStore.deleteItemAsync(key);
                return resolve(true)
            } else {
                if (value === false) {
                    value = 'false'
                }
                if (value === true) {
                    value = 'true'
                }
                SecureStore.setItem(key, value);
                return resolve(true)
            }
        }
    })
}

const getStoredValue = (key) => {
    let value = null
    if (Platform.OS === 'web') {
        value = localStorage.getItem(key)
    } else {
        value = SecureStore.getItem(key)
    }
    if (value === 'true') {
        return true
    }
    if (value === 'false') {
        return false
    }
    return value
}

const AppContext = React.createContext({});

export function useAppContext() {
    const value = React.useContext(AppContext);
    if (!value) {
        throw new Error('appContext must be wrapped in a <AppContextProvider />');
    }
    return value;
}

export function AppContextProvider(props) {
    const { SnowStyle } = Snow.useStyleContext(props)
    const [apiError, setApiError] = React.useState(null)
    const [apiClient, setApiClient] = React.useState(null)
    const [apiClientKey, setApiClientKey] = React.useState(1)
    const [message, setMessage] = React.useState("All is well")
    const [session, setSession] = React.useState(null)
    const [isAdmin, setIsAdmin] = React.useState(false)
    const [displayName, setDisplayName] = React.useState(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [clientOptions, setClientOptions] = React.useState(null)
    const [remoteCallbacks, setRemoteCallbacks] = React.useState({})
    const remoteCallbacksRef = React.useRef(remoteCallbacks)

    React.useEffect(() => {
        if (!apiClient) {
            const storedSession = getStoredValue('session')
            setSession(storedSession)
            const storedAdmin = getStoredValue('isAdmin')
            setIsAdmin(storedAdmin)
            setDisplayName(getStoredValue('displayName'))
            const storedWebApiUrl = getStoredValue('webApiUrl')
            setIsLoading(false)
            if (storedWebApiUrl) {
                setApiClient(new ApiClient({
                    webApiUrl: storedWebApiUrl,
                    authToken: storedSession,
                    isAdmin: storedAdmin,
                    onApiError: onApiError,
                    onLogout: logout
                }))
                setApiClientKey((prev) => { return prev + 1 })
            }
        }
    })

    React.useEffect(() => {
        if (!clientOptions) {
            let storedOptions = getStoredValue('clientOptions')
            if (storedOptions) {
                storedOptions = JSON.parse(storedOptions)
            }
            if (!storedOptions) {
                storedOptions = {
                }
            }
            if (!storedOptions.hasOwnProperty('resolutionWidth')) {
                storedOptions.resolutionWidth = SnowStyle.surface.uhd.width
            }
            if (!storedOptions.hasOwnProperty('resolutionHeight')) {
                storedOptions.resolutionHeight = SnowStyle.surface.uhd.height
            }
            if (!storedOptions.hasOwnProperty('deviceId')) {
                storedOptions.deviceId = uuid.v4()
            }
            if (!storedOptions.hasOwnProperty('alwaysTranscode')) {
                storedOptions.alwaysTranscode = false
            }
            if (!storedOptions.hasOwnProperty('audioCompression')) {
                storedOptions.audioCompression = false
            }
            if (!storedOptions.hasOwnProperty('hardwareDecoder')) {
                storedOptions.hardwareDecoder = false
            }
            if (!storedOptions.hasOwnProperty('deviceProfile')) {
                storedOptions.deviceProfile = 'CCwGTV4K'
            }
            if (!storedOptions.hasOwnProperty('alwaysUsePlayer')) {
                storedOptions.alwaysUsePlayer = 'all'
            }
            if (!storedOptions.hasOwnProperty('useMpvFast')) {
                storedOptions.useMpvFast = false
            }
            setClientOptions(storedOptions)
        }
    })

    if (Platform.isTV) {
        const remoteHandler = (remoteEvent) => {
            if (config.debugTvFocus) {
                util.log({ remoteEvent })
            }
            const callbacks = remoteCallbacksRef.current
            for (const [key, callback] of Object.entries(callbacks)) {
                if (callback == null) {
                    continue
                }
                // action 0  = start, action 1 = end for longpresses
                const kind = remoteEvent.eventType
                const action = remoteEvent.eventKeyAction
                callback(kind, action)
            }
        }
        useTVEventHandler(remoteHandler);
    }

    React.useEffect(() => {
        remoteCallbacksRef.current = remoteCallbacks
    }, [remoteCallbacks])

    const onApiError = (err) => {
        if (!apiError) {
            setApiError(err)
        }
    }

    const setWebApiUrl = (webApiUrl) => {
        return setStoredValue('webApiUrl', webApiUrl)
            .then(() => {
                setApiClient(null)
                setApiClientKey((prev) => { return prev + 1 })
            })
    }

    const login = (username, password) => {
        return new Promise(resolve => {
            if (!apiClient) {
                return resolve({ loading: true })
            }
            apiClient.login({
                username: username,
                password: password,
                deviceId: clientOptions.deviceId,
                deviceProfile: clientOptions.deviceProfile
            })
                .then(loginResponse => {
                    if (loginResponse && loginResponse.failed) {
                        resolve(loginResponse)
                    } else {
                        setDisplayName(loginResponse.displayName)
                        setSession(loginResponse.authToken)
                        setIsAdmin(loginResponse.isAdmin)
                        setStoredValue('displayName', loginResponse.displayName)
                            .then(() => {
                                return setStoredValue('session', loginResponse.authToken);
                            }).then(() => {
                                return setStoredValue('isAdmin', loginResponse.isAdmin)
                            }).then(() => {
                                return resolve({ token: loginResponse.authToken })
                            })
                    }
                })
                .catch((err) => {
                    util.log({ err })
                    apiClient.debug()
                    return resolve({ failed: err })
                })
        })
    }

    const logout = (removeApiUrl) => {
        setSession(null)
        setDisplayName(null)
        setIsAdmin(false)
        setClientOptions(null)
        return setStoredValue('session', null)
            .then(() => {
                return setStoredValue('displayName', null)
            }).then(() => {
                return setStoredValue('isAdmin', null)
            }).then(() => {
                return new Promise(resolve => {
                    if (removeApiUrl) {
                        return setStoredValue('webApiUrl', null).then(() => {
                            setApiClient(null)
                            return resolve()
                        })
                    }
                    return resolve()
                })
            })
            .then(() => {
                return routes.reset()
            })
    }

    const changeClientOptions = (options) => {
        let shouldLogout = false;
        if (clientOptions.deviceId !== options.deviceId) {
            shouldLogout = true;
        }
        let stored = options
        if (options) {
            stored = JSON.stringify(options)
        }
        setStoredValue('clientOptions', stored)
        setClientOptions(options)
        if (shouldLogout) {
            logout();
        }
    }

    if (apiError) {
        return (
            <Snow.Modal center>
                <Snow.Text>Unable to communicate with Snowstream.</Snow.Text>
                <Snow.Text>Check if your Wi-Fi is disconnected, ethernet unplugged, or if the Snowstream server is down.</Snow.Text>
                <View>
                    <Snow.Grid itemsPerRow={2}>
                        <Snow.TextButton title="Try to Reload" onPress={() => { setApiError(null) }} />
                        <Snow.TextButton title="Change Server" onPress={() => { logout(true) }} />
                    </Snow.Grid>
                </View>
            </Snow.Modal>
        )
    }

    const appContext = {
        config,
        routes,
        session,
        isLoading,
        apiClient,
        isAdmin,
        displayName,
        message,
        setMessageDisplay: setMessage,
        signIn: login,
        signOut: logout,
        setRemoteCallbacks,
        setWebApiUrl,
        clientOptions,
        changeClientOptions
    }

    return (
        <AppContext.Provider
            value={appContext}>
            {props.children}
        </AppContext.Provider>
    );
}

export default AppContextProvider