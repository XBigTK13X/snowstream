import React from 'react'
import { View } from 'react-native'
import Snow from 'expo-snowui'
import { usePathname, useLocalSearchParams } from 'expo-router'
import { useAppContext } from '../app-context'


function SnowPosterGridW(props) {
    const { navToItem, apiClient } = useAppContext()
    const { SnowStyle } = Snow.useStyleContext(props)
    const { readFocusProps } = Snow.useFocusContext()

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
                {...readFocusProps(props)}
                itemsPerRow={SnowStyle.isWeb ? 4 : 5}
                snowStyle={props.snowStyle}
                items={props.items}
                wideImage={false}
                longPressToggle={true}
                disableToggle={props.disableWatched}
                getItemName={(item) => { return item.name }}
                getItemImageUrl={getImageUrl}
                getItemToggleStatus={getItemToggleStatus}
                onPress={navToItem}
                onLongPress={onLongPress} />
        </View>
    )
}

SnowPosterGridW.isSnowFocusWired = true

export const SnowPosterGrid = SnowPosterGridW

export default SnowPosterGrid