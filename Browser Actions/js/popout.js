document.querySelector("#bgElem").onclick = function() {
    var bg = chrome.extension.getBackgroundPage();
    console.log('获取background的元素', bg.document.querySelector("#tips"));
}

document.querySelector("#capturePic").onclick = function() {
    chrome.windows.getCurrent(curwin => {
        const id = curwin.id;
        chrome.tabs.captureVisibleTab(id, {}, (data) => {
            const blob = dataURLtoBlob(data);
            // 创建隐藏的可下载链接
            const eleLink = document.createElement('a');
            eleLink.download = 'test.' + blob.type.split("/")[1];
            eleLink.style.display = 'none';
            // 字符内容转变成blob地址
            eleLink.href = URL.createObjectURL(blob);
            // 触发点击
            document.body.appendChild(eleLink);
            eleLink.click();
            // 然后移除
            document.body.removeChild(eleLink);
        })
    })
}

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

function capturePic(windowId, options) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            chrome.tabs.captureVisibleTab(windowId, options, res);
        }, 500);
    });
}

function sendMessageToContent(tabId, params) {
    return new Promise((res, rej) => {
        chrome.tabs.sendMessage(tabId, params, res);
    });
}


document.querySelector("#captureFull").onclick = async() => {
    let tabs = await CommonServer.getCurrentTabs(),
        curwin = await CommonServer.getCurrentWindow(),
        dataUrls = [];

    (function autoScroll(tabId, params) {
        sendMessageToContent(tabId, params).then(async data => {
            let dataUrl = await capturePic(curwin.id, {});
            dataUrls.push({
                dataUrl,
                scrollTop: params.scrollTop
            });
            data.next && autoScroll(tabs[0].id, { type: 'CAPTURE_FULL', scrollTop: data.value });
            !data.next && console.log(dataUrls);
        })
    })(tabs[0].id, { type: 'CAPTURE_FULL', scrollTop: 0 });
}