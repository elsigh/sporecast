#!/usr/bin/python2.7
# -*- coding: utf_8 -*-
#
#

from datetime import date, datetime
import json
import logging
import math
import operator
import os
from os import walk
import re
import webapp2

import wunderground.utils


class CORSWunderGroundRequestFileHandler(webapp2.RequestHandler):
    def get(self, path):
        path = os.path.join(os.getcwd(), path)
        logging.info('CORSWunderGroundRequestFileHandler path: %s' % path)
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        # any type
        self.response.headers['Content-Type'] = '*.*'
        self.response.out.write(open(path, 'rb').read())


class CORSWunderGroundRequestHandler(webapp2.RequestHandler):
    def get(self, path):
        logging.info('CORSWunderGroundRequestHandler path: %s', path)
        data = getFormattedData(path)
        logging.info("DATA!!: %s", data)
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.headers['Content-Type'] = '*.*'
        self.response.out.write(data)


FILE_EXT = '.json'
MONTHLY_SUMMARY_FILENAME = 'data%s' % FILE_EXT


def getFormattedData(data_root):
    (_, _, pws_name, year, month) = data_root.split('/')
    path = os.path.join(os.getcwd(), data_root)
    monthly_data = {
        'data': [],
        'total_rain': 0,
        'datetime_utc': '%s %s' % (str(datetime.utcnow()), 'UTC')
    }
    logging.info("GET FORMATTED DATA %s", data_root)
    for dirpath, _, filenames in walk(data_root):
        logging.info("FILENAMES %s", filenames)

        if len(filenames) == 0:
            continue

        for filename in filenames:
            if filename == MONTHLY_SUMMARY_FILENAME:
                continue

            dirpath_split = dirpath.split('/')
            dirpath_useful = '/'.join(
                dirpath_split[len(dirpath_split) - 4:len(dirpath_split)])
            logging.info('Reading %s in %s', filename, dirpath_useful)
            f = open(os.path.join(dirpath, filename), 'r')
            json_data = json.loads(f.read())
            f.close()

            daynum = re.search('^([\d]+)', filename).groups()[0]
            from_date = date(int(year), int(month), int(daynum))

            # FORECAST DATA
            if filename.find('forecast10day') != -1:
                pws = None
                for pws_item in wunderground.utils.PWS:
                    if pws_item['name'] == pws_name:
                        pws = pws_item
                        break
                if pws is None:
                    raise 'Found no PWS data for %s' % pws_name

                today = wunderground.utils.now_date(tz=pws['tz_long'])

                # only incorporate forecast datafile if it's from today.
                if from_date == today:
                    logging.info('->-> using forecast data file %s', today)
                    forecast_data = json_data['forecast']['simpleforecast']['forecastday']
                    for daily_data in forecast_data:
                        forecast_day_month = daily_data['date']['month']
                        forecast_day_num = daily_data['date']['day']
                        forecast_day_name = date(int(year), int(month),
                                                 int(forecast_day_num)).strftime('%a')
                        # Don't include next month's data in this months summary and also
                        # ignore forecast data for today, we should have real data.
                        is_from_this_month = int(
                            forecast_day_month) == today.month
                        is_from_today = int(forecast_day_num) == today.day
                        if (is_from_this_month and not is_from_today):
                            monthly_data['data'].append({
                                'is_forecast': True,
                                'daynum': forecast_day_num,
                                'dayname': forecast_day_name,
                                'precipi': daily_data['pop'],
                                'precipi_is_zero': int(daily_data['pop'] or 0) == 0,
                                'mintempi': int(float(daily_data['low']['fahrenheit'] or 0)),
                                'maxtempi': int(float(daily_data['high']['fahrenheit'] or 0)),
                            })
                            logging.info(('-->-->--> Adding forecast for %s %s/%s',
                                          forecast_day_name, forecast_day_month, forecast_day_num))
                        else:
                            logging.info(('-->-->--> Ignore forecast for %s %s/%s',
                                          forecast_day_name, forecast_day_month, forecast_day_num))

            # DAILY DATA
            else:
                logging.info('-> using daily data.')
                try:
                    daily_data = json_data['history']['dailysummary'][0]
                except KeyError:
                    pass
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

        monthly_data['total_rain'] = int(
            monthly_data['total_rain'] * 100 + 0.5) / 100.0
        monthly_data['data'].sort(key=operator.itemgetter('daynum'))
    return monthly_data
