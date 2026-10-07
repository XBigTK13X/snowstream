import { C, useAppContext } from 'snowstream'

export function RecentlyAddedListPage(props) {
    const { apiClient } = useAppContext()
    const [itemList, setItemList] = C.React.useState(null)
    const [resultsEmpty, setResultsEmpty] = C.React.useState(false)

    C.React.useEffect(() => {
        apiClient.getRecentlyAddedList().then((response) => {
            setItemList(response)
            if (!response.length) {
                setResultsEmpty(true)
            }
        })
    }, [])

    if (resultsEmpty) {
        return (
            <C.SnowText>
                Snowstream didn't find anything recently added.
            </C.SnowText>
        )
    }

    if (itemList) {
        return (
            <C.SnowView>
                <C.SnowPosterGrid disableWatched items={itemList} />
            </C.SnowView>
        )
    }
    return (
        <>
            <C.SnowLabel center>Loading the recently added list.</C.SnowLabel>
            <C.SnowText center>This will take a few seconds.</C.SnowText>
        </>
    )
}

export default RecentlyAddedListPage
