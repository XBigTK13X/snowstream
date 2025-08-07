# Kinds of Jobs

## scan_shelves_content

Walk shelf directories on local disk
Primarily add newly detected files and parsed meta about them to the database.
Make a small effort to try and update detected changes to known media.

## update_media_files

Use the known remote metadata id for a movie/show
Download new NFO and image content from provider to local disk

## read_media_files

Whatever changes have been made to known files on local disk
Reprocess that data, overwriting existing info in the DB

This can be used to force a show's thumbnails to be regenerated using update_images

## delete_media_records

Completely remove a show or movie from the database.
Useful when a show update radically changes the paths of episodes/seasons

## clean_file_records

Without specifying a particular show/movie
Recursively clean up orphaned records
Start at leaf nodes (image_file,etc)
Work backwards toward the root