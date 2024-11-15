import { Redirect, Slot } from 'expo-router';
import { Text } from 'react-native'
import { useSession } from '../../../auth-context';
import { useSettings } from '../../../settings-context';

export default function AuthPageLayout() {
    const { isAdmin, isLoading } = useSession();
    const { routes } = useSettings();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!isAdmin) {
        return <Redirect href={routes.landing} />;
    }

    return <Slot />;
}
