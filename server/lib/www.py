#!/usr/bin/python2.7
#

from lxml.html import parse, tostring, fromstring
from lib.web_request_handler import WebRequestHandler
from google.appengine.api import memcache
import logging
import urllib2

# last import.
import settings


class IndexHandler(WebRequestHandler):
    def get(self):
        self.output_response({}, 'index.html')


class PrivacyHandler(WebRequestHandler):
    def get(self):
        self.output_response({}, 'privacy.html')


class AppHandler(WebRequestHandler):
    def get(self, station=None, year=None, month=None):
        # TODO(elsigh): cache this baby in memory.
        app_html = self.add_version_to_template('templates/app.html')
        self.response.out.write(app_html)


class MushroomObserverHandler(WebRequestHandler):
    def get(self, state='CA'):
        """FUGLY hackery to get MO data.

        Args:
            state: A state code.
        """
        mob_location = urllib2.quote('California, USA')
        mob_url = ('http://mushroomobserver.org/observer/observation_search'
                   '?_js=off&_new=true&pattern=%s' % mob_location)
        mob_key = 'mushroomobserver_%s' % mob_location

        # Look in memcache first.
        docstring = memcache.get(mob_key)
        #logging.info('docstring: %s' % docstring)

        # MO will serve certain non-results pages back under some circumstances
        # so if the length of the page is less than this, then don't cache.
        docstring_min_length = 600
        if docstring and len(docstring) > docstring_min_length:
            logging.info('Got docstring from memcache %s.' % len(docstring))
            doc = fromstring(docstring)

        else:
            logging.info('Loading %s ...' % mob_url)
            try:
                request = urllib2.Request(mob_url)
                request.add_header('User-Agent', 'MushroomForecast/0.1')
                #opener = urllib2.build_opener()
                #response = opener.open(request, timeout=30).read()
                response = urllib2.urlopen(request, timeout=30)
            except urllib2.HTTPError, e:
                print e.code
            except urllib2.URLError, e:
                print e.args
            logging.info('Got response.')

            encoding = response.headers.getparam('charset')
            logging.info('Encoding: %s' % encoding)
            html = response.read().decode(encoding).encode('ascii', 'ignore')
            logging.info('Got HTML! length: %s' % len(html))
            #logging.info('HTML: %s' % html)

            doc = fromstring(html)
            logging.info('Made a lxml doc object %s' % doc)

            # aka 16 minutes
            memcache.set(mob_key, html, time=1000)
            logging.info('Saved docstring to memcache')

        doc.make_links_absolute('http://mushroomobserver.org/')
        response_json = {'data': []}
        for result_node in doc.xpath('//table[@class="Matrix"]/.//table'):
            img = ''
            what = ''
            where = ''
            when = ''
            who = ''
            for cell_node in result_node.xpath('.//td'):
                thumbnail_node = cell_node.xpath('.//*[@class="thumbnail"]/.//a')
                what_node = cell_node.xpath('.//*[@class="ListWhat"]/.//a')
                if len(thumbnail_node):
                    img = tostring(thumbnail_node[0])
                elif len(what_node):
                    what = tostring(what_node[0])
                    where = tostring(cell_node.xpath('.//*[@class="ListWhere"]/.//a')[0])
                    who = tostring(cell_node.xpath('.//*[@class="ListWho"]/.//a')[0])

                    when_node = cell_node.xpath('.//*[@class="ListWhen"]')
                    if len(when_node) >= 2:
                        when = when_node[1].text
                    elif len(when_node):
                        when = when_node[0].text.replace(':', '')

            response_json['data'].append({
                'img': img.strip(),
                'what': what.strip(),
                'where': where.strip(),
                'when': when.strip(),
                'who': who.strip(),
            })
        self.output_json(response_json)
