import { Link } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Button, ListItem } from '@rneui/themed';

import { useSession } from '../../ctx';

export default function Index() {
    console.log("Landing page")
    const { signOut } = useSession();
    return (
        <View>
            <Button
                onPress={() => {
                    // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
                    signOut();
                }}
                title="Sign Out">

            </Button>
            <Text>This is working through the expo router.</Text>
            <Text>And so is this</Text>
            <>
                <ListItem>
                    <Link href="/" asChild>
                        <TouchableOpacity>
                            <Button title="Home">Home</Button>
                        </TouchableOpacity>
                    </Link>
                </ListItem>
                <ListItem>
                    <Link href="/page/options" asChild>
                        <TouchableOpacity>
                            <Button title="Options">Options</Button>
                        </TouchableOpacity>
                    </Link>
                </ListItem>
            </>
        </View>

    );
}
