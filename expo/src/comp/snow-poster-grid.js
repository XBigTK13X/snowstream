import React from 'react'
import Snow from 'react-native-snowui'
import { useAppContext } from '../app-context'

export function SnowPosterGrid(props) {
    if (!props.items || !props.items.length) {
        return null
    }
    const { routes, apiClient } = useAppContext()

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
    const onLongPress = (item) => {
        apiClient.toggleItemWatched(item)
    }
    const getItemToggleStatus = (item) => {
        return !props.disableWatched && (toggledItems.hasOwnProperty(item.id) ? !item.watched : item.watched)
    }
    return (
        <Snow.FillView>
            {props.title ?
                <Snow.Label>
                    {props.title} ({props.items.length})
                </Snow.Label>
                : null}
            <Snow.ImageGrid
                shouldFocus={true}
                wideImage={false}
                isMainGrid={true}
                longPressToggle={true}
                getItemName={(item) => { item.name }}
                getItemImageUrl={getImageUrl}
                getItemToggleStatus={getItemToggleStatus}
                onPress={() => { routes.gotoItem(item) }}
                onLongPress={onLongPress} />
        </Snow.FillView>
    )
}

export default SnowPosterGrid