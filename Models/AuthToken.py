import datetime
import hashlib

import logging

from google.appengine.ext import ndb

from Models.User import *

class AuthToken(ndb.Model):
    """Models an AuthToken for authorizing access for a user"""
    token = ndb.StringProperty(indexed = True, required = True)
    user = ndb.KeyProperty(indexed = True, required = True, kind = User)
    created = ndb.DateTimeProperty(auto_now_add = True)
    expires = ndb.DateTimeProperty(required = True)
    ip_address = ndb.StringProperty(required = True)
    last_usage = ndb.DateTimeProperty()
    
    @classmethod
    def query_authtoken(cls, token):
        """Gets an AuthToken based on the tokens value"""
        return list(cls.query(cls.token == unicode(token)))
    
    @classmethod
    def create_authtoken(cls, user_key, ip_address):
        """Creates a new AuthToken for the given user_key/ip_address pair"""
        date_time = str(datetime.datetime.now())
        hash_input = date_time + str(user_key) + ip_address
        h = hashlib.md5()
        h.update(hash_input)
        hash_token = h.hexdigest()
        expires = datetime.datetime.now() + datetime.timedelta(0, 60 * 10)
        return AuthToken(token = hash_token, user = user_key, expires = expires, ip_address = ip_address, last_usage = datetime.datetime.now())
        
    @classmethod
    def validate_authtoken(cls, token, ip_address):
        """Validates the validity of an auth-token"""
        now = datetime.datetime.now()
        auth_tokens = AuthToken.query_authtoken(token)
        if len(auth_tokens) > 0:
            auth_token = auth_tokens[0]
            if auth_token.expires > now:
                if auth_token.ip_address == ip_address:
                    return True
        return False
        
