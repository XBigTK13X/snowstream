import { Link } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Button, ListItem } from '@rneui/themed';

import { useSession } from '../../auth-context';
import { useSettings } from '../../settings-context';

export default function LandingPage() {
    const { signOut } = useSession();
    const { routes } = useSettings();
    return (
        <View>
            <Button
                onPress={() => {
                    signOut();
                }}
                title="Sign Out">

            </Button>
            <Text>This is working through the expo router.</Text>
            <Text>And so is this</Text>
            <>
                <ListItem>
                    <Button title="Home" onPress={routes.func(routes.landing)} />
                </ListItem>
                <ListItem>
                    <Button title="Options" onPress={routes.func(routes.options)} />
                </ListItem>
            </>
        </View >

    );
}
