$(function() {
    const TS = {
        uncompleted: 'uncompleted',
        completed: 'completed'
    }
    const cacheDOM = new Map();
    const linkText = '哈哈哈哈，嗝~~~';
    const onMessageHandler = new Handler();

    onMessageHandler.types = {
        handlerInbox: {
            handler() {
                // 当页面跳转的时候 页面尚但是缓存还在 所以 需要一个同步的机制 可封装一个 方法
                if (!isElementExist("#exptInbox")) {
                    getEl('task-header .title').then(el => {
                        let link = document.createElement('a'),
                            attr = {
                                id: 'exptInbox',
                                style: 'color:red !important;',
                                href: '#####'
                            };

                        setAttr(link, attr);
                        link.innerText = linkText;
                        el.appendChild(link);
                        cacheDOM.set('#exptInbox', link);
                    });
                }
            }
        },
        handlerExptTeam: {
            handler() {
                if (!isElementExist("#exptTeam")) {
                    getEl('.nav-apps').then(el => {
                        let li = document.createElement("li"),
                            attr = {
                                id: 'exptTeam'
                            };

                        setAttr(li, attr);
                        li.innerHTML = `<span style="color:#22d7bb;">哈哈哈哈，嗝~~~</span>`;
                        el.appendChild(li);
                        cacheDOM.set("#exptTeam", li);
                    });
                }
            }
        }

    }

    onMessageHandler.config = {
        BAMSG_WT_TASKSINBOX: 'handlerInbox',
        BAMSG_WT_TEAM: 'handlerExptTeam'
    }

    chrome.runtime.onMessage.addListener(function({ type }, sender, sendResponse) {
        console.log('type--->', type);
        onMessageHandler.do(type);
    });

    // addListener
    $(document).on('click', '#exptInbox', async() => {
        const response = await apiWTInbox(TS.uncompleted);
        sendMsgToBackground({
            type: 'WT_INBOX_SEND',
            data: response
        });
        console.log('send to background ok');
    });

    // $(document).on('click', '#exptTeam', async() => {
    //     const response = await Promise.all([apiWTTeam(), apiTree(), apiProjectNav()]);
    //     console.log('response--->', response);
    //     let projectNavs = response[2];
    //     let projects = await apiProjects(projectNavs.projects);
    //     console.log(projects);
    // });


    $(document).on('click', '#exptTeam', async() => {
        apiWtBox();
        // let iframe = document.createElement('iframe');

    });

    function sendMsgToBackground(message) {
        return new Promise(res => {
            chrome.runtime.sendMessage(message, res);
        });
    }

    // Util
    function Handler() {
        this.types = {}; // 配置 处理函数和一些错误信息等
        this.config = {}; // 配置类型与对应的处理函数 
    }
    Handler.prototype.do = function(type, ...params) {
        let funName, handler;
        funName = this.config[type];

        if (!funName) {
            return;
        }
        handler = (this.types[funName] || {}).handler;
        if (typeof handler !== 'function') {
            console.error(`type ${type} without hander`);
            return;
        }

        handler.apply(this, params);
    }


    // DOM
    function sleep(ms) {
        return new Promise(res => {
            setTimeout(res, ms);
        });
    }

    async function getEl(selector, threshold = 10) {
        let el;
        for (let count = 0; count < threshold && !el; ++count) {
            el = document.querySelector(selector);
            !el && await sleep(1000);
        }
        return el ? Promise.resolve(el) : Promise.reject();
    }

    function setAttr(el, attrObj) {
        for (let key in attrObj) {
            if (attrObj.hasOwnProperty(key)) {
                el.setAttribute(key, attrObj[key]);
            }
        }
    }

    function isElementExist(selector) {
        return document.querySelector(selector) !== null;
    }

    // api
    const fetch = (options) => {
        let defaultConfig = {
            type: 'GET',
            dataType: 'JSON',
            data: {}
        }
        let opt = Object.assign({}, defaultConfig, options);
        // 自动添加 t 时间戳
        opt.type === "GET" &&
            !opt.data.hasOwnProperty('t') &&
            (opt.data.t = Date.now());

        return new Promise((res, rej) => {
            $.ajax(opt).then(response => {
                response.code === 200 ?
                    res(response.data) :
                    rej();
            }).catch(rej);
        });
    }

    const apiWTInbox = (ts) => fetch({
        url: '/api/tasks/inbox',
        data: {
            ts
        }
    });


    // https://wt-box.worktile.com/drives/5a27b278cf9190609715dd75/from-s3?team_id=59b646c1c827387d4debeda1&version=1&ref_id=5a25f3f09fa42f7545d545e2&action=

    const apiWtBox = () => {
        console.log('enter');
        debugger;
        $.ajax({
            url: 'https://wt-box.worktile.com/drives/5a27b278cf9190609715dd75/from-s3',
            data: {
                team_id: "59b646c1c827387d4debeda1",
                version: "1",
                ref_id: "5a25f3f09fa42f7545d545e2"
            },
        }).then(response => {
            // let blob = new Blob(response.responseText);
            console.log(response.responseText);

        }).catch(err => {
            console.log(err);
        })
    }

    const apiTree = (async = false) => fetch({
        url: '/api/departments/tree',
        data: {
            async
        }
    });

    const apiProject = (projectId, ed = true, ts = '') => fetch({
        url: '/api/tasks/projects/{projectId}'.replace('{projectId}', projectId),
        data: {
            ed,
            ts
        }
    });

    const apiProjects = async(projects) => {
        const pArr = [];
        projects.map(nav =>
            pArr.push(apiProject(nav._id))
        );
        return await Promise.all(pArr);
    }

    const apiWTTeam = () => fetch({ url: '/api/team' });

    // 获取projectId等信息
    const apiProjectNav = () => fetch({ url: '/api/project-nav' });

    // 获取任务的详情
    const apiTasks = (taskId) => fetch({ url: '/api/tasks/{taskId}'.replace('{taskId}', taskId) });

})