(() => {
    let deheight = document.documentElement.clientHeight || document.body.clientHeight,
        scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight,
        row = Math.ceil(scrollHeight / deheight);


    function autoScroll({ scrollTop }) {
        document.body.scrollTop = scrollTop * deheight;
        document.documentElement.scrollTop = scrollTop * deheight;
        return {
            next: scrollTop + 1 < row,
            value: scrollTop + 1 < row ? scrollTop + 1 : -1,
            y: document.documentElement.scrollTop || document.body.scrollTop,
            clientHeight: document.documentElement.scrollHeight || document.body.scrollHeight,
            clientWidth: document.documentElement.scrollWidth || document.body.scrollWidth
        }
    }

    chrome.runtime.onMessage.addListener((req, sender, rep) => {
        if (req.type === "CAPTURE_FULL") {
            rep(autoScroll(req));
        }
    })
})()