#!/usr/bin/python

from datetime import date, timedelta
import json
import os
import sys

import utils


def fetch_history_data(day, pws=utils.PWS[0]):
    """Gets and stores history data for a given days from wunderground.
    Args:
        day: A date object.
        pws: A weather station string.
    """
    file_path = os.path.join(os.getcwd(),
                             utils.DATA_DIR,
                             pws['name'],
                             day.strftime('%Y'),
                             day.strftime('%m'),
                             '%s.json' % day.strftime('%d'))

    if os.path.isfile(file_path):
        print 'Already have %s\n' % file_path
        return

    url = utils.get_history_api_url(day, pws)

    response = utils.urlfetch_throttled(url)
    if response:
        data = json.load(response)
        utils.write_json_data_to_file(data, file_path)
    else:
        print 'ERROR: No response from utils.urlfetch_throttled'
        raise


# Loops through a date range and makes a call to store the daily data.
if len(sys.argv) > 1:
    pws_index = int(sys.argv[1])
    days_in_past = int(sys.argv[2])
else:
    days_in_past = 2

start_date = utils.now_date() - timedelta(days=days_in_past)
end_date = utils.now_date()

if pws_index:
    pws = utils.PWS[pws_index]
    print ('HISTORY :: %s :: START: %s -> END: %s' %
           (pws['name'], start_date, end_date))
    for day in utils.datespan(start_date, end_date):
        fetch_history_data(day, pws)

else:
    for i in range(0, len(utils.PWS)):
        pws = utils.PWS[i]
        print ('HISTORY :: %s :: START: %s -> END: %s' %
               (pws['name'], start_date, end_date))
        for day in utils.datespan(start_date, end_date):
            fetch_history_data(day, pws)

