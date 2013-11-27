import os

MAIL_FROM = 'MushroomForecast <lsimon@commoner.com>'

ROOT_PATH = os.path.dirname(__file__)

TEMPLATE_DIRS = (
    os.path.join(ROOT_PATH, 'templates')
)

USER_AGENT = ('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 '
              '(KHTML, like Gecko) Chrome/28.0.1468.0 Safari/537.36')
