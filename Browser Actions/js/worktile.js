$(function() {
    const TS = {
        uncompleted: 'uncompleted'
    }


    console.log('enter worktile....');

    $(document).on('click', '#WTInbox', function() {
        apiWTInbox(TS.uncompleted).then(response => {
            console.log('WTInbox--->', response)
        }).catch(err => {
            console.error(err);
        })
    })

    function apiWTInbox(ts) {
        return $.ajax({
            url: '/api/tasks/inbox',
            type: "GET",
            dataType: "JSON",
            data: {
                ts,
                t: Date.now()
            }
        });
    }
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "BAMSG_WT_INBOX") {
        if (!document.querySelector('#WTInbox')) {
            console.log('try add wt tag...');
            $('task-header .title').append(
                '<a href="######;" id="WTInbox" style="color:red !important;">' +
                '获取未完成的任务' +
                '</a>');
        }
    }
});