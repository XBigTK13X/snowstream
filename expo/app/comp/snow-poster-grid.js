import { View } from 'react-native'
import { Button, Image } from '@rneui/themed'
import SnowGrid from './snow-grid'
import SnowText from './snow-text'

const itemStyle = { height: 300, width: 220, justifyContent: 'center' }
const imageStyle = { height: 310, width: 180 }

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