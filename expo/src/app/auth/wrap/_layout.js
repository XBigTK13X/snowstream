import { C } from 'snowstream'


export default function WrappedPageLayout() {
    return (
        <C.SnowHeaderPage>
            <C.Slot />
        </C.SnowHeaderPage>
    )
}
