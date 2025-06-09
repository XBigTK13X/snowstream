import React from 'react';


const MessageDisplayContext = React.createContext<{
    setMessageDisplay: (message) => void;
    message: string;
}>({
    setMessageDisplay: (message) => null,
    message: "All is well"
});

// This hook can be used to update the global message.
export function useMessageDisplay() {
    const value = React.useContext(MessageDisplayContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
            throw new Error('useMessageDisplay must be wrapped in a <DisplayMessageProvider />');
        }
    }

    return value;
}

export function MessageDisplayProvider(props: React.PropsWithChildren) {

    const [message, setMessage] = React.useState("All is well")

    return (
        <MessageDisplayContext.Provider
            value={{
                setMessageDisplay: setMessage,
                message: message
            }}>
            {props.children}
        </MessageDisplayContext.Provider>
    );
}

export default MessageDisplayProvider