#!/usr/bin/python

import json
import os
from os import walk
import sys

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
                daily_json = json.loads(f.read())
                f.close()
                daynum = filename.replace(FILE_EXT, '')
                daily_data = daily_json['history']['dailysummary'][0]

                monthly_data['data'].append({
                    'daynum': daynum,
                    'precipi': float(daily_data['precipi']),
                    'mintempi': float(daily_data['mintempi']),
                    'maxtempi': float(daily_data['maxtempi'])
                })
        output_file = os.path.join(dirpath, MONTHLY_SUMMARY_FILENAME)
        f = open(output_file, 'w')
        f.write(json.dumps(monthly_data))
        f.close()
        print 'Write to %s\n\n' % output_file
