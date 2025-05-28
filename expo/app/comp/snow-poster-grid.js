import { Platform, View } from 'react-native'
import SnowGrid from './snow-grid'
import SnowImageButton from './snow-image-button'
import SnowLabel from './snow-label'
import { useSettings } from '../settings-context'

const posterPress = (routes, item) => {
    if (item.kind === 'movie') {
        routes.goto(routes.movieDetails, {
            shelfId: item.shelf.id,
            movieId: item.id
        })
    }
    if (item.kind === 'episode') {
        let destination = {
            shelfId: item.show.shelf.id,
            showId: item.show.id,
            seasonId: item.season.id,
            episodeId: item.id,
            showName: item.show.name,
            seasonOrder: item.season.season_order_counter
        }
        routes.goto(routes.episodeDetails, destination)
    }
}

export function SnowPosterGrid(props) {
    const { routes } = useSettings()
    if (!props.items || !props.items.length) {
        return null
    }
    const renderItem = (item, itemIndex) => {
        let posterUrl = null
        if (item.poster_image) {
            posterUrl = item.poster_image.thumbnail_web_path
        }
        let longPress = null
        if (props.onLongPress) {
            longPress = () => {
                props.onLongPress(item)
            }
        }

        return <SnowImageButton
            wide={false}
            shouldFocus={props.shouldFocus && itemIndex === 0}
            imageUrl={posterUrl}
            onPress={() => { props.onPress ? props.onPress(item) : posterPress(routes, item) }}
            onLongPress={longPress}
            title={item.name}
        />
    }
    return (
        <View>
            {props.title ? <SnowLabel>{props.title} ({props.items.length})</SnowLabel> : null}
            <SnowGrid items={props.items} renderItem={renderItem} />
        </View>
    )
}

export default SnowPosterGrid