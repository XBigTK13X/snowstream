import React from 'react'
import { View } from 'react-native'
import Snow from 'react-native-snowui'
import { useAppContext } from '../app-context'

export function SnowPosterGrid(props) {
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
        return !props.disableWatched && item.watched
    }
    return (
        <View>
            {props.title ?
                <Snow.Label>
                    {props.title} ({props.items.length})
                </Snow.Label>
                : null}
            <Snow.ImageGrid
                snowStyle={props.snowStyle}
                items={props.items}
                shouldFocus={props.shouldFocus}
                wideImage={false}
                longPressToggle={true}
                disableToggle={props.disableWatched}
                getItemName={(item) => { return item.name }}
                getItemImageUrl={getImageUrl}
                getItemToggleStatus={getItemToggleStatus}
                onPress={(item) => { routes.gotoItem(item) }}
                onLongPress={onLongPress} />
        </View>
    )
}

export default SnowPosterGrid