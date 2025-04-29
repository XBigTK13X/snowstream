import { Platform, View } from 'react-native'
import SnowGrid from './snow-grid'
import SnowImageButton from './snow-image-button'


export function SnowPosterGrid(props) {
    const renderItem = (item, itemIndex) => {
        let posterUrl = null
        if (item.poster_image) {
            posterUrl = item.poster_image.web_path
        }
        let longPress = null
        if (props.onLongPress) {
            longPress = () => {
                props.onLongPress(item)
            }
        }

        if (posterUrl) {
            return <SnowImageButton
                imageUrl={posterUrl}
                onPress={() => { props.onPress(item) }}
                onLongPress={longPress}
                title={item.name}
            />
        }
    }
    return (
        <View>
            <SnowGrid data={props.data} renderItem={renderItem} />
        </View>
    )
}

export default SnowPosterGrid