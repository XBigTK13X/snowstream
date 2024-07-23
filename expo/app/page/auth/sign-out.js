import React from 'react'
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, ListItem } from '@rneui/themed';
import { useSession } from '../../auth-context';
import { useSettings } from '../../settings-context';

export default function SignOutPage() {
    const { signOut } = useSession();
    const { routes } = useSettings();
    const [signedOut, setSignedOut] = React.useState(null)

    React.useEffect(() => {
        if (!signedOut) {
            signOut()
            setSignedOut(true)
            routes.replace(routes.signIn);
        }
    })

    return (
        <View>
            <Text>Signing out...</Text>
        </View>
    );
}
