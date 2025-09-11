import React from 'react'
import { View, Platform } from 'react-native'
import FillView from './fill-view'
import SnowGrid from './snow-grid'
import SnowImageButton from './snow-image-button'
import SnowLabel from './snow-label'
import { useAppContext } from '../app-context'

const itemsPerRow = Platform.isTV ? 8 : 5

export function SnowScreencapGrid(props) {
    const { routes, apiClient } = useAppContext()
    const [toggledItems, setToggledItems] = React.useState({})
    const renderItem = (item, itemIndex) => {
        let thumbnailUrl = null
        if (item.screencap_image) {
            thumbnailUrl = item.screencap_image.thumbnail_web_path
        }

        let toggled = toggledItems.hasOwnProperty(item.id)

        return (
            <View>
                <SnowImageButton
                    wide={true}
                    dull={toggled ? !item.watched : item.watched}
                    shouldFocus={props.shouldFocus && itemIndex === 0}
                    imageUrl={thumbnailUrl}
                    title={item.name}
                    onPress={() => { routes.gotoItem(item) }}
                    onLongPress={() => {
                        apiClient.toggleItemWatched(item)
                            .then(() => {
                                setToggledItems((prev) => {
                                    let result = { ...prev }
                                    if (toggled) {
                                        delete result[item.id]
                                    }
                                    else {
                                        result[item.id] = true
                                    }

                                    return result
                                })
                            })
                    }}
                />
            </View>
        )
    }
    return (
        <FillView>
            {props.title ? <SnowLabel>{props.title} ({props.items.length})</SnowLabel> : null}
            <SnowGrid
                mainGrid
                wide={true}
                items={props.items}
                renderItem={renderItem}
                itemsPerRow={itemsPerRow}
            />
        </FillView>
    )
}

export default SnowScreencapGrid