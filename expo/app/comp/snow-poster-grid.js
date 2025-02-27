import { View } from 'react-native'
import { Button, Image } from '@rneui/themed'
import SnowGrid from './snow-grid'
import SnowText from './snow-text'

export function SnowPosterGrid(props) {
    const renderItem = (item, itemIndex) => {
        let posterUrl = null
        if (item.main_poster_image) {
            posterUrl = item.main_poster_image.web_path
        }
        else {
            for (let image of item.image_files) {
                if (image.kind === 'show_poster') {
                    posterUrl = image.web_path
                }
            }
        }

        if (posterUrl) {
            return (
                <Button
                    hasTVPreferredFocus={itemIndex === 0}
                    style={{ height: 350, width: 200, margin: 10, padding: 10 }}
                    icon={<Image
                        style={{ height: 220, width: 150 }}
                        key={item.id}
                        source={{ uri: posterUrl }} />}
                    onPress={() => { props.onPress(item) }}
                />
            )
        }
    }
    return (
        <View>
            <SnowText>Showing {props.data.length} items.</SnowText>
            <SnowGrid data={props.data} renderItem={renderItem} itemWidth={250} itemHeight={250} />
        </View>
    )
}

export default SnowPosterGrid