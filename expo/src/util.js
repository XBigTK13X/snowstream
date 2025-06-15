export function formatEpisodeTitle(episode) {
    let seasonPad = episode.season.season_order_counter.toString().padStart(2, '0')
    let episodePad = episode.episode_order_counter.toString().padStart(3, '0')
    let slug = `S${seasonPad}E${episodePad}`
    if (!episode.name) {
        return slug
    }
    return `${slug} - ${episode.name}`
}

const ONE_HOUR = 3600
export function secondsToTimestamp(seconds) {
    if (!seconds) {
        return "00:00"
    }
    if (seconds < ONE_HOUR) {
        return new Date(seconds * 1000).toISOString().substring(14, 19)
    }
    return new Date(seconds * 1000).toISOString().slice(11, 19);
}

export default {
    formatEpisodeTitle,
    secondsToTimestamp
}