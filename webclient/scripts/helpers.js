function hide(_id) {
    $("#" + _id).addClass('hidden');
}

function unhide(_id) {
    $("#" + _id).removeClass('hidden');
}

function cancel_btn(_modal_name) {
    return btn(_modal_name, "cancel");
}

function submit_btn(_modal_name) {
    return btn(_modal_name, "submit");
}

function modal(_modal_name) {
    return _modal_name + "-modal";
}

function progress_span(_modal_name) {
    return span(_modal_name, "progress");
}

function error_lbl(_modal_name) {
    return lbl(_modal_name, "error");
}

function txt(_modal_name, _txt_name) {
    return _txt_name + "-" + _modal_name + "-txt";
}

function lbl(_modal_name, _lbl_name) {
    return _lbl_name + "-" + _modal_name + "-lbl";
}

function btn(_modal_name, _btn_name) {
    return _btn_name + "-" + _modal_name + "-btn";
}

function span(_modal_name, _span_name) {
    return _span_name + "-" + _modal_name + "-span";
}

function select(_modal_name, _select_name) {
    return _select_name + "-" + _modal_name + "-select";
}

function ID(_name) {
    return "#" + _name;
}