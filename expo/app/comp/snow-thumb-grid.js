import { View } from 'react-native'
import { Button, Image, Text } from '@rneui/themed'
import SnowGrid from './snow-grid'

export function SnowThumbGrid(props) {
    const renderItem = (item, itemIndex) => {
        let posterUrl = null
        if (item.main_poster_image) {
            posterUrl = item.main_poster_image.web_path
        }
        else {
            for (let image of item.image_files) {
                if (image.kind === 'thumbnail') {
                    posterUrl = image.web_path
                }
            }
        }

        if (posterUrl) {
            let title = null
            if (props.itemTitle) {
                title = <Text style={{ textAlign: 'center' }}>{props.itemTitle(item)}</Text>
            }
            return (
                <View>
                    <Button
                        hasTVPreferredFocus={itemIndex === 0}
                        style={{ height: 120, width: 250, margin: 10, padding: 10 }}
                        icon={<Image
                            style={{ height: 100, width: 150, resizeMode: 'contain' }}
                            key={item.id}
                            source={{ uri: posterUrl }} />}
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
            <SnowGrid data={props.data} renderItem={renderItem} itemWidth={250} itemHeight={250} />
        </View>
    )
}

export default SnowThumbGrid