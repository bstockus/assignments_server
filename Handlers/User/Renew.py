import webapp2
import json
import datetime

from Handlers.Base import *

from Models.User import *

class Renew(AuthenticatedRequestHandler):
    def post(self):
        self.authentication_token.expires = datetime.datetime.now() + datetime.timedelta(0, 60 * 10)
        self.authentication_token.put()
        e = json.JSONEncoder()
        res = {'auth_token' : self.authentication_token.token, 'expires' : str(self.authentication_token.expires)}
        self.response.status = "200 OK"
        self.response.write(e.encode(res))