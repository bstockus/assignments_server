import webapp2
import json
import datetime

from Handlers.Base import *

from Models.AuthToken import *

class SignOut(AuthenticatedRequestHandler):
    def post(self):
        self.authentication_token.expires = datetime.datetime.now()
        self.authentication_token.put()
        self.response.status = "204 Logged Out"