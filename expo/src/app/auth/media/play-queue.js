let title = response.name
if (playingQueue) {
    title = `Queue [${playingQueue.progress + 1}/${playingQueue.length}] - ${title}`
}

apiClient.getPlayingQueue({ source: playingQueueSource }).then(response => {
    setPlayingQueue(response)
    let entry = response.content[response.progress]
    if (entry.kind === 'm') {
        loadMovie(entry.id)
    }
    else if (entry.kind === 'e') {
        loadEpisode(entry.id)
    }
    else {
        C.util.log("Unhandled playing queue entry")
        C.util.log({ entry })
    }
})