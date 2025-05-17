import React from 'react'
import {
    Modal,
    View
} from 'react-native'

import SnowTextButton from './snow-text-button'
import { useSession } from '../auth-context'
import SnowText from './snow-text'
import SnowInput from './snow-input'
import SnowLabel from './snow-label'

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
    const { isAdmin, apiClient } = useSession();
    if (!isAdmin) {
        return null
    }
    const [showRequest, setShowRequest] = React.useState(false)
    const [metadataId, setMetadataId] = React.useState('')
    const onCancel = () => {
        setShowRequest(false)
    }
    const onAccept = () => {
        props.updateMediaJob(metadataId)
        setShowRequest(false)
    }
    if (showRequest) {
        return (
            <Modal
                onRequestClose={() => {
                    setShowRequest(false)
                }}>
                <View style={styles.prompt}>
                    <SnowText>Do you want to update this item?</SnowText>
                    <SnowLabel>Specify a metadata ID</SnowLabel>
                    <SnowInput onChangeText={(text) => { setMetadataId(text) }} value={metadataId} />
                    <SnowTextButton title="Update" onPress={onAccept} />
                    <SnowTextButton title="Cancel" onPress={onCancel} />
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

