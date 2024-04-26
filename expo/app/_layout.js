import { Redirect, Slot } from "expo-router";
import { Text, TVFocusGuideView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, createTheme } from '@rneui/themed'

const theme = createTheme({
  lightColors: {
    primary: '#db9e2c'
  },
  darkColors: {
    primary: '#634712'
  },
  mode: 'light'
})

import { SessionProvider } from './ctx';

function Header() {
  return <Text>This is the header.</Text>;
}

function Footer() {
  return <Text>This is the footer.</Text>;
}


export default function HomeLayout() {
  console.log("Root layout")
  return (
    <ThemeProvider theme={theme}>
      <SafeAreaProvider>
        <SafeAreaView>
          <TVFocusGuideView autoFocus>
            <SessionProvider>
              <Header />
              <Slot />
              <Footer />
            </SessionProvider>
          </TVFocusGuideView>
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}