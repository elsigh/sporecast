#!/usr/bin/python2.7
# -*- coding: utf_8 -*-
#
#

import datetime
import httplib
import json
import logging
import os
import sys
import time
import urllib2
from urlparse import urlparse
import webapp2
from webapp2_extras import jinja2
from jinja2.runtime import TemplateNotFound

# Hack to get ndb into the modules list.
from google.appengine.ext import deferred
from google.appengine.ext import ndb
sys.modules['ndb'] = ndb

import settings


class WebRequestHandler(webapp2.RequestHandler):
    """
    WebRequestHandler
    """

    @webapp2.cached_property
    def jinja2(self):
        """Returns a Jinja2 renderer cached in the app registry"""
        return jinja2.get_jinja2(app=self.app)

    @webapp2.cached_property
    def is_production(self):
        return 'Development' not in os.environ['SERVER_SOFTWARE']

    @webapp2.cached_property
    def version(self):
        if self.is_production:
            version = os.environ['CURRENT_VERSION_ID']
        else:
            version = time.strftime('%H_%M_%S', time.gmtime())
        return version

    def get_full_url(self, path):
        """Return the full url from the provided request handler and path."""
        pr = urlparse(self.request.url)
        return '%s://%s%s' % (pr.scheme, pr.netloc, path)

    def output_response(self, tpl_data, tpl_name):
        """Renders a template with some useful pre-populated data.

        Args:
            tpl_data: A dictionary of template data.
            tpl_name: A string matching a file path in the templates dir.

        Returns:
            An HTTP response with the rendered template.
        """
        logging.info('output_response: start')
        tpl_data.update({
            'title_app': 'Mushroom Forecast',
            'is_production': self.is_production,
            'build_version': self.version,
            'url_for': self.uri_for,
            'url_path': self.request.path,
        })

        try:
            self.response.write(self.jinja2.render_template(
                tpl_name, **tpl_data))
            logging.info('output_response: done')
        except TemplateNotFound:
            self.abort(404)
        pass

    # This is a weird and crappy way to deal with datetime - surely someone
    # knows a better one. Also it's duplicated in models.py.
    @classmethod
    def json_dump(cls, obj):
        date_handler = (lambda obj: obj.isoformat()
                        if isinstance(obj, datetime.datetime) else None)
        return json.dumps(obj, default=date_handler)

    def output_json(self, obj):
        self.apply_cors_headers()
        self.response.headers['Content-Type'] = 'application/json'
        json_out = WebRequestHandler.json_dump(obj)
        logging.info('output_json: %s' % json_out)
        self.response.out.write(json_out)

    def output_json_success(self, obj={}):
        obj['status'] = 0
        self.output_json(obj)

    def output_json_error(self, obj={}, error_code=404):
        obj['status'] = 1
        self.response.set_status(error_code)
        self.output_json(obj)


class TemplatesRequestHandler(webapp2.RequestHandler):
    """This is a for the local tests."""
    def get(self, template):
        tpl_path = os.path.join(settings.TEMPLATE_DIRS, template)
        tpl_file = open(tpl_path, 'r')
        tpl = tpl_file.read()
        tpl_file.close()
        self.response.out.write(tpl)


def ErrorHandler(request, response, exception, code):
    """A webapp2 implementation of error_handler."""
    logging.info('ErrorHandler code %s' % code)
    logging.info('Exception: %s' % exception)

    response.set_status(code)

    tpl_data = {
        'error_code': code,
        'error_code_text': httplib.responses[code],
        'error_message': exception
    }
    jinja2_instance = jinja2.get_jinja2()
    rendered = jinja2_instance.render_template('error.html', **tpl_data)
    response.write(rendered)


def ErrorNotFoundRequestHandler(request, response, exception):
    """Generic 404 error handler."""
    ErrorHandler(request, response, exception, 404)


def ErrorInternalRequestHandler(request, response, exception):
    """Generic 500 error handler."""
    ErrorHandler(request, response, exception, 500)
