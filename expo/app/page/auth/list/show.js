import React from 'react'
import { Link } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Button, ListItem } from '@rneui/themed';
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router';

import { useSession } from '../../../auth-context';
import { useSettings } from '../../../settings-context';

export default function ShowShelfPage() {
    const { signOut, apiClient } = useSession();
    const { routes } = useSettings();
    const localParams = useLocalSearchParams();
    const [shelf, setShelf] = React.useState(null)
    React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(localParams.shelfId).then((response) => {
                setShelf(response)
            })
        }
    })
    if (shelf) {
        <Text>The shelf is for {shelf.kind}.</Text>
    }
    return (
        <Text>
            Loading shelf {localParams.shelfId}.
        </Text>
    );
}
