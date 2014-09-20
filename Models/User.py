import datetime
import hashlib

from google.appengine.ext import ndb

class User(ndb.Model):
    """Models an individual User"""
    user_name = ndb.StringProperty(indexed = True, required = True)
    password_hash = ndb.StringProperty(required = True)
    display_name = ndb.StringProperty(required = True)
    email = ndb.StringProperty(required = True)
    last_login = ndb.DateTimeProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)
    
    @classmethod
    def query_user(cls, user_name):
        """Gets a User based on their user_name"""
        return list(cls.query(cls.user_name == user_name))
        
    @classmethod
    def create_user(cls, user_name, password, display_name, email):
        """Creates a new User"""
        h = hashlib.sha512()
        h.update(password)
        password_hash = h.hexdigest()
        return User(user_name = user_name, password_hash = password_hash, display_name = display_name, email = email, last_login = datetime.datetime.now())
        
    @classmethod
    def authenticate_user(cls, user_name, password):
        """Authenticates a Users password"""
        h = hashlib.sha512()
        h.update(password)
        password_hash = h.hexdigest()
        users = User.query_user(user_name)
        if len(users) > 0:
            user = users[0]
            if user.password_hash == password_hash:
                return True
            else:
                return False
        else:
            return False