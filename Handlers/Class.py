import webapp2
import json

from Handlers.Base import *

from Models.User import *
from Models.UserClass import *
from Models.Assignment import *

class Class(AuthenticatedRequestHandler):
    def index(self):
        classes = UserClass.query_class_by_user(self.authenticated_user.key)
        res = {'active': [], 'inactive': [], 'total-assigns-due': 0}
        total_assigns_due = 0
        for _class in classes:
            if _class.active:
                assigns_due = len(Assignment.query_active_assignments_by_class(_class.key))
                total_assigns_due += assigns_due
                res['active'].append({'id': _class.key.urlsafe(), 'name': _class.name, 'assigns-due': assigns_due})
            else:
                res['inactive'].append({'id': _class.key.urlsafe(), 'name': _class.name})
        res['total-assigns-due'] = total_assigns_due
        e = json.JSONEncoder()
        self.response.write(e.encode(res))
        self.response.status = "200 OK"
    def get(self, id):
        _class = (ndb.Key(urlsafe = id)).get()
        if _class.user != self.authenticated_user.key:
            #This is not a class owned by this user
            self.response.status = "404 Not Found"
            return
        e = json.JSONEncoder()
        assigns = Assignment.query_assignments_by_class(_class.key)
        assigns_due = len(Assignment.query_active_assignments_by_class(_class.key))
        res = {'id': _class.key.urlsafe(), 'name': _class.name, 'active': _class.active, 'assigns-due': {}, 'assigns': {}}
        
        fassigns = {
            'completed': [],
            'past-due': [], 
            'due-today': [], 
            'due-tomorrow': [], 
            'due-this-week': [], 
            'due-next-week': [], 
            'due-this-month': [], 
            'due-after-this-month': []
        }
        
        nassigns = {
            'total': assigns_due,
            'past-due': 0, 
            'due-today': 0, 
            'due-tomorrow': 0, 
            'due-this-week': 0, 
            'due-next-week': 0, 
            'due-this-month': 0, 
            'due-after-this-month': 0
        }
        
        today = datetime.date.today().timetuple()
        today_value = (today.tm_year * 365) + today.tm_yday
        
        past_due = 0
        due_today = 0
        due_tomorrow = 0
        due_this_week = 0
        due_next_week = 0
        due_this_month = 0
        due_after_this_month = 0
        
        for assign in assigns:
            assign_date = assign.due.timetuple()
            assign_value = (assign_date.tm_year * 365) + assign_date.tm_yday
            delta = assign_value - today_value
            
            _assign = {}
            
            if assign.is_completed:
                _assign = {'id': assign.key.urlsafe(), 'name': assign.name, 'created': str(assign.created), 'due': str(assign.due), 'completed': assign.is_completed, 'date-completed': str(assign.completed_date)}
            else:
                _assign = {'id': assign.key.urlsafe(), 'name': assign.name, 'created': str(assign.created), 'due': str(assign.due), 'completed': assign.is_completed}
            
            if delta < 0:
                if assign.is_completed:
                    #Completed
                    fassigns['completed'].append(_assign)
                else:
                    #Past Due
                    fassigns['past-due'].append(_assign)
                    past_due += 1
            elif delta == 0:
                #Due Today
                fassigns['due-today'].append(_assign)
                if not assign.is_completed:
                    due_today += 1
            elif delta == 1:
                #Due Tomorrow
                fassigns['due-tomorrow'].append(_assign)
                if not assign.is_completed:
                    due_tomorrow += 1
            elif delta < 7:
                #Due This Week
                fassigns['due-this-week'].append(_assign)
                if not assign.is_completed:
                    due_this_week += 1
            elif delta < 14:
                #Due Next Week
                fassigns['due-next-week'].append(_assign)
                if not assign.is_completed:
                    due_next_week += 1
            elif delta < 28:
                #Due This Month
                fassigns['due-this-month'].append(_assign)
                if not assign.is_completed:
                    due_this_month += 1
            else:
                #Due Next Month
                fassigns['due-after-this-month'].append(_assign)
                if not assign.is_completed:
                    due_after_this_month += 1
        
        nassigns = {
            'total': assigns_due,
            'past-due': past_due, 
            'due-today': due_today, 
            'due-tomorrow': due_tomorrow, 
            'due-this-week': due_this_week, 
            'due-next-week': due_next_week, 
            'due-this-month': due_this_month, 
            'due-after-this-month': due_after_this_month
        }
        
        res['assigns'] = fassigns
        res['assigns-due'] = nassigns
        
        self.response.write(e.encode(res))
        self.response.status = "200 OK"
    def create(self):
        user = self.authenticated_user
        d = json.JSONDecoder()
        req = d.decode(self.request.body)
        if not req.has_key('name'):
            self.response.status = "400"
            return
        name = req['name']
        _class = UserClass.create_class(name, user.key)
        _class.put()
        e = json.JSONEncoder()
        res = {'name': _class.name, 'id': _class.key.urlsafe(), 'active': _class.active}
        self.response.write(e.encode(res))
        self.response.status = "201 Created"
    def update(self, class_id):
        user = self.authenticated_user
        _class = (ndb.Key(urlsafe = class_id)).get()
        if _class.user != user.key:
            self.response.status = "404 Not Found"
            return
        d = json.JSONDecoder()
        req = d.decode(self.request.body)
        if (not req.has_key('name')) and (not req.has_key('active')):
            self.response.status = "400"
            return
        if req.has_key('name'):
            _class.name = req['name']
        if req.has_key('active'):
            _class.active = req['active']
        _class.put()
        e = json.JSONEncoder()
        res = {'name': _class.name, 'id': _class.key.urlsafe(), 'active': _class.active}
        self.response.write(e.encode(res))
        self.response.status = "200 OK"
    def delete(self, class_id):
        user = self.authenticated_user
        _class = (ndb.Key(urlsafe = class_id)).get()
        if _class.user != user.key:
            self.response.status = "404 Not Found"
            return
        assigns = list(Assignment.query(Assignment.xclass == _class.key).fetch(keys_only= True))
        ndb.delete_multi(assigns)
        _class.key.delete()
        self.response.status = "204 Deleted"