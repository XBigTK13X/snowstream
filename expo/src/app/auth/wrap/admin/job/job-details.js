import { C } from 'snowstream'

export default function JobDetailsPage() {
    const localParams = C.useLocalSearchParams()
    const { apiClient } = C.useAppContext()
    const { routes, config } = C.useAppContext()
    const [job, setJob] = C.React.useState(null)
    const jobId = localParams.jobId
    C.React.useEffect(() => {
        if (!job) {
            apiClient.getJob(jobId).then((response) => {
                if (response && response.logs && response.logs.length) {
                    response.logs.reverse()
                }
                setJob(response)
                if (response.status === 'running' || response.status === 'pending') {
                    setTimeout(() => {
                        setJob(null)
                    }, 2500)
                }
            })
        }
    })

    if (!job) {
        return null
    }

    return (
        <C.View>
            <C.SnowTextButton title="Back" focusStart focusKey="page-entry" onPress={routes.funcBack()} />
            <C.SnowLabel>Job</C.SnowLabel>
            <C.SnowText>{job.kind} is {job.status}. {job.created_at} to {job.updated_at}</C.SnowText>
            <C.SnowLabel>Input</C.SnowLabel>
            <C.SnowText>{job.input_json ? job.input_json : 'None'}</C.SnowText>
            <C.SnowLabel>Logs</C.SnowLabel>
            {job.logs.map((log, logIndex) => {
                return <C.SnowText key={logIndex}>{log}</C.SnowText>
            })}
        </C.View>
    )
}
