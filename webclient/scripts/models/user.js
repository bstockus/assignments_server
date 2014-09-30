var User = function (display_name, email){
    
    this._display_name = display_name;
    this._email = email;
    this._total_assigns_due = undefined;
    this._active_classes = undefined;
    this._inactive_classes = undefined;
    
    this.getDisplayName = function (){
        return this._display_name;
    };
    
    this.getEmail = function (){
        return this._email;
    };
    
    this.updateClassList = function (){
        var _res = null;
        
        var _success_cb = function (response){
            _res = response;
        };
        
        var _error_cb = function (error){
            throw error;
        };
        
        performClassListRequest(_success_cb, _error_cb);
        
        if (_res != null) {
            this._total_assigns_due = _res['total-assigns-due'];
            this._active_classes = [];
            this._inactive_classes = [];
            for (var index = 0; index < _res['active'].length; index ++) {
                var _class = _res['active'][index];
                this._active_classes.push(new Class(this, _class['id'], _class['name'], _class['assigns-due']));
            }
            for (var index = 0; index < _res['inactive'].length; index ++) {
                var _class = _res['inactive'][index];
                this._inactive_classes.push(new Class(this, _class['id'], _class['name'], 0));
            }
        }
        
    };

    this.deleteClass = function (_class){
        var _res = null;

        var _success_cb = function (response){
            _res = response;
        };

        var _error_cb = function (error){
            throw error;
        };

        var _active = _class.getActive();
        var _assigns_due = _class.getAssignsDue();
        var _id = _class.getID();

        performClassDeleteRequest(_id, _success_cb, _error_cb);

        if (_res != null) {

            var _filter_cb = function (element){
                return (element.getID() != _id);
            };

            if (_active) {
                this._active_classes = this._active_classes.filter(_filter_cb);
                this._total_assigns_due -= _assigns_due;
            } else {
                this._inactive_classes = this._inactive_classes.filter(_filter_cb);
            }
        }

    };

    this.addClass = function (_name){
        var _res = null;

        var _success_cb = function (response){
            _res = response;
        };

        var _error_cb = function (error){
            throw error;
        };

        performClassCreateRequest(_name, _success_cb, _error_cb);

        if (_res != null) {
            var _new_class = new Class(this, _res['id'], _res['name'], 0);
            this._active_classes.push(_new_class);
            return _new_class;
        } else {
            throw "Unable to create new class (client-side).";
        }

    };

    this.getTotalAssignsDue = function (){
        if (this._total_assigns_due != undefined) {
            return this._total_assigns_due;
        } else {
            this.updateClassList();
            return this.getTotalAssignsDue();
        }
    };
    
    this.getActiveClasses = function (){
        if (this._active_classes != undefined) {
            return this._active_classes;
        } else {
            this.updateClassList();
            return this.getActiveClasses();
        }
    };
    
    this.getInactiveClasses = function (){
        if (this._inactive_classes != undefined) {
            return this._inactive_classes;
        } else {
            this.updateClassList();
            return this.getInactiveClasses();
        }
    };

    this.getClassById = function (_class_id){
        var __active_classes = this.getActiveClasses();
        for (var index = 0; index < __active_classes.length; index ++) {
            if (__active_classes[index].getID() == _class_id) {
                return __active_classes[index];
            }
        }
        var __inactive_classes = this.getInactiveClasses();
        for (var index = 0; index < __inactive_classes.length; index ++) {
            if (__inactive_classes[index].getID() == _class_id) {
                return __inactive_classes[index];
            }
        }
        return null;
    };

    this.getAssignById = function (_assign_id){
        var __active_classes = this.getActiveClasses();
        for (var index = 0; index < __active_classes.length; index ++) {
            var __assign = __active_classes[index].getAssignByID(_assign_id);
            if (__assign != null) {
                return __assign;
            }
        }
        return null;
    }

    this.updateTotalAssignsDue = function (_delta_total_assigns_due) {
        this._total_assigns_due += _delta_total_assigns_due;
    };

    this.forClassSidebar = function (){
        var __active_classes = this.getActiveClasses();
        var __active_classes_output = [];
        for (var index = 0; index < __active_classes.length; index ++) {
            __active_classes_output.push(__active_classes[index].forClassSidebar());
        }
        return {"total-assigns-due": this.getTotalAssignsDue(), "active": __active_classes_output};
    };

    this.forDuegroup = function(_period){
        var __active_classes = this.getActiveClasses();
        var __assigns = [];
        var __assigns_due = 0;
        for (var index = 0; index < __active_classes.length; index ++) {
            __assigns_due += __active_classes[index].getAssignsDue(_period);
            __assigns = __assigns.concat(__active_classes[index].forAllDuegroup(_period));
        }
        return {"assigns-due": __assigns_due, "assigns": __assigns};
    };
    
};