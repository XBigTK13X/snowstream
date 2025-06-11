import React from 'react'

import SnowTextButton from './snow-text-button'
import { useAppContext } from '../app-context'


export function SnowAdminButton(props) {
    const { isAdmin } = useAppContext()
    if (!isAdmin) {
        return null
    }
    return <SnowTextButton title={props.title} onPress={props.onPress} onLongPress={props.onLongPress} />
}

export default SnowAdminButton