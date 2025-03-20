import React from 'react'

import { Link, Redirect, Slot, useLocalSearchParams, useNavigation } from 'expo-router'

import {
    Dimensions,
    FlatList,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TVFocusGuideView,
    View,
} from 'react-native'

// https://www.npmjs.com/package/react-native-tvos
// TVFocusGuideView docs

import { Button, ListItem, Image } from '@rneui/themed'

import { useSession } from './auth-context'
import { useSettings } from './settings-context'
import { useMessageDisplay } from './message-context'

import SnowGrid from './comp/snow-grid'
import SnowText from './comp/snow-text'
import SnowInput from './comp/snow-input'
import SnowDropdown from './comp/snow-dropdown'
import SnowLabel from './comp/snow-label'
import SnowButton from './comp/snow-button'
import SnowPosterGrid from './comp/snow-poster-grid'
import SnowThumbGrid from './comp/snow-thumb-grid'

const Styles = StyleSheet.create({
    box: {
        padding: 5,
        margin: 5,
        width: '100%',
        height: '100%',
    },
})

export default {
    Button,
    Dimensions,
    FlatList,
    Image,
    Link,
    Linking,
    ListItem,
    Modal,
    Platform,
    React,
    Redirect,
    ScrollView,
    Slot,
    SnowButton,
    SnowDropdown,
    SnowGrid,
    SnowInput,
    SnowLabel,
    SnowThumbGrid,
    SnowPosterGrid,
    SnowText,
    StyleSheet,
    Styles,
    Text,
    TouchableOpacity,
    TVFocusGuideView,
    useLocalSearchParams,
    useMessageDisplay,
    useNavigation,
    useSession,
    useSettings,
    View,
}
