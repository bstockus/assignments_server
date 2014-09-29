//var _classes = [];

//var _active_class_idx = 0;
//var _active_class = {};

function findClassById(_id) {
    var __classes = _classes['active'];
    var _class;
    for (_class in __classes) {
        if (__classes[_class]['id'] == _id) {
            return __classes[_class];
        }
    }
    return {};
}

var Class = function (__parent_user, id, __name, assigns_due){

    this._parent_user = __parent_user;
    this._id = id;
    this._name = __name;
    this._total_assigns_due = assigns_due;
    this._active = undefined;
    this._assigns_due = undefined;
    this._assigns = undefined;
    
    this._assign_groups = ['past-due', 'due-today', 'due-tomorrow', 'due-this-week', 'due-next-week', 'due-this-month', 'due-after-this-month'];
    this._assign_groups_with_completed = ['past-due', 'due-today', 'due-tomorrow', 'due-this-week', 'due-next-week', 'due-this-month', 'due-after-this-month', 'completed'];
    
    this.getID = function (){
        return this._id;
    };
    
    this.getName = function (){
        return this._name;
    };

    this.setName = function (new_name){
        this.modifyClass(new_name);
        return this._name;
    };
    
    this.getTotalAssignsDue = function (){
        return this._total_assigns_due;
    };
    
    this.getActive = function (){
        if (this._active != undefined) {
            return this._active;
        } else {
            this.updateClassGet();
            return this.getActive();
        }
    };

    this.getAssignsDue = function (_period){
        if (this._assigns_due != undefined) {
            return this._assigns_due[_period];
        } else {
            this.updateClassGet();
            return this.getAssignsDue(_period);
        }
    };

    this.getAssigns = function (_period){
        if (this._assigns != undefined) {
            return this._assigns[_period];
        } else {
            this.updateClassGet();
            return this.getAssigns(_period);
        }
    };
    
    this.updateClassGet = function (){
        var _res = null;
        
        var _success_cb = function (response){
            _res = response;
        };
        
        var _error_cb = function (error){
            throw error;
        };
        
        performClassGetRequest(this._id, _success_cb, _error_cb);
        
        if (_res != null) {

            this._active = _res['active'];
            this._assigns_due = {};
            this._assigns = {};

            //Parse Assignments Due
            for (var index = 0; index < this._assign_groups.length; index ++) {
                var _key = this._assign_groups[index];
                this._assigns_due[_key] = _res['assigns-due'][_key];
            }

            //Parse Assignments
            for (var index = 0; index < this._assign_groups_with_completed.length; index ++) {
                var _key = this._assign_groups_with_completed[index];
                this._assigns[_key] = [];
                var __assigns = _res['assigns'][_key];
                for (var assignIndex = 0; assignIndex < __assigns.length; assignIndex ++) {
                    var __assign = __assigns[assignIndex];
                    if (__assign['completed']) {
                        this._assigns[_key].push(new Assign(
                            this,
                            __assign['id'],
                            __assign['name'],
                            new Date(__assign['created']),
                            new Date(__assign['due']),
                            __assign['completed'],
                            new Date(__assign['date-completed'])));
                    } else {
                        this._assigns[_key].push(new Assign(
                            this,
                            __assign['id'],
                            __assign['name'],
                            new Date(__assign['created']),
                            new Date(__assign['due']),
                            __assign['completed'],
                            null));
                    }
                }

            }

        }
        
    };

    this.updateAssignPeriod = function (__assign, new_period, old_completed) {
        var cur_period = this.getPeriodForAssign(__assign);
        var filter_cb = function (e){
            return (e != __assign);
        };
        this._assigns[cur_period] = this._assigns[cur_period].filter(filter_cb);
        if (!old_completed) {
            this._assigns_due[cur_period] -= 1;
            this._total_assigns_due -= 1;
            this._parent_user.updateTotalAssignsDue(-1);
        }
        if (!__assign.getIsCompleted()) {
            this._assigns_due[new_period] += 1;
            this._total_assigns_due += 1;
            this._parent_user.updateTotalAssignsDue(1);
        }
        this._assigns[new_period].push(__assign);
    };

    this.getAssignByID = function (__id) {
        for (var periodIndex = 0; periodIndex < this._assign_groups_with_completed.length; periodIndex ++) {
            var period = this._assign_groups_with_completed[periodIndex];
            var assigns = this.getAssigns(period);
            for (var assignIndex = 0; assignIndex < assigns.length; assignIndex ++) {
                if (assigns[assignIndex].getID() == __id) {
                    return assigns[assignIndex];
                }
            }
        }
        return null;
    };

    this.getPeriodForAssign = function (__assign){
        for (var periodIndex = 0; periodIndex < this._assign_groups_with_completed.length; periodIndex ++) {
            var period = this._assign_groups_with_completed[periodIndex];
            var assigns = this.getAssigns(period);
            for (var assignIndex = 0; assignIndex < assigns.length; assignIndex ++) {
                if (assigns[assignIndex] == __assign) {
                    return period;
                }
            }
        }
        return null;
    };

    this.modifyClass = function (new_name) {
        var _res;
        var _success_cb = function (_response){
            _res = _response;
        };
        var _failure_cb = function (_error){
            throw _error;
        };
        performClassUpdateRequest(this._id, new_name, null, _success_cb, _failure_cb);
        this._name = new_name;
    };

    this.addAssign = function (__name, __date_due) {
        var _res = null;

        var _success_cb = function (response){
            _res = response;
        };

        var _error_cb = function (error){
            throw error;
        };

        performAssignCreateRequest(this.getID(), __name, __date_due, _success_cb, _error_cb);

        if (_res != null) {
            var _new_assign = new Assign(this, _res['id'], _res['name'], new Date(_res['created']), new Date(_res['due']), _res['completed'], null);
            var period = _new_assign.getDuePeriod();
            this._assigns[period].push(_new_assign);
            if (!_new_assign.getIsCompleted()) {
                this._assigns_due[period] += 1;
                this._total_assigns_due += 1;
                this._parent_user.updateTotalAssignsDue(1);
            }
            return _new_assign;
        } else {
            throw "Unable to create new assign (Client-Side).";
        }
    };

    this.forClassSidebar = function (){
        var _show_assigns_due = false;
        if (this.getTotalAssignsDue() > 0) {
            _show_assigns_due = true;
        }
        return {"id": this.getID(), "assigns-due": this.getTotalAssignsDue(), "name": this.getName(), "show-assigns-due": _show_assigns_due};
    };

    this.forAllDuegroup = function (_period){
        var __assigns_out = [];
        var __assigns = this.getAssigns(_period);
        for (var index = 0; index < __assigns.length; index ++) {
            __assigns_out.push(__assigns[index].forDuegroup());
        }
        return __assigns_out;
    };

    this.forDuegroup = function (_period){
        var __assigns = this.getAssigns(_period);
        var __incompleted_assigns = __assigns.filter(function (e){
            return !e.getIsCompleted();
        });
        var __completed_assigns = __assigns.filter(function (e){
            return e.getIsCompleted();
        });

        var _sort_function = function (a, b){
            return (a.getDateDue().valueOf() - b.getDateDue().valueOf());
        };

        __incompleted_assigns.sort(_sort_function);
        __completed_assigns.sort(_sort_function);

        var __assigns_out = [];
        for (var index = 0; index < __incompleted_assigns.length; index ++) {
            __assigns_out.push(__incompleted_assigns[index].forDuegroup());
        }
        for (var index = 0; index < __completed_assigns.length; index ++) {
            __assigns_out.push(__completed_assigns[index].forDuegroup());
        }
        return {"assigns-due": this.getAssignsDue(_period), "assigns": __assigns_out};
    };

    this.isThereClassesForDuegroup = function (_period){
        if (this.getAssigns(_period).length == 0) {
            return false;
        } else {
            return true;
        }
    };

};