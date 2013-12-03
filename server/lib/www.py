#!/usr/bin/python2.7
#

from lxml.html import parse, tostring, fromstring
from lib.web_request_handler import WebRequestHandler
from google.appengine.api import memcache

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
        """FUGLY hackery to get MO data."""
        mo_url = 'http://mushroomobserver.org/observer/advanced_search?_js=on&_new=true&q=1f5SB'
        mo_key = 'mushroomobserver_CA'
        docstring = memcache.get(mo_key)
        if docstring:
            doc = fromstring(docstring)
        else:
            doc = parse(mo_url).getroot()
            doc.make_links_absolute()
            docstring = tostring(doc)
            memcache.set(mo_key, docstring, time=1000)

        response_json = {'data': []}
        for result_node in doc.xpath('//table[@class="Matrix"]/.//table'):
            img = ''
            what = ''
            where = ''
            when = ''
            for cell_node in result_node.xpath('.//td'):
                thumbnail_node = cell_node.xpath('.//*[@class="thumbnail"]/.//a')
                if len(thumbnail_node):
                    img = tostring(thumbnail_node[0])
                else:
                    what = tostring(cell_node.xpath('.//*[@class="ListWhat"]/.//a')[0])
                    where = tostring(cell_node.xpath('.//*[@class="ListWhere"]/.//a')[0])
                    when = cell_node.xpath('.//*[@class="ListWhen"]')[1].text
            response_json['data'].append({
                'img': img.strip(),
                'what': what.strip(),
                'where': where.strip(),
                'when': when.strip(),
            })
        self.output_json(response_json)
