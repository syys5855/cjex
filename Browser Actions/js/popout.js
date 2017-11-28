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