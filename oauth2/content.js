function content(params) {
    var result = { status: 1, message: "", result: {} };
    var r = result;

    this.view = function (params, callback) {
        r.message = "this is content";
        r.result = {data: "my content"};
        callback(r);
    }
}

module.exports = content;