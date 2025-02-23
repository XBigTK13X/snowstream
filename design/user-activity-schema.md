# User Activity Schema

## Workflows
First Pass Thoughts
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

Second Pass Thoughts
  1. Keeping all the show watched info broken into episodes makes for clean data, but muddy and slow queries.
    - Add show/shelf/season watched tracking. It makes writing slower, reading much faster

  2. Marking things watched workflow
    - Is it a movie shelf?
      - Delete all movies from shelf listed in Watched table
      - Insert shelf entry in Watched table
    
    - Is it a movie?
      - If shelf not in Watched
        - Insert movie into Watched
        - If all movies in shelf are marked as watched
          - Delete all movies from Watched and insert shelf

    - Is it a show shelf?
      - Delete all shows,seasons,episodes from Watched
      - Insert shelf in Watched

    - Is it a show?
      - If shelf not in Watched
        - Insert show into Watched
        - If all shows in shelf are marked as watched
          - Delete all shows from Watched and insert shelf

  3. Marking things unwatched workflow
    - Is it a movie shelf?
      - Delete all movies from Watched table
      - Delete shelf from Watched table

    - Is it a movie?
      - If shelf in Watched
        - Delete shelf
        - Insert every movie other than this one to Watched table
      - Otherwise
        - Delete movie from Watched table

    - Is it a show shelf?
      - If shelf in Watched
        - Delete shelf
        - Insert every show other than this one to Watched table
      - Otherwise
        - Delete show from Watched table

    - Is it a show?
      - If 

  3. Checking if things watched workflow
    - Is it a movie shelf?
      - Is the it in the Watched Table?
        - Watched

    - Is it a movie?
      - Is the shelf in the table?
        - Watched
      - Is the movie in the Watched table?
        - Watched




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