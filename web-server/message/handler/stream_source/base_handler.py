class BaseHandler:
    def download(self, stream_source):
        return True

    def parse_watchable_urls(self, stream_source):
        return True

    def parse_guide_info(self, stream_source):
        return True
