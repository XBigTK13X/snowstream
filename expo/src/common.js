import React from 'react'

import {
    Link,
    Redirect,
    Slot,
    Stack,
    useLocalSearchParams,
    useNavigation,
    useRouter
} from 'expo-router'

import {
    Image
} from 'expo-image'

import {
    Dimensions,
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

import { useDebouncedCallback } from 'use-debounce';

// https://www.npmjs.com/package/react-native-tvos
// TVFocusGuideView docs

import util from './util'

import { useAppContext } from './app-context'

import SnowAdminButton from './comp/snow-admin-button'
import SnowImageButton from './comp/snow-image-button'
import SnowDropdown from './comp/snow-dropdown'
import SnowGrid from './comp/snow-grid'
import SnowInput from './comp/snow-input'
import SnowLabel from './comp/snow-label'
import SnowPosterGrid from './comp/snow-poster-grid'
import SnowText from './comp/snow-text'
import SnowScreencapGrid from './comp/snow-screencap-grid'
import SnowVideoPlayer from './comp/snow-video-player'
import SnowVideoControls from './comp/snow-video-controls'
import SnowTrackSelector from './comp/snow-track-selector'
import SnowTextButton from './comp/snow-text-button'
import SnowUpdateMediaButton from './comp/snow-update-media-button'

const Styles = {
    box: {
        padding: 5,
        margin: 5,
        width: '100%',
        height: '100%',
    },
}

const getWindowHeight = () => {
    return Dimensions.get('window').height
}

const getWindowWidth = () => {
    return Dimensions.get('window').width
}

export default {
    getWindowWidth,
    getWindowHeight,
    useAppContext,
    useDebouncedCallback,
    useLocalSearchParams,
    useNavigation,
    useRouter,
    util,
    Image,
    Link,
    Linking,
    Modal,
    Platform,
    React,
    Redirect,
    ScrollView,
    Slot,
    SnowAdminButton,
    SnowDropdown,
    SnowGrid,
    SnowImageButton,
    SnowInput,
    SnowLabel,
    SnowPosterGrid,
    SnowText,
    SnowTextButton,
    SnowScreencapGrid,
    SnowTrackSelector,
    SnowUpdateMediaButton,
    SnowVideoControls,
    SnowVideoPlayer,
    Stack,
    Styles,
    StyleSheet,
    Text,
    TouchableOpacity,
    TVFocusGuideView,
    View,
}
