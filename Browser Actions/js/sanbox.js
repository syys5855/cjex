$(function() {

    console.log('sanbox.js executed');
    $("#btnAddTemplate").after("<button class='btn btn-default' id='test'>testBtn2333</button>");
    $(document).on('click', '#test', function(event) {
        console.log('button click');
        apiGet();
    });

    function apiGet() {
        $.ajax({
            url: 'http://sandbox.qingkaoqin.com/showPushTmplList?',
            type: 'POST',
            dataType: 'JSON',
            beforeSend: function(request) {
                request.setRequestHeader("Content-Type", "multipart/form-data");
            },
            data: {
                '{"pattern":"push_.{0,}.lua"}': ''
            }
        }).then(function(response) {
            console.log(response);
        }).catch(function(err) {
            console.log(err);
        })
    }
});