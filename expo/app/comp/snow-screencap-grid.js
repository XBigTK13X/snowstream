import { View } from 'react-native'
import SnowGrid from './snow-grid'
import SnowImageButton from './snow-image-button'
import SnowLabel from './snow-label'
import { useSettings } from '../settings-context'

export function SnowScreencapGrid(props) {
    const { routes } = useSettings()
    const renderItem = (item, itemIndex) => {
        let thumbnailUrl = null
        if (item.screencap_image) {
            thumbnailUrl = item.screencap_image.thumbnail_web_path
        }

        let title = null
        if (props.itemTitle) {
            title = <Text style={{ textAlign: 'center' }}>{props.itemTitle(item)}</Text>
        }
        return (
            <View>
                <SnowImageButton
                    wide={true}
                    shouldFocus={props.shouldFocus && itemIndex === 0}
                    imageUrl={thumbnailUrl}
                    title={item.name}
                    onPress={() => { routes.gotoItem(item) }}
                    onLongPress={() => { props.onLongPress(item) }}
                />
                {title}
            </View>
        )
    }
    return (
        <View>
            {props.title ? <SnowLabel>{props.title} ({props.items.length})</SnowLabel> : null}
            <SnowGrid wide={true} items={props.items} renderItem={renderItem} />
        </View>
    )
}

export default SnowScreencapGrid