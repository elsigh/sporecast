#!/usr/bin/python2.7
#

#from lxml.html import parse, tostring, fromstring
from lib.web_request_handler import WebRequestHandler
from google.appengine.api import memcache
import logging
import urllib2

# last import.
import settings


class IndexHandler(WebRequestHandler):
    def get(self, station=None, year=None, month=None):
        self.output_response({}, 'index.html')


class PrivacyHandler(WebRequestHandler):
    def get(self):
        self.output_response({}, 'privacy.html')



