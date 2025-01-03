import { View } from 'react-native'
import { Button, Image } from '@rneui/themed'
import SnowGrid from './snow-grid'

export function SnowPosterGrid(props) {
    const renderItem = (item, itemIndex) => {
        let posterUrl = null
        for (let image of item.image_files) {
            if (image.kind === 'show_poster') {
                posterUrl = image.web_path
            }
        }
        if (posterUrl) {
            return (
                <Button
                    hasTVPreferredFocus={itemIndex === 0}
                    title={item.name}
                    style={{ height: 300, width: 300, margin: 10, padding: 10 }}
                    icon={<Image
                        style={{ height: 150, width: 100 }}
                        key={item.id}
                        source={{ uri: posterUrl }} />}
                    onPress={() => { props.onPress(item) }}
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