import React from 'react'

import {
    Link,
    Redirect,
    Slot,
    useLocalSearchParams,
    useNavigation
} from 'expo-router'

import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Dimensions,
    TVFocusGuideView,
    Linking,
    Platform
} from 'react-native'

// https://www.npmjs.com/package/react-native-tvos
// TVFocusGuideView docs

import {
    Button,
    ListItem,
    Image
} from '@rneui/themed'

import { useSession } from './auth-context'

import { useSettings } from './settings-context'

import SnowGrid from './comp/snow-grid'
import SnowText from './comp/snow-text'
import SnowInput from './comp/snow-input'
import SnowDropdown from './comp/snow-dropdown'
import SnowLabel from './comp/snow-label'

export default {
    Button,
    Dimensions,
    FlatList,
    Image,
    Link,
    Linking,
    ListItem,
    Platform,
    React,
    Redirect,
    SnowDropdown,
    SnowGrid,
    SnowInput,
    SnowLabel,
    SnowText,
    StyleSheet,
    Slot,
    Text,
    TouchableOpacity,
    TVFocusGuideView,
    useLocalSearchParams,
    useNavigation,
    useSession,
    useSettings,
    View,
}