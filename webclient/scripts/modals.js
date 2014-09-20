var _change_class_name_id = "";

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
    $("#newname-change-class-name-txt").val("");
    $("#change-class-name-modal").modal('show');
}