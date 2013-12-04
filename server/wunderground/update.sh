#!/bin/sh

#git pull;
python history.py;
python forecast.py;
python format.py data/;
git add data/*;
git commit -a -m 'Adding new wunderground data.';
git push;
cd ../;
./update.sh;
echo 'YEAH!! Done.\n'
