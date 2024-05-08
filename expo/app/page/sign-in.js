import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, ListItem } from '@rneui/themed';
import { useSession } from '../auth-context';

export default function SignIn() {
    const { signIn, apiClient } = useSession();
    return (
        <View>
            <Button
                onPress={() => {
                    // TODO Add UI for username and password
                    // TODO Add Profile pick selectors
                    signIn('admin', 'admin').then((token) => {
                        router.replace('/page/auth/landing');
                    })
                }}>
                Sign In
            </Button>
        </View>
    );
}
