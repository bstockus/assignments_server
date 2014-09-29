import logging
import webapp2
import json

from datetime import *

from Models.AuthToken import *

from google.appengine.ext import ndb

class CleanStaleAuthTokens(webapp2.RequestHandler):
    def do(self):
        """Responsible for cleaning stale expired AuthTokens from the datastore"""
        if self.request.headers.has_key('X-AppEngine-Cron'):
            if self.request.headers['X-AppEngine-Cron'] == "true":
                logging.debug("Cleaning Stale AuthTokens Cron Task")
                _now = datetime.datetime.now()
                totalAuthTokens = 0
                removedAuthTokens = 0
                # Fetch all AuthTokens
                authTokens = AuthToken.query()
                for authToken in authTokens:
                    totalAuthTokens += 1
                    if authToken.expires < _now:
                        authToken.key.delete()
                        removedAuthTokens += 1
                logging.debug("Finished Cleaning Stale AuthTokens (Removed " + str(removedAuthTokens) + " of " + str(totalAuthTokens) + ")")
                self.response.status = "200"
        self.response.status = "401"