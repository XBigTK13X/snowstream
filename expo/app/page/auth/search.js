import C from '../../common'

export default function SearchPage() {

    const { apiClient } = C.useSession()
    const { routes } = C.useSettings()

    const [queryText, setQueryText] = C.React.useState('')
    const [searchResults, setSearchResults] = C.React.useState(null)

    const executeQuery = () => {
        apiClient.search(queryText).then(response => {
            setSearchResults(response.items)
        })
    }

    return (
        <C.View>
            <C.SnowLabel>Enter a search query</C.SnowLabel>
            <C.SnowInput value={queryText} onChangeText={setQueryText} onSubmit={executeQuery} />
            {searchResults ? searchResults.map(result => {
                return <C.SnowText>{result}</C.SnowText>
            }) : null}
        </C.View>
    )
}
