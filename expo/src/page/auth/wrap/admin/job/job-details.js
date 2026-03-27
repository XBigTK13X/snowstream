import { C, useAppContext } from 'snowstream'

export default function JobDetailsPage() {
    const { navPop, currentRoute } = C.useSnowContext()
    const { apiClient } = useAppContext()
    const [job, setJob] = C.React.useState(null)

    const fetchJob = () => {
        apiClient.getJob(currentRoute.routeParams.jobId).then((response) => {
            if (response && response.logs && response.logs.length) {
                response.logs.reverse()
            }

            setJob(response)

            if (response.status === 'running' || response.status === 'pending') {
                setTimeout(fetchJob, 2500)
            }
        })
    }

    C.React.useEffect(() => {
        fetchJob()
    }, [])

    if (!job) {
        return null
    }

    return (
        <>
            <C.SnowTextButton title="Back" focusStart focusKey="page-entry" onPress={navPop(true)} />
            <C.SnowLabel>Job</C.SnowLabel>
            <C.SnowText>{job.kind} is {job.status}. {job.created_at} to {job.updated_at}</C.SnowText>
            <C.SnowLabel>Input</C.SnowLabel>
            <C.SnowText>{job.input_json ? job.input_json : 'None'}</C.SnowText>
            <C.SnowLabel>Logs</C.SnowLabel>
            {job.logs.map((log, logIndex) => {
                const logKey = `log-${logIndex}`
                return <C.SnowText key={logKey}>{log}</C.SnowText>
            })}
        </>
    )
}