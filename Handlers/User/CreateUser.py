import webapp2
import json

from Handlers.Base import *

from Models.User import *

class CreateUser(LoggedRequestHandler):
    def post(self):
        req_str = self.request.body
        d = json.JSONDecoder()
        req = d.decode(req_str)
        if req.has_key('user_name') and req.has_key('password') and req.has_key('display_name') and req.has_key('email'):
            user_name = req['user_name']
            password = req['password']
            display_name = req['display_name']
            email = req['email']
            if len(User.query_user(user_name)) == 0:
                user = User.create_user(user_name, password, display_name, email)
                user.put()
                self.response.status = "201 User Created"
            else:
                self.response.status = "409 Name In Use"
        else:
            self.response.status = "400 Missing Required Parameters"