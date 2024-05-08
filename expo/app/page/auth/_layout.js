import { Redirect, Slot } from 'expo-router';
import { Text } from 'react-native'
import { useSession } from '../../auth-context';
import { useSettings } from '../../settings-context';

export default function AuthPageLayout() {
    const { session, isLoading } = useSession();
    const { routes } = useSettings();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!session) {
        return <Redirect href={routes.signIn} />;
    }

    return <Slot />;
}
