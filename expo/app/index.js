const React = require("react-native");
import { Link } from "expo-router";

export default function Page() {
  return (
    <React.View>
      <React.Text>This is working through the expo router.</React.Text>
      <React.Text>And so is this</React.Text>
      <Link href="/options" asChild>
        <React.Pressable>
          <React.Text>Options</React.Text>
        </React.Pressable>
      </Link>
    </React.View>
  );
}
