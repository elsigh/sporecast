#!/usr/bin/python

from datetime import date, datetime, timedelta
import json
import os
import time
import urllib2


KEY = 'b316a72d2e91b2e7'

# Pesonal Weather Stations
PWS = [
    'KCAMENDO1',
    'KCAINVER2',
    'KCASANFR34',
    'KCASANTA134',
    'KCAEUREK5'
]

DATA_DIR = 'data'

# Note - we're rate-limited by wunderground to 10-per-minute, so
# we'll just ghetto-rig this so that each request takes 7 seconds.
MIN_TIME_SEC = 7


def datespan(startDate, endDate, delta=timedelta(days=1)):
    currentDate = startDate
    while currentDate < endDate:
        yield currentDate
        currentDate += delta


def get_api_url(day, pws='KCAMENDO1'):
    """Gets the wunderground API endpoint.
    Args:
        day: A date object.
        pws: A weather station string.
    """
    yyyymmdd = day.strftime('%Y%m%d')
    return ('http://api.wunderground.com/api/%s/history_%s/q/pws:%s.json' %
            (KEY, yyyymmdd, pws))


def store_data(day, pws='KCAMENDO1'):
    """Gets and stores data from wunderground.
    Args:
        day: A date object.
        pws: A weather station string.
    """
    output_file = os.path.join(os.getcwd(),
                               DATA_DIR,
                               pws,
                               day.strftime('%Y'),
                               day.strftime('%m'),
                               '%s.json' % day.strftime('%d'))

    if os.path.isfile(output_file):
        print 'Already have %s' % output_file
        return

    url = get_api_url(day, pws)
    print '\nLoading %s ...' % url

    try:
        start_time = datetime.now()
        response = urllib2.urlopen(url)
        data = json.load(response)

        # mkdir -p
        if not os.path.exists(os.path.dirname(output_file)):
            os.makedirs(os.path.dirname(output_file))

        with open(output_file, 'w') as f:
            f.write(json.dumps(data))

        print 'Wrote data! %s' % output_file

        end_time = datetime.now()
        took_s = (end_time - start_time).total_seconds()
        if took_s < MIN_TIME_SEC:
            sleep_for = MIN_TIME_SEC - took_s
            print 'Sleeping %s ...' % sleep_for
            time.sleep(sleep_for)

    except urllib2.HTTPError, e:
        print e.code
    except urllib2.URLError, e:
        print e.args


# Loops through a date range and makes a call to store the daily data.
start_date = date(2013, 9, 01)
end_date = date(2013, 11, 27)
for i in range(0, len(PWS)):
    pws = PWS[i]
    #end_date = datetime.now().date()
    print '%s :: START: %s -> END: %s\n' % (pws, start_date, end_date)
    for day in datespan(start_date, end_date):
        store_data(day, pws)
