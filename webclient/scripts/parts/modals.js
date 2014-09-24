var _modals = {};

function loadModal(name, _init_callback) {
    if (_modals === undefined || _modals[name] === undefined) {
    	$.ajax({
    		url : _modals_url + name + '.html',
    		success : function(data) {
                if (_modals === undefined) {
                    _modals = {};
                }
                _modals[name] = data;
                $("body").prepend(data);
                _init_callback();
    		},
    		async : false
    	});
    }
}

//function _modal_callback(status, response)
//function _modal_submit_callback(_cb, _cancel_cb)
function initializeModal(_modal_name, _modal_callback, _modal_submit_callback) {
    var _cancel_btn = cancel_btn(_modal_name);
    var _submit_btn = submit_btn(_modal_name);
    var _progress_span = progress_span(_modal_name);
    var _error_lbl = error_lbl(_modal_name);
    var _modal = modal(_modal_name);
    var _cancel_cb = function (){
        unhide(_submit_btn);
        unhide(_cancel_btn);
        hide(_progress_span);
    };
    $(ID(_cancel_btn)).click(function (event){
        $(ID(_modal)).modal('hide');
    });
    $(ID(_submit_btn)).click(function (event){
        hide(_submit_btn);
        hide(_cancel_btn);
        hide(_progress_span);
        $(ID(_error_lbl)).text("");
        var cb = function (_status, response){
            _cancel_cb();
            _modal_callback(_status, response);
        };
        _modal_submit_callback(cb, _cancel_cb);
    });
}

function displayModal(_modal_name) {
    unhide(btn(_modal_name, "submit"));
    unhide(btn(_modal_name, "cancel"));
    hide(span(_modal_name, "progress"));
    $(ID(lbl(_modal_name, "error"))).text("");
    $(ID(modal(_modal_name))).modal('show');
}