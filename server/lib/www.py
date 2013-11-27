#!/usr/bin/python2.7
#


from lib.web_request_handler import WebRequestHandler

# last import.
import settings


class AppHandler(WebRequestHandler):
    def get(self, endpoint=None, more_endpoint=None):
        # TODO(elsigh): cache this baby in memory.
        app_html = open('templates/app.html', 'r').read()
        self.response.out.write(app_html)


class IndexHandler(WebRequestHandler):
    def get(self):
        self.output_response({}, 'index.html')
