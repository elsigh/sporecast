#!/bin/sh
echo '-- App Engin update bgin --'
/usr/local/bin/gcloud app deploy --promote -q app.yaml
echo '-- App Engine update complete --'
