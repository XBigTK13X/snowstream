import React from 'react'
import Snow from '@snowsuite/expo-snowui'
import { Asset } from '../asset'
import { useAppContext } from '../app-context'
import util from '../util'


export function SnowPosterGrid(props) {
    const { navToItem, apiClient } = useAppContext()
    const { SnowStyle } = Snow.useSnowContext(props)

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
    const getItemName = (item) => {
        if (item?.name) {
            return item.name
        }
        if (item?.model_kind === 'show_episode' && item?.season?.show?.name) {
            return `${item.season.show.name} - ${util.formatEpisodeTitle(item)}`
        }
        return item?.name
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
                {...scaleProps}
                overlayTitle={props.overlayTitle}
                focusStart={props.focusStart}
                focusKey={props.focusKey}
                parentPath={props.parentPath}
                xx={props.xx}
                yy={props.yy}
                snowStyle={props.snowStyle}
                items={props.items}
                wideImage={false}
                longPressToggle={true}
                disableToggle={props.disableWatched}
                getItemName={getItemName}
                getItemImageUrl={getImageUrl}
                getItemImageFallback={getItemImageFallback}
                getItemToggleStatus={getItemToggleStatus}
                onPress={navToItem}
                onLongPress={onLongPress} />
        </>
    )
}

export default SnowPosterGrid