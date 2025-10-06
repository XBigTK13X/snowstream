import React from 'react'
import {
    View
} from 'react-native'

import {
    SnowInput,
    SnowLabel,
    SnowModal,
    SnowGrid,
    SnowToggle,
    SnowHeader,
    SnowTextButton,
    useFocusContext
} from 'expo-snowui'

function SnowUpdateMediaButtonW(props) {
    const [showRequest, setShowRequest] = React.useState(false)
    const [metadataId, setMetadataId] = React.useState(props.remoteId ? props.remoteId : '')
    const [metadataSource, setMetadataSource] = React.useState('')
    const [updateMetadata, setUpdateMetadata] = React.useState(true)
    const [updateImages, setUpdateImages] = React.useState(true)
    const [skipExisting, setSkipExisting] = React.useState(false)

    const { readFocusProps } = useFocusContext()

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
            <SnowModal
                focusLayer="update-media"
                center
                onRequestClose={() => {
                    setShowRequest(false)
                }}>
                <SnowHeader>{question}</SnowHeader>
                <SnowGrid focusStart focusKey="update-inputs" focusDown="update-toggles" itemsPerRow={4}>
                    <View style={{ alignItems: 'center' }}>
                        <SnowLabel>Remote Metadata ID</SnowLabel>
                        <SnowInput onValueChange={(text) => { setMetadataId(text) }} value={metadataId} />
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <SnowLabel>Metadata Source</SnowLabel>
                        <SnowInput onValueChange={(text) => { setMetadataSource(text) }} value={metadataSource} />
                    </View>
                </SnowGrid>
                <SnowGrid focusKey="update-toggles" focusDown="update-submit" itemsPerRow={6}>
                    <SnowToggle title="Metadata" value={updateMetadata} onValueChange={setUpdateMetadata} />
                    <SnowToggle title="Images" value={updateImages} onValueChange={setUpdateImages} />
                    <SnowToggle title="Skip Existing" value={skipExisting} onValueChange={setSkipExisting} />
                </SnowGrid>
                <SnowGrid focusKey="update-submit" gridStyle={{ marginTop: 20 }} itemsPerRow={4}>
                    <SnowTextButton disabled={!updateMetadata && !updateImages} title="Update Media" onPress={() => { onAccept() }} />
                    <SnowTextButton title="Cancel" onPress={onCancel} />
                </SnowGrid>
            </SnowModal>
        )
    }
    let title = props.kind ? `Update ${props.kind} Media` : 'Update Media'
    return (
        <SnowTextButton
            {...readFocusProps(props)}
            tall={props.tall}
            title={title}
            onPress={() => {
                setShowRequest(true)
            }} />
    )
}

SnowUpdateMediaButtonW.isSnowFocusWired = true

export const SnowUpdateMediaButton = SnowUpdateMediaButtonW

export default SnowUpdateMediaButton

