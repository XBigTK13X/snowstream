import React from 'react'
import Snow from 'react-native-snowui'
import { useAppContext } from '../app-context'

export function SnowScreencapGrid(props) {
    const { routes, apiClient } = useAppContext()

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
                items={props.items}
                shouldFocus={true}
                wideImage={true}
                isMainGrid={true}
                longPressToggle={true}
                getItemName={(item) => { item.name }}
                getItemImageUrl={getImageUrl}
                getItemToggleStatus={getItemToggleStatus}
                onPress={(item) => { routes.gotoItem(item) }}
                onLongPress={onLongPress} />
        </Snow.FillView>
    )
}

export default SnowScreencapGrid