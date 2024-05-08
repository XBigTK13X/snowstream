import React from 'react'
import { Link } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Button, ListItem } from '@rneui/themed';

import { useSession } from '../../auth-context';
import { useSettings } from '../../settings-context';

export default function LandingPage() {
    const { signOut, apiClient } = useSession();
    const { routes } = useSettings();
    const [shelves, setShelves] = React.useState(null);
    React.useEffect(() => {
        if (!shelves) {
            apiClient.getShelves().then((response) => {
                setShelves(response)
            })
        }
    })

    if (shelves) {
        return (
            <>
                {shelves.map((shelf) => {
                    let page = shelf.kind == 'Movies' ? routes.movieList : routes.showList
                    return (
                        <Button key={shelf.id} title={shelf.name} onPress={routes.func(page, { 'shelfId': shelf.id })} />
                    )
                })}
            </>
        )
    }

    return (
        <Text>
            Loading shelves...
        </Text>

    );
}
