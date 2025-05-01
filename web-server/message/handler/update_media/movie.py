import message.handler.update_media.base_handler as base

class Movie(base.BaseHandler):
    def __init__(self):
        super().__init__("Movie")