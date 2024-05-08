import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, ListItem } from '@rneui/themed';
import { useSession } from '../auth-context';
import { useSettings } from '../settings-context';

export default function SignIn() {
    const { signIn, apiClient } = useSession();
    const { routes } = useSettings();
    return (
        <View>
            <Button
                onPress={() => {
                    // TODO Add UI for username and password
                    // TODO Add Profile pick selectors
                    signIn('admin', 'admin').then((token) => {
                        routes.replace(routes.landing);
                    })
                }}>
                Sign In
            </Button>
        </View>
    );
}
