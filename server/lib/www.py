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


class AppHandler(WebRequestHandler):
    def get(self, station=None, year=None, month=None):
        # TODO(elsigh): cache this baby in memory.
        app_html = open('templates/app.html', 'r').read()
        self.response.out.write(app_html)


class MushroomObserverHandler(WebRequestHandler):
    def get(self, state='CA'):
        """FUGLY hackery to get MO data.

        Args:
            state: A state code.
        """
        mob_url = 'http://mushroomobserver.org/observer/advanced_search?_js=on&_new=true&q=1f5SB'
        mob_key = 'mushroomobserver_CA'
        docstring = memcache.get(mob_key)
        if docstring:
            logging.info('Got docstring from memcache.')
            doc = fromstring(docstring)
        else:
            logging.info('Loading %s ...' % mob_url)
            try:
                response = urllib2.urlopen(mob_url, timeout=30)
            except urllib2.HTTPError, e:
                print e.code
            except urllib2.URLError, e:
                print e.args
            logging.info('Got response.')

            encoding = response.headers.getparam('charset')
            logging.info('Encoding: %s' % encoding)
            html = response.read().decode(encoding).encode('ascii', 'ignore')
            logging.info('Got HTML!')

            doc = fromstring(html)
            logging.info('Made a lxml doc object %s' % doc)

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
                if len(thumbnail_node):
                    img = tostring(thumbnail_node[0])
                else:
                    what = tostring(cell_node.xpath('.//*[@class="ListWhat"]/.//a')[0])
                    where = tostring(cell_node.xpath('.//*[@class="ListWhere"]/.//a')[0])
                    when = cell_node.xpath('.//*[@class="ListWhen"]')[1].text
                    who = tostring(cell_node.xpath('.//*[@class="ListWho"]/.//a')[0])
            response_json['data'].append({
                'img': img.strip(),
                'what': what.strip(),
                'where': where.strip(),
                'when': when.strip(),
                'who': who.strip(),
            })
        self.output_json(response_json)
