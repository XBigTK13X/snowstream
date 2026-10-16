import { initialPlayerHubState, resolvePlaybackConfig } from './player-hub'
import { usePlayerActions } from './player-actions'
import PlayerManager from './player-manager'

export const Player = {
    initialState: initialPlayerHubState,
    resolvePlaybackConfig,
    useActions: usePlayerActions,
    Manager: PlayerManager
}

export default Player