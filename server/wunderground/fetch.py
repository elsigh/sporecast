#!/usr/bin/python

from datetime import date, datetime, timedelta
import json
import os
import time
import urllib2


KEY = 'b316a72d2e91b2e7'
DATA_DIR = 'data'
# Note - we're rate-limited by wunderground to 10-per-minute, so
# we'll just ghetto-rig this so that each request takes 7 seconds.
MIN_TIME_SEC = 7


def datespan(startDate, endDate, delta=timedelta(days=1)):
    currentDate = startDate
    while currentDate < endDate:
        yield currentDate
        currentDate += delta


def get_api_url(yyyymmdd, pws='KCAMENDO1'):
    return ('http://api.wunderground.com/api/%s/history_%s/q/pws:%s.json' %
            (KEY, yyyymmdd, pws))


def store_data(yyyymmdd, pws='KCAMENDO1'):

    output_file = os.path.join(os.getcwd(),
                               DATA_DIR,
                               pws,
                               yyyymmdd.strftime('%Y'),
                               yyyymmdd.strftime('%m'),
                               '%s.json' % yyyymmdd.strftime('%d'))

    if os.path.isfile(output_file):
        print 'Already have %s' % output_file
        return

    url = get_api_url(yyyymmdd, state, city)
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


start_date = date(2013, 11, 1)
end_date = date(2013, 11, 26)
state = 'CA'
city = 'San Francisco'
#end_date = datetime.now().date()
print 'START: %s -> END: %s' % (start_date, end_date)
for day in datespan(start_date, end_date):
    yyyymmdd = day.strftime('%Y%m%d')
    store_data(yyyymmdd, state, city)
