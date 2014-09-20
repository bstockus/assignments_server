import datetime

from google.appengine.ext import ndb

from Models.User import *

class UserClass(ndb.Model):
    """Represents a single class for a user"""
    user = ndb.KeyProperty(kind = User)
    name = ndb.StringProperty(required = True)
    active = ndb.BooleanProperty(required = True)
    
    @classmethod
    def query_class_by_user(cls, user_key):
        """Returns all classes associated with a user"""
        return list(cls.query(cls.user == user_key))
    
    @classmethod
    def create_class(cls, name, user_key):
        """Creates a new class"""
        return UserClass(user = user_key, name = name, active = True)
        