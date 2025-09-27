import React from 'react'
import Snow from 'react-native-snowui'
import { useAppContext } from '../app-context'
import { useStyleContext } from 'react-native-snowui'

export function SnowScreencapGrid(props) {
    const { routes, apiClient } = useAppContext()
    const { SnowStyle } = useStyleContext(props)

    const getImageUrl = (item) => {
        let thumbnailUrl = null
        if (item.screencap_image) {
            thumbnailUrl = item.screencap_image.thumbnail_web_path
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
        <Snow.FillView>
            {props.title ?
                <Snow.Label>
                    {props.title} ({props.items.length})
                </Snow.Label>
                : null}
            <Snow.ImageGrid
                snowStyle={props.snowStyle}
                itemsPerRow={SnowStyle.isWeb ? 4 : 5}
                items={props.items}
                wideImage={true}
                longPressToggle={true}
                disableToggle={props.disableWatched}
                getItemName={(item) => { return item.name }}
                getItemImageUrl={getImageUrl}
                getItemToggleStatus={getItemToggleStatus}
                onPress={(item) => { routes.gotoItem(item) }}
                onLongPress={onLongPress} />
        </Snow.FillView>
    )
}

export default SnowScreencapGrid