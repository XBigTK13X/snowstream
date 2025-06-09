
import { View, Text, TouchableOpacity } from "react-native";
import { routes } from './routes'

// TV Navigation and Focus
// https://medium.com/@sofialz/understanding-focus-on-react-native-the-easy-way-d2646b0d2022

// react-native library search
// https://reactnative.directory/

// react-native elements components doc
// https://reactnativeelements.com/docs/next/components

// react-native components doc
// https://reactnative.dev/docs/components-and-apis#basic-components
import { useNavigation } from 'expo-router'
import { Redirect } from 'expo-router'

export default function AppIndex() {
  const navigation = useNavigation();
  const navigationState = navigation.getState()
  if (navigationState?.key != null) {
    return (
      <Redirect href={routes.landing} />
    )
  }
  return <Text>Loading snowstream</Text>;
}
