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