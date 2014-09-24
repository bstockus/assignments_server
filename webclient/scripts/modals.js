var _change_class_name_id = "";
var _add_new_assignment_class_id = "";

function initializeAddNewClassModal() {
    $("#cancel-add-new-class-btn").click(function (event){
        $("#add-new-class-modal").modal('hide');
    });
    $("#submit-add-new-class-btn").click(function (event){
        $("#submit-add-new-class-btn").addClass('hidden');
        $("#cancel-add-new-class-btn").addClass('hidden');
        $("#progress-add-new-class-span").removeClass('hidden');
        $("#error-add-new-class-lbl").text("");
        var cb = function (status, response){
            $("#submit-add-new-class-btn").removeClass('hidden');
            $("#cancel-add-new-class-btn").removeClass('hidden');
            $("#progress-add-new-class-span").addClass('hidden');
            if (status == "201") {
                var res = JSON.parse(response);
                var new_class_obj = {"id": res['id'], "name": res['name'], "assigns-due": 0};
                _classes['active'].push(new_class_obj);
                updateClassSidebar();
                $("#add-new-class-modal").modal('hide');
            } else {
                $("#error-add-new-class-lbl").text("Unable to create a new class with that name.");
            }
        };
        
        var body = {'name': $("#name-add-new-class-txt").val()};
        
        performAuthorizedAjaxRequest('POST', 'class/', {}, JSON.stringify(body), cb);
    });
}

function initializeChangeClassNameModal() {
    $("#cancel-change-class-name-btn").click(function (event){
        $("#change-class-name-modal").modal('hide');
    });
    $("#submit-change-class-name-btn").click(function (event){
        $("#submit-change-class-name-btn").addClass('hidden');
        $("#cancel-change-class-name-btn").addClass('hidden');
        $("#progress-change-class-name-span").removeClass('hidden');
        $("#error-change-class-name-lbl").text("");
        var cb = function (status, response){
            $("#submit-change-class-name-btn").removeClass('hidden');
            $("#cancel-change-class-name-btn").removeClass('hidden');
            $("#progress-change-class-name-span").addClass('hidden');
            if (status == "200") {
                var res = JSON.parse(response);
                var _class = findClassById(res['id']);
                _class['name'] = res['name'];
                updateClassSidebar();
                $("#change-class-name-modal").modal('hide');
            } else {
                $("#error-change-class-name-lbl").text("Unable to change the name of the class.");
            }
        };
        
        var body = {'name': $("#newname-change-class-name-txt").val()};
    
        performAuthorizedAjaxRequest('POST', 'class/' + _change_class_name_id, {}, JSON.stringify(body), cb);
    });
}

function initializeAddNewAssignmentModal() {
    $("#cancel-add-new-assignment-btn").click(function (event){
        $("#add-new-assignment-modal").modal('hide');
    });
    $("#submit-add-new-assignment-btn").click(function (event){
        $("#submit-add-new-assignment-btn").addClass('hidden');
        $("#cancel-add-new-assignment-btn").addClass('hidden');
        $("#progress-add-new-assignment-span").removeClass('hidden');
        $("#error-add-new-assignment-lbl").text("");
        var cb = function (status, response){
            $("#submit-add-new-assignment-btn").removeClass('hidden');
            $("#cancel-add-new-assignment-btn").removeClass('hidden');
            $("#progress-add-new-assignment-span").addClass('hidden');
            if (status == "201") {
                //TODO: See if we can update the new class to the display, without completly reloading the entire active class, via AJAX
                refreshClassSidebar();
                $("#add-new-assignment-modal").modal('hide');
            } else {
                $("#error-add-new-assignment-lbl").text("Unable to create a new assignment.");
            }
        };
        
        var body = {'name': $("#name-add-new-assignment-txt").val(), 
                    'due': {
                        'day': parseInt($("#day-due-add-new-assignment-select").val()) + 1, 
                        'month': parseInt($("#month-due-add-new-assignment-select").val()), 
                        'year': parseInt($("#year-due-add-new-assignment-txt").val())
                    }};
        
        performAuthorizedAjaxRequest('POST', 'class/' + _add_new_assignment_class_id + "/assign/", {}, JSON.stringify(body), cb);
    });
}

function displayAddNewClassModal() {
    $("#submit-add-new-class-btn").removeClass('hidden');
    $("#cancel-add-new-class-btn").removeClass('hidden');
    $("#progress-add-new-class-span").addClass('hidden');
    $("#error-add-new-class-lbl").text("");
    $("#name-add-new-class-txt").val("");
    $("#add-new-class-modal").modal('show');
}

function displayChangeClassNameModal(_name, _id) {
    _change_class_name_id = _id;
    $("#submit-change-class-name-btn").removeClass('hidden');
    $("#cancel-change-class-name-btn").removeClass('hidden');
    $("#progress-change-class-name-span").addClass('hidden');
    $("#error-change-class-name-lbl").text("");
    $("#oldname-change-class-name-txt").text(_name)
    $("#newname-change-class-name-txt").val(_name);
    $("#change-class-name-modal").modal('show');
}

function displayAddNewAssignmentModal(_class_name, _class_id) {
    var _date = new Date();
    var _day = _date.getDate();
    var _month = _date.getMonth() + 1;
    var _year = _date.getFullYear();
    _add_new_assignment_class_id = _class_id;
    $("#submit-add-new-assignment-btn").removeClass('hidden');
    $("#cancel-add-new-assignment-btn").removeClass('hidden');
    $("#progress-add-new-assignment-span").addClass('hidden');
    $("#error-add-new-assignment-lbl").text("");
    $("#class-add-new-assignment-txt").text(_class_name)
    $("#name-add-new-assignment-txt").val("");
    $("#add-new-assignment-modal").modal('show');
    $("#day-due-add-new-assignment-select").val(_day.toString());
    $("#month-due-add-new-assignment-select").val(_month.toString());
    $("#year-due-add-new-assignment-txt").val(_year.toString());
}