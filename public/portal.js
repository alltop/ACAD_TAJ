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
    user: {},
    mode: '',
    units: [],
    myunits: [],
    blocklist: [],
    blocklist_array: [],
	blockgplist_array: []
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
            children : []
        }
    });
    Ext.create('Ext.Viewport', {
        layout: 'border',
        title: '選課系統',
        id: 'topview',
        style: {
            background: '#fff'
        },
        items: [{
            region: 'north',
            bbar: [{
                xtype: 'tbfill'
            }, {
                xtype: 'tbtext',
                id: 'notifier',
                text: '請從左方主選單點選一項功能開始進行操作'
            }, '-', {
                xtype: 'tbtext',
                id: 'userinfo',
                text: '資料讀取中'
            }, '-', {
                text: '首頁',
                icon: __SILK_ICONS_URL + 'application_home.png',
                handler: function(button, e) {
                    var tabpanel = Ext.getCmp('portal-tabpanel');
                    tabpanel.setActiveTab('home');
                }
            }, {
                text: '登出',
                icon: __SILK_ICONS_URL + 'link_break.png',
                handler: function(button, e) {
                    Ext.MessageBox.confirm(
                        '是否登出系統',
                        '<span class="portal-message">請按「是」確認登出系統，按「否」則取消！</span>',
                        function (btn, text) {
							var logout_url = '';
                            if (btn == 'yes') {
								logout_url = (ClientSession.admin == 'admin') ? encodeURIComponent('/' + ClientSession.admin) : encodeURIComponent('/' + ClientSession.mode);
								location.href='/logout?redirect='+ logout_url;
                            }
                        }
                    );
                }
            }],
            items: [{
                xtype: 'box',
                id: 'header',
                cls: 'portal-header',
                html: '<h1 class="portal-title">大仁科技大學選課系統</h1>'
            }]
        },{
            id: 'menu',
            title: '功能表',
            region: 'west',
            layout: 'border',
            border: true,
            /*split: true,*/
            collapsible: true,
            resizable: true,
            width: 220,
            minSize: 100,
            maxSize: 360,
            items: [{
                layout: 'accordion',
                region: 'center',
                border: true,
                items: [{
                    title: '學生加退選',
                    layout: 'fit',
                    items: [tree1]
                }]
            }, {
                id: 'details-panel',
                title: '通知',
                region: 'south',
                height: 100,
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
            }],
            listeners: {
                tabchange: function(tabPanel, newCard, oldCard, eOpts) {
                    newCard.fireEvent('tabshow');
                    oldCard.fireEvent('tabhide');
                }
            }
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
	jobs[4] = 0;
	jobs[5] = 0;
	jobs[6] = 0;

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
                        location.href = '/login';
                    }
                );
            }
            else {
                if (obj.data) {
                    ClientSession.user = obj.data.user;
                    ClientSession.mode = obj.data.mode;
                    ClientSession.units = obj.data.units;
                    ClientSession.blocklist = obj.data.blocklist;
					ClientSession.admin = obj.data.admin;

                    //動態設定選單（依照 mode 參數）
                    switch (ClientSession.mode) {
                        case 'select':
                            tree1.getRootNode().appendChild({
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
                            });
                            tree1.doLayout();
                        break;
                        case 'realtime':
                            tree1.getRootNode().appendChild({
                                text : '即選即上',
                                expanded: true,
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
                                    id: 'Module.SchoolCourse.ShowCourseReal',
                                    leaf: true
                                }]
                            });
                            tree1.doLayout();
                        break;
                    }

                    //更新使用者資訊列
                    if (obj.data.user) {
                        var user = obj.data.user;
                        var cmp = Ext.getCmp('userinfo');
                        cmp.setText(user.chtname+' '+user.studentno+' '+user.classname);
                    }

                    //設定登入身分所屬學院系所清單
                    ClientSession.myunits.push({unitid: '', unitname: '全系所'});
                    if (obj.data.units) {
                        Ext.Array.each(obj.data.units, function(unit) {
                            if (unit && unit.collegeid == ClientSession.user.collegeid) {
                                ClientSession.myunits.push(unit);
                            }
                        });
                    }

                    //設定 blocklist 快取陣列
                    if (obj.data.blocklist) {
                        Ext.Array.each(obj.data.blocklist, function(block) {
                            ClientSession.blocklist_array.push(block.semcoursename);
							if(block.selectgpid != '') {
								ClientSession.blockgplist_array.push(block.selectgpid);								
							}
                        });
                    }
                }

                Ext.defer(function() {
                    var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
                    var store1a = Ext.data.StoreManager.lookup('SchoolCourse-Store1a');
                    var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
					var storeReal1a = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal1a');
                    var storeReal3 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal3');
					var storeReal5 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal5');
					
                    store0.load({
                        callback: function(records, operation, success) {
                            
                            //列舉需要被移除的課程清單
                            /*
                            var blocklist_array = new Array();
                            Ext.Array.each(ClientSession.blocklist, function(block) {
                                blocklist_array.push(block.semcoursename);
                            });
                            */

                            //找出需要被移除的課程
                            /*
                            var blocklist_records = new Array();
                            store0.each(function(record) {
                                if (Ext.Array.contains(blocklist_array, record.get('semcoursename'))) {
                                    blocklist_records.push(record);
                                }
                            });
                            store0.remove(blocklist_records);
                            */

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
							storeReal3.load({
                                callback: function(records, operation, success) {
                                    completeJob(4);
                                }
                            });
                            storeReal1a.load({
                                callback: function(records, operation, success) {
                                    completeJob(5);
                                }
                            });
							storeReal5.load({
                                callback: function(records, operation, success) {
                                    completeJob(6);
                                }
                            });
                            completeJob(1);
                        }
                    });
                }, 0);

                completeJob(0);
            }
        }
    });

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