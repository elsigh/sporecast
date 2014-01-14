#!/usr/bin/python2.7
#
#

import os
import sys

# Need the server root dir on the path.
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/..')

from google.appengine.ext import testbed

import unittest
import webtest

from lib import controllers


class HandlerTest(unittest.TestCase):
    def setUp(self):
        self.testbed = testbed.Testbed()
        self.testbed.setup_env(app_id='mushroomforecast')
        self.testbed.activate()
        self.testbed.init_datastore_v3_stub()
        self.testbed.init_taskqueue_stub()
        self.taskqueue_stub = self.testbed.get_stub(testbed.TASKQUEUE_SERVICE_NAME)
        self.testapp = webtest.TestApp(controllers.app)

    def tearDown(self):
        self.testbed.deactivate()

    def test_www_root(self):
        self.testapp.get('/', status=200)

    def test_www_app(self):
        self.testapp.get('/app', status=200)
