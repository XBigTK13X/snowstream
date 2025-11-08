import React from 'react'
import Snow from 'expo-snowui'
import { Asset } from 'snowstream'
import { useAppContext } from '../app-context'

export function SnowScreencapGridW(props) {
    const { apiClient, navToItem } = useAppContext()
    const { SnowStyle, readFocusProps } = Snow.useSnowContext(props)

    const getImageUrl = (item) => {
        let thumbnailUrl = null
        if (item.screencap_image) {
            thumbnailUrl = item.screencap_image.thumbnail_web_path
        }
        if (!thumbnailUrl) {
            return Asset.image.missing.screencap
        }
        return thumbnailUrl
    }
    const getItemImageFallback = () => {
        return Asset.image.missing.screencap
    }
    const onLongPress = (item) => {
        apiClient.toggleItemWatched(item)
    }
    const getItemToggleStatus = (item) => {
        return !props.disableWatched && item.watched
    }

    let scaleProps = {}
    scaleProps.itemsPerRow = 5
    if (SnowStyle.isPortrait) {
        scaleProps.itemsPerRow = 2
        scaleProps.itemsPerPage = 10
    }

    return (
        <Snow.FillView>
            {props.title ?
                <Snow.Label>
                    {props.title} ({props.items.length})
                </Snow.Label>
                : null}
            <Snow.ImageGrid
                {...readFocusProps(props)}
                {...scaleProps}
                snowStyle={props.snowStyle}
                items={props.items}
                wideImage={true}
                longPressToggle={true}
                disableToggle={props.disableWatched}
                getItemName={(item) => { return item.name }}
                getItemImageUrl={getImageUrl}
                getItemImageFallback={getItemImageFallback}
                getItemToggleStatus={getItemToggleStatus}
                onPress={navToItem}
                onLongPress={onLongPress} />
        </Snow.FillView>
    )
}

SnowScreencapGridW.isSnowFocusWired = true

export const SnowScreencapGrid = SnowScreencapGridW

export default SnowScreencapGrid