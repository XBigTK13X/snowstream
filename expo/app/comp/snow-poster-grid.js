import { Platform, View } from 'react-native'
import { Button, Image } from '@rneui/themed'
import SnowGrid from './snow-grid'
import SnowText from './snow-text'


let itemStyle = { height: 220, width: 150, justifyContent: 'center' }
let imageStyle = { height: 200, width: 130 }

export function SnowPosterGrid(props) {
    const renderItem = (item, itemIndex) => {
        let posterUrl = null
        if (item.poster_image) {
            posterUrl = item.poster_image.web_path
        }

        if (posterUrl) {
            return (
                <View style={itemStyle}>
                    <Button
                        hasTVPreferredFocus={itemIndex === 0}
                        style={itemStyle}
                        icon={<Image
                            style={imageStyle}
                            resizeMode="contain"
                            key={item.id}
                            source={{ uri: posterUrl }} />}
                        onPress={() => { props.onPress(item) }}
                        onLongPress={() => { props.onLongPress(item) }}
                    />
                </View>
            )
        }
    }
    return (
        <View>
            <SnowGrid data={props.data} renderItem={renderItem} itemStyle={itemStyle} />
        </View>
    )
}

export default SnowPosterGrid