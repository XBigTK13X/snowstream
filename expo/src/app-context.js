import React from 'react';
import Snow from 'expo-snowui'
import { Platform, useTVEventHandler, View } from 'react-native';
import uuid from 'react-native-uuid';

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
    const { SnowStyle, navPush } = Snow.useSnowContext(props)
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
                navPush(routes.movieDetails, {
                    shelfId: item.shelf.id,
                    movieId: item.id
                })
            }
            else if (item.model_kind === 'show') {
                navPush(routes.seasonList, {
                    shelfId: item.shelf.id,
                    showId: item.id,
                    showName: item.name
                })
            }
            else if (item.model_kind === 'show_season') {
                navPush(routes.episodeList, {
                    shelfId: item.show.shelf.id,
                    showId: item.show.id,
                    seasonId: item.id,
                    showName: item.show.name,
                    seasonOrder: item.season_order_counter
                })
            }
            else if (item.model_kind === 'show_episode') {
                navPush(routes.episodeDetails, {
                    shelfId: item.season.show.shelf.id,
                    showId: item.season.show.id,
                    seasonId: item.season.id,
                    episodeId: item.id,
                    showName: item.season.show.name,
                    seasonOrder: item.season.season_order_counter,
                    episodeOrder: item.episode_order_counter
                })
            }
            else if (item.model_kind === 'playlist') {
                navPush(routes.playlistDetails, {
                    tagId: item.id,
                    tagName: item.name
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



    React.useEffect(() => {
        if (!apiClient) {
            const storedSession = Snow.loadData('session')
            setSession(storedSession)
            const storedAdmin = Snow.loadData('isAdmin')
            setIsAdmin(storedAdmin)
            setDisplayName(Snow.loadData('displayName'))
            const storedWebApiUrl = Snow.loadData('webApiUrl')
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
    }, [apiClient, sessionLoaded])

    React.useEffect(() => {
        if (!clientOptions) {
            let storedOptions = Snow.loadData('clientOptions')
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
    }, [clientOptions])

    const onApiError = (err) => {
        if (!apiError) {
            setApiError(err)
        }
    }

    const setWebApiUrl = (webApiUrl) => {
        return Snow.saveData('webApiUrl', webApiUrl)
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
                        Snow.saveData('displayName', loginResponse.displayName)
                            .then(() => {
                                return Snow.saveData('session', loginResponse.authToken);
                            }).then(() => {
                                return Snow.saveData('isAdmin', loginResponse.isAdmin)
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
        return Snow.saveData('session', null)
            .then(() => {
                return Snow.saveData('displayName', null)
            }).then(() => {
                return Snow.saveData('isAdmin', null)
            }).then(() => {
                return new Promise(resolve => {
                    if (removeApiUrl) {
                        return Snow.saveData('webApiUrl', null).then(() => {
                            setApiClient(null)
                            return resolve()
                        })
                    }
                    return resolve()
                })
            })
            .then(() => {
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
        Snow.saveData('clientOptions', stored)
        setClientOptions(options)
        if (shouldLogout) {
            logout();
        }
    }

    if (apiError) {
        return (
            <Snow.Modal focusLayer="api-error" center>
                <Snow.Text>Unable to communicate with Snowstream.</Snow.Text>
                <Snow.Text>Check if your Wi-Fi is disconnected, ethernet unplugged, or if the Snowstream server is down.</Snow.Text>
                <View>
                    <Snow.Grid focusStart focusKey="error-buttons" itemsPerRow={2}>
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
        <AppContext.Provider
            value={appContext}>
            {props.children}
        </AppContext.Provider>
    );
}

export default AppContextProvider