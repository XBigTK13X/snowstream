import React from 'react'
import { Link } from 'expo-router'
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, TVFocusGuideView } from 'react-native'
// https://www.npmjs.com/package/react-native-tvos
// TVFocusGuideView docs

import { Button, ListItem } from '@rneui/themed'

import { useSession } from '../../../auth-context'
import { useSettings } from '../../../settings-context'

import SnowGrid from '../../../comp/snow-grid'
import SnowText from '../../../comp/snow-text'

const styles = StyleSheet.create({
    boxContainer: {},
    image: {},
    box: {
        padding: 5,
        margin: 5,
        width: '100%',
        height: '100%'
    },
})

export default function LandingPage() {
    const { signOut, apiClient } = useSession()
    const { routes, config } = useSettings()
    const [users, setUsers] = React.useState(null)

    React.useEffect(() => {
        if (!users) {
            apiClient.getUsers().then((response) => {
                setUsers(response)
            })
        }
    })

    if (users) {
        const renderItem = (user, itemIndex) => {
            return (
                <Button
                    hasTVPreferredFocus={itemIndex === 0}
                    style={styles.box}
                    title={user.username}
                    onPress={routes.func(routes.admin.userEdit, { userId: user.id })}
                />
            )

        }
        return (
            <View >
                <SnowGrid data={users} renderItem={renderItem} />
                <SnowText>Loaded content from [{config.webApiUrl}]</SnowText>
            </View>
        )
    }

    return (
        <SnowText>
            Loading content from [{config.webApiUrl}] v{config.clientVersion}
        </SnowText>
    )
}
