#!/usr/bin/python

from datetime import date
import json
import os

import utils


def fetch_history_data(day, pws=utils.PWS[0]):
    """Gets and stores history data for a given days from wunderground.
    Args:
        day: A date object.
        pws: A weather station string.
    """
    file_path = os.path.join(os.getcwd(),
                             utils.DATA_DIR,
                             pws,
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
start_date = date(2013, 12, 01)
end_date = utils.now_date()
for i in range(0, len(utils.PWS)):
    pws = utils.PWS[i]
    #end_date = datetime.now().date()
    print 'HISTORY :: %s :: START: %s -> END: %s' % (pws, start_date, end_date)
    for day in utils.datespan(start_date, end_date):
        fetch_history_data(day, pws)
