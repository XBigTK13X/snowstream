import { Redirect, Slot } from "expo-router";
import { Text, TVFocusGuideView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, createTheme } from '@rneui/themed'
import { SessionProvider } from './auth-context';
import { SettingsProvider } from './settings-context';
import { Button, ListItem } from '@rneui/themed';
const routes = require('./routes')

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
  return (
    <>
      <Button title="Home" onPress={routes.func(routes.landing)} />
      <Button title="Options" onPress={routes.func(routes.options)} />
      <Button title="Sign Out" onPress={routes.func(routes.signOut)} />
      <Text>{"\n"}</Text>
    </>
  )
}

function Footer() {
  return (
    <>
      <Text>{"\n"}</Text>
      <Text></Text>
    </>
  )
}

// TODO Do I want always visible nav bars, or some kind of drawer?

export default function HomeLayout() {
  return (
    <div className="app-wrapper">
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
    </div>
  );
}