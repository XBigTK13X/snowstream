import React from 'react'

import {
    AppState,
    findNodeHandle,
    Linking,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    TVEventHandler,
    TVFocusGuideView,
    useTVEventHandler,
    View,
} from 'react-native'

import {
    Link,
    Redirect,
    Slot,
    Stack,
    useLocalSearchParams,
    useNavigation,
    usePathname,
    useRouter
} from 'expo-router'

import { Image } from 'expo-image'

import { useKeepAwake } from 'expo-keep-awake';

import { useDebouncedCallback } from 'use-debounce';

// https://www.npmjs.com/package/react-native-tvos
// TVFocusGuideView docs

import util from './util'

import Snow, {
    SnowBreak,
    SnowDropdown,
    SnowFillView,
    SnowGrid,
    SnowHeader,
    SnowImageButton,
    SnowImageGrid,
    SnowInput,
    SnowLabel,
    SnowModal,
    SnowOverlay,
    SnowRangeSlider,
    SnowTabs,
    SnowTarget,
    SnowText,
    SnowTextButton,
    SnowToggle,
    SnowView,
    useStyleContext,
    useFocusContext,
    useFocusLayer
} from 'expo-snowui'

import SnowPosterGrid from './comp/snow-poster-grid'
import SnowScreencapGrid from './comp/snow-screencap-grid'
import SnowTrackSelector from './comp/snow-track-selector'
import SnowUpdateMediaButton from './comp/snow-update-media-button'
import SnowVideoControls from './comp/snow-video-controls'
import SnowVideoPlayer from './comp/snow-video-player'

const isWeb = Platform.OS === 'web'
const isAndroid = Platform.OS === 'android'
const isTV = Platform.isTV

export default {
    findNodeHandle,
    isAndroid,
    isTV,
    isWeb,
    useDebouncedCallback,
    useFocusContext,
    useFocusLayer,
    useKeepAwake,
    useLocalSearchParams,
    useNavigation,
    usePathname,
    useRouter,
    useStyleContext,
    useTVEventHandler,
    util,
    AppState,
    FillView: SnowFillView,
    Image,
    Link,
    Linking,
    Platform,
    React,
    Redirect,
    ScrollView,
    Slot,
    Snow,
    SnowBreak,
    SnowDropdown,
    SnowGrid,
    SnowHeader,
    SnowImageButton,
    SnowImageGrid,
    SnowInput,
    SnowLabel,
    SnowModal,
    SnowOverlay,
    SnowPosterGrid,
    SnowRangeSlider,
    SnowScreencapGrid,
    SnowTabs,
    SnowTarget,
    SnowText,
    SnowTextButton,
    SnowToggle,
    SnowTrackSelector,
    SnowUpdateMediaButton,
    SnowVideoControls,
    SnowVideoPlayer,
    SnowView,
    Stack,
    Text,
    TouchableOpacity,
    TVEventHandler,
    TVFocusGuideView,
    View,
}
