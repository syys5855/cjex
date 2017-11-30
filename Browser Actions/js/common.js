var CommonServer = {
    getCurrentTabs() {
        return new Promise((res, rej) => {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, (tabs) => {
                res(tabs);
            })
        });
    },
    getCurrentWindow() {
        return new Promise((res, rej) => {
            chrome.windows.getCurrent(res);
        });
    }

}