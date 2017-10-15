#!/bin/sh

cd $(dirname $0);
git pull;
python history.py;
python forecast.py;
python format.py data/;
git add data/*;
git add output/*;
git commit -a -m 'Adding new wunderground data.';
git push;
cd ../;
./delete_old_gae_versions.sh default 3;
./update.sh;
echo 'YEAH!! Done.\n'
