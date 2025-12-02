import { useSnapshot, snapshot } from 'valtio'

import { playerState } from './player-state'
import { playerActions } from './player-actions'
import PlayerManager from './player-manager'
export const Player = {
    state: playerState,
    action: playerActions,
    Manager: PlayerManager,
    useSnapshot,
    snapshot
}
export default Player