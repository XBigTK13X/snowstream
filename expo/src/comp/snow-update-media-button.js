import React from 'react'
import {
    Modal,
    View
} from 'react-native'

import SnowTextButton from './snow-text-button'
import { useAppContext } from '../app-context'
import { StaticStyle } from '../snow-style'
import SnowInput from './snow-input'
import SnowLabel from './snow-label'
import SnowGrid from './snow-grid'
import SnowToggle from './snow-toggle'
import SnowHeader from './snow-header'

const styles = {
    prompt: {
        backgroundColor: StaticStyle.color.background,
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
    const [metadataSource, setMetadataSource] = React.useState('')
    const [updateMetadata, setUpdateMetadata] = React.useState(true)
    const [updateImages, setUpdateImages] = React.useState(true)
    const [skipExisting, setSkipExisting] = React.useState(false)

    const onCancel = () => {
        setShowRequest(false)
    }
    const onAccept = () => {
        props.updateMediaJob({
            metadataId,
            metadataSource,
            updateMetadata,
            updateImages,
            skipExisting
        })
        setShowRequest(false)
    }
    if (showRequest) {
        let question = props.kind ? `Do you want to update this ${props.kind}?` : 'Do you want to update this item?'
        return (
            <Modal
                navigationBarTranslucent statusBarTranslucent
                onRequestClose={() => {
                    setShowRequest(false)
                }}>
                <View style={styles.prompt}>
                    <SnowHeader>{question}</SnowHeader>
                    <SnowGrid itemsPerRow={4}>
                        <View style={{ alignItems: 'center' }}>
                            <SnowLabel>Remote Metadata ID</SnowLabel>
                            <SnowInput onChangeText={(text) => { setMetadataId(text) }} value={metadataId} />
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <SnowLabel>Metadata Source</SnowLabel>
                            <SnowInput onChangeText={(text) => { setMetadataSource(text) }} value={metadataSource} />
                        </View>
                    </SnowGrid>
                    <SnowGrid itemsPerRow={6}>
                        <SnowToggle title="Metadata" value={updateMetadata} onValueChange={setUpdateMetadata} />
                        <SnowToggle title="Images" value={updateImages} onValueChange={setUpdateImages} />
                        <SnowToggle title="Skip Existing" value={skipExisting} onValueChange={setSkipExisting} />
                    </SnowGrid>
                    <SnowGrid gridStyle={{ marginTop: 20 }} itemsPerRow={4}>
                        <SnowTextButton disabled={!updateMetadata && !updateImages} title="Update Media" onPress={() => { onAccept() }} />
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

