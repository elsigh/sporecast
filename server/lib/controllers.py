#!/usr/bin/python2.7
#
#

import os
import webapp2
from webapp2 import Route
from webapp2 import SimpleRoute

from lib.web_request_handler import ErrorNotFoundRequestHandler
from lib.web_request_handler import ErrorInternalRequestHandler
from lib.cors_request_handler import CORSWunderGroundRequestFileHandler, CORSWunderGroundRequestHandler

# last import.
import settings

routes = [
    Route('/app/weather/<station>/<year>/<month>',
          handler='lib.www.IndexHandler'),
    Route('/', handler='lib.www.IndexHandler'),
    Route('/index.html', handler='lib.www.IndexHandler'),
    Route('/privacy', handler='lib.www.PrivacyHandler'),

    SimpleRoute('/(wunderground/.+\.json)$',
                CORSWunderGroundRequestFileHandler),
    SimpleRoute('/(wunderground/.+)$', CORSWunderGroundRequestHandler),
]

is_debug = True
if 'SERVER_SOFTWARE' in os.environ:
    is_debug = 'Development' in os.environ['SERVER_SOFTWARE']

app = webapp2.WSGIApplication(routes,
                              debug=is_debug)

#app.error_handlers[404] = ErrorNotFoundRequestHandler
#app.error_handlers[500] = ErrorInternalRequestHandler
