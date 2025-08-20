import React from "react";
import {
    PanResponder,
    Pressable,
    View,
    findNodeHandle
} from "react-native";
import Style from '../snow-style'
import { useDebouncedCallback } from 'use-debounce'
import { useAppContext } from '../app-context'
import { useFocusContext } from '../focus-context'

// This is a tricky component because props.value can be debounced
// The numerical value the component provides is `percent`
// This is a float between 0.0 and 1.0, to ease multiplication

// The slider has two primary components, the thumb and the track.
// The thumb's position within the track determines the `percent` used throughout the component
// However, that position can also be decided by the parent by passing in a percent
// When the component is being manually updated, then parent updates should be ignored
// Otherwise the parent should take priority

// I first tried @react-native-community/slider
// It did not offer enough customization of the track and thumb

// I then tried @react-native-assets/slider
// It completely breaks in Android or Web, depending on the version of react I override it to use

// After a handful of other libraries still had problems, I rolled my own

const borderRadius = 16
const thumbSize = 60
const trackSize = 30

const styles = {
    wrapper: {
        alignItems: "center",
        marginVertical: trackSize
    },
    trackWrapper: {
        height: trackSize,
        borderRadius: borderRadius,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    leftTrack: {
        height: "100%",
        borderTopLeftRadius: borderRadius,
        borderBottomLeftRadius: borderRadius,
        backgroundColor: Style.color.coreDark
    },
    rightTrack: {
        flex: 1,
        height: "100%",
        borderTopRightRadius: borderRadius,
        borderBottomRightRadius: borderRadius,
        backgroundColor: Style.color.outlineDark
    },
    thumb: {
        position: "absolute",
        width: thumbSize,
        height: thumbSize,
        borderRadius: thumbSize / 2,
        borderWidth: 4,
        backgroundColor: Style.color.core,
        borderColor: Style.color.coreDark
    }
}

const min = 0.0
const max = 1.0
const step = 0.01

export function SnowRangeSlider(props) {
    const { allowFocusing, setLockedElement, lockedElement } = useFocusContext()
    const { config, setRemoteCallbacks } = useAppContext()
    const isDraggingRef = React.useRef(false)
    const [percent, setPercent] = React.useState(0)
    const percentRef = React.useRef(percent)
    const [thumbFocus, setThumbFocus] = React.useState(false)
    const elementRef = React.useRef(null)
    const [applyStepInterval, setApplyStepInterval] = React.useState(null)

    let onValueChange = props.onValueChange
    if (props.debounce) {
        onValueChange = useDebouncedCallback(props.onValueChange, config.debounceMilliseconds)
    }

    const thumbPositionToPercent = (positionX) => {
        if (positionX < 0) {
            positionX = 0
        }
        if (positionX > props.width) {
            positionX = props.width
        }
        let newPercent = positionX / props.width
        if (newPercent < 0) {
            newPercent = 0
        }
        if (newPercent > 1) {
            newPercent = 1
        }
        setPercent(newPercent)
        onValueChange(newPercent)
    }

    const panRef = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderEnd: () => {
                isDraggingRef.current = false
            },
            onPanResponderRelease: () => {
                isDraggingRef.current = false
            },
            onPanResponderMove: (pressEvent) => {
                isDraggingRef.current = true
                const positionX = pressEvent.nativeEvent.locationX
                thumbPositionToPercent(positionX)
            },
            onPanResponderGrant: (pressEvent) => {
                isDraggingRef.current = true
                const positionX = pressEvent.nativeEvent.locationX
                thumbPositionToPercent(positionX)
            }
        })
    );

    React.useEffect(() => {
        if (!isDraggingRef.current) {
            setPercent(props.percent)
        }
    }, [props.percent])

    React.useEffect(() => {
        percentRef.current = percent
    }, [percent])

    React.useEffect(() => {
        setRemoteCallbacks((callbacks) => {
            callbacks['slider'] = sliderHandleRemote
            return callbacks
        })
        return () => {
            setRemoteCallbacks((callbacks) => {
                callbacks['slider'] = null
                return callbacks
            })
        }
    })

    const applyStep = (amount) => {
        let result = percentRef.current + amount
        if (result < min) {
            result = min
        }
        if (result > max) {
            result = max
        }
        percentRef.current = result
        setPercent(result)
        onValueChange(result)
    }

    const longPress = (amount, action) => {
        if (action === 0) {
            applyStep(amount)
            setApplyStepInterval(setInterval(() => { applyStep(amount) }, 100))
        }
        if (action === 1) {
            clearInterval(applyStepInterval)
        }
    }

    const sliderHandleRemote = (kind, action) => {
        if (lockedElement) {
            if (kind === 'right') {
                applyStep(step)
                clearInterval(applyStepInterval)
            }
            else if (kind === 'longRight') {
                longPress(step * 2, action)
            }
            else if (kind === 'left') {
                applyStep(-step)
                clearInterval(applyStepInterval)
            }
            else if (kind === 'longLeft') {
                longPress(-step * 2, action)
            }
            else if (kind === 'down') {
                focusThumb(false)
            }
        }
    }

    const focusThumb = (focus) => {
        if (allowFocusing) {
            if (focus !== thumbFocus) {
                if (focus) {
                    setLockedElement(findNodeHandle(elementRef.current))
                } else {
                    setLockedElement(null)
                }
                setThumbFocus(focus)
            }
        }
    }

    const trackWrapperStyle = [
        styles.trackWrapper,
        {
            width: props.width
        }
    ]

    const thumbX = percent * props.width

    const leftTrackStyle = [
        styles.leftTrack,
        {
            width: thumbX
        }
    ]

    let thumbStyle = [
        styles.thumb,
        {
            left: thumbX - styles.thumb.width / 2
        }
    ]
    if (thumbFocus) {
        thumbStyle.push({
            backgroundColor: 'white'
        })
    }

    return (
        <View style={styles.wrapper}>
            <View {...panRef.current.panHandlers} style={trackWrapperStyle}>
                <View style={leftTrackStyle} />
                <View style={styles.rightTrack} />
                <Pressable
                    ref={elementRef}
                    onPress={() => { focusThumb(true) }}
                    onFocus={() => { focusThumb(true) }}
                    focusable={true}
                    style={thumbStyle} />
            </View>
        </View>
    );
}

export default SnowRangeSlider