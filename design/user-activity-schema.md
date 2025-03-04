# User Activity Schema

## Links

https://docs.sqlalchemy.org/en/20/orm/queryguide/inheritance.html

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

    - Is it a season?
      - If shelf not in Watched
        - If show not in watched
          - Insert season into Watched
          - If all seasons in show are marked as watched
            - Delete all seasons from Watched and insert show

    - Is it an episode?
      - If shelf not in Watched
        - If show not in Watched
          - If season not in Watched
            - Insert episode into Watched
            - If all episode in season are marked as watched
              - Delete all episodes from Watched and insert season

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
      - If shelf in Watched
        - Delete shelf
        - Insert every show other than this one into watched
      - Otherwise
        - Delete show from Watched table
    
    - Is it a season?
      - If shelf in Watched
        - Delete shelf
        - Insert every show other than this one into Watched
        - Insert every season other than this one into Watched
      - Otherwise
        - Delete show from Watched table

    - Is it an episode?
      - If shelf in Watched
        - Delete shelf
        - Insert every show other than this one into Watched
        - Insert every season other than this one into Watched
        - Insert every episode other than this one into Watched
      - Otherwise
        - Delete episode from Watched table

  3. Checking if things watched workflow
    - Is it a movie shelf?
      - Is the shelf in the Watched Table?
        - Watched

    - Is it a movie?
      - Is the shelf in the table?
        - Watched
      - Is the movie in the Watched table?
        - Watched

    - Is it a show shelf?
      - Is the shelf in the Watched table?
        - watched

    - Is it a show?
      - Is the shelf in the table?
        - Watched
      - Is the show in the table?
        - Watched
      
    - Is it a show season?
      - Is the shelf in the table?
        - Watched
      - Is the show in the table?
        - Watched
      - Is the season in the table?
        - Watched

    - Is it a show episode?
      - Is the shelf in the table?
        - Watched
      - Is the show in the table?
        - Watched
      - Is the season in the table?
        - watched
      - Is the episode in the table?
        - Watched

  4. Determining In-Progress items
    - Episode/movie has an entry in the Progress table?
      - It is in progress

  5. Determining Next Up items
    - Is it in-progress?
      - It is next up
    - Is it a movie?
      - It is unwatched?
        - It is next up
    - Is it an episode?
      - Is it unwatched and the nearest neighbor to a watched episode?
        - It is next up

  6. Bubbling client device
    - Need all of the above to join on client device table based on cduid isolation settings
      - Change queries from cduid=id to cduid._in(group)
    - Need all of the above to filter if user has access restrictions
      - Add a join and filter to all queries on tags at respective content levels

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