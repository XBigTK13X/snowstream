import C from '../../../../common'

export default function JobListPage() {
    const { apiClient } = C.useAppContext()
    const { routes, config } = C.useAppContext()
    const [jobs, setJobs] = C.React.useState(null)
    C.React.useEffect(() => {
        if (!jobs) {
            apiClient.getJobList().then((response) => {
                setJobs(response)
            })
        }
    })

    if (!!jobs) {
        return (
            <C.FillView>
                <C.SnowGrid itemsPerRow={2} items={jobs} renderItem={(job) => {
                    const title = `${job.id}) ${job.kind} - ${job.status} - ${job.message.substring(0, 25)}`
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
