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

def test_singlepart_episode():
    file_path = '/mnt/j-media/tv/cartoon/a/Aaahh!!! Real Monsters/Season 1/S01E001 - The Switching Hour.mkv'
    info = shows.parse_show_info(file_path)
    assert info != None
    assert info['episode_start'] == 1

def test_multipart_episode():
    file_path = '/mnt/j-media/tv/cartoon/a/Aaahh!!! Real Monsters/Season 3/S03E001-E002 - Festival of the Festering Moon + Simon\'s Big Score.mkv'
    info = shows.parse_show_info(file_path)
    assert info != None
    assert info['asset_scope'] == shows.AssetScope.EPISODE
    assert info['episode_start'] == 1
    assert info['episode_end'] == 2
    assert info['title'] == "Festival of the Festering Moon + Simon's Big Score"

def test_multiformat_episode():
    file_path = '/mnt/j-media/tv/cartoon/f/Futurama/Season 2/S02E001 - A Flight to Remember - [Raw].mkv'
    info = shows.parse_show_info(file_path)
    assert info != None