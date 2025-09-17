# Channel Guide Design

## IPTV EPG XML

IPTV EPG XML is straight forward. Call the service, parse the XML.

# Schedules Direct

Schedules Direct is more complicated.

Snowstream will treat the `url` field of the source as the lineup to be parsed to ease using the API.

If no url is set, then snowstream will log in the job that a zip code is required.

If a zip code is in the url, then the job will log the available lineups.

If a lineup is in the url, then the scraper will fully execute.

For now, a single guide source entity will handle a single lineup.

# Data Model

Stream sources have streamables.

Channel guide sources have channels and channels have programs.

A streamable can be mapped to a single channel.

A channel can have many programs.

A channel can provide the same guide data to multiple streamables.