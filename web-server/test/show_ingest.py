import message.handler.scan_shelf.shows_scan as shows
from log import log

def test_copy_paste_regex():
    log.info('')
    log.info('Show')
    log.info(shows.SHOW_REGEX.pattern)
    log.info('Season')
    log.info(shows.SHOW_SEASON_REGEX.pattern)
    log.info('Episode')
    log.info(shows.SHOW_EPISODE_REGEX.pattern)
    assert True

def get_show_info(file_path:str):
    return shows.parse_show_info(file_path)

def test_show():
    info = get_show_info('/mnt/j-media/tv/anime/precure/Delicious Party♡Pretty Cure/folder.jpg')
    assert info != None
    assert info['asset_scope'] == shows.AssetScope.SHOW

def test_show_metadata():
    info = get_show_info('/mnt/j-media/tv/anime/precure/Delicious Party♡Pretty Cure/metadata/folder.jpg')
    assert info != None
    assert info['asset_scope'] == shows.AssetScope.SHOW

def test_singlepart_episode():
    info = get_show_info('/mnt/j-media/tv/cartoon/a/Aaahh!!! Real Monsters/Season 1/S01E001 - The Switching Hour.mkv')
    assert info != None
    assert info['episode_start'] == 1

def test_multipart_episode():
    info = get_show_info('/mnt/j-media/tv/cartoon/a/Aaahh!!! Real Monsters/Season 3/S03E001-E002 - Festival of the Festering Moon + Simon\'s Big Score.mkv')
    assert info != None
    assert info['asset_scope'] == shows.AssetScope.EPISODE
    assert info['episode_start'] == 1
    assert info['episode_end'] == 2
    assert info['title'] == "Festival of the Festering Moon + Simon's Big Score"

def test_multiformat_episode():
    info = get_show_info('/mnt/j-media/tv/cartoon/f/Futurama/Season 2/S02E001 - A Flight to Remember - [Raw].mkv')
    assert info != None
    assert info['season'] == 2
    assert info['episode_start'] == 1

def test_region_episode():
    info = get_show_info('/mnt/j-media/tv/live-action/h/Heartland (2007) (CA)/Season 15/001 - Moving Toward the Light.mkv')
    assert info != None
    assert info['episode_start'] == 1
    assert info['season'] == 15

def test_multiepisode_no_second_e():
    info = get_show_info('/mnt/j-media/tv/cartoon/t/The Fairly OddParents/Season 7/S07E005-06 - Birthday Bashed + Momnipresent - SDTV.mkv')
    assert info != None
    assert info['episode_start'] == 5
    assert info['episode_end'] == 6

def test_broken_prod_file_1():
    info = get_show_info('/mnt/j-media/tv/cartoon/r/Rocket Power/Season 3/S03E034-35 - Merv Links to Otto + Big Air.mkv')
    assert info != None
    assert info['episode_start'] == 34
    assert info['episode_end'] == 35
    assert info['season'] == 3

def test_show_name_in_epsiode():
    info = get_show_info('/mnt/j-media/tv/cartoon/m/My Little Pony - Friendship Is Magic/Season 6/My Little Pony - Friendship Is Magic - S06E04 - On Your Marks.mkv')
    assert info != None
    assert info['episode_start'] == 4
    assert info['season'] == 6

def test_broken_prod_file_2():
    info = get_show_info('/mnt/j-media/tv/anime/t/Toradora!/Season 1/S01E004 .mkv')
    assert info != None
    assert info['episode_start'] == 4
    assert info['season'] == 1

def test_no_season_folder():
    info = get_show_info('/mnt/j-media/tv/live-action/c/Comedy Central Presents/S03E014 - Lewis Black.mkv')
    assert info != None
    assert info['episode_start'] == 14
    assert info['season'] == 3

def test_bluray_rip():
    info = get_show_info('/mnt/j-media/tv/live-action/t/The 10th Kingdom/Season 1/S01E009-10 - Part 9 + Part 10 - Bluray-1080p.mkv')
    assert info != None
    assert info['season'] == 1
    assert info['episode_start'] == 9
    assert info['episode_end'] == 10

def test_hyphenated_directory():
    info = get_show_info('/mnt/j-media/tv/anime/gundam/Mobile Suit Gundam 0080 - War in the Pocket/Season 1/S01E001 - How Many Miles to the Battlefield.mkv')
    assert info != None
    assert info['season'] == 1
    assert info['episode_start'] == 1
    assert info['show_name'] == 'Mobile Suit Gundam 0080 - War in the Pocket'

def test_number_directory():
    info = get_show_info('/mnt/j-media/tv/anime/[number]/86 - Eighty Six/Season 1/S01E001 - Undertaker.mkv')
    assert info != None
    assert info['season'] == 1
    assert info['episode_start'] == 1
    assert info['show_name'] == '86 - Eighty Six'