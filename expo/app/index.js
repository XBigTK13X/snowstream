import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

// https://medium.com/@sofialz/understanding-focus-on-react-native-the-easy-way-d2646b0d2022

export default function Page() {
  return (
    <View>
      <Text>This is working through the expo router.</Text>
      <Text>And so is this</Text>
      <Link href="/" asChild>
        <TouchableOpacity>
          <Text>Home</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/options" asChild>
        <TouchableOpacity>
          <Text>Options</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
