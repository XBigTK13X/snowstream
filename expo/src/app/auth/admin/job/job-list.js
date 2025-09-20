import C from '../../../../common'

export default function JobListPage() {
    const { apiClient } = C.useAppContext()
    const { routes, config } = C.useAppContext()
    const [jobs, setJobs] = C.React.useState(null)
    const [showComplete, setShowComplete] = C.React.useState(true)
    C.React.useEffect(() => {
        if (!jobs) {
            apiClient.getJobList(showComplete, 100).then((response) => {
                setJobs(response)
            })
        }
    })

    const toggleComplete = () => {
        setShowComplete(!showComplete)
        setJobs(null)
    }

    if (!!jobs) {
        return (
            <C.FillView>
                <C.SnowGrid itemsPerRow={3}>
                    <C.SnowTextButton
                        title="Toggle Complete"
                        onPress={toggleComplete}
                    />
                </C.SnowGrid>
                <C.SnowGrid itemsPerRow={1} items={jobs} renderItem={(job) => {
                    const title = `${job.id}) ${job.kind} - ${job.status} - ${job.message.substring(0, 180).replaceAll('\n', '.')}`
                    return (
                        <C.SnowTextButton
                            title={title}
                            onPress={routes.func(routes.admin.jobDetails, { jobId: job.id })}
                        />
                    )
                }} />
            </C.FillView>
        )
    }
    return (
        <C.View >
            <C.SnowText>Loading jobs</C.SnowText>
        </C.View >
    )
}
