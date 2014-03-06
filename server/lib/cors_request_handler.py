#!/usr/bin/python2.7
# -*- coding: utf_8 -*-
#
#

import logging
import os
import webapp2


# TODO(elsigh): Nuke this and explore making the app "privileged" in FFOS.
class CORSStaticRequestHandler(webapp2.RequestHandler):
    def get(self, path):
        path = os.path.join(os.path.dirname(__file__), '../static', path)
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        # any type
        self.response.headers['Content-Type'] = '*.*'
        self.response.out.write(open(path, 'rb').read())


class CORSWunderGroundRequestHandler(webapp2.RequestHandler):
    def get(self, path):
        path = os.path.join(os.path.dirname(__file__), '../', path)
        logging.info('path: %s' % path)
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        # any type
        self.response.headers['Content-Type'] = '*.*'
        self.response.out.write(open(path, 'rb').read())
