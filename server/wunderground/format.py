#!/usr/bin/python

from datetime import date, datetime
import json
import os
from os import walk
import math
import operator
import re
import sys

import utils

# TODO(elsigh): Put some bound on how far back we format each time.

FILE_EXT = '.json'
MONTHLY_SUMMARY_FILENAME = 'data%s' % FILE_EXT

# Start with our data dir, but take command line as well.
dir_to_start = utils.DATA_DIR
if len(sys.argv) == 2:
    dir_to_start = sys.argv[1]

data_path = os.path.join(os.getcwd(), dir_to_start)
for (dirpath, dirnames, filenames) in walk(data_path):
    if len(filenames) == 0:
        continue

    utcnow = datetime.utcnow()
    monthly_data = {
        'data': [],
        'total_rain': 0,
        'datetime_utc': '%s %s' % (str(datetime.utcnow()), 'UTC')
    }

    for filename in filenames:
        if filename == MONTHLY_SUMMARY_FILENAME:
            continue

        dirpath_split = dirpath.split('/')
        dirpath_useful = '/'.join(dirpath_split[len(dirpath_split) - 4:len(dirpath_split)])
        print 'Reading %s in %s' % (filename, dirpath_useful)
        f = open(os.path.join(dirpath, filename), 'r')
        json_data = json.loads(f.read())
        f.close()

        (pws_name, year, month) = re.search(
            '%s\/(.+)\/(\d{4})\/(\d{2})$' % utils.DATA_DIR,
            dirpath).groups()
        daynum = re.search('^([\d]+)', filename).groups()[0]
        from_date = date(int(year), int(month), int(daynum))

        # FORECAST DATA
        if filename.find('forecast10day') != -1:

            pws = None
            for pws_item in utils.PWS:
                if pws_item['name'] == pws_name:
                    pws = pws_item
                    break
            if pws is None:
                raise 'Found no PWS data for %s' % pws_name

            today = utils.now_date(tz=pws['tz_long'])

            # only incorporate forecast data if it's from today.
            if from_date == today:
                print '->-> using forecast data %s' % today
                forecast_data = json_data['forecast']['simpleforecast']['forecastday']
                for daily_data in forecast_data:
                    forecast_day_num = daily_data['date']['day']
                    forecast_day_name = date(int(year), int(month),
                                             int(forecast_day_num)).strftime('%a')
                    monthly_data['data'].append({
                        'is_forecast': True,
                        'daynum': forecast_day_num,
                        'dayname': forecast_day_name,
                        'precipi': daily_data['pop'],
                        'precipi_is_zero': int(daily_data['pop'] or 0) == 0,
                        'mintempi': int(float(daily_data['high']['fahrenheit'] or 0)),
                        'maxtempi': int(float(daily_data['low']['fahrenheit'] or 0)),
                    })
                    print 'Adding forecast for %s %s' % (forecast_day_name, forecast_day_num)

        # DAILY DATA
        else:
            print '-> using daily data.'
            daily_data = json_data['history']['dailysummary'][0]
            precipi = float(daily_data['precipi'] or 0)
            precipi_rounded = int(precipi * 100 + 0.5) / 100.0
            monthly_data['data'].append({
                'daynum': int(daynum),
                'dayname': from_date.strftime('%a'),
                'precipi': precipi_rounded,
                'precipi_is_zero': int(math.ceil(precipi)) == 0,
                'mintempi': int(float(daily_data['mintempi'] or 0)),
                'maxtempi': int(float(daily_data['maxtempi'] or 0)),
            })
            monthly_data['total_rain'] += precipi
            #print 'Adding past for %s' % daynum

    monthly_data['total_rain'] = int(monthly_data['total_rain'] * 100 + 0.5) / 100.0
    monthly_data['data'].sort(key=operator.itemgetter('daynum'))

    # Update dirpath to point to our output dir.
    output_file_path = dirpath.replace('%s/' % utils.DATA_DIR,
                                       '%s/' % utils.OUTPUT_DIR)
    file_path = os.path.join(output_file_path, MONTHLY_SUMMARY_FILENAME)
    utils.write_json_data_to_file(monthly_data, file_path)
