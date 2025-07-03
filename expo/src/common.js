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
    Text,
    TouchableOpacity,
    TVFocusGuideView,
    View,
} from 'react-native'

import { useDebouncedCallback } from 'use-debounce';

// https://www.npmjs.com/package/react-native-tvos
// TVFocusGuideView docs

import util from './util'
import { StaticStyle, DynamicStyle } from './snow-style'

import { useAppContext } from './app-context'

import FillView from './comp/fill-view'

import SnowAdminButton from './comp/snow-admin-button'
import SnowImageButton from './comp/snow-image-button'
import SnowDropdown from './comp/snow-dropdown'
import SnowGrid from './comp/snow-grid'
import SnowHeader from './comp/snow-header'
import SnowInput from './comp/snow-input'
import SnowLabel from './comp/snow-label'
import SnowPosterGrid from './comp/snow-poster-grid'
import SnowToggle from './comp/snow-toggle'
import SnowText from './comp/snow-text'
import SnowScreencapGrid from './comp/snow-screencap-grid'
import SnowVideoPlayer from './comp/snow-video-player'
import SnowVideoControls from './comp/snow-video-controls'
import SnowTrackSelector from './comp/snow-track-selector'
import SnowTextButton from './comp/snow-text-button'
import SnowUpdateMediaButton from './comp/snow-update-media-button'

const getWindowHeight = () => {
    return Dimensions.get('window').height
}

const getWindowWidth = () => {
    return Dimensions.get('window').width
}

const isWeb = Platform.OS === 'web'
const isAndroid = Platform.OS === 'android'
const isTV = Platform.isTV

export default {
    getWindowWidth,
    getWindowHeight,
    isAndroid,
    isTV,
    isWeb,
    useAppContext,
    useDebouncedCallback,
    useLocalSearchParams,
    useNavigation,
    useRouter,
    util,
    DynamicStyle,
    FillView,
    Image,
    Link,
    Linking,
    Modal,
    Platform,
    React,
    Redirect,
    Slot,
    SnowAdminButton,
    SnowDropdown,
    SnowGrid,
    SnowHeader,
    SnowImageButton,
    SnowInput,
    SnowLabel,
    SnowPosterGrid,
    SnowText,
    SnowTextButton,
    SnowToggle,
    SnowScreencapGrid,
    SnowTrackSelector,
    SnowUpdateMediaButton,
    SnowVideoControls,
    SnowVideoPlayer,
    StaticStyle,
    Stack,
    Text,
    TouchableOpacity,
    TVFocusGuideView,
    View,
}
