import Snow from 'expo-snowui'
import { useAppContext } from '../app-context'

export function SnowCreateJobButtonW(props) {
    const { routes } = useAppContext()
    const { navPush, readFocusProps } = Snow.useSnowContext()
    return (
        <Snow.TextButton
            {...readFocusProps(props)}
            tall={props.tall}
            title={props.title}
            onPress={navPush(
                routes.adminJobRunner,
                props.jobDetails,
                true
            )}
        />
    )
}

SnowCreateJobButtonW.isFocusWired = true

const SnowCreateJobButton = SnowCreateJobButtonW

export default SnowCreateJobButton