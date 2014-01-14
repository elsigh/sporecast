#!/bin/sh
nosetests-2.7 --with-gae --without-sandbox --logging-level=INFO

#--nocapture --logging-level=DEBUG tests.test_controllers:HandlerTest.test_www_root
