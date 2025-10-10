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
    useSnowContext
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
    useKeepAwake,
    useSnowContext,
    useTVEventHandler,
    util,
    AppState,
    FillView: SnowFillView,
    Image,
    Linking,
    Platform,
    React,
    ScrollView,
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
    Text,
    TouchableOpacity,
    TVEventHandler,
    TVFocusGuideView,
    View,
}
