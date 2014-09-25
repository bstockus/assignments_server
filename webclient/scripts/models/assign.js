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

};