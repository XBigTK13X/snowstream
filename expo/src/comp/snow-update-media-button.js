import React from 'react'
import {
    View
} from 'react-native'

import {
    SnowFillView,
    SnowInput,
    SnowLabel,
    SnowModal,
    SnowGrid,
    SnowToggle,
    SnowHeader,
    SnowTextButton,
    useSnowContext
} from 'expo-snowui'

function SnowUpdateMediaButtonW(props) {
    const [showRequest, setShowRequest] = React.useState(false)
    const [form, setForm] = React.useState({
        metadataId: props.remoteId ? props.remoteId : '',
        metadataSource: '',
        updateMetadata: true,
        updateImages: true,
        updateVideos: false,
        skipExisting: false
    })
    const formRef = React.useRef(form)

    React.useEffect(() => {
        formRef.current = form
    }, [form])

    const changeForm = (key) => {
        return (val) => {
            setForm((prev) => { return { ...prev, [key]: val } })
        }
    }

    const { readFocusProps } = useSnowContext()

    const onCancel = () => {
        setShowRequest(false)
    }
    const onAccept = () => {
        props.updateMediaJob(formRef.current)
        setShowRequest(false)
    }
    const allowSubmit = form.updateMetadata || form.updateImages || form.updateVideos
    if (showRequest) {
        let question = props.kind ? `Do you want to update this ${props.kind}?` : 'Do you want to update this item?'
        return (
            <SnowModal
                focusLayer="update-media"
                center
                onRequestClose={() => {
                    setShowRequest(false)
                }}>
                <SnowFillView>
                    <SnowHeader>{question}</SnowHeader>
                    <SnowGrid focusStart focusKey="update-inputs" focusDown="update-toggles" itemsPerRow={2}>
                        <SnowLabel>Remote Metadata ID</SnowLabel>
                        <SnowInput onValueChange={changeForm('metadataId')} value={form.metadataId} />
                        <SnowLabel>Metadata Source</SnowLabel>
                        <SnowInput onValueChange={changeForm('metadataSource')} value={form.metadataSource} />
                    </SnowGrid>
                    <SnowGrid focusKey="update-toggles" focusDown="update-submit" itemsPerRow={3}>
                        <SnowToggle title="Metadata" value={form.updateMetadata} onValueChange={changeForm('updateMetadata')} />
                        <SnowToggle title="Images" value={form.updateImages} onValueChange={changeForm('updateImages')} />
                        <SnowToggle title="Videos" value={form.updateVideos} onValueChange={changeForm('updateVideos')} />
                        <SnowToggle title="Skip Existing" value={form.skipExisting} onValueChange={changeForm('skipExisting')} />
                    </SnowGrid>
                    <SnowGrid focusKey="update-submit" gridStyle={{ marginTop: 20 }} itemsPerRow={2}>
                        <SnowTextButton disabled={!allowSubmit} title="Update Media" onPress={() => { onAccept() }} />
                        <SnowTextButton title="Cancel" onPress={onCancel} />
                    </SnowGrid>
                </SnowFillView>
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

