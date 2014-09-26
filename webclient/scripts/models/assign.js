var Assign = function (__id, __name, __date_created, __date_due, __is_completed, __date_completed){

    this._id = __id;
    this._name = __name;
    this._date_created = __date_created;
    this._date_due = __date_due;
    this._is_completed = __is_completed;
    this._date_completed = __date_completed;

    this.getID = function (){
        return this._id;
    };

    this.getName = function (){
        return this._name;
    }

    this.getDateCreated = function (){
        return this._date_completed;
    }

    this.getDateDue = function (){
        return this._date_due;
    }

    this.getIsCompleted = function (){
        return this._is_completed;
    }

    this.getDateCompleted = function (){
        return this._date_completed;
    }

    this.setName = function (new_name){
        this.modifyAssign(new_name, null, null);
        return this._name;
    };

    this.setDateDue = function (new_date_due){
        this.modifyAssign(null, new_date_due, null);
        return this._date_due;
    };

    this.setIsCompleted = function (new_is_completed){
        this.modifyAssign(null, null, new_is_completed);
        return this._is_completed;
    };

    this.modifyAssign = function (new_name, new_date_due, new_is_completed) {
        var _res;
        var _success_cb = function (_response){
            _res = _response;
        };
        var _failure_cb = function (_error){
            throw _error;
        };
        performAssignUpdateRequest(this._id, new_name, new_is_completed, new_date_due, _success_cb, _failure_cb);
        this._name = _res['name'];
        this._date_created = new Date(_res['created']);
        this._date_due = new Date(_res['due']);
        this._is_completed = _res['completed'];
        if (_res['completed']) {
            this._date_completed = new Date(_res['date-completed']);
        } else {
            this._date_completed = null;
        }
    };

};