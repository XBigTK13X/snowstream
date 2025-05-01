import message.handler.update_media.provider.media_provider as base

class ThetvdbProvider(base.MediaProvider):
    def __init__(self):
        super().__init__("thetvdb")