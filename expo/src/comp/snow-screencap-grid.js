import { View } from 'react-native'
import FillView from './fill-view'
import SnowGrid from './snow-grid'
import SnowImageButton from './snow-image-button'
import SnowLabel from './snow-label'
import { useAppContext } from '../app-context'

export function SnowScreencapGrid(props) {
    const { routes } = useAppContext()
    const renderItem = (item, itemIndex) => {
        let thumbnailUrl = null
        if (item.screencap_image) {
            thumbnailUrl = item.screencap_image.thumbnail_web_path
        }

        let title = null
        if (props.itemTitle) {
            title = <Text style={{ textAlign: 'center' }}>{props.itemTitle(item)}</Text>
        }
        return (
            <View>
                <SnowImageButton
                    wide={true}
                    dull={item.watched}
                    shouldFocus={props.shouldFocus && itemIndex === 0}
                    imageUrl={thumbnailUrl}
                    title={item.name}
                    onPress={() => { routes.gotoItem(item) }}
                    onLongPress={() => { props.onLongPress(item) }}
                />
                {title}
            </View>
        )
    }
    return (
        <FillView>
            {props.title ? <SnowLabel>{props.title} ({props.items.length})</SnowLabel> : null}
            <SnowGrid
                mainGrid
                wide={true}
                items={props.items}
                renderItem={renderItem} itemsPerRow={8}
            />
        </FillView>
    )
}

export default SnowScreencapGrid