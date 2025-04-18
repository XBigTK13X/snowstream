import { View } from 'react-native'
import { Button, Image, Text } from '@rneui/themed'
import SnowGrid from './snow-grid'

const itemStyle = { width: 200, height: 110, justifyContent: 'center' }
const imageStyle = { width: 180, height: 100 }

export function SnowThumbGrid(props) {
    const renderItem = (item, itemIndex) => {
        let thumbUrl = null
        if (item.thumbnail_image) {
            thumbUrl = item.thumbnail_image.web_path
        }

        if (thumbUrl) {
            let title = null
            if (props.itemTitle) {
                title = <Text style={{ textAlign: 'center' }}>{props.itemTitle(item)}</Text>
            }
            return (
                <View style={itemStyle}>
                    <Button
                        hasTVPreferredFocus={itemIndex === 0}
                        style={itemStyle}
                        icon={<Image
                            style={imageStyle}
                            resizeMode="contain"
                            key={item.id}
                            source={{ uri: thumbUrl }} />}
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
            <SnowGrid data={props.data} renderItem={renderItem} itemStyle={itemStyle} />
        </View>
    )
}

export default SnowThumbGrid