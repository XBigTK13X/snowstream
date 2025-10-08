import { routes } from './routes'
import SignInPage from './page/sign-in'
import LandingPage from './page/auth/wrap/landing'
import SignOutPage from './page/auth/sign-out'

export var Pages = {
    [routes.signIn]: SignInPage,
    [routes.landing]: LandingPage,
    [routes.signOut]: SignOutPage
}


export function QuietReactWarning() {
    return null
}

export default QuietReactWarning