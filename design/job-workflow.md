# High Level

At first, there is only the shelf scan and stream source refresh.

Respectively, these walk through the raw streaming resources and make those available to play.

There is also read_media_files with processes the metadata for shelves and creates relevant tags.

update_media_files can pull down new metadata and images for a movie/show.

What is missing, is that sometimes the tvdb id of content is not yet known.

This will always be the case for new shows/movies.

update_media_files can already create scan_shelves_content subjobs that don't recursively create more umf/ssc jobs.

rmf is a bit clunky, and kind of feels like it should be part of the shelf scan.

Where to put the identification of unknown content, making a best guess based on year/name?

## Ideas

If it goes in scan_shelf_content, then maybe it would be after ingesting existing nfo and images.

At that point, find any movie missing an image/nfo and any show missing an image/nfo.

Try to identify the content in question, then download new files.

So maybe when doing a shelf scan, if it isn't a subjob, then identify the unknown content and use the result to queue subjobs that will pull down the new media.