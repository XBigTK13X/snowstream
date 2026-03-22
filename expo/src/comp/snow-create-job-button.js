import Snow from 'expo-snowui'
import { useAppContext } from '../app-context'

export function SnowCreateJobButtonW(props) {
    const { routes } = useAppContext()
    const { navPush } = Snow.useSnowContext()
    const jobDetails = {
        updateImages: true,
        updateMetadata: true,
        updateVideos: false,
        ...props.jobDetails
    }
    return (
        <Snow.TextButton
            tall={props.tall}
            title={props.title}
            onPress={navPush({
                path: routes.adminJobRunner,
                params: jobDetails
            })}
        />
    )
}

SnowCreateJobButtonW.isFocusWired = true

const SnowCreateJobButton = SnowCreateJobButtonW

export default SnowCreateJobButton