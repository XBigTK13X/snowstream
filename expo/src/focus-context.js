import React from 'react';
import { findNodeHandle, TVFocusGuideView, Platform, View } from 'react-native'
import Style from './snow-style'

const FocusContext = React.createContext({});

export function useFocusContext() {
    const value = React.useContext(FocusContext);
    if (!value) {
        throw new Error('useFocusContext must be wrapped in a <FocusContextProvider />');
    }
    return value;
}

const styles = {
    safeArea: {
        padding: 30,
        backgroundColor: Style.color.background,
        flex: 1
    }
}

function AppFocusView(props) {
    return (
        <View style={styles.safeArea}>
            {props.children}
        </View>
    )
}

function TvFocusView(props) {
    return (
        <TVFocusGuideView
            autoFocus={true}
            hasTVPreferredFocus={true}
            style={styles.safeArea}>
            {props.children}
        </TVFocusGuideView>
    )
}

export function FocusContextProvider(props) {
    const [lockedElement, setLockedElement] = React.useState(null)
    const focusIsLocked = !!lockedElement
    let FocusView = AppFocusView
    if (Platform.isTV) {
        FocusView = TvFocusView
    }
    const focusContext = {
        lockedElement,
        setLockedElement,
        focusIsLocked
    }
    return (
        <FocusContext.Provider
            value={focusContext}>
            <FocusView>
                {props.children}
            </FocusView>
        </FocusContext.Provider>
    );
}

export default FocusContextProvider