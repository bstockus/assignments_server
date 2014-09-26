import webapp2
import json

from Handlers.Base import *

from Models.User import *
from Models.UserClass import *
from Models.Assignment import *

from google.appengine.ext import ndb


class Assign(AuthenticatedRequestHandler):
    def create(self, class_id):
        user = self.authenticated_user
        _class = (ndb.Key(urlsafe=class_id)).get()
        if _class.user != user.key:
            self.response.status = "404 Not Found"
            return
        d = json.JSONDecoder()
        req = d.decode(self.request.body)
        if req.has_key('name') and req.has_key('due'):
            if req['due'].has_key('day') and req['due'].has_key('month') and req['due'].has_key('year'):
                date = datetime.date(req['due']['year'], req['due']['month'], req['due']['day'])
                assign = Assignment.create_assignment(req['name'], _class.key, self.authenticated_user.key, date)
                assign.put()
                e = json.JSONEncoder()
                res = {'id': assign.key.urlsafe(), 'name': assign.name, 'created': str(assign.created),
                       'due': str(assign.due), 'completed': assign.is_completed, 'class-id': _class.key.urlsafe()}
                self.response.status = "201 Created"
                self.response.write(e.encode(res))
                return
        self.response.status = "400 Missing Required Parameters"

    def update(self, assign_id):
        user = self.authenticated_user
        assign = (ndb.Key(urlsafe=assign_id)).get()
        _class = assign.xclass.get()
        if assign.xclass != _class.key:
            self.response.status = "404 Not Found"
            return
        d = json.JSONDecoder()
        req = d.decode(self.request.body)

        if req.has_key('name'):
            assign.name = req['name']
        if req.has_key('completed'):
            assign.is_completed = req['completed']
            if req['completed']:
                assign.completed_date = datetime.datetime.now()
        if req.has_key('due'):
            due = req['due']
            if due.has_key('day') and due.has_key('month') and due.has_key('year'):
                assign.due = datetime.date(due['year'], due['month'], due['day'])
        assign.put()
        e = json.JSONEncoder()
        res = {'id': assign.key.urlsafe(), 'name': assign.name, 'created': str(assign.created), 'due': str(assign.due),
               'completed': assign.is_completed, 'class-id': _class.key.urlsafe()}
        if assign.is_completed:
            res['date-completed'] = str(assign.completed_date)
        self.response.write(e.encode(res))
        self.response.status = "200 OK"

    def delete(self, assign_id):
        user = self.authenticated_user
        assign = (ndb.Key(urlsafe=assign_id)).get()
        _class = assign.xclass.get()
        if assign.xclass != _class.key:
            self.response.status = "404 Not Found"
            return
        assign.key.delete()
        self.response.status = "204 Deleted"