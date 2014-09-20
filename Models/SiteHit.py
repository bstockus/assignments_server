from google.appengine.ext import ndb

from Models.User import *

class SiteHit(ndb.Model):
    """Models a hit to the site"""
    timestamp = ndb.DateTimeProperty(auto_now_add = True)
    request_url = ndb.StringProperty()
    request_ip_address = ndb.StringProperty()
    request_client = ndb.StringProperty()
    response_status = ndb.StringProperty()
    user = ndb.KeyProperty(kind = User)
    auth_token = ndb.StringProperty()
    request_method = ndb.StringProperty()
    request_scheme = ndb.StringProperty()