import React from 'react'
import Snow from 'expo-snowui'
import { Asset } from 'snowstream'
import { useAppContext } from '../app-context'


function SnowPosterGridW(props) {
    const { navToItem, apiClient } = useAppContext()
    const { SnowStyle, readFocusProps } = Snow.useSnowContext(props)

    const getImageUrl = (item) => {
        let thumbnailUrl = null
        if (item.poster_image) {
            thumbnailUrl = item.poster_image.thumbnail_web_path
        }
        if (item.thumbnail_url) {
            thumbnailUrl = item.thumbnail_url
        }
        return thumbnailUrl
    }
    const getItemImageFallback = () => {
        return Asset.image.missing.poster
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
        <>
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
                wideImage={false}
                longPressToggle={true}
                disableToggle={props.disableWatched}
                getItemName={(item) => { return item.name }}
                getItemImageUrl={getImageUrl}
                getItemImageFallback={getItemImageFallback}
                getItemToggleStatus={getItemToggleStatus}
                onPress={navToItem}
                onLongPress={onLongPress} />
        </>
    )
}

SnowPosterGridW.isSnowFocusWired = true

export const SnowPosterGrid = SnowPosterGridW

export default SnowPosterGrid