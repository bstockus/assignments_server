import webapp2
import json

from Handlers.Base import *

from Models.User import *

class User(AuthenticatedRequestHandler):
    def post(self):
        user = self.authenticated_user
        e = json.JSONEncoder()
        res = {'display_name': user.display_name, 'email': user.email}
        self.response.status = "200 OK"
        self.response.write(e.encode(res))