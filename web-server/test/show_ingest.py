import message.handler.scan_shelf.shows_scan as shows

def test_show():
    file_path = '/mnt/j-media/tv/anime/precure/Delicious Party♡Pretty Cure/folder.jpg'
    info = shows.parse_show_info(file_path)
    assert info != None
    assert info['asset_scope'] == shows.AssetScope.SHOW

def test_show_metadata():
    file_path = '/mnt/j-media/tv/anime/precure/Delicious Party♡Pretty Cure/metadata/folder.jpg'
    info = shows.parse_show_info(file_path)
    assert info != None
    assert info['asset_scope'] == shows.AssetScope.SHOW
