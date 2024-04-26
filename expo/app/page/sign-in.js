import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, ListItem } from '@rneui/themed';
import { useSession } from '../ctx';

export default function SignIn() {
    console.log("Sign in page")
    const { signIn, apiClient } = useSession();
    return (
        <View>
            <Button
                onPress={() => {
                    signIn('admin', 'admin');
                    // Navigate after signing in. You may want to tweak this to ensure sign-in is
                    // successful before navigating.
                    // router.replace('/page/auth/landing');
                }}>
                Sign In
            </Button>
        </View>
    );
}
