import { Redirect, Slot } from 'expo-router';
import { Text } from 'react-native'
import { useSession } from '../../auth-context';

export default function AuthPageLayout() {
    const { session, isLoading } = useSession();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!session) {
        return <Redirect href="/page/sign-in" />;
    }

    return <Slot />;
}
