(function() {
    console.log('injected test.html');

    chrome.runtime.onMessage.addListener((req, sender, rep) => {
        console.log(req);
    });

    // inject success
    chrome.storage.local.get({ LASTTAB: {} }, ({ LASTTAB: fromTab }) => {
        fromTab.id && chrome.runtime.sendMessage({
            type: "TAB_LOADED",
        }, (response) => {
            console.log(response);
        });
    });
})();