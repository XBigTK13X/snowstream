import { Modal } from 'react-native'
import FillView from './fill-view'
import Style from '../snow-style'

const styles = {
    prompt: {
        backgroundColor: Style.color.background
    },
    transparent: {
        backgroundColor: Style.color.transparentDark
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    }
}

export function SnowModal(props) {
    let style = [styles.prompt]
    if (props.transparent) {
        style.push(styles.transparent)
    }
    if (props.center) {
        style.push(styles.center)
    }
    if (props.style) {
        style.push(props.style)
    }
    if (props.wrapper === false) {
        return (
            <Modal
                navigationBarTranslucent
                statusBarTranslucent
                transparent={props.transparent}
                style={style}
                onRequestClose={props.onRequestClose}
                children={props.children} />
        )
    }
    let modalStyle = [styles.prompt]
    if (props.modalStyle) {
        modalStyle.push(modalStyle)
    }
    return <Modal
        style={modalStyle}
        navigationBarTranslucent
        statusBarTranslucent
        transparent={props.transparent}
        onRequestClose={props.onRequestClose}>
        <FillView
            scroll={props.scroll}
            children={props.children}
            style={style} />
    </Modal>
}

export default SnowModal