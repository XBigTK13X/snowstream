import React from 'react'

import { View } from 'react-native'
import { Button } from '@rneui/themed'
import { Redirect } from 'expo-router'
import { useSession } from '../../../auth-context'
import { useSettings } from '../../../settings-context'

import SnowGrid from '../../../comp/snow-grid'
import SnowText from '../../../comp/snow-text'

export default function DashboardPage() {
    const { routes } = useSettings();
    const renderItem = (item) => {
        return <Button title={item.title} onPress={routes.func(item.route)} />
    }
    const buttons = [
        { title: 'Shelves', route: routes.admin.shelves },
        { title: 'Stream Sources', route: routes.admin.streamSources },
        { title: 'Users', route: routes.admin.users },
    ]
    return <SnowGrid data={buttons} renderItem={renderItem}></SnowGrid>
}
