import { Platform, View } from 'react-native'
import SnowGrid from './snow-grid'
import SnowImageButton from './snow-image-button'
import SnowLabel from './snow-label'
import { useSettings } from '../settings-context'

export function SnowPosterGrid(props) {
    const { routes } = useSettings()
    if (!props.items || !props.items.length) {
        return null
    }
    const renderItem = (item, itemIndex) => {
        let thumbnailUrl = null
        if (item.poster_image) {
            thumbnailUrl = item.poster_image.thumbnail_web_path
        }
        let longPress = null
        if (props.onLongPress) {
            longPress = () => {
                props.onLongPress(item)
            }
        }

        return <SnowImageButton
            wide={false}
            shouldFocus={props.shouldFocus && itemIndex === 0}
            imageUrl={thumbnailUrl}
            onPress={() => { props.onPress ? props.onPress(item) : routes.gotoItem(item) }}
            onLongPress={longPress}
            title={item.name}
        />
    }
    return (
        <View>
            {props.title ? <SnowLabel>{props.title} ({props.items.length})</SnowLabel> : null}
            <SnowGrid items={props.items} renderItem={renderItem} />
        </View>
    )
}

export default SnowPosterGrid