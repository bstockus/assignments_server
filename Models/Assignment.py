import datetime

from google.appengine.ext import ndb

from Models.UserClass import *
from Models.User import *

class Assignment(ndb.Model):
    """Represents a single assignment for a class"""
    xclass = ndb.KeyProperty(kind = UserClass)
    user = ndb.KeyProperty(kind = User)
    name = ndb.StringProperty(required = True)
    created = ndb.DateTimeProperty(auto_now_add = True)
    due = ndb.DateProperty()
    completed_date = ndb.DateTimeProperty()
    is_completed = ndb.BooleanProperty()
    
    @classmethod
    def query_assignment_by_user(cls, user_key):
        """Returns all assignments associated with a user"""
        return list(cls.query(cls.user == user_key))
    
    @classmethod
    def query_assignments_by_class(cls, class_key):
        """Returns all assignments associated with a class"""
        return list(cls.query(cls.xclass == class_key))
    
    @classmethod
    def query_active_assignments_by_class(cls, class_key):
        """Returns all active assignments associated with a class"""
        return list(cls.query(ndb.AND(cls.xclass == class_key, cls.is_completed == False)))
    
    @classmethod
    def create_assignment(cls, name, xclass_key, user_key, due):
        return Assignment(xclass= xclass_key, user = user_key, name = name, created = datetime.datetime.now(), due = due, is_completed = False)