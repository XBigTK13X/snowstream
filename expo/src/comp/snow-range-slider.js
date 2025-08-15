import React from "react";
import { View, PanResponder, Pressable, useTVEventHandler, Platform } from "react-native";
import Style from '../snow-style'

// This is a tricky component because props.value can be debounced by the parent
// The numerical value the component tracks and reports is `percent`
// This is a float between 0.0 and 1.0, to ease multiplication
// The parent provides a `min` and `max`
// In addition to the parent receiving the percent, it also receives the value bounded by this `min` and `max`
// Finally, a `step` is provided which dictates how much the value can change.
// The third value provided to the parent is a `stepValue` which is the value rounded to the nearest step

// The slider has two primary components, the thumb and the track.
// The thumb's position within the track determines the `percent` used throughout the component
// However, that position can also be decided by the parent by passing in a percent
// When the component is being manually updated, then parent updates should be ignored
// Otherwise the parent should take priority

// I first tried @react-native-community/slider
// It did not offer enough customization of the track and thumb

// I then tried @react-native-assets/slider
// It completely breaks in Android or Web, depending on the version of react I override it to use

// After a handful of other libraries still had problems, I decided to just roll my own for snowstream

const borderRadius = 16
const thumbSize = 80
const trackSize = 40

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
    const isDraggingRef = React.useRef(false)
    const trackXRef = React.useRef(0)
    const trackRef = React.useRef(null)
    const [percent, setPercent] = React.useState(0)

    const thumbPositionToPercent = (positionX) => {
        const trackX = trackXRef.current
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
        props.onValueChange(newPercent);
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

    const onTrackLayout = () => {
        if (trackRef && trackRef.current) {
            trackRef.current.measure((x, y, width, height, pageX, pageY) => {
                trackXRef.current = pageX
            })
        }
    }

    if (Platform.isTV) {
        const tvRemoteHandler = (remoteEvent) => {
            if (isDraggingRef.current) {
                if (remoteEvent.eventType === 'right') {
                    let result = percent + step
                    if (result < min) {
                        result = min
                    }
                    if (result > max) {
                        result = max
                    }
                    setPercent(result)
                    //props.onValueChange(result)
                }
                else if (remoteEvent.eventType === 'left') {
                    let result = percent - step
                    if (result < min) {
                        result = min
                    }
                    if (result > max) {
                        result = max
                    }
                    setPercent(result)
                    //props.onValueChange(result)
                }
            }
        };
        useTVEventHandler(tvRemoteHandler);
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

    const thumbStyle = [
        styles.thumb,
        {
            left: thumbX - styles.thumb.width / 2
        }
    ]

    return (
        <View style={styles.wrapper}>
            <View {...panRef.current.panHandlers} style={trackWrapperStyle} onLayout={onTrackLayout} >
                <View ref={trackRef} style={leftTrackStyle} />
                <View style={styles.rightTrack} />
                <View style={thumbStyle} />
            </View>
        </View>
    );
}

export default SnowRangeSlider