import { C, useAppContext } from 'snowstream'

export function ContinueWatchingListPage(props) {
    const { apiClient } = useAppContext()
    const [continueWatchingList, setContinueWatchingList] = C.React.useState(null)
    const [resultsEmpty, setResultsEmpty] = C.React.useState(false)

    C.React.useEffect(() => {
        if (!continueWatchingList) {
            apiClient.getContinueWatchingList().then((response) => {
                setContinueWatchingList(response)
                if (!response.length) {
                    setResultsEmpty(true)
                }
            })
        }
    }, [continueWatchingList])

    if (resultsEmpty) {
        return (
            <C.SnowText>
                Snowstream didn't find anything new to watch.
            </C.SnowText>
        )
    }

    if (continueWatchingList) {
        let tabs = continueWatchingList.map((kind) => {
            return `${kind.name} [${kind.items.length}]`
        })

        return (
            <C.View>
                <C.SnowTabs
                    focusStart
                    focusKey="page-entry"
                    headers={tabs}>
                    {continueWatchingList.map((kind) => {
                        return <C.SnowPosterGrid
                            disableWatched
                            items={kind.items}
                        />
                    })}
                </C.SnowTabs>
            </C.View>
        )
    }
    return <C.SnowLabel>Loading the continue watching list. This will take a few seconds.</C.SnowLabel>
}

export default ContinueWatchingListPage
