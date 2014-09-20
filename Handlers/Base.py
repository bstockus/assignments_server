import webapp2

import logging

from Models.AuthToken import *
from Models.SiteHit import *
from Models.User import *

class LoggedRequestHandler(webapp2.RequestHandler):
    """Abstract Class for Providing Logging of Requests"""
    def dispatch(self):
        ip_addr = self.request.remote_addr
        path = self.request.path
        client = self.request.headers['User-Agent']
        method = self.request.method
        scheme = self.request.scheme
        is_authed = False
        if self.request.headers.has_key('X-Assignments-Auth-Token'):
            auth_token = self.request.headers['X-Assignments-Auth-Token']
            if len(auth_token) > 0:
                if AuthToken.validate_authtoken(auth_token, ip_addr):
                    is_authed = True
                    user = (AuthToken.query_authtoken(auth_token))[0].user.get()
        super(LoggedRequestHandler, self).dispatch()
        self.response.headers['Access-Control-Allow-Origin'] = 'null'
        status = self.response.status
        if is_authed:
            SiteHit(request_url = path, request_ip_address = ip_addr, request_client = client, request_method = method, request_scheme = scheme, response_status = status, user = user.key, auth_token = auth_token).put()
        else:
            SiteHit(request_url = path, request_ip_address = ip_addr, request_client = client, request_method = method, request_scheme = scheme, response_status = status).put()

class AuthenticatedRequestHandler(LoggedRequestHandler):
    """Abstract Class for Providing Authenticated Request Handling"""
    def dispatch(self):
        ip_addr = self.request.remote_addr
        if self.request.headers.has_key('X-Assignments-Auth-Token'):
            token = self.request.headers['X-Assignments-Auth-Token']
            if AuthToken.validate_authtoken(token, ip_addr):
                self.authentication_token = (AuthToken.query_authtoken(token))[0]
                self.authenticated_user = self.authentication_token.user.get()
                super(AuthenticatedRequestHandler, self).dispatch()
                return
            else:
                self.response.status = "401 Invalid or Expired Auth-Token"
        else:
            self.response.status = "401"