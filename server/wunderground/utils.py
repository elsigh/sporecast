#!/usr/bin/python

from datetime import datetime, timedelta
import json
import os
import time
import urllib2

from pytz.gae import pytz

#KEY = 'b316a72d2e91b2e7'
KEY = 'aef72e8b74b7ddb5'

# Pesonal Weather Stations
PWS = [
    {
        'name': 'KCAMENDO1',
        'tz_long': 'America/Vancouver'
    },
    {
        'name': 'KCAINVER2',
        'tz_long': 'America/Los_Angeles'
    },
    {
        'name': 'KCASANFR34',
        'tz_long': 'America/Los_Angeles'
    },
    {
        'name': 'KCASANTA134',
        'tz_long': 'America/Los_Angeles'
    },
    {
        'name': 'KCAEUREK4',
        'tz_long': 'America/Vancouver'
    },
    {
        'name': 'KORASTOR4',
        'tz_long': 'America/Vancouver'
    },
    {
        'name': 'KWACARSO8',
        'tz_long': 'America/Vancouver'
    },
    {
        'name': 'KCAKINGS6',
        'tz_long': 'America/Los_Angeles'
    },
    {
        'name': 'KCAFAIRF199',
        'tz_long': 'America/Los_Angeles'
    },
    {
        'name': 'KCATHESE5',
        'tz_long': 'America/Los_Angeles'
    },
]

OUTPUT_DIR = 'output'
DATA_DIR = 'data'

# Note - we're rate-limited by wunderground to 10-per-minute, so
# we'll just ghetto-rig this so that each request takes n seconds.
MIN_TIME_SEC = 10


def now_date(tz='US/Pacific'):
    """Returns a date object for now in the given timezine."""
    return datetime.now(pytz.timezone(tz)).date()


def tomorrow_date(tz='US/Pacific'):
    """Returns a date object for tomorrow in the given timezine."""
    return datetime.now(pytz.timezone(tz)).date() + timedelta(days=1)


def datespan(startDate, endDate, delta=timedelta(days=1)):
    currentDate = startDate
    while currentDate <= endDate:
        yield currentDate
        currentDate += delta


def get_history_api_url(day, pws=PWS[0]):
    """Gets the wunderground API endpoint.
    Args:
        day: A date object.
        pws: A weather station string.
    """
    yyyymmdd = day.strftime('%Y%m%d')
    return ('http://api.wunderground.com/api/%s/history_%s/q/pws:%s.json' %
            (KEY, yyyymmdd, pws['name']))


def get_forecast_api_url(pws=PWS[0]):
    """Gets the wunderground API endpoint.
    Args:
        pws: A weather station string.
    """
    return ('http://api.wunderground.com/api/%s/forecast10day/q/pws:%s.json' %
            (KEY, pws['name']))


def write_json_data_to_file(data, file_path):
    """Does a mkdir -p and writes out the json data to a file.
    Args:
        data: A json object.
        file_path: An output file path.
    """

    # mkdir -p
    if not os.path.exists(os.path.dirname(file_path)):
        os.makedirs(os.path.dirname(file_path))

    with open(file_path, 'w') as f:
        f.write(json.dumps(data))

    print 'Wrote data! %s\n' % file_path


def urlfetch_throttled(url):
    """Gets and stores history data for a given days from wunderground.
    Args:
        url: An URL.

    Returns:
        response object from urllib2.urlopen
    """
    start_time = datetime.now()
    print 'Loading %s ...' % url

    try:
        response = urllib2.urlopen(url)
    except urllib2.HTTPError, e:
        print e.code
        raise
    except urllib2.URLError, e:
        print e.args
        raise

    end_time = datetime.now()
    took_s = (end_time - start_time).total_seconds()
    if took_s < MIN_TIME_SEC:
        sleep_for = MIN_TIME_SEC - took_s
        print 'Took %s, sleeping for %s ...' % (took_s, sleep_for)
        time.sleep(sleep_for)

    return response
