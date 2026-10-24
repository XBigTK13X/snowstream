import { initialPlayerHubState, resolvePlaybackConfig, resetPlayerHub } from './player-hub'
import { usePlayerActions } from './player-actions'
import PlayerManager from './player-manager'

export const Player = {
    initialState: initialPlayerHubState,
    resolvePlaybackConfig,
    resetHub: resetPlayerHub,
    useActions: usePlayerActions,
    Manager: PlayerManager
}

export default Player