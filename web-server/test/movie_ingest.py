import message.handler.scan_shelf.movies_scan as movies

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
    import pprint
    print("info")
    pprint.pprint(info)
    assert info != None
    assert info['movie_name'] == 'Love Comes Softly'

def test_movie_extras():
    file_path = "/mnt/m-media/movie/dreamworks/Over the Hedge (2006)/Extras/Hammy's Boomerand Adventure.mkv"
    info = movies.parse_movie_info(file_path)
    assert info != None