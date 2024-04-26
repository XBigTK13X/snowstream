import { Slot } from "expo-router";
import { Text, TVFocusGuideView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

function Header() {
  return <Text>This is the header.</Text>;
}

function Footer() {
  return <Text>This is the footer.</Text>;
}

export default function HomeLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <TVFocusGuideView autoFocus>
          <Header />
          <Slot />
          <Footer />
        </TVFocusGuideView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
