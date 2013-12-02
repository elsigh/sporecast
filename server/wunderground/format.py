#!/usr/bin/python

from datetime import datetime
import json
import os
from os import walk
import sys
import utils

FILE_EXT = '.json'
MONTHLY_SUMMARY_FILENAME = 'data%s' % FILE_EXT

dir_to_start = sys.argv[1]

data_path = os.path.join(os.getcwd(), dir_to_start)
for (dirpath, dirnames, filenames) in walk(data_path):
    if len(filenames) > 0:
        monthly_data = {
            'data': []
        }
        for filename in filenames:
            if filename != MONTHLY_SUMMARY_FILENAME:
                print 'Reading %s' % filename
                f = open(os.path.join(dirpath, filename), 'r')
                json_data = json.loads(f.read())
                f.close()

                # FORECAST DATA
                if filename.find('forecast10day') != -1:
                    print 'FORECAST DATA FOUND!'

                # DAILY DATA
                else:
                    daynum = filename.replace(FILE_EXT, '')
                    daily_data = json_data['history']['dailysummary'][0]

                    monthly_data['data'].append({
                        'daynum': daynum,
                        'precipi': float(daily_data['precipi']),
                        'mintempi': float(daily_data['mintempi']),
                        'maxtempi': float(daily_data['maxtempi'])
                    })

        file_path = os.path.join(dirpath, MONTHLY_SUMMARY_FILENAME)
        utils.write_json_data_to_file(monthly_data, file_path)
