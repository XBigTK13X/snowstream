import React from 'react';
import { config } from './settings'
import { routes } from './routes'
const SettingsContext = React.createContext<{
    config: object;
    routes: object;
}>({
    config: null,
    routes: null
});

// This hook can be used to access the user info.
export function useSettings() {
    const value = React.useContext(SettingsContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
            throw new Error('appSettings must be wrapped in a <SettingsProvider />');
        }
    }

    return value;
}

export function SettingsProvider(props: React.PropsWithChildren) {
    return (
        <SettingsContext.Provider
            value={{
                config: config,
                routes: routes
            }}>
            {props.children}
        </SettingsContext.Provider>
    );
}

export default SettingsProvider