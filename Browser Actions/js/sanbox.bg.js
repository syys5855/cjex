console.log('bg execute');
chrome.browserAction.setBadgeText({ text: 'new' });
chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });

chrome.contextMenus.create({
    title: '测试右键的点击',
    onclick() {
        alert('您点击了测试的右键');
    }
});
chrome.contextMenus.create({
    title: '使用百度搜索',
    contexts: ['selection'],
    onclick(params) {
        console.log('baidu search ', params.selectionText);
        chrome.tabs.create({ url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(params.selectionText) });
    }
});

// 获取当前的 window
chrome.windows.getCurrent(function(currentWindow) {
    console.log("currentWindow-->", currentWindow);
});

function getCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log('active tabs1--->', tabs.length ? tabs[0].id : null)
    });
}

function getCurrentTab2(cb) {
    chrome.windows.getCurrent((currentWindow) => {
        chrome.tabs.query({ active: true, windowId: currentWindow.id }, (tabs) => {
            console.log('active tabs2--->', tabs.length ? tabs[0].id : null)
        })
    })
}

// getCurrentTab();
// getCurrentTab2();



chrome.webRequest.onBeforeRequest.addListener((details) => {
    // console.log('reciver webRequest');
    // chrome.notifications.create(null, {
    //     type: 'basic',
    //     iconUrl: 'img/chrome.png',
    //     title: 'title',
    //     message: 'something....',
    // });
    console.log('before request---->', details);
}, { urls: ["<all_urls>"], types: ["xmlhttprequest"] });


chrome.webRequest.onCompleted.addListener((details) => {
    console.log('onCompleted--->', details);
}, { urls: ["<all_urls>"], types: ["xmlhttprequest"] })