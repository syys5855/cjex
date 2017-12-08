console.log('bg execute');

// chrome api
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


chrome.webRequest.onCompleted.addListener((details) => {
    let path = _.get(details.url.match(/api(.+?)\?/), '[1]');
    if (path === "/tasks/inbox") {
        sendMessageToContent({ type: 'BAMSG_WT_TASKSINBOX' });
    } else if (path === "/team") {
        sendMessageToContent({ type: 'BAMSG_WT_TEAM' })
    }

}, { urls: ["*://*.worktile.com/api/*"], types: ["xmlhttprequest"] });


chrome.runtime.onMessage.addListener(({ type, data }, sender, req) => {
    if (type === "WT_INBOX_SEND") {
        console.log('reciver msg form content script ', data);
    } else if (type === "TAB_LOADED") {
        console.log(data);
        req({ type: 'SOMETYPE', data: 'hahahah' })
    }
});

// define variable
const cache = new Cache();


function getCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log('active tabs1--->', tabs.length ? tabs[0].id : null)
    });
}

function getCurrentTab2(cb) {
    chrome.windows.getCurrent((currentWindow) => {
        chrome.tabs.query({ active: true, windowId: currentWindow.id }, (tabs) => {
            console.log('active tabs2--->', tabs.length ? tabs[0].id : null)
            typeof cb === "function" && cb(tabs);
        })
    })
}

// getCurrentTab();
// getCurrentTab2();



function sendMessageToContent(message, callback) {
    getCurrentTab2((tabs) => {
        console.log('sendMessageToContent-->', tabs);
        if (tabs.length) {
            chrome.tabs.sendMessage(tabs[0].id, message, response => {
                typeof callback === "function" && callback(null, response);
            });
        } else {
            typeof callback === "function" && callback('no active tab');
        }
    })
}

// 单例
function Cache() {
    if (Cache.instance) {
        return Cache.instance;
    }

    let cache = new Map();
    let instance = {
        get(key) {
            return cache.get(key)
        },
        set(key, value) {
            cache.set(key, value);
        }
    }
    Cache.instance = instance;
    return instance;
}


// // https://wt-box.worktile.com/drives/5a27b278cf9190609715dd75/from-s3?team_id=59b646c1c827387d4debeda1&version=1&ref_id=5a25f3f09fa42f7545d545e2&action=