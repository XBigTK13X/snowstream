export function formatEpisodeTitle(episode) {
    let seasonPad = episode.season.season_order_counter.toString().padStart(2, '0')
    let episodePad = episode.episode_order_counter.toString().padStart(3, '0')
    let slug = `S${seasonPad}E${episodePad}`
    if (!episode.name) {
        return slug
    }
    return `${slug} - ${episode.name}`
}

function pad(input) {
    return String(input).padStart(2, "0")
}

const ONE_HOUR = 3600;
const ONE_MINUTE = 60
export function secondsToTimestamp(secondsInput) {
    if (!secondsInput || secondsInput < 0) {
        return "00:00";
    }

    const hours = Math.floor(secondsInput / ONE_HOUR);
    const minutes = Math.floor((secondsInput % ONE_HOUR) / ONE_MINUTE);
    const seconds = Math.floor(secondsInput % ONE_MINUTE);


    if (secondsInput < ONE_HOUR) {
        return `${pad(minutes)}:${pad(seconds)}`
    }

    return `${hours}:${pad(minutes)}:${pad(seconds)}`
}

export function log(message) {
    console.log(message)
}

export function bitsToPretty(bits) {
    if (!bits) {
        return '???'
    }
    if (bits < 1000) {
        return `${bits.toFixed(2)} b`
    }
    if (bits < 1000000) {
        return `${(bits / 1000).toFixed(2)} kb`
    }
    if (bits < 1000000000) {
        return `${(bits / 1000000).toFixed(2)} Mb`
    }
    return `${(bits / 1000000000).toFixed(2)} Gb`
}

async function urlExists(url) {
    return fetch(url, { method: 'head' })
        .then((status) => {
            return status.ok
        }).catch(err => {
            return false
        })
}



export default {
    formatEpisodeTitle,
    secondsToTimestamp,
    log,
    bitsToPretty,
    urlExists
}