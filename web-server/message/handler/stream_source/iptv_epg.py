import message.handler.stream_source.base_handler as base


class IptvEpg(base.BaseHandler):
    def download(self, stream_source):
        return True

    def parse_watchable_urls(self, stream_source):
        return True
