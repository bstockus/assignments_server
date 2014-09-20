import webapp2
import json

from Handlers.Base import *

from Models.User import *
from Models.AuthToken import *

class SignIn(LoggedRequestHandler):
    def post(self):
        req_str = self.request.body
        d = json.JSONDecoder()
        req = d.decode(req_str)
        if req.has_key('user_name') and req.has_key('password'):
            user_name = req['user_name']
            password = req['password']
            if User.authenticate_user(user_name, password):
                user = (User.query_user(user_name))[0]
                auth_token = AuthToken.create_authtoken((User.query_user(user_name))[0].key, self.request.remote_addr)
                auth_token.put()
                e = json.JSONEncoder()
                res = {'auth_token' : auth_token.token, 'expires' : str(auth_token.expires), 'display_name': user.display_name}
                self.response.status = "200 OK"
                self.response.write(e.encode(res))
            else:
                self.response.status = "401 Invalid Username or Password"
        else:
            self.response.status = "400 Missing Required Parameters"