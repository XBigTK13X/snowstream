import { C, useAppContext } from 'snowstream'

export default function VideoFileListPage() {
    const { apiClient, routes } = useAppContext()
    const { navPush, currentRoute } = C.useSnowContext()

    const [queryText, setQueryText] = C.React.useState('')
    const queryTextRef = C.React.useRef(queryText)
    const [searchResults, setSearchResults] = C.React.useState(null)
    const [resultKey, setResultKey] = C.React.useState(null)
    const [loading, setLoading] = C.React.useState(false)

    C.React.useEffect(() => {
        let query = currentRoute?.routeParams?.queryText
        if (query && query !== queryTextRef.current) {
            setQueryText(query)
            queryTextRef.current = query
            if (query?.length > 1) {
                setLoading(true)
                apiClient.getVideoFileListByQuery(query).then(response => {
                    if (queryTextRef.current === query) {
                        setSearchResults(response)
                        setResultKey(`query-${query}`)
                    }
                    setLoading(false)
                })
            }
        }
    }, [currentRoute])

    const executeQuery = (input) => {
        navPush({
            params: {
                ...currentRoute?.routeParams,
                queryText: input ?? queryText
            },
            func: false
        })
    }

    const downloadJson = () => {
        if (!searchResults?.video_files) return
        const dataString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(searchResults.video_files, null, 2))
        const downloadAnchor = document.createElement('a')
        downloadAnchor.setAttribute("href", dataString)
        downloadAnchor.setAttribute("download", `snowstream_video_files.json`)
        document.body.appendChild(downloadAnchor)
        downloadAnchor.click()
        downloadAnchor.remove()
    }

    let resultsTabs = null
    if (searchResults) {
        if (!searchResults?.video_files?.length) {
            resultsTabs = <C.SnowText>No results found for [{queryText}].</C.SnowText>
        }
        else {
            resultsTabs = (
                <>
                    <C.SnowTextButton title="Download JSON" onPress={downloadJson} />
                    <C.SnowText>{searchResults?.query}</C.SnowText>
                    <C.SnowText key={resultKey}>{C.Snow.stringifySafe(searchResults?.video_files)}</C.SnowText>
                </>
            )

        }
    }

    return (
        <C.SnowGrid
            assignFocus={false}
            itemsPerRow={1}>
            <C.SnowLabel>Enter a search query</C.SnowLabel>
            <C.SnowInput
                yy={0}
                focusStart
                focusKey="page-entry"
                value={queryText}
                onValueChange={setQueryText}
                onSubmit={executeQuery}
                onDebounce={setQueryText} />
            {loading && !searchResults ? <C.SnowText center>Searching for [{queryText}]...</C.SnowText> : null}
            {resultsTabs}
        </C.SnowGrid>
    )
}