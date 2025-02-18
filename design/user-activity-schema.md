# User Activity Schema

## Workflows

1. Tracking Next Up episodes
  - Find all seasons not marked watched
  - From lowest order index not watched season
    - Find the lowest order not watched

2. Tracking In Progress
  - Find anything existing for media item in Progress table
  - Allow some stream sources to track progress (Tube Archivist, etc) while some don't (HDHomeRun)

3. Cleaning Up watched items
  - Find Progress where played seconds / duration meets a certain threshold (high or low)

4. Don't mess up queue on other devices
  - Server-side, mark a user/client device pair as isolated
  - Isolation considers the device/user being used (self) and all other device/users (group)
  - Four isolation modes: silo, quiet, loud, and shout depending on  client device
    - Silent => don't show activity from self in group, don't show activty from group
    - Quiet => don't show activity from self in group, do show activity from group
    - Loud => do show activity from self in group, do show activity from group
    - Shout => do show activity from self in group


5. Watched / Unwatched
  - If it exists in the Watched table, then it has been watched
  - Can only watch an episode/movie/streamable
  - To "watch" a season, mark all episodes in season watched. Same for a Show

6. client_device_user_id is becoming useful around the app, shorten to cduid ti ease differentiation

## Proposed Tables

Models
- Client Device
  - reported name
  - display name
  - last connected
  - kind

- Client Device User
  - client id
  - user id
  - isolation mode

- Progress
  - client device user id
  - movie id
  - episode id
  - played seconds
  - duration seconds

- Watch Count
  - client device user id
  - movie id
  - episode id

- Watched
  - client device user id
  - movie id
  - episode id