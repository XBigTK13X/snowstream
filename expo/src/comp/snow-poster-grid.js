import { Platform } from 'react-native'
import FillView from './fill-view'
import SnowGrid from './snow-grid'
import SnowImageButton from './snow-image-button'
import SnowLabel from './snow-label'
import { useAppContext } from '../app-context'

const itemsPerRow = Platform.isTV ? 7 : 5

export function SnowPosterGrid(props) {
    const { routes } = useAppContext()
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
        let longPress = null
        if (props.onLongPress) {
            longPress = () => {
                props.onLongPress(item)
            }
        }

        return <SnowImageButton
            wide={false}
            dull={!props.disableWatched && item.watched}
            shouldFocus={props.shouldFocus && itemIndex === 0}
            imageUrl={thumbnailUrl}
            onPress={() => {
                props.onPress ? props.onPress(item) : routes.gotoItem(item)
            }}
            onLongPress={longPress}
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