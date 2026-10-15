
import { initialPlayerEnvelope, playerSelectors } from './player-envelope'
import { playerActions } from './player-actions'
import PlayerManager from './player-manager'
export const Player = {
    initialPlayerEnvelope: initialPlayerEnvelope,
    selectors: playerSelectors,
    action: playerActions,
    Manager: PlayerManager
}
export default Player