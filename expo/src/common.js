import React from 'react'

import {
    AppState,
    Linking,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    TVEventHandler,
    TVFocusGuideView,
    View,
} from 'react-native'

import { Image } from 'expo-image'

import { useKeepAwake } from 'expo-keep-awake';

import { useDebouncedCallback } from 'use-debounce';

import * as Sentry from "@sentry/react-native";

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

import SnowCreateJobButton from './comp/snow-create-job-button'
import SnowPosterGrid from './comp/snow-poster-grid'
import SnowScreencapGrid from './comp/snow-screencap-grid'
import SnowTrackSelector from './comp/snow-track-selector'

const isAndroid = Platform.OS === 'android'
const isTV = Platform.isTV
const isWeb = Platform.OS === 'web'

export default {
    isAndroid,
    isTV,
    isWeb,
    useDebouncedCallback,
    useKeepAwake,
    useSnowContext,
    util,
    AppState,
    FillView: SnowFillView,
    Image,
    Linking,
    Platform,
    React,
    ScrollView,
    Sentry,
    Snow,
    SnowBreak,
    SnowCreateJobButton,
    SnowDropdown,
    SnowGrid,
    SnowHeader,
    SnowImageButton,
    SnowImageGrid,
    SnowInput,
    SnowLabel,
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
    SnowView,
    Text,
    TouchableOpacity,
    TVEventHandler,
    TVFocusGuideView,
    View,
}
