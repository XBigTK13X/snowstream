import { View } from 'react-native'
import { Button, Image } from '@rneui/themed'
import SnowGrid from './snow-grid'
import SnowText from './snow-text'

export function SnowPosterGrid(props) {
    const renderItem = (item, itemIndex) => {
        let posterUrl = null
        if (item.poster_image) {
            posterUrl = item.poster_image.web_path
        }

        if (posterUrl) {
            return (
                <Button
                    hasTVPreferredFocus={itemIndex === 0}
                    style={{ height: 350, width: 200, margin: 10, padding: 10 }}
                    icon={<Image
                        style={{ height: 220, width: 150, resizeMode: "contain" }}
                        key={item.id}
                        source={{ uri: posterUrl }} />}
                    onPress={() => { props.onPress(item) }}
                    onLongPress={() => { props.onLongPress(item) }}
                />
            )
        }
    }
    return (
        <View>
            <SnowGrid data={props.data} renderItem={renderItem} itemWidth={250} itemHeight={250} />
        </View>
    )
}

export default SnowPosterGrid