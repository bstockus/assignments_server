import webapp2
import os

from Handlers.Base import *

import Handlers.User.SignIn
import Handlers.User.Renew
import Handlers.User.SignOut
import Handlers.User.CreateUser
import Handlers.User.User
import Handlers.Class
import Handlers.Assign

class IndexRedirect(LoggedRequestHandler):
    def get(self):
        self.redirect('/web/index.html')

class JavaScriptAPIPathRouter(LoggedRequestHandler):
    def get(self):
        if os.environ['SERVER_SOFTWARE'].startswith('Development'):
            self.redirect('/web/api_development.js')
        else:
            self.redirect('/web/api_production.js')

# Application Routes
routes = [
    webapp2.Route(r'/api/class/', handler='Handlers.Class.Class:index', name='class-list', methods=['GET']),
    webapp2.Route(r'/api/class/', handler='Handlers.Class.Class:create', name='class-create', methods=['POST']),
    webapp2.Route(r'/api/class/<id>', handler='Handlers.Class.Class:get', name='class-get', methods=['GET']),
    webapp2.Route(r'/api/class/<class_id>', handler='Handlers.Class.Class:update', name='class-update', methods=['POST']),
    webapp2.Route(r'/api/class/<class_id>', handler='Handlers.Class.Class:delete', name='class-delete', methods=['DELETE']),
    webapp2.Route(r'/api/class/<class_id>/assign/', handler='Handlers.Assign.Assign:create', name='assign-create', methods=['POST']),
    webapp2.Route(r'/api/assign/<assign_id>', handler='Handlers.Assign.Assign:update', name='assign-update', methods=['POST']),
    webapp2.Route(r'/api/assign/<assign_id>', handler='Handlers.Assign.Assign:delete', name='assign-delete', methods=['DELETE']),
    ('/api/signin', Handlers.User.SignIn.SignIn),
    ('/api/renew', Handlers.User.Renew.Renew),
    ('/api/signout', Handlers.User.SignOut.SignOut),
    ('/api/create_user', Handlers.User.CreateUser.CreateUser),
    ('/api/user', Handlers.User.User.User),
    ('/api.js', JavaScriptAPIPathRouter),
    ('/', IndexRedirect)
]

application = webapp2.WSGIApplication(routes, debug=True)