import message.handler.scan_shelf.movies_scan as movies
from log import log
def test_copy_paste_regex():
    log.info('')
    log.info('Movie Asset')
    log.info(movies.MOVIE_ASSETS_REGEX.pattern)
    log.info('Movie Video File')
    log.info(movies.MOVIE_VIDEO_FILE_REGEX.pattern)
    log.info('Movie Extra Asset')
    log.info(movies.MOVIE_EXTRAS_ASSETS_REGEX.pattern)
    log.info('Movie Extra Video File')
    log.info(movies.MOVIE_EXTRAS_VIDEO_FILE_REGEX.pattern)
    assert True

def test_movie():
    file_path = '/mnt/m-media/movie/a/Abominable (2019)/folder.jpg'
    info = movies.parse_movie_info(file_path)
    assert info != None
    assert info['movie_name'] == 'Abominable'

def test_movie_metadata():
    file_path = '/mnt/m-media/movie/a/Abominable (2019)/metadata/folder.jpg'
    info = movies.parse_movie_info(file_path)
    assert info != None
    assert info['movie_name'] == 'Abominable'

def test_movie_multiformat():
    file_path = '/mnt/m-media/movie/love/Love Comes Softly (2003)/Love Comes Softly (2003) - [Dvd-Fullscreen] Remux-480p.mkv'
    info = movies.parse_movie_info(file_path)
    assert info != None
    assert info['movie_name'] == 'Love Comes Softly'

def test_movie_extras():
    file_path = "/mnt/m-media/movie/dreamworks/Over the Hedge (2006)/Extras/Hammy's Boomerand Adventure.mkv"
    info = movies.parse_movie_info(file_path)
    assert info != None

def test_movie_folder_asset():
    file_path = "/mnt/m-media/movie/dreamworks/How to Train Your Dragon - Homecoming (2019)/folder.jpg"
    info = movies.parse_movie_info(file_path)
    identity = movies.identify_movie_file_kind(extension_kind='image',info=info,file_path=file_path)
    assert info != None
    assert identity == 'movie_main_feature_poster'

def test_legacy_movie_image_file():
    file_path = '/mnt/m-media/movie/love/Love Begins (2011)/Love Begins (2011) - [Web] WEBDL-1080p-poster.jpg'
    info = movies.parse_movie_info(file_path)
    identity = movies.identify_movie_file_kind(extension_kind='image',info=info,file_path=file_path)
    assert info != None
    assert identity != None

def test_video_and_image_have_the_same_movie():
    video_file_path = '/mnt/m-media/movie/dreamworks/How to Train Your Dragon - Homecoming (2019)/How to Train Your Dragon Homecoming (2019) WEBDL-1080p.mkv'
    image_file_path = '/mnt/m-media/movie/dreamworks/How to Train Your Dragon - Homecoming (2019)/folder.jpg'
    video_info = movies.parse_movie_info(video_file_path)
    video_identity = movies.identify_movie_file_kind(extension_kind='video',info=video_info,file_path=video_file_path)
    image_info = movies.parse_movie_info(image_file_path)
    image_identity = movies.identify_movie_file_kind(extension_kind='image',info=image_info,file_path=image_file_path)
    assert video_info != None
    assert video_identity != None
    assert image_info != None
    assert image_identity != None
    assert video_info['movie_name'] == image_info['movie_name']

def test_file_in_the_folder():
    video_file_path = "/mnt/m-media/movie/the/The Parent Trap (1998)/The Parent Trap (1998) Remux-1080p.mkv"
    video_info = movies.parse_movie_info(video_file_path)
    assert video_info != None
    assert video_info['movie_name'] == "The Parent Trap"
    assert video_info['movie_year'] == '1998'