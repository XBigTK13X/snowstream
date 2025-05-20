import { View } from 'react-native'
import SnowGrid from './snow-grid'
import SnowImageButton from './snow-image-button'

export function SnowThumbGrid(props) {
    const renderItem = (item, itemIndex) => {
        let thumbUrl = null
        if (item.thumbnail_image) {
            thumbUrl = item.thumbnail_image.thumbnail_web_path
        }

        if (thumbUrl) {
            let title = null
            if (props.itemTitle) {
                title = <Text style={{ textAlign: 'center' }}>{props.itemTitle(item)}</Text>
            }
            return (
                <View>
                    <SnowImageButton
                        wide={true}
                        shouldFocus={props.shouldFocus && itemIndex === 0}
                        imageUrl={thumbUrl}
                        title={item.name}
                        onPress={() => { props.onPress(item) }}
                        onLongPress={() => { props.onLongPress(item) }}
                    />
                    {title}
                </View>
            )
        }
    }
    return (
        <View>
            <SnowGrid wide={true} items={props.items} renderItem={renderItem} />
        </View>
    )
}

export default SnowThumbGrid