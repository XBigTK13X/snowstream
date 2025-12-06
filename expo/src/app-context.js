import React from 'react';
import Snow from 'expo-snowui'
import { View } from 'react-native';
import uuid from 'react-native-uuid';

import CONST from './constant'
import util from './util'
import { config } from './settings'
import { routes } from './routes'
import { ApiClient } from './api-client'

const AppContext = React.createContext({});

export function useAppContext() {
    const value = React.useContext(AppContext);
    if (!value) {
        throw new Error('appContext must be wrapped in a <AppContextProvider />');
    }
    return value;
}

export function AppContextProvider(props) {
    const { navReset, clearFocusLayers } = Snow.useSnowContext()
    const { SnowStyle, navPush, pushModal, popModal } = Snow.useSnowContext(props)
    const [apiError, setApiError] = React.useState(null)
    const [apiClient, setApiClient] = React.useState(null)
    const [apiClientKey, setApiClientKey] = React.useState(1)
    const [session, setSession] = React.useState(null)
    const [sessionLoaded, setSessionLoaded] = React.useState(false)
    const [isAdmin, setIsAdmin] = React.useState(false)
    const [displayName, setDisplayName] = React.useState(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [clientOptions, setClientOptions] = React.useState(null)

    const navToItem = (arg) => {
        let isFunc = true
        let itemArg = null
        if (typeof arg === 'object') {
            isFunc = false
            itemArg = arg
        }
        const func = (item) => {
            if (itemArg) {
                item = itemArg
            }
            if (item.model_kind === 'movie') {
                navPush({
                    path: routes.movieDetails,
                    params: {
                        shelfId: item.shelf.id,
                        movieId: item.id
                    },
                    func: false
                })
            }
            else if (item.model_kind === 'show') {
                navPush({
                    path: routes.seasonList,
                    params: {
                        shelfId: item.shelf.id,
                        showId: item.id,
                        showName: item.name
                    },
                    func: false
                })
            }
            else if (item.model_kind === 'show_season') {
                navPush({
                    path: routes.episodeList,
                    params: {
                        shelfId: item.show.shelf.id,
                        showId: item.show.id,
                        seasonId: item.id,
                        showName: item.show.name,
                        seasonOrder: item.season_order_counter
                    },
                    func: false
                })
            }
            else if (item.model_kind === 'show_episode') {
                navPush({
                    path: routes.episodeDetails,
                    params: {
                        shelfId: item.season.show.shelf.id,
                        showId: item.season.show.id,
                        seasonId: item.season.id,
                        episodeId: item.id,
                        showName: item.season.show.name,
                        seasonOrder: item.season.season_order_counter,
                        episodeOrder: item.episode_order_counter
                    },
                    func: false
                })
            }
            else if (item.model_kind === 'playlist') {
                navPush({
                    path: routes.playlistDetails,
                    params: {
                        tagId: item.id,
                        tagName: item.name
                    },
                    func: false
                })
            }
            else {
                util.log("Unhandled media item route")
                util.log({ item })
            }
        }
        if (isFunc) {
            return func
        }
        return func()
    }

    const onApiError = (err) => {
        if (!apiError) {
            setApiError(err)
        }
    }

    const setWebApiUrl = (webApiUrl) => {
        return Snow.saveData(CONST.storageKey.webApiUrl, webApiUrl)
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
                        Snow.saveData(CONST.storageKey.displayName, loginResponse.displayName)
                            .then(() => {
                                return Snow.saveData(CONST.storageKey.session, loginResponse.authToken);
                            }).then(() => {
                                return Snow.saveData(CONST.storageKey.isAdmin, loginResponse.isAdmin)
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
        return Snow.saveData(CONST.storageKey.session, null)
            .then(() => {
                return Snow.saveData(CONST.storageKey.displayName, null)
            }).then(() => {
                return Snow.saveData(CONST.storageKey.isAdmin, null)
            }).then(() => {
                return new Promise(resolve => {
                    if (removeApiUrl) {
                        return Snow.saveData(CONST.storageKey.webApiUrl, null).then(() => {
                            setApiClient(null)
                            return resolve()
                        })
                    }
                    return resolve()
                })
            })
            .then(() => {
                clearFocusLayers()
                return navReset()
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
        Snow.saveData(CONST.storageKey.clientOptions, stored)
        setClientOptions(options)
        if (shouldLogout) {
            logout();
        }
    }

    React.useEffect(() => {
        if (!apiClient) {
            const storedSession = Snow.loadData(CONST.storageKey.session)
            setSession(storedSession)
            const storedAdmin = Snow.loadData(CONST.storageKey.isAdmin)
            setIsAdmin(storedAdmin)
            setDisplayName(Snow.loadData(CONST.storageKey.displayName))
            const storedWebApiUrl = Snow.loadData(CONST.storageKey.webApiUrl)
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
            setSessionLoaded(true)
        }
    }, [apiClient, sessionLoaded, apiClientKey])

    React.useEffect(() => {
        if (!clientOptions) {
            let storedOptions = Snow.loadData(CONST.storageKey.clientOptions)
            if (storedOptions) {
                storedOptions = JSON.parse(storedOptions)
            }
            if (!storedOptions) {
                storedOptions = {
                }
            }
            if (!storedOptions.hasOwnProperty('resolutionKind')) {
                storedOptions.resolutionKind = 'Video File'
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
            if (!storedOptions.hasOwnProperty('deviceProfile')) {
                storedOptions.deviceProfile = 'Google Streamer'
            }
            if (!storedOptions.hasOwnProperty('alwaysUsePlayer')) {
                storedOptions.alwaysUsePlayer = 'all'
            }
            setClientOptions(storedOptions)
        }
    }, [clientOptions])

    React.useEffect(() => {
        if (apiError) {
            pushModal({
                props: {
                    focusLayer: "api-error",
                    center: true,
                    onRequestClose: () => { }
                },
                render: () => {
                    <Snow.FillView >
                        <Snow.Text>Unable to communicate with Snowstream.</Snow.Text>
                        <Snow.Text>Check if your Wi-Fi is disconnected, ethernet unplugged, or if the Snowstream server is down.</Snow.Text>
                        <Snow.Grid focusStart focusKey="error-buttons" itemsPerRow={2}>
                            <Snow.TextButton title="Try to Reload" onPress={() => { setApiError(null) }} />
                            <Snow.TextButton title="Change Server" onPress={() => { logout(true) }} />
                        </Snow.Grid>
                    </Snow.FillView>
                }
            })
        }
        else {
            popModal()
        }
    }, [apiError])


    const appContext = {
        config,
        routes,
        session,
        sessionLoaded,
        isLoading,
        apiClient,
        isAdmin,
        displayName,
        signIn: login,
        signOut: logout,
        setWebApiUrl,
        clientOptions,
        changeClientOptions,
        navToItem
    }

    return (
        <AppContext.Provider value={appContext}>
            {props.children}
        </AppContext.Provider>
    );
}

export default AppContextProvider