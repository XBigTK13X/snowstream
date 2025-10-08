import React from 'react'
import Snow from 'expo-snowui'
import { useAppContext } from '../app-context'

export function SnowScreencapGridW(props) {
    const { apiClient, navToItem } = useAppContext()
    const { SnowStyle } = Snow.useStyleContext(props)
    const { readFocusProps } = Snow.useFocusContext()

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
                {...readFocusProps(props)}
                snowStyle={props.snowStyle}
                itemsPerRow={SnowStyle.isWeb ? 4 : 5}
                items={props.items}
                wideImage={true}
                longPressToggle={true}
                disableToggle={props.disableWatched}
                getItemName={(item) => { return item.name }}
                getItemImageUrl={getImageUrl}
                getItemToggleStatus={getItemToggleStatus}
                onPress={navToItem}
                onLongPress={onLongPress} />
        </Snow.FillView>
    )
}

SnowScreencapGridW.isSnowFocusWired = true

export const SnowScreencapGrid = SnowScreencapGridW

export default SnowScreencapGrid