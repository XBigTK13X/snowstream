import { Modal } from 'react-native'

export function SnowModal(props) {
    return <Modal
        navigationBarTranslucent
        statusBarTranslucent
        style={props.style}
        onRequestClose={props.onRequestClose}
        children={props.children} />
}

export default SnowModal