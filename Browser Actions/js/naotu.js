$(function() {
    $('header').append(
        '<div class="pull-right">' +
        '<button class="btn btn-primary" id="testBtn">测试的按钮</button>' +
        '</div>'
    );
    $(document).on('click', '#testBtn', function() {
        var fileGuid = window.location.pathname.split('/').reverse()[0],
            csrf_token = document.querySelector("#km-csrf").value;

        apiGetInfo(fileGuid, csrf_token).then(function(response) {
            var data = response.data;
            var content, file_name, ext_name;
            content = data.content;
            file_name = data.file_name;
            ext_name = data.ext_name;
            download(content, file_name + '.json');
        })
    });


    function apiGetInfo(fileGuid, csrf_token) {
        return $.ajax({
            url: "/bos/open",
            type: "POST",
            dataType: "JSON",
            data: {
                fileGuid: fileGuid,
                csrf_token: csrf_token
            }
        }).catch(function(err) {
            console.error(err)
        });
    }

    function download(content, filename) {
        // 创建隐藏的可下载链接
        var eleLink = document.createElement('a');
        eleLink.download = filename;
        eleLink.style.display = 'none';
        // 字符内容转变成blob地址
        var blob = new Blob([content]);
        eleLink.href = URL.createObjectURL(blob);
        // 触发点击
        document.body.appendChild(eleLink);
        eleLink.click();
        // 然后移除
        document.body.removeChild(eleLink);
    };
});