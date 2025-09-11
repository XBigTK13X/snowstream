import React from 'react'
import { Platform } from 'react-native'
import FillView from './fill-view'
import SnowGrid from './snow-grid'
import SnowImageButton from './snow-image-button'
import SnowLabel from './snow-label'
import { useAppContext } from '../app-context'

const itemsPerRow = Platform.isTV ? 7 : 5

export function SnowPosterGrid(props) {
    const { routes, apiClient } = useAppContext()
    const [toggledItems, setToggledItems] = React.useState({})
    if (!props.items || !props.items.length) {
        return null
    }
    const renderItem = (item, itemIndex) => {
        let thumbnailUrl = null
        if (item.poster_image) {
            thumbnailUrl = item.poster_image.thumbnail_web_path
        }
        if (item.thumbnail_url) {
            thumbnailUrl = item.thumbnail_url
        }

        let toggled = toggledItems.hasOwnProperty(item.id)

        return <SnowImageButton
            wide={false}
            dull={!props.disableWatched && (toggled ? !item.watched : item.watched)}
            shouldFocus={props.shouldFocus && itemIndex === 0}
            imageUrl={thumbnailUrl}
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
            title={item.name}
        />
    }
    return (
        <FillView>
            {props.title ?
                <SnowLabel>
                    {props.title} ({props.items.length})
                </SnowLabel>
                : null}
            <SnowGrid
                mainGrid
                items={props.items}
                renderItem={renderItem}
                itemsPerRow={itemsPerRow}
            />
        </FillView>
    )
}

export default SnowPosterGrid