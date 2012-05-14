/* Simple Package Definition System */

/*
var _package = null;

var package = function(name) {
    _package = name;
};
*/

//啟用 Ext 動態載入器
Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Module': 'modules'
    }
});

//Ext.require([...]);

//實作瀏覽器資料快取
Ext.define('ClientSession', { 
    singleton: true,
    user: {}
});

//資料讀取提示訊息
if (Ext.view.AbstractView) {
    Ext.apply(Ext.view.AbstractView.prototype, {
        loadingText: '資料讀取中...',
    });
}

Ext.onReady(function(){

    var tree1 = Ext.create('Ext.TreePanel', {
        header: false,
        headerAsText: false,
        border: false,
        rootVisible : false,
        listeners: {
            itemclick: {
                fn: function(view, record, item, index, event) {
                    var moduleName = record.get('id');

                    if (moduleName) {
                        Ext.log('Load module: '+moduleName);
                        var module = Ext.create(moduleName);
                        module.moduleInit();
                        module.moduleLoad();
                    }
                }
            }
        },
        root: {
            nodeType: 'async',
            text : '',
            expanded: true,
            children : [{
                text : '登記分發',
                expanded: true,
                children : [{
                    text: '加選 - 登記',
                    icon: __SILK_ICONS_URL+'application_view_columns.png',
                    id: 'Module.SchoolCourse.RegisterCourse',
                    leaf: true
                }, {
                    text: '加選 - 待分發（修改刪除）',
                    icon: __SILK_ICONS_URL+'application_view_columns.png',
                    id: 'Module.SchoolCourse.BookingCourse',
                    leaf: true
                }, {
                    text: '我的課程清單',
                    icon: __SILK_ICONS_URL+'application_view_columns.png',
                    id: 'Module.SchoolCourse.ShowCourse',
                    leaf: true
                }]
            }, {
                text : '即選即上',
                expanded: false,
                children : [{
                    text: '加選 - 即選即上',
                    icon: __SILK_ICONS_URL+'application_view_columns.png',
                    id: 'Module.SchoolCourse.RealtimeCourse',
                    leaf: true
                }, {
                    text: '退選',
                    icon: __SILK_ICONS_URL+'application_view_columns.png',
                    id: 'Module.SchoolCourse.UnregisterCourse',
                    leaf: true
                }, {
                    text: '我的課程清單',
                    icon: __SILK_ICONS_URL+'application_view_columns.png',
                    leaf: true
                }]
            }]
        }
    });
    Ext.create('Ext.Viewport', {
        layout: 'border',
        title: '選課系統',
        id: 'topview',
        items: [{
            region: 'north',
            bbar: [{
                xtype: 'tbfill'
            }, {
                xtype: 'tbtext',
                id: 'userinfo',
                text: '資料讀取中'
            }, '-', {
                text: '首頁',
                icon: __SILK_ICONS_URL+'application_home.png',
                handler: function(button, e) {
                    var tabpanel = Ext.getCmp('portal-tabpanel');
                    tabpanel.setActiveTab('home');
                }
            }, {
                text: '個人設定',
                icon: __SILK_ICONS_URL+'user_edit.png'
            }, {
                text: '離開',
                icon: __SILK_ICONS_URL+'link_break.png',
                handler: function(button, e) {
                    Ext.MessageBox.confirm(
                        '是否登出系統',
                        '<span class="portal-message">請按「是」確認登出系統，按「否」則取消！</span>',
                        function (btn, text) {
                            if (btn == 'yes') {
                                Ext.Ajax.request({
                                    url: __SERVICE_URL + '/service/logout.json',
                                    method: 'GET',
                                    success: function(response) {
                                         location.href = 'login.html';
                                    }
                                });
                            }
                        }
                    );
                }
            }],
            items: [{
                xtype: 'box',
                id: 'header',
                cls: 'portal-header',
                html: '<h1 class="portal-title">ExtJS 網路選課系統</h1>'
            }]
        },{
            id: 'menu',
            title: '功能表',
            region: 'west',
            layout: 'border',
            border: true,
            split: true,
            collapsible: true,
            margins: '2 0 5 5',
            width: 200,
            minSize: 100,
            maxSize: 360,
            items: [{
                layout: 'accordion',
                region: 'center',
                border: true,
                margins: '3 3 3 3',
                items: [{
                    title: '學生加退選',
                    layout: 'fit',
                    items: [tree1]
                }, {
                    title: '系統管理',
                    html: '選單二'
                }]
            }, {
                id: 'details-panel',
                title: '通知',
                region: 'south',
                height: 100,
                margins: '3 3 3 3',
                bodyStyle: 'padding:15px;background:#eee;',
                autoScroll: true,
                html: '<p class="details-info">沒有通知。</p>',
                border: true
            }]
        }, {
            id: 'portal-tabpanel',
            region: 'center',
            xtype: 'tabpanel',
            items: [{
                title: '首頁',
                itemId: 'home',
                icon: __SILK_ICONS_URL + 'application_home.png',
                bodyStyle: 'padding: 10px',
                closable: false,
                autoLoad: {
                    url: 'main.html',
                    scripts: false
                }
            }]
        }],
        renderTo: Ext.getBody()
    });

    //讀取套件定義
    var pack = Ext.create('Module.SchoolCourse.Package');
    pack.packageInit();

    // 取得 SESSION 變數（停用：已改用 Server 端 Session 機制）
    //var getParams = document.URL.split("?");
    //var params = Ext.urlDecode(getParams[1]);
    //ClientSession.sid = params.sid;
    
    //開始快取資料
    Ext.Msg.wait('正在快取資料...');

    var jobs = new Array();
    jobs[0] = 0;
    jobs[1] = 0;
    jobs[2] = 0;
    jobs[3] = 0;

    //背景工作完成查核函式
    var completeJob = function(index) {
        jobs[index] = 1;
        for (var i=0; i<2; i++) {
            if (jobs[i] == 0) return false;
        }
        Ext.Msg.updateProgress(1);
        Ext.Msg.hide();
        return true;
    };

    //job0
    Ext.Ajax.request({
        url: __SERVICE_URL + '/service/readdata.json',
        method: 'GET',
        success: function(response) {
            var obj = Ext.JSON.decode(response.responseText);
            if (!obj.success) {
                Ext.Msg.alert(
                    '發生錯誤',
                    '請重新登入再操作一次！',
                    function() {
                        location.href = 'login.html';
                    }
                );
            }
            else {
                if (obj.data) {
                    ClientSession.user = obj.data.user;

                    //更新使用者資訊列
                    if (obj.data.user) {
                        var user = obj.data.user;
                        var cmp = Ext.getCmp('userinfo');
                        cmp.setText(user.chtname+' '+user.studentno+' '+user.classname);
                    }
                }
                completeJob(0);
            }
        }
    });

    Ext.defer(function() {
        var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
        var store1a = Ext.data.StoreManager.lookup('SchoolCourse-Store1a');
        var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
        store0.load({
            callback: function(records, operation, success) {
                store3.load({
                    callback: function(records, operation, success) {
                        completeJob(2);
                    }
                });
                store1a.load({
                    callback: function(records, operation, success) {
                        completeJob(3);
                    }
                });
                completeJob(1);
            }
        });
    }, 0);

    /*
    //re-open tab from url hash
    Ext.defer(function() {
        if (window.location.hash) {
            var module = Ext.create(window.location.hash.replace('#', ''));
            module.moduleInit();
            module.moduleLoad();
        }        
    }, 100);
    */
});