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

function createNewTab(options) {
    return new Promise((res, rej) => {
        chrome.tabs.create(options, res);
    });
}

async function createImg(dataUrls) {
    let canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        mergeDataUrl, blob,
        pArr;

    canvas.width = dataUrls.canvasW;
    canvas.height = dataUrls.canvasH;

    pArr = dataUrls.map((data) => {
        return new Promise((res) => {
            let img = new Image;
            img.src = data.dataUrl;
            img._posX = data.x;
            img._posY = data.y;

            img.onload = function() {
                res(img);
            }
        })
    });
    let imgs = await Promise.all(pArr);
    imgs.forEach(img => {
        ctx.drawImage(img, img._posX, img._posY);
    });
    mergeDataUrl = canvas.toDataURL('image/jpeg');
    blob = dataURLtoBlob(mergeDataUrl);
    return URL.createObjectURL(blob);
}
// function createImg(dataUrls) {
//     let canvas = document.createElement('canvas');
//     canvas.width = 2000;
//     canvas.height = 2000;
//     let context = canvas.getContext('2d');
//     let img = new Image();
//     img.src = dataUrls[0].dataUrl;
//     img.onload = function () { 
//         context.drawImage(img, 0, 0);
//         document.body.appendChild(img);
//     }
//     // let blob = dataURLtoBlob(dataUrls[0].dataUrl);
//     // return URL.createObjectURL(blob);
// }

document.querySelector("#captureFull").onclick = async() => {
    let tabs = await CommonServer.getCurrentTabs(),
        curwin = await CommonServer.getCurrentWindow(),
        theTab,
        dataUrls = [];

    await (async function autoScroll(tabId, params) {
        let response = await sendMessageToContent(tabId, params);
        let dataUrl = await capturePic(curwin.id, {});
        dataUrls.push({
            dataUrl,
            x: 0,
            y: response.y
        });

        !dataUrls.hasOwnProperty("canvasW") &&
            Object.defineProperties(dataUrls, {
                canvasW: {
                    value: response.clientWidth
                },
                canvasH: {
                    value: response.clientHeight
                }
            });

        response.next &&
            await autoScroll(tabs[0].id, { type: 'CAPTURE_FULL', scrollTop: response.value });
    })(tabs[0].id, { type: 'CAPTURE_FULL', scrollTop: 0 });


    let imgUrl = await createImg(dataUrls);

    const eleLink = document.createElement('a');
    eleLink.download = 'test.jpeg';
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    eleLink.href = imgUrl;
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);

    // theTab = await createNewTab({
    //     url: '/canvas.html?src=' + imgUrl,
    // });
}

document.querySelector("#createNewTab").onclick = () => {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, async tabs => {
        const bg = chrome.extension.getBackgroundPage();
        chrome.storage.local.set({ 'LASTTAB': tabs[0] });
        tab = await createNewTab({
            url: 'http://127.0.0.1:1234/Browser%20Actions/test.html'
        });
        chrome.tabs.sendMessage({
            type: 'SAVE_CURRENT_TAB',
            data: {
                tab: tabs[0]
            }
        })
    })
}


//