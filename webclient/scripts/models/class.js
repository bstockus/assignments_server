var _classes = [];

var _active_class_idx = 0;
var _active_class = {};

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

var Class = function (id, __name, assigns_due){
    
    this._id = id;
    this._name = __name;
    this._total_assigns_due = assigns_due;
    this._active = null;
    this._assigns_due = null;
    this._assigns = null;
    
    this._assign_groups = ['past-due', 'due-today', 'due-tomorrow', 'due-this-week', 'due-next-week', 'due-this-month', 'due-after-this-month'];
    this._assign_groups_with_completed = this._assign_groups.push('completed');
    
    this.getID = function (){
        return this._id;
    };
    
    this.getName = function (){
        return this._name;
    };
    
    this.getTotalAssignsDue = function (){
        return this._total_assigns_due;
    };
    
    this.getActive = function (){
        if (this._active != null) {
            return this._active;
        } else {
            this.updateClassGet();
            return this.getActive();
        }
    };

    this.getAssignsDue = function (_period){
        if (this._assigns_due != null) {
            return this._assigns_due[_period];
        } else {
            this.updateClassGet();
            return this.getAssignsDue(_period);
        }
    };

    this.getAssigns = function (_period){
        if (this._assigns != null) {
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
                            __assign['id'],
                            __assign['name'],
                            new Date(__assign['created']),
                            new Date(__assign['due']),
                            __assign['completed'],
                            new Date(__assign['date-completed'])));
                    } else {
                        this._assigns[_key].push(new Assign(
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
    
    
};