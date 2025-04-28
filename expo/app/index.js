
import { View, Text, TouchableOpacity } from "react-native";
const routes = require('./routes')


// TV Navigation and Focus
// https://medium.com/@sofialz/understanding-focus-on-react-native-the-easy-way-d2646b0d2022

// react-native library search
// https://reactnative.directory/

// react-native elements components doc
// https://reactnativeelements.com/docs/next/components

// react-native components doc
// https://reactnative.dev/docs/components-and-apis#basic-components
import { useRootNavigationState } from 'expo-router'
import { Redirect } from 'expo-router'

export default function AppIndex() {
  const navigation = useRootNavigationState();
  if (navigation?.key != null) {
    return (
      <Redirect href={routes.landing} />
    )
  }
  return <Text>Loading snowstream</Text>;
}
