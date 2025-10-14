import { useSnapshot } from 'valtio'

import AppContext from './app-context'
export { AppContextProvider, useAppContext } from './app-context'

import { playerState } from './player/player-state'
import { playerActions } from './player/player-actions'
import PlayerManager from './player/player-manager'
export const Player = {
    state: playerState,
    action: playerActions,
    Manager: PlayerManager,
    useSnapshot
}

import C from './common'
export { default as C } from './common'

import Util from './util'
export { default as Util } from './util'

import { config } from './settings'
export { config } from './settings'

export default {
    AppContext,
    C,
    Util,
    config,
    Player

}