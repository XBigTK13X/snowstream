import React from 'react'
import Snow from 'expo-snowui'
import { Asset } from '../asset'
import { useAppContext } from '../app-context'

export function SnowScreencapGrid(props) {
    const { apiClient, navToItem } = useAppContext()
    const { SnowStyle } = Snow.useSnowContext(props)

    const getImageUrl = (item) => {
        if (!props.disableWatched && !item.watched) {
            return null
        }
        let thumbnailUrl = null
        if (item.thumbnail_web_path) {
            thumbnailUrl = item.thumbnail_web_path
        }
        if (item.screencap_image) {
            thumbnailUrl = item.screencap_image.thumbnail_web_path
        }
        return thumbnailUrl
    }
    const getItemImageSource = (item) => {
        if (!props.disableWatched && !item.watched) {
            return Asset.image.spoiler.screencap
        }
        return null
    }

    const getItemImageFallback = () => {
        return Asset.image.missing.screencap
    }

    const getItemName = (item) => {
        if (!props.disableWatched && !item.watched) {
            return item?.name?.split(' - ')[0]
        }
        return item.name
    }

    const onLongPress = (item) => {
        apiClient.toggleItemWatched(item)
    }
    const getItemToggleStatus = (item) => {
        return !props.disableWatched && item.watched
    }

    let scaleProps = {}
    scaleProps.itemsPerRow = 4
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
                {...scaleProps}
                overlayTitle={props.overlayTitle}
                focusStart={props.focusStart}
                focusKey={props.focusKey}
                parentPath={props.parentPath}
                xx={props.xx}
                yy={props.yy}
                snowStyle={props.snowStyle}
                items={props.items}
                wideImage={true}
                longPressToggle={true}
                disableToggle={props.disableWatched}
                getItemName={getItemName}
                getItemImageUrl={getImageUrl}
                getItemImageSource={getItemImageSource}
                getItemImageFallback={getItemImageFallback}
                getItemToggleStatus={getItemToggleStatus}
                onPress={navToItem}
                onLongPress={onLongPress} />
        </Snow.FillView>
    )
}

export default SnowScreencapGrid