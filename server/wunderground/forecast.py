#!/usr/bin/python

import json
import os

import utils


def fetch_forecast_data(pws=utils.PWS[0]):
    """Gets and stores forecast data for a given day from wunderground.
    Args:
        day: A date object.
        pws: A weather station string.
    """
    print 'FORECAST :: %s' % pws['name']
    day = utils.now_date(tz=pws['tz_long'])
    file_path = os.path.join(os.getcwd(), utils.DATA_DIR, pws['name'],
                             day.strftime('%Y'), day.strftime('%m'),
                             '%s_forecast10day.json' % day.strftime('%d'))

    if os.path.isfile(file_path):
        print 'Already have %s\n' % file_path
        return

    url = utils.get_forecast_api_url(pws)

    response = utils.urlfetch_throttled(url)
    if response:
        data = json.load(response)
        utils.write_json_data_to_file(data, file_path)
    else:
        print 'ERROR: No response from utils.urlfetch_throttled'
        raise


for i in range(0, len(utils.PWS)):
    pws = utils.PWS[i]
    fetch_forecast_data(pws)
