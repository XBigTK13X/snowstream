import React from 'react'
import { router } from 'expo-router'
import { Text, View } from 'react-native'
import { Button, ListItem } from '@rneui/themed'
import { useSession } from '../auth-context'
import { useSettings } from '../settings-context'

export default function SignIn() {
    const { signIn, apiClient } = useSession()
    const { routes, config } = useSettings()
    const [errors, setErrors] = React.useState(null)

    return (
        <View>
            <Button
                onPress={() => {
                    // TODO Add UI for username and password
                    // TODO Add Profile pick selectors
                    setErrors('The button has been clicked!')
                    signIn('admin', 'admin')
                        .then((token) => {
                            setErrors('Everything went fine?')
                            routes.replace(routes.landing)
                        })
                        .catch((err) => {
                            setErrors(err)
                        })
                }}
            >
                Sign In
            </Button>
            <Text>{errors ? JSON.stringify(errors) : '[' + config.webApiUrl + '] v' + config.clientVersion}</Text>
        </View>
    )
}
