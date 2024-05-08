import { Redirect, Slot } from "expo-router";
import { Text, TVFocusGuideView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, createTheme } from '@rneui/themed'
import { SessionProvider } from './auth-context';
import { SettingsProvider } from './settings-context';

const theme = createTheme({
  lightColors: {
    primary: '#db9e2c'
  },
  darkColors: {
    primary: '#634712'
  },
  mode: 'light'
})

function Header() {
  return <Text>This is the header.</Text>;
}

function Footer() {
  return <Text>This is the footer.</Text>;
}


export default function HomeLayout() {
  return (
    <ThemeProvider theme={theme}>
      <SafeAreaProvider>
        <SafeAreaView>
          <TVFocusGuideView autoFocus>
            <SettingsProvider>
              <SessionProvider>
                <Header />
                <Slot />
                <Footer />
              </SessionProvider>
            </SettingsProvider>
          </TVFocusGuideView>
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}