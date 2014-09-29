var _active_class_collapse_state_cache = {};

function _checkActiveClassCollapseStateCacheClassExists(_class_id) {
    if (_active_class_collapse_state_cache[_class_id] === undefined) {
        _active_class_collapse_state_cache[_class_id] = {'past-due': false, 'due-today': false, 'due-tomorrow': false, 'due-this-week': false, 'due-next-week': false, 'due-this-month': false, 'due-after-this-month': false, 'completed': false};
    }
}

function getActiveClassCollapseStateCacheForClass(_class_id, _duegroup_id) {
    _checkActiveClassCollapseStateCacheClassExists(_class_id);
    return _active_class_collapse_state_cache[_class_id][_duegroup_id];
}

function setActiveClassCollapseStateCacheForClass(_class_id, _duegroup_id, _value) {
    _checkActiveClassCollapseStateCacheClassExists(_class_id);
    _active_class_collapse_state_cache[_class_id][_duegroup_id] = _value;
}

function updateActiveClass() {

    var ids = ['past-due', 'due-today', 'due-tomorrow', 'due-this-week', 'due-next-week', 'due-this-month', 'due-after-this-month', 'completed'];
    var titles = ['Past Due', 'Due Today', 'Due Tomorrow', 'Due This Week', 'Due Next Week', 'Due This Month', 'Due After This Month', 'Completed'];
    var show_due_dates = [true, false, false, true, true, true, true, false];
    var show_assigns_dues = [true, true, true, true, true, true, true, false];

    if (_active_class_id != "all") {
        var _active_class = _user.getClassById(_active_class_id);

        var html = (Handlebars.getTemplate("main_header"))({"name": _active_class.getName(), "id": _active_class.getID()});

        for (var idx = 0; idx < ids.length; idx ++) {
            var _period = ids[idx];
            if (_active_class.isThereClassesForDuegroup(_period)) {
                var obj = _active_class.forDuegroup(_period);
                obj['id'] = _period;
                obj['title'] = titles[idx];
                obj['show-due-dates'] = show_due_dates[idx];
                obj['show-assigns-due'] = show_assigns_dues[idx];
                if (_active_class.getAssignsDue(_period) == 0) {
                    obj['show-assigns-due'] = false;
                }
                obj['collapse'] = getActiveClassCollapseStateCacheForClass(_active_class_id, _period);

                html += (Handlebars.getTemplate("duegroup"))(obj);
            }
        }

        $("#main").html(html);

        $("#header-class-btns").removeClass('hidden');

    } else {

        var html = (Handlebars.getTemplate("main_header"))({"name": "All Classes", "id": "all"});

        for (var idx = 0; idx < ids.length; idx ++) {
            var _period = ids[idx];
            var obj = _user.forDuegroup(_period);
            obj['id'] = _period;
            obj['title'] = titles[idx];
            obj['show-due-dates'] = show_due_dates[idx];
            obj['show-assigns-due'] = show_assigns_dues[idx];
            if (obj['assigns-due'] == 0) {
                obj['show-assigns-due'] = false;
            }
            obj['collapse'] = getActiveClassCollapseStateCacheForClass(_active_class_id, _period);

            if (obj['assigns'].length != 0) {
                html += (Handlebars.getTemplate("duegroup-all-classes"))(obj);
            }

        }

        $("#main").html(html);

        $("#header-class-btns").addClass('hidden');

    }

    updateClassEditAndDeleteBtns();
    updateAddNewClassBtn();

    $(".unchecked").hover(function (event){
        $(".assign-cb#" + this.id).removeClass('fa-square').addClass('fa-check-square-o');
    }, function (event){
        $(".assign-cb#" + this.id).addClass('fa-square').removeClass('fa-check-square-o');
    });
    
    $(".unchecked").click(function (event){
        var _id = this.id;
        var _assign = _user.getAssignById(_id);
        _assign.setIsCompleted(true);
        updateActiveClass();
        updateActiveClassAssignsDue();
    });

    $(".checked").click(function (event){
        var _id = this.id;
        var _assign = _user.getAssignById(_id);
        _assign.setIsCompleted(false);
        updateActiveClass();
        updateActiveClassAssignsDue();
    });
    
    $(".assign-name").popover();

    if (_active_class_id == "all") {
        $(".add-new-assign-btn").addClass('hidden');
    } else {
        $(".add-new-assign-btn").removeClass('hidden');
        $(".add-new-assign-btn").click(function (event){
        _displayAddNewAssignmentModal();
    });
    }



    $(".panel-collapse").on('shown.bs.collapse', function (){
        setActiveClassCollapseStateCacheForClass(_active_class_id, this.id, true);
    });

    $(".panel-collapse").on('hidden.bs.collapse', function (){
        setActiveClassCollapseStateCacheForClass(_active_class_id, this.id, false);
    });

}

function refreshActiveClass() {
    updateActiveClass();
}

function updateActiveClassAssignsDue() {
    if (_active_class_id != "all") {
        var __total_assigns_due = _user.getClassById(_active_class_id).getTotalAssignsDue();
        if (__total_assigns_due == 0) {
            $("span.badge#" + _active_class_id).addClass('hidden');
        } else {
            $("span.badge#" + _active_class_id).removeClass('hidden');
            $("span.badge#" + _active_class_id).text(__total_assigns_due);
        }
    } else {
        updateAllClassAssignsDue();
    }
    updateTotalAssignsDue();
}

function updateTotalAssignsDue() {
    var __total_assigns_due = _user.getTotalAssignsDue();
    if (__total_assigns_due == 0) {
        $(".total-assigns-due-badge").addClass('hidden');
    } else {
        $(".total-assigns-due-badge").removeClass('hidden');
        $(".total-assigns-due-badge").text(__total_assigns_due);
    }
}

function updateAllClassAssignsDue() {
    var __active_classes = _user.getActiveClasses();
    for (var index = 0; index < __active_classes.length; index ++) {
        var __class = __active_classes[index];
        var __total_assigns_due = __class.getTotalAssignsDue();
        var __class_id = __class.getID();
        if (__total_assigns_due == 0) {
            $("span.badge#" + __class_id).addClass('hidden');
        } else {
            $("span.badge#" + __class_id).removeClass('hidden');
            $("span.badge#" + __class_id).text(__total_assigns_due);
        }
    }
}