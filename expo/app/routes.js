import { router } from 'expo-router'

// DOCS router method https://docs.expo.dev/router/navigating-pages/#imperative-navigation

module.exports = {
    options: "/page/auth/options",
    landing: "/page/auth/landing",
    signIn: "/page/sign-in",
    root: "/",
    replace: (target) => { router.replace(target) },
    goto: (target) => { router.push(target) },
    func: (target) => {
        return () => {
            router.push(target)
        }
    }
}