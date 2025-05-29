import React from 'react'

import SnowTextButton from './snow-text-button'
import { useSession } from '../auth-context'


export function SnowAdminButton(props) {
    const { isAdmin } = useSession()
    if (!isAdmin) {
        return null
    }
    return <SnowTextButton title={props.title} onPress={props.onPress} onLongPress={props.onLongPress} />
}

export default SnowAdminButton