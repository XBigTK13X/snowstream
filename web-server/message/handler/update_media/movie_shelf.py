from message.handler.update_media.media_updater import MediaUpdater

class MovieShelf(MediaUpdater):
    def __init__(self):
        super().__init__("MovieShelf")