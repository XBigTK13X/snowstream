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

import { Image } from 'expo-image'

import {
    AppState,
    Linking,
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
import Style from './snow-style'

import { useAppContext } from './app-context'

import FillView from './comp/fill-view'

import SnowImageButton from './comp/snow-image-button'
import SnowDropdown from './comp/snow-dropdown'
import SnowGrid from './comp/snow-grid'
import SnowHeader from './comp/snow-header'
import SnowInput from './comp/snow-input'
import SnowLabel from './comp/snow-label'
import SnowModal from './comp/snow-modal'
import SnowPosterGrid from './comp/snow-poster-grid'
import SnowToggle from './comp/snow-toggle'
import SnowText from './comp/snow-text'
import SnowScreencapGrid from './comp/snow-screencap-grid'
import SnowVideoPlayer from './comp/snow-video-player'
import SnowVideoControls from './comp/snow-video-controls'
import SnowTrackSelector from './comp/snow-track-selector'
import SnowTextButton from './comp/snow-text-button'
import SnowUpdateMediaButton from './comp/snow-update-media-button'

const isWeb = Platform.OS === 'web'
const isAndroid = Platform.OS === 'android'
const isTV = Platform.isTV

export default {
    isAndroid,
    isTV,
    isWeb,
    useAppContext,
    useDebouncedCallback,
    useLocalSearchParams,
    useNavigation,
    useRouter,
    util,
    AppState,
    FillView,
    Image,
    Link,
    Linking,
    Platform,
    React,
    Redirect,
    Slot,
    SnowDropdown,
    SnowGrid,
    SnowHeader,
    SnowImageButton,
    SnowInput,
    SnowLabel,
    SnowModal,
    SnowPosterGrid,
    SnowScreencapGrid,
    SnowText,
    SnowTextButton,
    SnowToggle,
    SnowTrackSelector,
    SnowUpdateMediaButton,
    SnowVideoControls,
    SnowVideoPlayer,
    Stack,
    Style,
    Text,
    TouchableOpacity,
    TVFocusGuideView,
    View,
}
