# Finding all 10 bit h264 videos

,
LATERAL jsonb_array_elements(ffprobe_raw_json::jsonb -> 'streams') AS stream
WHERE stream ->> 'codec_type' = 'video'
    AND stream ->> 'codec_name' = 'h264'
    AND (
    stream ->> 'profile' = 'High 10'
    OR stream ->> 'bits_per_raw_sample' = '10'
    )