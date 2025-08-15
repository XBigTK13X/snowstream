import React from 'react'

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

import {
    AppState,
    Linking,
    Platform,
    Text,
    TouchableOpacity,
    TVEventHandler,
    TVFocusGuideView,
    useTVEventHandler,
    View,
} from 'react-native'

import { useDebouncedCallback } from 'use-debounce';

// https://www.npmjs.com/package/react-native-tvos
// TVFocusGuideView docs

import util from './util'
import Style from './snow-style'

import { AppContextProvider, useAppContext } from './app-context'

import { PlayerContextProvider, usePlayerContext } from './player-context'

import FillView from './comp/fill-view'

import SnowDropdown from './comp/snow-dropdown'
import SnowGrid from './comp/snow-grid'
import SnowHeader from './comp/snow-header'
import SnowImageButton from './comp/snow-image-button'
import SnowInput from './comp/snow-input'
import SnowLabel from './comp/snow-label'
import SnowModal from './comp/snow-modal'
import SnowPosterGrid from './comp/snow-poster-grid'
import SnowRangeSlider from './comp/snow-range-slider'
import SnowScreencapGrid from './comp/snow-screencap-grid'
import SnowTabs from './comp/snow-tabs'
import SnowText from './comp/snow-text'
import SnowTextButton from './comp/snow-text-button'
import SnowToggle from './comp/snow-toggle'
import SnowTrackSelector from './comp/snow-track-selector'
import SnowUpdateMediaButton from './comp/snow-update-media-button'
import SnowVideoControls from './comp/snow-video-controls'
import SnowVideoPlayer from './comp/snow-video-player'

const isWeb = Platform.OS === 'web'
const isAndroid = Platform.OS === 'android'
const isTV = Platform.isTV

export default {
    isAndroid,
    isTV,
    isWeb,
    useAppContext,
    usePlayerContext,
    useDebouncedCallback,
    useKeepAwake,
    useLocalSearchParams,
    useNavigation,
    usePathname,
    useRouter,
    useTVEventHandler,
    util,
    AppContextProvider,
    AppState,
    FillView,
    Image,
    Link,
    Linking,
    Platform,
    PlayerContextProvider,
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
    SnowRangeSlider,
    SnowScreencapGrid,
    SnowTabs,
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
    TVEventHandler,
    TVFocusGuideView,
    View,
}
