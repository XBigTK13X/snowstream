import React from 'react'
import {
    Modal,
    View
} from 'react-native'

import SnowTextButton from './snow-text-button'
import { useAppContext } from '../app-context'
import SnowText from './snow-text'
import SnowInput from './snow-input'
import SnowLabel from './snow-label'
import SnowGrid from './snow-grid'

const styles = {
    prompt: {
        backgroundColor: 'black',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    }
}

export default function SnowUpdateMediaButton(props) {
    const { isAdmin } = useAppContext();
    if (!isAdmin) {
        return null
    }
    const [showRequest, setShowRequest] = React.useState(false)
    const [metadataId, setMetadataId] = React.useState(props.remoteId ? props.remoteId : '')
    const onCancel = () => {
        setShowRequest(false)
    }
    const onAccept = (metadata, images) => {
        props.updateMediaJob({ metadataId, metadata, images })
        setShowRequest(false)
    }
    if (showRequest) {
        let question = props.kind ? `Do you want to update this ${props.kind}?` : 'Do you want to update this item?'
        return (
            <Modal
                onRequestClose={() => {
                    setShowRequest(false)
                }}>
                <View style={styles.prompt}>
                    <SnowText>{question}</SnowText>
                    <SnowLabel>Specify a metadata ID</SnowLabel>
                    <SnowInput onChangeText={(text) => { setMetadataId(text) }} value={metadataId} />
                    <SnowGrid>
                        <SnowTextButton title="Update Metadata" onPress={() => { onAccept(true, false) }} />
                        <SnowTextButton title="Update Images" onPress={() => { onAccept(false, true) }} />
                        <SnowTextButton title="Update Both" onPress={() => { onAccept(true, true) }} />
                        <SnowTextButton title="Cancel" onPress={onCancel} />
                    </SnowGrid>
                </View>
            </Modal>
        )
    }
    let title = props.kind ? `Update ${props.kind} Media` : 'Update Media'
    return (
        <SnowTextButton
            title={title}
            onPress={() => {
                setShowRequest(true)
            }} />
    )
}

