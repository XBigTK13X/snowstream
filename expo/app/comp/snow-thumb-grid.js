import { View } from 'react-native'
import { Button, Image, Text } from '@rneui/themed'
import SnowGrid from './snow-grid'

const itemStyle = { width: 330, height: 200, justifyContent: 'center' }
const imageStyle = { width: 290, height: 180, resizeMode: "contain" }

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