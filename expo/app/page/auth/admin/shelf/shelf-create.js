import C from '../../../../common'

const styles = C.StyleSheet.create({
    boxContainer: {},
    image: {},
    box: {
        padding: 5,
        margin: 5,
        width: '100%',
        height: '100%'
    },
})

export default function LandingPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
    const [shelfName, setShelfName] = C.React.useState('')
    const [localPath, setLocalPath] = C.React.useState('')
    const [networkPath, setNetworkPath] = C.React.useState('')
    const [shelfKind, setShelfKind] = C.React.useState('Movies')
    const chooseShelfKind = (chosenKindIndex) => {
        if (!chosenKindIndex) {
            setShelfKind('Movies')
        } else {
            setShelfKind('Shows')
        }
    }
    const createShelf = () => {
        console.log({
            shelfName,
            shelfKind,
            localPath,
            networkPath,
        })
    }
    return (
        <C.View >
            <C.SnowLabel>Name</C.SnowLabel>
            <C.SnowInput onChangeText={setShelfName} />
            <C.SnowLabel>Kind</C.SnowLabel>
            <C.SnowDropdown options={['Movies', 'Shows']} onChoose={chooseShelfKind} />
            <C.SnowLabel>Shelf Local Directory Path</C.SnowLabel>
            <C.SnowInput onChangeText={setLocalPath} />
            <C.SnowLabel>Shelf Network Share Path</C.SnowLabel>
            <C.SnowInput onChangeText={setNetworkPath} />
            <C.Button title="Create Shelf" onPress={createShelf} />
        </C.View>
    )
}
