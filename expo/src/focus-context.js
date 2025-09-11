import React from 'react';
import { TVFocusGuideView, Platform, View } from 'react-native'
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

function AppView(props) {
    return (
        <View style={styles.safeArea}>
            {props.children}
        </View>
    )
}

function TvFocusView(props) {
    return (
        <TVFocusGuideView
            style={styles.safeArea}>
            {props.children}
        </TVFocusGuideView>
    )
}

export function FocusContextProvider(props) {
    const [lockedElement, setLockedElement] = React.useState(null)
    const focusIsLocked = !!lockedElement
    const allowFocusing = Platform.isTV
    let FocusView = AppView
    if (allowFocusing) {
        FocusView = TvFocusView
    }
    const focusContext = {
        allowFocusing,
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