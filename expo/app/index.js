
import { Link } from "expo-router";
import { useEffect } from 'react'
import { View, Text, TouchableOpacity } from "react-native";
import { Button, ListItem } from '@rneui/themed';

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

export default function Page() {
  console.log("Index")
  const navigation = useRootNavigationState();
  if (navigation?.key != null) {
    return (
      <Redirect href="/page/auth/landing" />
    )
  }
  return <Text>Loading the app</Text>;
}
