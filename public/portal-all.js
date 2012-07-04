/*
Copyright(c) 2012 Company Name
*/
//啟用 Ext 動態載入器
Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Module': 'modules'
    }
});

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

Ext.onReady(function() {
    //資料讀取提示訊息
    if (Ext.view.AbstractView) {
        Ext.apply(Ext.view.AbstractView.prototype, {
            loadingText: '資料讀取中...',
        });
    }

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
/*
Copyright(c) 2012 Company Name
*/
/**
 * showOnReload: 重新整理網頁後是否重新載入模組
 */
Ext.define('Module.Prototype.Package', {
	packageInit: function() {
		Ext.log(this.$className+'.packageInit() at prototype');
	},
	requireStore: function(storeClass, storeId) {
		var store = Ext.data.StoreManager.lookup(storeId);
		if (!store) {
			Ext.create(storeClass, {
				storeId: storeId
			});
		}
	}
});
Ext.define('Module.SchoolCourse.Store0', {
    extend: 'Ext.data.Store',
    autoSync: false,
    autoLoad: false,
    buffered: false,
    purgePageCount: 0,
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount', 'choose', 'grade',
        'credit', 'semilarhr', 'classname', 'unitname',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel', 'physicalgroup'
    ],
    proxy: {
        type: 'ajax',
        url: __SERVICE_URL + '/service/listall.json',
        method: 'GET',
        noCache: false,
        reader: {
            type: 'array'
        }
    }
});
/**
 * 畫面右方課程清單
 */
Ext.define('Module.SchoolCourse.Store1', {
    extend: 'Ext.data.Store',
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount', 'choose', 'grade',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel'
    ],
    sorters: [{
        property : 'semcoursename',
        direction: 'ASC'
    }],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    }
});

/**
 * 畫面左方課程清單
 */
Ext.define('Module.SchoolCourse.Store1a', {
    extend: 'Ext.data.Store',
    autoLoad: false,
    autoSync: false,
    fields: [
        'courseid', 'coursetype', 'semcoursename', 'coursetime', 'choose', 'grade',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel'
    ],
    sorters: [{
        property : 'semcoursename',
        direction: 'ASC'
    }],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    listeners: {
        load: function(store1a, records, options) {
            var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
            if (store0 && store0.count() > 0) {
                var tempIds = {};
                var result = store0.queryBy(function(record) {
                    /*
                    var record_courseid = record.get('courseid');
                    var returnValue = (tempIds[record_courseid]==null);
                    tempIds[record_courseid] = true;
                    */
                    var record_semcoursename = record.get('semcoursename');
                    var returnValue = (tempIds[record_semcoursename]==null);
                    tempIds[record_semcoursename] = true;
                    return returnValue;
                });
                store1a.loadRecords(result.items);
            }
        }
    }
});

/**
 * 已選課程資料來源（退選用）
 */
Ext.define('Module.SchoolCourse.Store3', {
    extend: 'Ext.data.Store',
    autoLoad: false,
    autoSync: false,
    sortOnFilter: false,
    remoteSort: false,
    //isSortable: false,
    //sortOnLoad: false,
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount', 'choose', 'grade',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel',
        'serialno'
    ],
    groupField: 'semcoursename',
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    listeners: {
        load: function(store3, records, options) {
            var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
            if (store0 && store0.count() > 0) {
                var request = Ext.Ajax.request({
                    url: __SERVICE_URL + '/service/listselected.json',
                    method: 'GET',
                    success: function(response) {
                        var obj = Ext.JSON.decode(response.responseText);

                        var records = new Array();

                        Ext.Array.each(obj, function(semcourseid) {
                            var record_index = store0.find('semcourseid', semcourseid);
                            if (record_index > 0) {
                                var record = store0.getAt(record_index);
                                records.push(record);
                            }
                        });

                        //載入資料
                        store3.loadRecords(records);

                        //產生志願序號
                        store3.generateSerialno();
                    }
                });
            }
        }
    },
    generateSerialno: function() {
        var store3 = this;
        store3.each(function(record) {
            var record_index = store3.indexOf(record);
            var record_semcoursename = record.get('semcoursename');
            var result = store3.queryBy(function(record2) {
                if (store3.indexOf(record2) >= record_index) return false;
                return (record2.get('semcoursename')==record_semcoursename);
            });
            record.set('serialno', result.items.length + 1);
        });
    }
});

Ext.define('Module.SchoolCourse.Store2', {
    extend: 'Ext.data.Store',
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount', 'choose', 'grade',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel',
        'serialno'
    ],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    /**
     * 產生志願順序
     */
    generateSerialno: function() {
        var store2 = this;
        store2.each(function(record) {
            var record_index = store2.indexOf(record);
            var record_semcoursename = record.get('semcoursename');
            var result = store2.queryBy(function(record2) {
                if (store2.indexOf(record2) >= record_index) return false;
                return (record2.get('semcoursename')==record_semcoursename);
            });
            record.set('serialno', result.items.length + 1);
        });
        store2.sort([
            {property: 'semcoursename', direction: 'ASC'},
            {property: 'serialno', direction: 'ASC'}
        ]);
    }
});

/**
 * 已選課程資料來源（課表用）
 */
Ext.define('Module.SchoolCourse.Store5', {
    extend: 'Ext.data.Store',
    autoLoad: false,
    autoSync: false,
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount', 'choose', 'grade',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel',
        'serialno', 'regtype'
    ],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    listeners: {
        load: function(store5, records, options) {
            var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
            if (store0 && store0.count() > 0) {
                var request = Ext.Ajax.request({
                    url: __SERVICE_URL + '/service/listcourse.json',
                    method: 'GET',
                    success: function(response) {
                        var obj = Ext.JSON.decode(response.responseText);

                        var semcourseid_array = new Array();
                        var serialno_map = new Ext.util.HashMap();
                        var regtype_map = new Ext.util.HashMap();

                        Ext.Array.each(obj, function(item) {
                            var tokens = item.split(':');
                            semcourseid_array.push(tokens[0]);
                            serialno_map.add(tokens[0], tokens[1]);
                            regtype_map.add(tokens[0], tokens[2]);
                        });

                        var records_array = new Array();

                        store0.each(function(record) {
                            if (Ext.Array.contains(semcourseid_array, record.get('semcourseid'))) {
                                records_array.push(record);
                            }
                        });
                        store5.loadRecords(records_array);
                        store5.each(function(record) {
                            record.set('serialno', serialno_map.get(record.get('semcourseid')));
                            record.set('regtype', regtype_map.get(record.get('semcourseid')));
                        });
                        store5.sort([
                            {property: 'semcoursename', direction: 'ASC'},
                            {property: 'serialno', direction: 'ASC'}
                        ]);
                    }
                });
            }
        }
    }
});

/**
 * 我的課程清單
 */
Ext.define('Module.SchoolCourse.Store4', {
    extend: 'Ext.data.Store',
    autoLoad: true,
    autoSync: false,
    fields: [
        'classno', 'day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'
    ],
    data: {
        items: [
            { classno: 1, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 2, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 3, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 4, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 5, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 6, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 7, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 8, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 9, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 10, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 11, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 12, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 13, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 14, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' }
        ]
    },
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    generateData: function() {
        var store4 = this;
        var store5 = Ext.data.StoreManager.lookup('SchoolCourse-Store5');
        store5.load({
            callback: function(records, operation, success) {
                Ext.defer(function() {
                    store4.each(function(record) {
                        var classno = record.get('classno');

                        var class_array = new Array();
                        class_array[0] = '';
                        class_array[1] = '';
                        class_array[2] = '';
                        class_array[3] = '';
                        class_array[4] = '';
                        class_array[5] = '';
                        class_array[6] = '';

                        store5.each(function(record2) {
                            var record2_coursetime = record2.get('coursetime');
                            var coursetime_array = record2_coursetime.split(',');

                            Ext.Array.each(coursetime_array, function(coursetime) {
                                var the_classno = coursetime % 100;
                                var index = (coursetime - the_classno) / 100 - 1;

                                if (classno == the_classno) {
                                    var display_text = record2.get('semcoursename');

                                    //選課需求：
                                    //課表regtype=1(分發)和regtype<>1(已選上(配課、登記、即選即上))的顏色區別。
                                    //(regtype=1→藍色、regtype=2→紅色、regtype<>1, 2→黑色)
                                    if (record2.get('regtype') == '1') {
                                        display_text = '<font color="blue">' + display_text + '</font>';
                                    }
									else if (record2.get('regtype') == '2') {
                                        display_text = '<font color="red">' + display_text + '</font>';
                                    }

                                    class_array[index] = class_array[index] + display_text + '<br/>';
                                }
                            });
                        });

                        for (var i = 0; i < 7; i++) {
                            var the_day = 'day' + (i+1);
                            record.set(the_day, class_array[i]);
                        }
                    });

                    store4.commitChanges();
                }, 2000);
            }
        });
    }
});

/**
 * 畫面右方課程清單
 */
Ext.define('Module.SchoolCourse.StoreReal1', {
    extend: 'Ext.data.Store',
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount', 'choose', 'grade',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel'
    ],
    sorters: [{
        property : 'semcoursename',
        direction: 'ASC'
    }],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    }
});

/**
 * 畫面左方課程清單
 */
Ext.define('Module.SchoolCourse.StoreReal1a', {
    extend: 'Ext.data.Store',
    autoLoad: false,
    autoSync: false,
    fields: [
        'courseid', 'coursetype', 'semcoursename', 'coursetime', 'choose', 'grade',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel'
    ],
    sorters: [{
        property : 'semcoursename',
        direction: 'ASC'
    }],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    listeners: {
        load: function(storeReal1a, records, options) {
            var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
            if (store0 && store0.count() > 0) {
                var tempIds = {};
                var result = store0.queryBy(function(record) {
                    var record_semcoursename = record.get('semcoursename'); //store0每筆資料的secoursename
                    var returnValue = (tempIds[record_semcoursename]==null); //檢查這個semcoursename是否已存在於store1a
                    tempIds[record_semcoursename] = true; //記錄這個semcoursename已存在
                    return returnValue;
                });
                storeReal1a.loadRecords(result.items);
            }
        }
    }
});

Ext.define('Module.SchoolCourse.StoreReal2', {
    extend: 'Ext.data.Store',
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount', 'choose', 'grade',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel',
        'serialno', 'credit', 'unitname'
    ],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    /**
     * 產生志願順序
     */
    generateSerialno: function() {
        var store2 = this;
        store2.each(function(record) {
            var record_index = store2.indexOf(record);
            var record_semcoursename = record.get('semcoursename');
            var result = store2.queryBy(function(record2) {
                if (store2.indexOf(record2) >= record_index) return false;
                return (record2.get('semcoursename')==record_semcoursename);
            });
            record.set('serialno', result.items.length + 1);
        });
        store2.sort([
            {property: 'semcoursename', direction: 'ASC'},
            {property: 'serialno', direction: 'ASC'}
        ]);
    }
});

/**
 * 已選課程資料來源（退選用）
 */
Ext.define('Module.SchoolCourse.StoreReal3', {
    extend: 'Ext.data.Store',
    autoLoad: false,
    autoSync: false,
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount', 'choose', 'grade',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel',
        'serialno', 'credit', 'unitname'
    ],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    listeners: {
        load: function(StoreReal3, records, options) {
            var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
            if (store0 && store0.count() > 0) {
                var request = Ext.Ajax.request({
                    url: __SERVICE_URL + '/service/listselectedReal.json',
                    method: 'GET',
                    success: function(response) {
                        var obj = Ext.JSON.decode(response.responseText);

                        var semcourseid_array = new Array();

                        Ext.Array.each(obj, function(item) {
                            var tokens = item.split(':');
                            semcourseid_array.push(tokens[0]);
                        });


                        var records = new Array();

                        store0.each(function(record) {
                            if (Ext.Array.contains(semcourseid_array, record.get('semcourseid'))) {
                                records.push(record);
                            }
                        });
                        StoreReal3.loadRecords(records);

                        StoreReal3.sort([
                            {property: 'semcoursename', direction: 'ASC'},
                        ]);
                    }
                });
            }
        }
    }
});

/**
 * 已選課程資料來源（課表用）
 */
Ext.define('Module.SchoolCourse.StoreReal5', {
    extend: 'Ext.data.Store',
    autoLoad: false,
    autoSync: false,
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount', 'choose', 'grade',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel',
        'serialno', 'regtype'
    ],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    listeners: {
        load: function(storeReal5, records, options) {
            var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
            if (store0 && store0.count() > 0) {
                var request = Ext.Ajax.request({
                    url: __SERVICE_URL + '/service/listcourse.json',
                    method: 'GET',
                    success: function(response) {
                        var obj = Ext.JSON.decode(response.responseText);

                        var semcourseid_array = new Array();
                        //var serialno_map = new Ext.util.HashMap();
                        var regtype_map = new Ext.util.HashMap();

						//0:semcourseid, 1:serialno, 2:regtype
                        Ext.Array.each(obj, function(item) {
                            var tokens = item.split(':');
                            semcourseid_array.push(tokens[0]);
                            //serialno_map.add(tokens[0], tokens[1]);
                            regtype_map.add(tokens[0], tokens[2]);
                        });

                        var records_array = new Array();

                        store0.each(function(record) {
                            if (Ext.Array.contains(semcourseid_array, record.get('semcourseid'))) {
                                records_array.push(record);
                            }
                        });
                        storeReal5.loadRecords(records_array);
                        storeReal5.each(function(record) {
                            //record.set('serialno', serialno_map.get(record.get('semcourseid')));
                            record.set('regtype', regtype_map.get(record.get('semcourseid')));
                        });
                        storeReal5.sort([
                            {property: 'semcoursename', direction: 'ASC'},
                        ]);
                    }
                });
            }
        }
    }
});

/**
 * 我的課程清單
 */
Ext.define('Module.SchoolCourse.StoreReal4', {
    extend: 'Ext.data.Store',
    autoLoad: true,
    autoSync: false,
    fields: [
        'classno', 'day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'
    ],
    data: {
        items: [
            { classno: 1, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 2, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 3, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 4, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 5, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 6, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 7, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 8, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 9, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 10, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 11, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 12, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 13, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 14, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' }
        ]
    },
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    generateData: function() {
        var storeReal4 = this;
        var storeReal5 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal5');
		//storeReal5.clearFilters();
        storeReal5.load({
            callback: function(records, operation, success) {
                Ext.defer(function() {
                    storeReal4.each(function(record) {
                        var classno = record.get('classno');

                        var class_array = new Array();
                        class_array[0] = '';
                        class_array[1] = '';
                        class_array[2] = '';
                        class_array[3] = '';
                        class_array[4] = '';
                        class_array[5] = '';
                        class_array[6] = '';

                        storeReal5.each(function(record2) {
                            var record2_coursetime = record2.get('coursetime');
                            var coursetime_array = record2_coursetime.split(',');

                            Ext.Array.each(coursetime_array, function(coursetime) {
                                var the_classno = coursetime % 100;
                                var index = (coursetime - the_classno) / 100 - 1;

                                if (classno == the_classno) {
                                    var display_text = record2.get('semcoursename');

                                    //選課需求：
                                    //課表regtype=1(分發)和regtype<>1(已選上(配課、即選即上))的顏色區別。
                                    //(regtype=1→藍色、regtype=2→紅色)
                                    if (record2.get('regtype') == '1') {
                                        display_text = '<font color="blue">' + display_text + '</font>';
                                    }
									else if (record2.get('regtype') == '2') {
                                        display_text = '<font color="red">' + display_text + '</font>';
                                    }

                                    class_array[index] = class_array[index] + display_text + '<br/>';
                                }
                            });
                        });

                        for (var i = 0; i < 7; i++) {
                            var the_day = 'day' + (i+1);
                            record.set(the_day, class_array[i]);
                        }
                    });

                    storeReal4.commitChanges();
                }, 2000);
            }
        });
    }
});

/**
 * showOnReload: 重新整理網頁後是否重新載入模組
 */
Ext.define('Module.Prototype.Module', {
	moduleInit: function() {
		Ext.log(this.$className+'.moduleInit() at prototype');
	},
	moduleLoad: function() {
		Ext.log(this.$className+'.moduleLoad() at prototype');
	},
    moduleUnload: function() {
    	Ext.log(this.$className+'.moduleUnload() at prototype');
    }
});
/**
 * 「加選 - 待分發」功能模組
 */
Ext.define('Module.SchoolCourse.BookingCourse.Grid1', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-BookingCourse-Grid1',
    store: 'SchoolCourse-Store3',
    loadMask: true,
    disableSelection: false,
    invalidateScrollerOnRefresh: true,
    viewConfig: {
        trackOver: false,
        plugins: {
            ddGroup: 'grid2-group',
            ptype: 'gridviewdragdrop',
            enableDrop: true
        },
        listeners: {
            drop: function(node, data, overModel, dropPosition, eOpts) {
                var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
                store3.generateSerialno();
            }
        }
    },
    listeners: {
        render: function(grid) {
            //載入資料
            //grid.body.mask('讀取中');
        }
    },
    columns: [
        {
            header: '退選',
            xtype: 'actioncolumn',
            width: 50,
            hideable: false,
            sortable: false,
            align: 'center',
            items: [{
                icon: __SILK_ICONS_URL+'delete.png',
                text: 'test',
                xtype: 'button',
                tooltip: '取消選擇的課程',
                handler: function(grid, rowIndex, colIndex) {
                    //設定選課來源資料
                    var store3 = grid.getStore();
                    var record = store3.getAt(rowIndex);

                    Ext.MessageBox.confirm(
                        '取消確認',
                        '<span class="portal-message">請按「是」取消<strong>'+record.get('semcoursename')+'</strong>課程！</span>',
                        function (btn, text) {
                            if (btn=='yes') {

                                var courses = new Array();
                                courses.push(record.get('semcourseid') + ':' + record.get('courseid'));

                                //將選課資料移到待選區
                                Ext.Msg.wait('正在取消課程...');
                                Ext.Ajax.request({
                                    url: __SERVICE_URL + '/service/cancelcourse.json',
                                    method: 'POST',
                                    params: {
                                        courses: Ext.Array.from(courses).join(',')
                                    },
                                    success: function(response) {
                                        Ext.Msg.hide();
                                        var obj = Ext.JSON.decode(response.responseText);
                                        
                                        //Ext.Msg.alert("伺服器回應", obj.success);

                                        if (obj.success) {
                                            store3.load(); //更新退選區
                                        } else {
											Ext.getCmp('notifier').setText('<font color="red">選課退選失敗，請重新操作一次</font>');
											alert('學生資料無法讀取，按確定後重新登入選課系統。');
											//載入主畫面
											window.location = '/select';
										}
                                    }
                                });
                            }
                        }
                    );
                }
            }]  
        },
        { header: '志願順序', dataIndex: 'serialno', width: 60, sortable: false },
        { header: '學期課號', dataIndex: 'semcourseid', width: 120, hidden: true, sortable: false },
        { header: '來源課號', dataIndex: 'courseid', width: 120, hidden: true, sortable: false },
        { header: '課程名稱', dataIndex: 'semcoursename', flex: 1, sortable: false },
		{ header: '學分', dataIndex: 'credit', width: 40, hidden: false},
		{ header: '開課系所', dataIndex: 'unitname', width: 60, hidden: false},
		{ header: '開課班級', dataIndex: 'classname', width: 110, hidden: false},
        { header: '教師', dataIndex: 'teachername', sortable: false },
        { header: '星期/節', dataIndex: 'coursetime_view', sortable: false },
        { header: '上課地點', dataIndex: 'roomname', sortable: false },
        //{ header: '已選', dataIndex: 'selectedcount', width: 50, sortable: false },
		{ header: '級別', dataIndex: 'englevel', width: 40, hidden: true },
        //{ header: '年級', dataIndex: 'grade', width: 50, hidden: true},
        { header: '上限', dataIndex: 'maxcount', width: 50, sortable: false }
    ]
});

Ext.define('Module.SchoolCourse.BookingCourse.MainPanel', {
    extend: 'Ext.Panel',
    frame: false,
    closable: true,
    title: '加選 - 待分發（修改刪除）',
    icon: __SILK_ICONS_URL + 'application_view_columns.png',
    layout: 'border',
    tbar: [{
        xtype: 'button',
        icon: __SILK_ICONS_URL + 'arrow_rotate_clockwise.png',
        text: '重新整理',
        scale: 'medium',
        handler: function(button, e) {
            Ext.defer(function() {
                var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
                store3.load();
            }, 1);
        }
    }, {
        xtype: 'button',
        icon: __SILK_ICONS_URL + 'database_save.png',
        text: '<b><font size="3" color="#E68E36">儲存志願排序</font></b>',
        scale: 'medium',
        handler: function(button, e) {
            var courses = new Array();

            var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
            var store4 = Ext.data.StoreManager.lookup('SchoolCourse-Store4');

            store3.each(function(record) {
                courses.push(record.get('semcourseid') + ':' + record.get('courseid') + ':' + record.get('serialno'));
            });

            if (courses.length == 0) {
                Ext.Msg.alert('沒有候選課程', '請從待選區選擇要加入候選的課程！');
            }
            else {
                Ext.Msg.wait('正在儲存志願排序...');
                Ext.Ajax.request({
                    url: __SERVICE_URL + '/service/updateselected.json',
                    method: 'POST',
                    params: {
                        courses: Ext.Array.from(courses).join(',')
                    },
                    success: function(response, opts) {
                        Ext.Msg.hide();

                        var obj = Ext.JSON.decode(response.responseText);

                        //Ext.Msg.alert("伺服器回應", response.responseText);

                        if (obj.success) {
                            store3.load();
                            store4.generateData();

                            Ext.getCmp('notifier').setText('<font color="green">志願排序儲存完成！</font>');
                        }
                        else {
                            Ext.getCmp('notifier').setText('<font color="red">志願排序儲存失敗，請重新操作一次</font>');
                        }
                    },
                    failure: function(response, opts) {
                        Ext.Msg.hide();

                        Ext.Msg.alert("伺服器回應", "無法儲存，請重新再試一次！<br/>" + response.responseText);

                        Ext.getCmp('notifier').setText('<b><font color="red">志願排序儲存失敗</font></b>');
                    }
                });
            }
        }
    }],
    items: [{
        xtype: 'SchoolCourse-BookingCourse-Grid1',
        itemId: 'grid1',
        border: true,
        region: 'center',
        autoHeight: true,
        autoScroll: true
    }],
    bbar: [{
        xtype: 'tbtext',
        text: ''
    }]
});

/**
 * 模組主程式定義區
 */
Ext.define('Module.SchoolCourse.BookingCourse', {
    extend: 'Module.Prototype.Module',
    statics: {
        _previous: null
    },
    moduleLoad: function() {
        var thisModule = this;
        
        //將目前的模組記錄在 URL HASH
    	window.location.hash = '#'+this.$className;

        var tabpanel = Ext.getCmp('portal-tabpanel');

        //判斷 Panel 是否已經存在 Tab（建立或切換）
        var panel = Module.SchoolCourse.BookingCourse._previous;

        if (!panel) {
            //使用新頁籤建立主畫面
            //tabpanel.setLoading('讀取中');
            var panel = Ext.create('Module.SchoolCourse.BookingCourse.MainPanel', {
                listeners: {
                    beforeclose: function(panel, eOpts) {
                        thisModule.moduleUnload();
                        Module.SchoolCourse.BookingCourse._previous = null;
                    },
                    afterrender: function(panel, eOpts) {
                        //載入資料
                        Ext.defer(function() {
                            var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
                            store3.load();
                        }, 100);
                    }
                }
            });

            //新增主畫面到 Tab
            tabpanel.add(panel);

            //記錄已建立的新 Panel
            Module.SchoolCourse.BookingCourse._previous = panel;
        }

        //切換到 Panel
        tabpanel.setActiveTab(panel);
    },
    moduleUnload: function() {
        //從 URL HASH 移除目前的模組記錄
        if (window.location.hash == '#'+this.$className) {
            window.location.hash = '';
        }
    }
});
/**
 * 「加選 - 即選即上」功能模組
 */

//已選人數顯示（背景執行）
var runner = new Ext.util.TaskRunner();
var task1 = runner.newTask({
    run: function () {
        Ext.Ajax.request({
            url: __SERVICE_URL + '/service/listcount.json',
            method: 'GET',
            success: function(response) {
                var obj = Ext.JSON.decode(response.responseText);
                if (obj) {
                    var storeReal1 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal1'); //待選區
					var storeReal2 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal2'); //候選區
					//更新待選區人數
                    storeReal1.each(function(record) {
                        var semcourseid = record.get('semcourseid');
                        if (obj[semcourseid] != null) {
                            record.set('selectedcount', obj[semcourseid]);
                        }
                    });
					//更新候選區人數
					storeReal2.each(function(record) {
                        var semcourseid = record.get('semcourseid');
                        if (obj[semcourseid] != null) {
                            record.set('selectedcount', obj[semcourseid]);
                        }
                    });
                }
            }
        });
    },
    interval: 5000
});
//task1.start();
//task1.stop();
var courseNowCount = 0;
function is_coursefull(semcourseid, maxcount) {
	var coursecount = 0;
	Ext.Ajax.request({
		url: __SERVICE_URL + '/service/listcount.json',
		async:false,
		method: 'GET',
		success: function(response) {
			var obj = Ext.JSON.decode(response.responseText);
			
			if (obj) {
				if (obj[semcourseid] != null) {
					coursecount = obj[semcourseid];
					courseNowCount = obj[semcourseid];
				}
			}
		}
	});
	if(coursecount >= maxcount) {
		return true;
	} else {
		return false
	}
};

var __changeFilterHandler_state = null;
var changeFilterHandler = function(val, params) {
/*
    if (val==__changeFilterHandler_state) {
        return true;
    }
*/
    if (!val) {
        val = __changeFilterHandler_state;
    }
    __changeFilterHandler_state = val;

    //初始化參數
    if (!params) {
        params = {};
    }
	//篩選資料前置處理
    var weekdays = params.weekdays?params.weekdays:null;
    //var depttypes = params.depttypes?params.depttypes:null;
	var gpid = params.gpid?params.gpid:null;
    var semcoursename = params.semcoursename?params.semcoursename:null;

	//資料來源設定
    var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
    var store1 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal1');
    var store1a = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal1a');
	
    store1.removeAll();
    //store1a.removeAll();

    var __filter_proc = function(record) {
        var result = false;

        if (record.get('coursetype')==val) {
            result = true;			
			
			//擋課處理（blocklist）
            if (result && (Ext.Array.contains(ClientSession.blocklist_array, record.get('semcoursename')))) {
                result = false;
				//if(result == false) alert(val+'='+record.get('semcoursename')+'-'+'block_sotp'); //test
            }
			if (result && Ext.Array.contains(ClientSession.blockgplist_array, record.get('selectgpid'))) {
                result = false;
				//if(result == false) alert(val+'='+record.get('semcoursename')+'-'+'blockgp_sotp'); //test
            }
			
			//這次通識只對選修做選課
			if (record.get('choose') == '1' && val == '1') {
                result = false;
             }
			
			//我的體育課程時段
			if(result && val == '2' )
			{	
				if(Ext.String.trim(ClientSession.user.physicalgroup) != '') {
					result = true;
					var is_myphy = (record.get('physicalgroup') == ClientSession.user.physicalgroup)?true:false; //我的體育時段
					if(!is_myphy) {
						result = false;
					}
				} else {
					result = false;
				}
				//if(result == false) alert(val+'='+record.get('semcoursename')+'?'+record.get('physicalgroup')+'-'+'pe_sotp'); //test
			}
			
			//課程名稱篩選
            if (result && semcoursename != null && Ext.String.trim(semcoursename) != '') {
                if (record.get('semcoursename').indexOf(semcoursename) == -1) {
                    result = false;
                }
				//if(result == false) alert(val+'='+record.get('semcoursename')+'-'+'name_sotp'); //test
            }

            //學門領域
            if (result && gpid && gpid != '') {
                if (record.get('selectgpid') != gpid) {
                    result = false;
                }
				//if(result == false && val!= '1') alert(val+'='+record.get('semcoursename')+'?'+'gpid_sotp'); //test
            }
			
            //星期篩選
            if (result && weekdays) {
                var coursetime = Ext.String.trim(record.get('coursetime'));
                var coursetime_array = coursetime.split(',');
                var weeksetup = [
                    false, false, false, false,
                    false, false, false, false
                ];

                weeksetup[0] = (coursetime == '');

                Ext.Array.each(coursetime_array, function(item) {
                    if (item >= 100 && item <= 199) {
                        weeksetup[1] = true;
                    }
                    else if (item >= 200 && item <= 299) {
                        weeksetup[2] = true;
                    }
                    else if (item >= 300 && item <= 399) {
                        weeksetup[3] = true;
                    }
                    else if (item >= 400 && item <= 499) {
                        weeksetup[4] = true;
                    }
                    else if (item >= 500 && item <= 599) {
                        weeksetup[5] = true;
                    }
                    else if (item >= 600 && item <= 699) {
                        weeksetup[6] = true;
                    }
                    else if (item >= 700 && item <= 799) {
                        weeksetup[7] = true;
                    }
                });

                result = false;
                Ext.Array.each(weekdays, function(item) {
                    if (weeksetup[item]) {
                        result = (result || true);
                    }
                });
				//if(result == false) alert(val+'='+record.get('semcoursename')+'week_stop'); //test
            }
        }
        //傳回處理結果
        return result;
    };

	//左側選單體育籂選
	var __filter_phy = function(record) {
		if(Ext.String.trim(ClientSession.user.physicalgroup) == '') {
			return false;
		} else {
			var store_phy = store0;
			store_phy.filter('physicalgroup' , ClientSession.user.physicalgroup);

			var exist = store_phy.find('semcoursename', record.get('semcoursename'));
			if(exist >= 0)
				return true;
			else 
				return false;
		}
	}
	
    //處理左邊分類清單查詢
    Ext.defer(function() { 
		if(val == '2') {
			store1a.filterBy(__filter_phy); //__filter_phy
			
            if(store1a.getCount() == 0) {
                Ext.Msg.alert('選課訊息','無體育課程可選。');
            }

			store0.clearFilter();
		} else {
			store1a.filterBy(__filter_proc);
		}
    }, 100);

    //處理課程清單
    Ext.defer(function() {
        var result = store0.queryBy(__filter_proc);
        store1.loadRecords(result.items);
        store1.sort();
		
		//預設顯示0筆
        store1.filterBy(function(record) {
            return false;
        });
    }, 100);
};

Ext.define('Module.SchoolCourse.RealtimeCourse.Grid1a', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-RealtimeCourse-Grid1a',
    store: 'SchoolCourse-StoreReal1a',
    loadMask: true,
    disableSelection: false,
    invalidateScrollerOnRefresh: true,
    viewConfig: {
        trackOver: false
    },
    listeners: {
        render: function(grid) {
            //載入資料
            //grid.body.mask('讀取中');
        },
        select: function(grid, record, index, eOpts) {
            var record_semcoursename = record.get('semcoursename');
            var store1 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal1');
            store1.filterBy(function(record2) {
                return (record2.get('semcoursename')==record_semcoursename);
            });
        }
    },
    columns: [
        { header: '課程名稱', dataIndex: 'semcoursename', flex: 1 }
    ]
});

Ext.define('Module.SchoolCourse.RealtimeCourse.Grid1', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-RealtimeCourse-Grid1',
    store: 'SchoolCourse-StoreReal1',
    loadMask: true,
    disableSelection: false,
    invalidateScrollerOnRefresh: true,
    viewConfig: {
        trackOver: false
    },
    listeners: {
        render: function(grid) {
            //載入資料
            //grid.body.mask('讀取中');
        }
    },
    columns: [
        {
            header: '加選',
            xtype: 'actioncolumn',
            width: 50,
            hideable: false,
            sortable: false,
            align: 'center',
            items: [{
                icon: __SILK_ICONS_URL + 'add.png',
                tooltip: '加選',
                getClass: function(value, metadata, record) {
                    //如果課程已經在已選清單中，就不顯示加選按鈕
					var store2 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal2'); //候選
                    var store3 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal3'); //退選區
                    var record_semcourseid = record.get('semcourseid');
					var exists = false;
					
					exists = store2.find('semcourseid', record_semcourseid);
                    if (exists >= 0) {
                       return 'x-hide-display';
                    }
					
					exists = store3.find('semcourseid', record_semcourseid);
                    if (exists >= 0) {
                       return 'x-hide-display';
                    }
					
                    return 'x-grid-center-icon';
                },
                handler: function(view, rowIndex, colIndex, item, e) { 
                    //將選課資料移到待選區
					var store2 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal2'); //候選
					var store3 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal3'); //退選區
					var storeReal5 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal5'); //已選課程
					
					var store1 = view.getStore();
					var record = store1.getAt(rowIndex);
					var coursetype = record.get('coursetype');
					
					//課程人數是否已滿
					var is_full = true;
					var max_count = record.get('maxcount');

					is_full = is_coursefull(record.get('semcourseid'), max_count);
					//admin有無限加選權力
					if(ClientSession.admin == 'admin'){
						is_full = false; 
					}
					
					//衝堂
					var is_exist = false;
					var existTime = storeReal5.findBy(function (record2) {
						var store5Time_array = record2.get('coursetime').split(',');
						var recordTime_array = record.get('coursetime').split(',');
						
						Ext.Array.each(store5Time_array, function(store5Time) {						
							Ext.Array.each(recordTime_array, function(recordTime) {
								if (Ext.String.trim(store5Time) == Ext.String.trim(recordTime)) {
									is_exist = true;
								}
							});
						});						
						return false;
					});

					storeReal5.load({
						callback: function(records, operation, success) {
							;//alert('TMD complete now!!');
						}
					});	
					
					//學分是否已達學分上限
					var amt_credit = 0;
					store3.each(function(record2) {   
						amt_credit += parseInt(record2.get('credit'));   
					});
					store2.each(function(record2) {   
						amt_credit += parseInt(record2.get('credit'));   
					});
					
					//選通識選修是否已選
					var exist1 = store3.findBy(function (record2) {   
						return record2.get('selectgpid') != '';
					});
					if(exist1 == -1) {
						var exist1 = store2.findBy(function (record2) {   
							return record2.get('selectgpid') != '';
						});
					}

					//體育是否已選
					var exist2 = store3.findBy(function (record2) {  
						return record2.get('physicalgroup') != '';   
					});
					if(exist2 == -1) {
						var exist2 = store2.findBy(function (record2) {  
							return record2.get('physicalgroup') != '';
						});
					}
					
					//軍訓是否已選
					var exist4 = store3.findBy(function (record2) {   
						return record2.get('coursetype') == '4';   
					});
					if(exist4 == -1) {
						var exist4 = store2.findBy(function (record2) {   
							return record2.get('coursetype') == '4';
						});
					}
					if(is_full){
						Ext.Msg.alert('選課訊息', '無法加選，課程已達選課人數上限。');
					} else if(amt_credit > 28) {
						Ext.Msg.alert('選課訊息', '已達學分數上限(28學分)。'+amt_credit);
					} else if(is_exist) {
						Ext.Msg.alert('選課訊息', '衝堂！'+record.get('coursetime_view')+'時段已有課程佔用。');
					} else if(coursetype == '2' && exist2 >= 0) {
						Ext.Msg.alert('選課訊息', '體育課程只能選擇 1 門');
					} else if(coursetype == '1' && exist1 >= 0) {
						Ext.Msg.alert('選課訊息', '通識選修只能選擇 1 門');
					} else if(coursetype == '4' && exist4 >= 0) {
						Ext.Msg.alert('選課訊息', '軍訓課程只能選擇 1 門');
					} else {
						//設定選課來源資料
						store1.remove(record);
						store2.add(record);
					}

                }
            }]  
        },
        { header: '學期課號', dataIndex: 'semcourseid', width: 120, hidden: true },
        { header: '來源課號', dataIndex: 'courseid', width: 120, hidden: true },
        { header: '課程名稱', dataIndex: 'semcoursename', flex: 1 },
		{ header: '學分', dataIndex: 'credit', width: 40 },
		{ header: '開課系所', dataIndex: 'unitname', width: 80 },
        { header: '教師', dataIndex: 'teachername', width: 70 },
        { header: '星期/節', dataIndex: 'coursetime_view', width: 80 },
        { header: '上課地點', dataIndex: 'roomname', width: 90 },
		{ header: '已選', dataIndex: 'selectedcount', width: 40 },
        { header: '上限', dataIndex: 'maxcount', width: 40 }
    ]
});
  
Ext.define('Module.SchoolCourse.RealtimeCourse.Grid2', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-RealtimeCourse-Grid2',
    store: 'SchoolCourse-StoreReal2',
    columns: [
        { 
            header: '移除',
            xtype: 'actioncolumn',
            width: 50,
            hideable: false,
            sortable: false,
            align: 'center',
            style: {cursor: 'hand'},
            items: [{
                icon: __SILK_ICONS_URL+'delete.png',
                tooltip: '移除',
                handler: function(grid, rowIndex, colIndex) {
					var store1 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal1');
                    var store2 = grid.getStore();
                    var record = store2.getAt(rowIndex);
                    
                    Ext.MessageBox.confirm(
                        '移除候選區課程',
                        '<span class="portal-message">此動作將會移除候選區課程<strong>'+record.get('semcoursename')+'</strong>！</span>',
                        function (btn, text) {
                            if (btn=='yes') {
                                //將選課資料移到待選區
								store2.removeAt(rowIndex);
                                //store2.generateSerialno();
                                store1.add(record);
                            }
                        }
                    );
                }
            }]
        },
        { header: '學期課號', dataIndex: 'semcourseid', width: 120, hidden: true },
        { header: '來源課號', dataIndex: 'courseid', width: 120, hidden: true },
        { header: '課程名稱', dataIndex: 'semcoursename', flex: 1 },		
		{ header: '學分', dataIndex: 'credit', width: 40 },
		{ header: '開課系所', dataIndex: 'unitname', width: 90 },
        { header: '教師', dataIndex: 'teachername', width: 80 },
        { header: '星期/節', dataIndex: 'coursetime_view', width: 100 },
        { header: '上課地點', dataIndex: 'roomname' },
        { header: '已選', dataIndex: 'selectedcount', width: 50 },
        { header: '上限', dataIndex: 'maxcount', width: 50 }
    ]
});

var __createFilterHandler = function(code, text) {
    return function(button, e) {
        button.toggle(true);
		
		var weekdays = this.up('panel').getComponent('filterbar').getComponent('week-filter').getValue().days; //取得勾選的星期資料（陣列）
		var gpid = this.up('panel').getComponent('filterbar').getComponent('gpid-filter').getValue(); //學門領域
		if(code != '1') gpid = null;
		var semcoursename = this.up('panel').getComponent('filterbar').getComponent('semcoursename-filter').getValue(); //課程名稱
		
		changeFilterHandler(code, {
			weekdays: weekdays,
			gpid: gpid,
			semcoursename: semcoursename
		});
		
		//通識特別處理：學門領域下拉選單啟用
		var cmp = this.up('panel').getComponent('filterbar').getComponent('gpid-filter');
		cmp.setVisible(code == '1');
    };
}

//
var __queryByFilters = function(val, toolbar) {
    //取得勾選的星期資料（陣列）
    var weekdays = toolbar.getComponent('week-filter').getValue().days;

    //取得勾選的單位資料（陣列）
    //var depttypes = toolbar.getComponent('dept-filter').getValue().types;

    //學門領域
    var gpid = toolbar.getComponent('gpid-filter').getValue();
	if(val != '1') gpid = null;
    //年級下拉清單值
    //var grade = toolbar.getComponent('grade-filter').getValue();

    //系所下拉清單值
    //var unitid = toolbar.getComponent('unitid-filter').getValue();

    //全系所（學院）
    //var college = toolbar.getComponent('college-filter').getValue();

    //課程名稱
    var semcoursename = toolbar.getComponent('semcoursename-filter').getValue();

    //重新篩選查詢
    changeFilterHandler(val, {
        weekdays: weekdays,
        //depttypes: depttypes,
        gpid: gpid,
        semcoursename: semcoursename
        //grade: grade,
        //unitid: unitid,
        //college: college
    });

    //取消左方課程清單的選擇項目
    toolbar.up('panel').getComponent('grid1a').getSelectionModel().deselectAll();
};

Ext.define('Module.SchoolCourse.RealtimeCourse.MainPanel', {
    extend: 'Ext.Panel',
    frame: false,
    closable: true,
    icon: __SILK_ICONS_URL+'application_view_columns.png',
    title: '加選 - 即選即上',
    layout: 'border',
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: [{
            xtype: 'button',
            icon: __SILK_ICONS_URL+'bullet_green.png',
            text: '通識選修',
            toggleGroup: 'grid1-filter',
            pressed: true,
			handler: __createFilterHandler('1', '通識選修限制：1.畢業前必須修完五大領域。2.已修過領域不顯示。3.每人只能選一科。')
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL+'bullet_green.png',
            text: '體育課程 ',
            toggleGroup: 'grid1-filter',
			handler: __createFilterHandler('2', '體育課程')
        },{
            xtype: 'button',
            icon: __SILK_ICONS_URL+'bullet_green.png',
            text: '軍訓課程 ',
            toggleGroup: 'grid1-filter',
			handler: __createFilterHandler('4', '軍訓課程')
        }, '-', {
            xtype: 'tbtext',
            text: ''
        }]
    }, {
        xtype: 'toolbar',
        dock: 'top',
		itemId: 'filterbar',
        items: [ {
            xtype: 'combo',
            itemId: 'gpid-filter',
            disabled: false,
            hidden: false,
            store: {
                fields: ['value', 'display'],
                data : [
                    {value: '', display: '- 全部顯示 -'},
                    {value: 'G00001', display: '人文藝術'},
                    {value: 'G00002', display: '社會科學'},
                    {value: 'G00003', display: '自然科學'},
                    {value: 'G00004', display: '生命倫理與環境關懷'},
                    {value: 'G00005', display: '生活應用'}
                ]
            },
            queryMode: 'local',
            displayField: 'display',
            valueField: 'value',
            emptyText: '學門領域',
			value: 'G00001',
			width: 150,
			listeners: {				
                change: function(field, newValue, oldValue, eOpts) {
                    __queryByFilters('1', this.up('toolbar'));
                }
            },
            allowBlank: true
        },{
            itemId: 'week-filter',
            xtype: 'checkboxgroup',
            fieldLabel: '星期',
            labelAlign: 'right',
            labelWidth: 40,
            width: 350,
            items: [
                { xtype: 'checkbox', boxLabel: '一', name: 'days', inputValue: 1, checked: true },
                { xtype: 'checkbox', boxLabel: '二', name: 'days', inputValue: 2, checked: true },
                { xtype: 'checkbox', boxLabel: '三', name: 'days', inputValue: 3, checked: true },
                { xtype: 'checkbox', boxLabel: '四', name: 'days', inputValue: 4, checked: true },
                { xtype: 'checkbox', boxLabel: '五', name: 'days', inputValue: 5, checked: true },
                { xtype: 'checkbox', boxLabel: '六', name: 'days', inputValue: 6, checked: true },
                { xtype: 'checkbox', boxLabel: '日', name: 'days', inputValue: 7, checked: true }
            ]
        },{
            xtype: 'textfield',
            itemId: 'semcoursename-filter',
            fieldLabel: '課程名稱',
            labelAlign: 'right',
            labelWidth: 70,
            text: 'test'
        }, '-', {
            xtype: 'button',
            icon: __SILK_ICONS_URL+'magnifier.png',
            tooltip: '加選',
            text: '查詢',
			itemId: 'query-button',
            handler: function() {
				__queryByFilters(__changeFilterHandler_state, this.up('toolbar'));
            }
        }]
    }, {
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        itemId: 'footbar',
        items: [ {
            xtype: 'tbtext',
            text: ''
        }, {
            xtype: 'tbtext',
            itemId: 'label-status',
            text: ''
        }]
    }],
    items: [{
        xtype: 'SchoolCourse-RealtimeCourse-Grid1a',
        itemId: 'grid1a',
        border: true,
        resizable: false,
        region: 'west',
        autoScroll: true,
        width: 180,
        //margins: '5 0 0 5'
    }, {
        xtype: 'SchoolCourse-RealtimeCourse-Grid1',
        itemId: 'grid1',
        border: true,
        resizable: false,
        region: 'center',
        autoScroll: true,
        //margins: '5 5 0 5'
    }, {
        xtype: 'SchoolCourse-RealtimeCourse-Grid2',
        itemId: 'grid2',
        border: true,
        resizable: true,
        region: 'south',
        //title: '候選區',
        icon: __SILK_ICONS_URL + 'cart_add.png',
        autoScroll: true,
        height: 150,
		dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            ui: 'default',
            itemId: 'footbar',
            items: [{
                xtype: 'tbtext',
                text: '候選區'
            }, '-', {
				xtype: 'button',
				icon: __SILK_ICONS_URL + 'accept.png',
				text: '<b><font size="3" color="#E68E36">確定加選</font></b>',
				scale: 'medium',
				handler: function() {
					var courses = new Array();

					var store2 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal2'); //候選
					var storeReal3 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal3'); //退選區
					var store4 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal4'); //課表
					var courses_full = '';
					var is_full = true;	

					store2.each(function(record) {
						courses.push(record.get('semcourseid') + ':' + record.get('courseid'));
						//課程人數是否已滿
						is_full = true;	
						var max_count = record.get('maxcount');
						is_full = is_coursefull(record.get('semcourseid'), max_count);
						
						//admin有無限加選權力
						if(ClientSession.admin == 'admin'){
							is_full = false; 
						}
						//記下已達人數上限的課程
						if(is_full){
							if(courses_full != '') {
								courses_full +=  (', ' + record.get('semcoursename'));
							} else {
								courses_full += record.get('semcoursename');
							}
						}
					});

					if (courses.length == 0) {
						Ext.Msg.alert('選課訊息', '沒有候選課程', '請從待選區選擇要加入候選的課程！');
					} else if (is_full) {
						Ext.Msg.alert('無法加選', '已達選課人數上限，請移除候選區課程<b> ' + courses_full + '</b>。');
					} else {
                        Ext.Msg.wait('正在處理加選...');
                        Ext.Ajax.request({
                            url: __SERVICE_URL + '/service/selectcourseReal.json',
                            method: 'POST',
                            params: {
                                courses: Ext.Array.from(courses).join(',')								
                            },
                            success: function(response, opts) {
                                Ext.Msg.hide();

                                var obj = Ext.JSON.decode(response.responseText);

                                //Ext.Msg.alert("伺服器回應", response.responseText);

                                if (obj.success) {
                                    store2.removeAll();
                                    storeReal3.load();
									store4.generateData();

                                    Ext.getCmp('notifier').setText('<font color="green">選課登記完成</font>');
                                } else {
                                    Ext.getCmp('notifier').setText('<font color="red">選課加選失敗，請重新操作一次</font>');
									//伺服器session.user資料遺失則提示登出
                                    if (obj.logout) {
										Ext.Msg.alert('已遺失資料', '學生資料無法讀取，按確定後重新登入選課系統。', function(btn) {
											if (btn=='ok') {
												//強制登出
												logout_url = (ClientSession.admin == 'admin') ? encodeURIComponent('/' + ClientSession.admin) : encodeURIComponent('/' + ClientSession.mode);
												location.href='/logout?redirect='+ logout_url;
											}
										});
									}
                                }
                            },
                            failure: function(response, opts) {
                                Ext.Msg.hide();

                                Ext.Msg.alert("伺服器回應", response.responseText);

                                Ext.getCmp('notifier').setText('<font color="red">選課登記失敗</font>');
                            }
                        });
					}
				}
			}, {
				icon: __SILK_ICONS_URL + 'cart_delete.png',
				text: '清除候選區',
				scale: 'medium',
				handler: function() {
					var filterbar = this.up('panel').up('panel').getComponent('filterbar');
					
					Ext.Msg.confirm(
						'清除確認',
						'請按「是」將候選區資料清空；按「否」取消動作。',
						function(btn, text){
							if (btn == 'yes'){
								var store2 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal2');
								store2.removeAll();
								
								//重新整理待選區
                                __queryByFilters(__changeFilterHandler_state, filterbar);
							}
						}
					);
				}
			}]
		}]
        //margins: '5 5 5 5'
    }]
});

/**
 * 模組主程式定義區
 */
Ext.define('Module.SchoolCourse.RealtimeCourse', {
    extend: 'Module.Prototype.Module',
    statics: {
        _previous: null
    },
    moduleLoad: function() {
        var thisModule = this;

        //將目前的模組記錄在 URL HASH
    	window.location.hash = '#'+this.$className;
        
		//顯示提示訊息
		Ext.getCmp('notifier').setText('<font color="blue">需點擊確定登記按鈕，候選課程才會加到待分發課程清單</font>');
		
		//加入新畫面到 Tab 視窗
        var tabpanel = Ext.getCmp('portal-tabpanel');

        //判斷 Panel 是否已經存在 Tab（建立或切換）
        var panel = Module.SchoolCourse.RealtimeCourse._previous;

        if (!panel) {
            //使用新頁籤建立主畫面
            //tabpanel.setLoading('讀取中');
            var panel = Ext.create('Module.SchoolCourse.RealtimeCourse.MainPanel', {
                listeners: {
                    beforeclose: function(panel, eOpts) {
					
						//候選區有資料禁止關閉 Tab 視窗
                        var store2 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal2');
                        if (store2.count() > 0) {
                            Ext.Msg.alert('選課訊息', '無法關閉', '候選區尚有課程資料！');
                            return false;
                        }
						
                        thisModule.moduleUnload();
                        Module.SchoolCourse.RealtimeCourse._previous = null;

                        //關閉讀取已選人數（可以安心了）
                        task1.stop();
                    },
                    afterrender: function(panel, eOpts) {
                        //載入資料（帶預設值）
                        //changeFilterHandler('1');
						changeFilterHandler('1', {
                            gpid: 'G00001'
                        });

                        //開始讀取已選人數（負載會增加須小心爆炸）
                        task1.start();
                    }
                }
            });
            
            //新增主畫面到 Tab
            tabpanel.add(panel);

            //記錄已建立的新 Panel
            Module.SchoolCourse.RealtimeCourse._previous = panel;
        }

        //切換到 Panel
        tabpanel.setActiveTab(panel);
    },
    moduleUnload: function() {
        //從 URL HASH 移除目前的模組記錄
        if (window.location.hash == '#'+this.$className) {
            window.location.hash = '';
        }
    }
});
/**
 * 「加選 - 登記」功能模組
 */
var __changeFilterHandler_state = null;
var changeFilterHandler = function(val, params) {
    if (val==__changeFilterHandler_state) {
        return true;
    }
    if (!val) {
        val = __changeFilterHandler_state;
    }
    __changeFilterHandler_state = val;

    //初始化參數
    if (!params) {
        params = {};
    }

    //必修選修特別處理
    var val_tokens = val.split('-');
    var val_choose = null;

    if (val_tokens.length > 1) {
        val = val_tokens[0];
        val_choose = val_tokens[1];
    }

    //篩選資料前置處理
    var weekdays = params.weekdays?params.weekdays:null;
    var depttypes = params.depttypes?params.depttypes:null;
    var gpid = params.gpid?params.gpid:null;
    var semcoursename = params.semcoursename?params.semcoursename:null;
    var grade = params.grade?params.grade:null;
    var unitid = params.unitid?params.unitid:null;
    var college = params.college?params.college:null;

    //資料來源設定
    var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
    var store1 = Ext.data.StoreManager.lookup('SchoolCourse-Store1');
    var store1a = Ext.data.StoreManager.lookup('SchoolCourse-Store1a');

    store1.removeAll();
    //store1a.removeAll();

    var __filter_proc = function(record) {
        var result = false;

        if (record.get('coursetype')==val) {
            result = true;

            //擋課處理（blocklist）
            if (result && Ext.Array.contains(ClientSession.blocklist_array, record.get('semcoursename'))) {
                result = false;
            }

            //必修選修特別處理
            if (result && val_choose != null) {
                if (record.get('choose') != val_choose) {
                    result = false;
                }
            }

            //課程名稱篩選
            if (result && semcoursename != null && Ext.String.trim(semcoursename) != '') {
                if (record.get('semcoursename').indexOf(semcoursename) == -1) {
                    result = false;
                }
            }

            //學門領域
            if (result && gpid && gpid != '') {
                if (record.get('selectgpid') != gpid) {
                    result = false;
                }
            }

            //年級
            if (result && grade && grade != '') {
                if (record.get('grade') != grade) {
                    result = false;
                }
            }

            //系所
            if (result && !college && unitid && unitid != '') {
                if (record.get('unitid') != unitid) {
                    result = false;
                }
            }

            //全系所（學院）
            if (result && ClientSession.user.collegeid) {
                if (record.get('collegeid') != ClientSession.user.collegeid) {
                    result = false;
                }
            }

            //單位篩選
            if (result && depttypes) {
                //部（studytype）
                if (result && Ext.Array.contains(depttypes, 'studytype')) {
                    if (record.get('studytype') != ClientSession.user.studytype) {
                        result = false;
                    }
                }

                //院（collegeid）
                if (result && Ext.Array.contains(depttypes, 'collegeid')) {
                    if (record.get('collegeid') != ClientSession.user.collegeid) {
                        result = false;
                    }
                }

                //系所（unitid）
                if (result && Ext.Array.contains(depttypes, 'unitid')) {
                    if (record.get('unitid') != ClientSession.user.unitid) {
                        result = false;
                    }
                }
            }

            //星期篩選
            if (result && weekdays) {
                var coursetime = Ext.String.trim(record.get('coursetime'));
                var coursetime_array = coursetime.split(',');
                var weeksetup = [
                    false, false, false, false,
                    false, false, false, false
                ];

                weeksetup[0] = (coursetime == '');

                Ext.Array.each(coursetime_array, function(item) {
                    if (item >= 100 && item <= 199) {
                        weeksetup[1] = true;
                    }
                    else if (item >= 200 && item <= 299) {
                        weeksetup[2] = true;
                    }
                    else if (item >= 300 && item <= 399) {
                        weeksetup[3] = true;
                    }
                    else if (item >= 400 && item <= 499) {
                        weeksetup[4] = true;
                    }
                    else if (item >= 500 && item <= 599) {
                        weeksetup[5] = true;
                    }
                    else if (item >= 600 && item <= 699) {
                        weeksetup[6] = true;
                    }
                    else if (item >= 700 && item <= 799) {
                        weeksetup[7] = true;
                    }
                });

                result = false;
                Ext.Array.each(weekdays, function(item) {
                    if (weeksetup[item]) {
                        result = (result || true);
                    }
                });
            }
        }
        //傳回處理結果
        return result;
    };
	
    //處理左邊分類清單查詢
    Ext.defer(function() {
		var result_left = store0.queryBy(__filter_proc);
		var name_array={};
		var rec_array = new Array();
		var i=0;
		var _length = result_left.items.length;
		
		for(i=0;i<_length;i++) {
			var semcoursename = result_left.items[i].get('semcoursename');

			if(name_array[semcoursename] == null) {				
				name_array[semcoursename]=true;
				rec_array.push(result_left.items[i])
			} else {
				;
			}
		}
		store1a.loadRecords(rec_array);

        //store1a.filterBy(__filter_proc);
		if (store1a.getCount() == 0 && val == '5') {
			Ext.Msg.alert('選課訊息', "因所有課程為配課 或 已修，故無課程顯示");
		}
    }, 100);

    //處理課程清單
    Ext.defer(function() {
        var result = store0.queryBy(__filter_proc);
        store1.loadRecords(result.items);
        store1.sort();
        //預設顯示0筆
        store1.filterBy(function(record) {
            return false;
        });
    });
};

Ext.define('Module.SchoolCourse.RegisterCourse.Grid1a', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-RegisterCourse-Grid1a',
    store: 'SchoolCourse-Store1a',
    loadMask: true,
    disableSelection: false,
    invalidateScrollerOnRefresh: true,
    viewConfig: {
        trackOver: false
    },
    listeners: {
        render: function(grid) {
            //載入資料
            //grid.body.mask('讀取中');
        },
        select: function(grid, record, index, eOpts) {
            // group by courseid
            /*
            var record_courseid = record.get('courseid');
            var store1 = Ext.data.StoreManager.lookup('SchoolCourse-Store1');
            store1.filterBy(function(record2) {
                return (record2.get('courseid')==record_courseid);
            });
            */
            // group by semcoursename
            var record_semcoursename = record.get('semcoursename');
            var store1 = Ext.data.StoreManager.lookup('SchoolCourse-Store1');
            store1.filterBy(function(record2) {
                return (record2.get('semcoursename')==record_semcoursename);
            });
        }
    },
    columns: [
        { header: '課程名稱', dataIndex: 'semcoursename', flex: 1 }
    ]
});

Ext.define('Module.SchoolCourse.RegisterCourse.Grid1', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-RegisterCourse-Grid1',
    store: 'SchoolCourse-Store1',
    loadMask: true,
    disableSelection: false,
    invalidateScrollerOnRefresh: true,
    viewConfig: {
        trackOver: false
    },
    listeners: {
        render: function(grid) {
            //載入資料
            //grid.body.mask('讀取中');
        }
    },
    columns: [
        {
            header: '加選',
            xtype: 'actioncolumn',
            width: 40,
            hideable: false,
            sortable: false,
            align: 'center',
            items: [{
                icon: __SILK_ICONS_URL + 'add.png',
                tooltip: '加選',
                getClass: function(value, metadata, record) {
                    //如果課程已經在已選清單中，就不顯示加選按鈕
                    var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
                    var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
                    var record_semcourseid = record.get('semcourseid');
                    var exists = false;
                    
                    exists = store2.find('semcourseid', record_semcourseid);
                    if (exists >= 0) {
                       return 'x-hide-display';
                    }

                    exists = store3.find('semcourseid', record_semcourseid);
                    if (exists >= 0) {
                       return 'x-hide-display';
                    }

                    return 'x-grid-center-icon';
                },
                handler: function(grid, rowIndex, colIndex) {				
					var store5 = Ext.data.StoreManager.lookup('SchoolCourse-Store5'); //已選課程
					
                    //設定選課來源資料
                    var store1 = grid.getStore();
                    var record = store1.getAt(rowIndex);
					
					//衝堂
					var is_exist = false;
					var existTime = store5.findBy(function (record2) {
						var store5Time_array = record2.get('coursetime').split(',');
						var recordTime_array = record.get('coursetime').split(',');
						
						Ext.Array.each(store5Time_array, function(store5Time) {
							Ext.Array.each(recordTime_array, function(recordTime) {
								if (Ext.String.trim(store5Time) == Ext.String.trim(recordTime) && record2.get('regtype') != '1') {
									is_exist = true;
								}
							});
						});						
						return false;
					});
					
					if(is_exist) {
						Ext.Msg.alert('選課訊息', '衝堂！'+record.get('coursetime_view')+'時段已有課程佔用。');
					} else {
						store1.remove(record);

						//將選課資料移到待選區
						var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
						store2.add(record);
						store2.generateSerialno();
					}
                    /*--從加選區加選時，不提示訊息--
                    Ext.MessageBox.confirm(
                        '符合選課條件',
                        '<span class="portal-message">請按「是」將課程<strong>'+record.get('semcoursename')+'</strong>放入候選區！<br/>請按<strong style="color:red">確定加選</strong>按鈕送出所有候選區資料！</span>',
                        function (btn, text) {
                            if (btn=='yes') {
                                //將選課資料移到待選區
                                var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
                                record.set('serialno', store2.count()+1);
                                store2.add(record);
                            }
                        }
                    );*/
                }
            }]  
        },
        { header: '學期課號', dataIndex: 'semcourseid', width: 120, hidden: true },
        { header: '來源課號', dataIndex: 'courseid', width: 120, hidden: true },
        { header: '課程名稱', dataIndex: 'semcoursename', flex: 1 },
		{ header: '修課類別', dataIndex: 'coursetypename', width: 60, hidden: true},
		{ header: '修課院別', dataIndex: 'collegeid', width: 60, hidden: true},
		{ header: '必選修', dataIndex: 'choose', width: 60, hidden: true},
		{ header: '學分', dataIndex: 'credit', width: 40, hidden: false},
		{ header: '開課系所', dataIndex: 'unitname', width: 60, hidden: false},
		{ header: '開課班級', dataIndex: 'classname', width: 110, hidden: false},
        { header: '教師', dataIndex: 'teachername', width: 60 },
        { header: '星期/節', dataIndex: 'coursetime_view', width: 80 },
        { header: '上課地點', dataIndex: 'roomname', width: 60 },
        //{ header: '已選', dataIndex: 'selectedcount', width: 50 },
        { header: '級別', dataIndex: 'englevel', width: 40, hidden: true },
        //{ header: '年級', dataIndex: 'grade', width: 50, hidden: true},
        { header: '上限', dataIndex: 'maxcount', width: 40 }
        //{ header: '時數', dataIndex: 'semilarhr', width: 40, hidden: false}
    ]
});

Ext.define('Module.SchoolCourse.RegisterCourse.Grid2', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-RegisterCourse-Grid2',
    store: 'SchoolCourse-Store2',
    viewConfig: {
        plugins: {
            ddGroup: 'grid2-group',
            ptype: 'gridviewdragdrop',
            enableDrop: true
        },
        listeners: {
            drop: function(node, data, overModel, dropPosition, eOpts) {
                var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
                store2.generateSerialno();
                //store2.each(function(record) {
                //    record.set('serialno', store2.indexOf(record)+1);
                //});
                //store2.sort('serialno', 'ASC');
            }
        }
    },
    columns: [
        { 
            header: '移除',
            xtype: 'actioncolumn',
            width: 50,
            hideable: false,
            sortable: false,
            align: 'center',
            style: {cursor: 'hand'},
            items: [{
                icon: __SILK_ICONS_URL + 'delete.png',
                tooltip: '移除',
                handler: function(grid, rowIndex, colIndex) {
                    var store1 = Ext.data.StoreManager.lookup('SchoolCourse-Store1');
                    var store2 = grid.getStore();
                    var record = store2.getAt(rowIndex);
                    
                    Ext.MessageBox.confirm(
                        '移除候選區課程',
                        '<span class="portal-message">此動作將會移除候選區課程<strong>'+record.get('semcoursename')+'</strong>！</span>',
                        function (btn, text) {
                            if (btn=='yes') {
                                //將選課資料移到待選區
                                store2.removeAt(rowIndex);
                                store2.generateSerialno();
                                store1.add(record);
                            }
                        }
                    );
                }
            }]
        },
        { header: '志願順序', dataIndex: 'serialno', width: 60, sortable: false },
        { header: '學期課號', dataIndex: 'semcourseid', width: 120, hidden: true, sortable: false },
        { header: '來源課號', dataIndex: 'courseid', width: 120, hidden: true, sortable: false },
        { header: '課程名稱', dataIndex: 'semcoursename', flex: 1, sortable: false },
		{ header: '學分', dataIndex: 'credit', width: 40, hidden: false},
		{ header: '開課系所', dataIndex: 'unitname', width: 60, hidden: false},
		{ header: '開課班級', dataIndex: 'classname', width: 110, hidden: false},
        { header: '教師', dataIndex: 'teachername', width: 80, sortable: false },
        { header: '星期/節', dataIndex: 'coursetime_view', width: 100, sortable: false },
        { header: '上課地點', dataIndex: 'roomname', sortable: false },
        //{ header: '已選', dataIndex: 'selectedcount', width: 50, sortable: false },
        { header: '上限', dataIndex: 'maxcount', width: 50, sortable: false },
		//{ header: '年級', dataIndex: 'grade', width: 50, hidden: true},
        { header: '級別', dataIndex: 'englevel', width: 50, hidden: true, sortable: false }
    ]
});

var __createFilterHandler = function(code, text) {
    return function(button, e) {
        button.toggle(true);
		
		var grade = this.up('panel').getComponent('filterbar').getComponent('grade-filter').getValue(); //課程名稱
		var unitid = this.up('panel').getComponent('filterbar').getComponent('unitid-filter').getValue(); //課程名稱
		var semcoursename = this.up('panel').getComponent('filterbar').getComponent('semcoursename-filter').getValue(); //課程名稱
		var collegeid = this.up('panel').getComponent('filterbar').getComponent('college-filter').getValue(); //課程名稱
		
		//專業選修的預設條件為該系統該年級
		if (code == '5-2') {			
			unitid = ClientSession.user.unitid;
			collegeid = ClientSession.user.collegeid;
			grade = ClientSession.user.grade;
			this.up('panel').getComponent('filterbar').getComponent('unitid-filter').setValue(unitid); //課程名稱
			this.up('panel').getComponent('filterbar').getComponent('grade-filter').setValue(grade); //課程名稱
		}
		if (code == '3-2') {			
			unitid = '';
			collegeid = ClientSession.user.collegeid;
			grade = '';
			this.up('panel').getComponent('filterbar').getComponent('unitid-filter').setValue(unitid); //課程名稱
			this.up('panel').getComponent('filterbar').getComponent('grade-filter').setValue(grade); //課程名稱
		}
		
        changeFilterHandler(code, {
			collegeid: collegeid,
			unitid: unitid,
			grade: grade,
			semcoursename: semcoursename
		});

        //通識特別處理：學門領域下拉選單啟用
        var cmp = this.up('panel').getComponent('filterbar').getComponent('gpid-filter');
        if (cmp) {
            cmp.setVisible(code == '1-1' || code == '1-2');
        }

        //切換[英文]顯示級別欄位
        //this.up('panel').getComponent('grid1').getView().getHeaderCt().getHeaderAtIndex(9).setVisible(code=='7');
        //this.up('panel').getComponent('grid2').getView().getHeaderCt().getHeaderAtIndex(9).setVisible(code=='7');
    };
};

var __queryByFilters = function(toolbar) {
    //取得勾選的星期資料（陣列）
    var weekdays = toolbar.getComponent('week-filter').getValue().days;

    //取得勾選的單位資料（陣列）
    var depttypes = toolbar.getComponent('dept-filter').getValue().types;

    //學門領域
    var gpid = toolbar.getComponent('gpid-filter').getValue();

    //年級下拉清單值
    var grade = toolbar.getComponent('grade-filter').getValue();

    //系所下拉清單值
    var unitid = toolbar.getComponent('unitid-filter').getValue();

    //全系所（學院）
    var college = toolbar.getComponent('college-filter').getValue();

    //課程名稱
    var semcoursename = toolbar.getComponent('semcoursename-filter').getValue();

    //重新篩選查詢
    changeFilterHandler(null, {
        weekdays: weekdays,
        depttypes: depttypes,
        gpid: gpid,
        semcoursename: semcoursename,
        grade: grade,
        unitid: unitid,
        college: college
    });

    //取消左方課程清單的選擇項目
    toolbar.up('panel').getComponent('grid1a').getSelectionModel().deselectAll();
};

Ext.define('Module.SchoolCourse.RegisterCourse.MainPanel', {
    extend: 'Ext.Panel',
    frame: false,
    closable: true,
    icon: __SILK_ICONS_URL + 'application_view_columns.png',
    title: '加選 - 登記',
    layout: 'border',
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: [{
            xtype: 'button',
            icon: __SILK_ICONS_URL + 'bullet_green.png',
            text: '通識必修',
            hidden: true,
            toggleGroup: 'grid1-filter',
            handler: __createFilterHandler('1-1', '通識必修...')
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL + 'bullet_green.png',
            text: '通識選修',
            hidden: true,
            toggleGroup: 'grid1-filter',
            pressed: false,
            handler: __createFilterHandler('1-2', '通識選修限制：1.畢業前必須修完五大領域。2.已修過領域不顯示。3.每人只能選一科。')
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL + 'bullet_green.png',
            text: '體育課程',
            hidden: true,
            toggleGroup: 'grid1-filter',
            handler: __createFilterHandler('2', '體育選修...')
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL + 'bullet_green.png',
            text: '院訂選修',
			pressed: true,
            hidden: false,
            toggleGroup: 'grid1-filter',
            handler: __createFilterHandler('3-2', '院訂選修...')
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL + 'bullet_green.png',
            text: '軍訓課程',
            hidden: true,
            toggleGroup: 'grid1-filter',
            handler: __createFilterHandler('4', '軍訓課程...')
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL + 'bullet_green.png',
            text: '專業必修',
            hidden: true,
            toggleGroup: 'grid1-filter',
            handler: __createFilterHandler('5-1', '專業必修...')
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL + 'bullet_green.png',
            text: '專業選修',			
            hidden: false,
            toggleGroup: 'grid1-filter',
            handler: __createFilterHandler('5-2', '專業選修...')
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL + 'bullet_green.png',
            text: '英文課程',
            hidden: true,
            toggleGroup: 'grid1-filter',
            handler: __createFilterHandler('7', '英文課程...')
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL + 'bullet_green.png',
            text: '服務教育',
            hidden: true,
            toggleGroup: 'grid1-filter',
            handler: __createFilterHandler('8', '服務教育...')
        }, {
            xtype: 'tbtext',
            text: '最低學分/最高學分：',
            hidden: true
        }]
    }, {
        xtype: 'toolbar',
        dock: 'top',
        itemId: 'filterbar',
        items: [{
            xtype: 'combo',
            itemId: 'unitid-filter',
            disabled: false,
            hidden: false,
            width: 200,
            store: {
                fields: ['unitid', 'unitname'],
                data : ClientSession.myunits
            },
            queryMode: 'local',
            displayField: 'unitname',
            valueField: 'unitid',
            emptyText: '系所',
            value: '',
            allowBlank: true,
            fieldLabel: '系所',
            labelAlign: 'right',
            labelWidth: 40,
            listeners: {
                change: function(field, newValue, oldValue, eOpts) {
                    __queryByFilters(this.up('toolbar'));
                }
            }
        }, {
            xtype: 'checkbox',
            boxLabel: '全系所',
            itemId: 'college-filter',
            checked: false,
            hidden: true,
            handler: function(checkbox, checked) {
                this.up('toolbar').getComponent('unitid-filter').setDisabled(checked);
                __queryByFilters(this.up('toolbar'));
            }
        }, {
            xtype: 'combo',
            itemId: 'grade-filter',
            disabled: false,
            hidden: false,
            width: 150,
            store: {
                fields: ['value', 'display'],
                data : [
                    {value: '', display: '全年級'},
                    {value: '1', display: '一'},
                    {value: '2', display: '二'},
                    {value: '3', display: '三'},
                    {value: '4', display: '四'},
                    {value: '5', display: '五'}
                ]
            },
            queryMode: 'local',
            displayField: 'display',
            valueField: 'value',
            emptyText: '年級',
            value: '',
            allowBlank: false,
            fieldLabel: '年級',
            labelAlign: 'right',
            labelWidth: 40,
            listeners: {
                change: function(field, newValue, oldValue, eOpts) {
                    __queryByFilters(this.up('toolbar'));
                }
            }
        }, {
            xtype: 'combo',
            itemId: 'gpid-filter',
            disabled: false,
            hidden: true,
            store: {
                fields: ['value', 'display'],
                data : [
                    {value: '', display: '- 全部顯示 -'},
                    {value: 'G00001', display: '人文藝術'},
                    {value: 'G00002', display: '社會科學'},
                    {value: 'G00003', display: '自然科學'},
                    {value: 'G00004', display: '生命倫理與環境關懷'},
                    {value: 'G00005', display: '生活應用'}
                ]
            },
            queryMode: 'local',
            displayField: 'display',
            valueField: 'value',
            emptyText: '學門領域',
            allowBlank: true,
            listeners: {
                change: function(field, newValue, oldValue, eOpts) {
                    __queryByFilters(this.up('toolbar'));
                }
            }
        }, {
            xtype: 'checkboxgroup',
            itemId: 'dept-filter',
            disabled: false,
            hidden: true,
            width: 220,
            items: [
                {xtype: 'checkbox', boxLabel: '全校', name: 'types', inputValue: 'all', checked: false},
                {xtype: 'checkbox', boxLabel: '跨部', name: 'types', inputValue: 'studytype', checked: false},
                {xtype: 'checkbox', boxLabel: '院', name: 'types', inputValue: 'collegeid', checked: false},
                {xtype: 'checkbox', boxLabel: '系所', name: 'types', inputValue: 'unitid', checked: false}
            ]
        }, {
            xtype: 'checkboxgroup',
            itemId: 'week-filter',
            fieldLabel: '星期',
            labelAlign: 'right',
            labelWidth: 30,
            width: 320,
            hidden: true,
            items: [
                { xtype: 'checkbox', boxLabel: '全時段', name: 'days', inputValue: 0, checked: true, width: 60 },
                { xtype: 'checkbox', boxLabel: '一', name: 'days', inputValue: 1, checked: false },
                { xtype: 'checkbox', boxLabel: '二', name: 'days', inputValue: 2, checked: false },
                { xtype: 'checkbox', boxLabel: '三', name: 'days', inputValue: 3, checked: false },
                { xtype: 'checkbox', boxLabel: '四', name: 'days', inputValue: 4, checked: false },
                { xtype: 'checkbox', boxLabel: '五', name: 'days', inputValue: 5, checked: false },
                { xtype: 'checkbox', boxLabel: '六', name: 'days', inputValue: 6, checked: false },
                { xtype: 'checkbox', boxLabel: '日', name: 'days', inputValue: 7, checked: false }
            ]
        }, {
            xtype: 'textfield',
            itemId: 'semcoursename-filter',
            fieldLabel: '課程名稱',
            labelAlign: 'right',
            labelWidth: 80,
            text: 'test'
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL + 'magnifier.png',
            tooltip: '加選',
            text: '查詢',
            itemId: 'query-button',
            handler: function() {
                __queryByFilters(this.up('toolbar'));
            }
        }]
    }],
    items: [{
        xtype: 'SchoolCourse-RegisterCourse-Grid1a',
        itemId: 'grid1a',
        region: 'west',
        border: true,
        resizable: true,
        autoScroll: true,
        width: 200,
        minWidth: 150,
        maxWidth: 250
    }, {
        xtype: 'SchoolCourse-RegisterCourse-Grid1',
        itemId: 'grid1',
        border: true,
        resizable: false,
        autoScroll: true,
        region: 'center'
    }, {
        xtype: 'SchoolCourse-RegisterCourse-Grid2',
        itemId: 'grid2',
        border: true,
        resizable: true,
        region: 'south',
        title: '',
        icon: __SILK_ICONS_URL + 'cart_add.png',
        autoScroll: true,
        height: 150,
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            ui: 'default',
            itemId: 'footbar',
            items: [{
                xtype: 'tbtext',
                text: '候選區 <small>（滑鼠左鍵按下可拖曳調整志願順序）</small>'
            }, '-', {
                xtype: 'button',
                icon: __SILK_ICONS_URL + 'accept.png',
                text: '<b><font size="3" color="#E68E36">確定登記</font></b>',
                scale: 'medium',
                handler: function() {
                    var courses = new Array();

                    var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
                    var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
					var store4 = Ext.data.StoreManager.lookup('SchoolCourse-Store4');

                    store2.each(function(record) {
                        courses.push(record.get('semcourseid') + ':' + record.get('courseid') + ':' + record.get('serialno'));
                    });

                    if (courses.length == 0) {
                        Ext.Msg.alert('沒有候選課程', '請從待選區選擇要加入候選的課程！');
                    }
                    else {
                        Ext.Msg.wait('正在處理加選...');
                        Ext.Ajax.request({
                            url: __SERVICE_URL + '/service/selectcourse.json',
                            method: 'POST',
                            params: {
                                courses: Ext.Array.from(courses).join(',')
                            },
                            success: function(response, opts) {
                                Ext.Msg.hide();

                                var obj = Ext.JSON.decode(response.responseText);

                                //Ext.Msg.alert("伺服器回應", response.responseText);

                                if (obj.success) {
                                    store2.removeAll();

                                    //重新整理已選清單
                                    Ext.defer(function() {
                                        store3.load();
                                    }, 1);

									store4.generateData();

                                    Ext.getCmp('notifier').setText('<font color="green">選課登記完成</font>');
                                }
                                else {
                                    Ext.getCmp('notifier').setText('<font color="red">選課登記失敗，請重新操作一次</font>');

                                    //伺服器session.user資料遺失則提示登出
                                    if (obj.logout) {
    									Ext.Msg.alert('已遺失資料', '學生資料無法讀取，按確定後重新登入選課系統。', function(btn) {
                                            if (btn=='ok') {
                                                //強制登出
                                                logout_url = (ClientSession.admin == 'admin') ? encodeURIComponent('/' + ClientSession.admin) : encodeURIComponent('/' + ClientSession.mode);
												location.href='/logout?redirect='+ logout_url;
                                            }
                                        });
                                    }
                                }
                            },
                            failure: function(response, opts) {
                                Ext.Msg.hide();

                                Ext.Msg.alert("伺服器回應", response.responseText);

                                Ext.getCmp('notifier').setText('<font color="red">選課登記失敗</font>');
                            }
                        });
                    }
                }
            }, {
                icon: __SILK_ICONS_URL + 'lightning_add.png',
                text: '快速登記',
                scale: 'medium',
                hidden: true,
                handler: function() {
                    Ext.Msg.prompt(
                        '加入課程候選區',
                        '<span class="portal-message">請輸入學期課號，將會快速判斷您是否可選這堂課，並放入課程候選區！！<br/>&nbsp;<br/>學期課號：</span>',
                        function(btn, text){
                            if (btn == 'ok'){
                                //設定選課來源資料
                                var store1 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
                                var rowIndex = store1.findBy(function(record, id) {
                                    return (record.get('semcourseid')==text);
                                });
                                if (rowIndex > -1) {
                                    var record = store1.getAt(rowIndex);
                                    Ext.Msg.confirm(
                                        '符合選課條件',
                                        '<span class="portal-message">課程：<strong>'+record.get('semcoursename')+'</strong>已放入候選區！<br/>請按<strong style="color:red">確定加選</strong>按鈕送出所有候選區資料！</span>',
                                        function (btn, text) {
                                            if (btn=='yes') {
                                                //將選課資料移到待選區
                                                var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
                                                store2.add(record);
                                                store2.generateSerialno();
                                            }
                                        }
                                    );
                                }
                                else {
                                    Ext.Msg.alert('沒有符合的課程', '您輸入的學期課號無法找到符合選課條件！');
                                }
                            }
                        }
                    );
                }
            }, {
                icon: __SILK_ICONS_URL + 'cart_delete.png',
                text: '清除候選區',
                scale: 'medium',
                handler: function() {
                    var filterbar = this.up('panel').up('panel').getComponent('filterbar');

                    Ext.Msg.confirm(
                        '清除確認',
                        '請按「是」將候選區資料清空；按「否」取消動作。',
                        function(btn, text){
                            if (btn == 'yes'){
                                var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
                                store2.removeAll();

                                //重新整理待選區
                                __queryByFilters(filterbar);
                            }
                        }
                    );
                }
            }, {
                xtype: 'tbtext',
                itemId: 'label-status',
                text: '顯示全部',
                hidden: true
            }]
        }]
    }]
});

/**
 * 模組主程式定義區
 */
Ext.define('Module.SchoolCourse.RegisterCourse', {
    extend: 'Module.Prototype.Module',
    statics: {
        _previous: null
    },
    moduleLoad: function() {
        var thisModule = this;

        //將目前的模組記錄在 URL HASH
    	window.location.hash = '#'+this.$className;
        
        //顯示提示訊息
        Ext.getCmp('notifier').setText('<font color="blue">需點擊確定登記按鈕，候選課程才會加到待分發課程清單</font>');

        //加入新畫面到 Tab 視窗
        var tabpanel = Ext.getCmp('portal-tabpanel');

        //判斷 Panel 是否已經存在 Tab（建立或切換）
        var panel = Module.SchoolCourse.RegisterCourse._previous;

        if (!panel) {
            //使用新頁籤建立主畫面
            //tabpanel.setLoading('讀取中');
            var panel = Ext.create('Module.SchoolCourse.RegisterCourse.MainPanel', {
                listeners: {
                    beforeclose: function(panel, eOpts) {

                        //候選區有資料禁止關閉 Tab 視窗
                        var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
                        if (store2.count() > 0) {
                            Ext.Msg.alert('無法關閉', '候選區尚有課程資料！');
                            return false;
                        }

                        thisModule.moduleUnload();
                        Module.SchoolCourse.RegisterCourse._previous = null;
                    },
                    afterrender: function(panel, eOpts) {
                        //載入資料（帶預設值）
                        //changeFilterHandler('3');
                        changeFilterHandler('3-2', {
                            grade: '',
                            unitid: ''
                        });
                    },
                    tabshow: function(panel) {
                        // tab 切換重新查詢
                        var filterbar = this.getComponent('filterbar');
                        __queryByFilters(filterbar);
                    }
                }
            });

            //新增主畫面到 Tab
            tabpanel.add(panel);

            //記錄已建立的新 Panel
            Module.SchoolCourse.RegisterCourse._previous = panel;
        }

        //切換到 Panel
        tabpanel.setActiveTab(panel);
    },
    moduleUnload: function() {
        //從 URL HASH 移除目前的模組記錄
        if (window.location.hash == '#'+this.$className) {
            window.location.hash = '';
        }
    }
});
Ext.define('Module.SchoolCourse.ShowCourse.Grid1', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-ShowCourse-Grid1',
    store: 'SchoolCourse-Store4',
    loadMask: true,
    disableSelection: true,
    columnLines: true,
    rowLines: true,
    invalidateScrollerOnRefresh: true,
    viewConfig: {
        trackOver: false
    },
    listeners: {
        render: function(grid) {
        }
    },
    columns: {
        items: [
            { header: '節次', dataIndex: 'classno', width: 60, flex: false, align: 'center' },
            { header: '星期一', dataIndex: 'day1' },
            { header: '星期二', dataIndex: 'day2' },
            { header: '星期三', dataIndex: 'day3' },
            { header: '星期四', dataIndex: 'day4' },
            { header: '星期五', dataIndex: 'day5' },
            { header: '星期六', dataIndex: 'day6' },
            { header: '星期日', dataIndex: 'day7' }
        ],
        defaults: {
            tdCls: 'clearlook-grid-cell',
            sortable: false,
            flex: true
        }
    }
});

Ext.define('Module.SchoolCourse.ShowCourse.MainPanel', {
    extend: 'Ext.Panel',
    frame: false,
    closable: true,
    icon: __SILK_ICONS_URL + 'application_view_columns.png',
    title: '我的課程清單',
    layout: 'border',
    /*bodyStyle: 'padding: 10px; background: white',
    autoScroll: true,
    autoLoad: {
        url: 'table.html',
        scripts: false
    }*/
    tbar: [{
        xtype: 'button',
        icon: __SILK_ICONS_URL + 'arrow_rotate_clockwise.png',
        text: '重新整理',
        handler: function(button, e) {
            var store4 = Ext.data.StoreManager.lookup('SchoolCourse-Store4');
            store4.generateData();
        }
    }, '-',{
                xtype: 'tbtext',
                text: '。黑色：配課<font color="blue">。藍色：登記</font>  <font color="red">。紅色：即選即上</font>'
    }],
    items: [{
        xtype: 'SchoolCourse-ShowCourse-Grid1',
        itemId: 'grid1',
        border: true,
        region: 'center',
        autoHeight: true,
        autoScroll: true
    }]
});

/**
 * 模組主程式定義區
 */
Ext.define('Module.SchoolCourse.ShowCourse', {
    extend: 'Module.Prototype.Module',
    statics: {
        _previous: null
    },
    moduleLoad: function() {
        var thisModule = this;

        //將目前的模組記錄在 URL HASH
    	window.location.hash = '#'+this.$className;
        
        var tabpanel = Ext.getCmp('portal-tabpanel');

        //判斷 Panel 是否已經存在 Tab（建立或切換）
        var panel = Module.SchoolCourse.ShowCourse._previous;

        if (!panel) {
            //使用新頁籤建立主畫面
            //tabpanel.setLoading('讀取中');
            var panel = Ext.create('Module.SchoolCourse.ShowCourse.MainPanel', {
                listeners: {
                    beforeclose: function(panel, eOpts) {
                        thisModule.moduleUnload();
                        Module.SchoolCourse.ShowCourse._previous = null;
                    },
                    afterrender: function(panel, eOpts) {
                        Ext.defer(function() {
                            var store4 = Ext.data.StoreManager.lookup('SchoolCourse-Store4');
                            store4.generateData();
                        }, 100);
                    }
                }
            });

            //新增主畫面到 Tab
            tabpanel.add(panel);

            //記錄已建立的新 Panel
            Module.SchoolCourse.ShowCourse._previous = panel;
        }

        //切換到 Panel
        tabpanel.setActiveTab(panel);
    },
    moduleUnload: function() {
        //從 URL HASH 移除目前的模組記錄
        if (window.location.hash == '#'+this.$className) {
            window.location.hash = '';
        }
    }
});
Ext.define('Module.SchoolCourse.ShowCourseReal.Grid1', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-ShowCourseReal-Grid1',
    store: 'SchoolCourse-StoreReal4',
    loadMask: true,
    disableSelection: true,
    columnLines: true,
    rowLines: true,
    invalidateScrollerOnRefresh: true,
    viewConfig: {
        trackOver: false
    },
    listeners: {
        render: function(grid) {
        }
    },
    columns: {
        items: [
            { header: '節次', dataIndex: 'classno', width: 60, flex: false, align: 'center' },
            { header: '星期一', dataIndex: 'day1' },
            { header: '星期二', dataIndex: 'day2' },
            { header: '星期三', dataIndex: 'day3' },
            { header: '星期四', dataIndex: 'day4' },
            { header: '星期五', dataIndex: 'day5' },
            { header: '星期六', dataIndex: 'day6' },
            { header: '星期日', dataIndex: 'day7' }
        ],
        defaults: {
            tdCls: 'clearlook-grid-cell',
            sortable: false,
            flex: true
        }
    }
});

Ext.define('Module.SchoolCourse.ShowCourseReal.MainPanel', {
    extend: 'Ext.Panel',
    frame: false,
    closable: true,
    icon: __SILK_ICONS_URL + 'application_view_columns.png',
    title: '我的課程清單',
    layout: 'border',
    /*bodyStyle: 'padding: 10px; background: white',
    autoScroll: true,
    autoLoad: {
        url: 'table.html',
        scripts: false
    }*/
    tbar: [{
        xtype: 'button',
        icon: __SILK_ICONS_URL + 'arrow_rotate_clockwise.png',
        text: '重新整理',
        handler: function(button, e) {
            var store4 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal4');
            store4.generateData();
        }
    }, '-',{
                xtype: 'tbtext',
                text: '。黑色：配課<font color="blue">。藍色：登記</font>  <font color="red">。紅色：即選即上</font>'
    }],
    items: [{
        xtype: 'SchoolCourse-ShowCourseReal-Grid1',
        itemId: 'grid1',
        border: true,
        region: 'center',
        autoHeight: true,
        autoScroll: true
    }]
});

/**
 * 模組主程式定義區
 */
Ext.define('Module.SchoolCourse.ShowCourseReal', {
    extend: 'Module.Prototype.Module',
    statics: {
        _previous: null
    },
    moduleLoad: function() {
        var thisModule = this;

        //將目前的模組記錄在 URL HASH
    	window.location.hash = '#'+this.$className;
        
        var tabpanel = Ext.getCmp('portal-tabpanel');

        //判斷 Panel 是否已經存在 Tab（建立或切換）
        var panel = Module.SchoolCourse.ShowCourseReal._previous;

        if (!panel) {
            //使用新頁籤建立主畫面
            //tabpanel.setLoading('讀取中');
            var panel = Ext.create('Module.SchoolCourse.ShowCourseReal.MainPanel', {
                listeners: {
                    beforeclose: function(panel, eOpts) {
                        thisModule.moduleUnload();
                        Module.SchoolCourse.ShowCourseReal._previous = null;
                    },
                    afterrender: function(panel, eOpts) {
                        Ext.defer(function() {
                            var store4 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal4');
                            store4.generateData();
                        }, 100);
                    }
                }
            });

            //新增主畫面到 Tab
            tabpanel.add(panel);

            //記錄已建立的新 Panel
            Module.SchoolCourse.ShowCourseReal._previous = panel;
        }

        //切換到 Panel
        tabpanel.setActiveTab(panel);
    },
    moduleUnload: function() {
        //從 URL HASH 移除目前的模組記錄
        if (window.location.hash == '#'+this.$className) {
            window.location.hash = '';
        }
    }
});
/**
 * 「退選」功能模組
 */
Ext.define('Module.SchoolCourse.UnregisterCourse.Grid1', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-UnregisterCourse-Grid1',
    store: 'SchoolCourse-StoreReal3',
    loadMask: true,
    disableSelection: false,
    invalidateScrollerOnRefresh: true,
    viewConfig: {
        trackOver: false
    },
    listeners: {
        render: function(grid) {
            //載入資料
            //grid.body.mask('讀取中');
        }
    },
    columns: [
        {
            header: '退選',
            xtype: 'actioncolumn',
            width: 50,
            hideable: false,
            sortable: false,
            align: 'center',
            items: [{
                icon: __SILK_ICONS_URL+'delete.png',
                text: 'test',
                xtype: 'button',
                tooltip: '取消選擇的課程',
                handler: function(grid, rowIndex, colIndex) {
                    //設定選課來源資料
                    var store3 = grid.getStore();
                    var record = store3.getAt(rowIndex);

                    Ext.MessageBox.confirm(
                        '取消確認',
                        '<span class="portal-message">請按「是」取消<strong>'+record.get('semcoursename')+'</strong>課程！</span>',
                        function (btn, text) {
                            if (btn=='yes') {

                                var courses = new Array();
                                courses.push(record.get('semcourseid') + ':' + record.get('courseid'));

                                //將選課資料移到待選區
                                Ext.Msg.wait('正在取消課程...');
                                Ext.Ajax.request({
                                    url: __SERVICE_URL + '/service/cancelcourse.json',
                                    method: 'POST',
                                    params: {
                                        courses: Ext.Array.from(courses).join(',')
                                    },
                                    success: function(response) {
                                        Ext.Msg.hide();
                                        var obj = Ext.JSON.decode(response.responseText);
                                        
                                        //Ext.Msg.alert("伺服器回應", obj.success);

                                        if (obj.success) {
                                            store3.load(); //更新退選區
                                        } else {
											Ext.getCmp('notifier').setText('<font color="red">選課退選失敗，請重新操作一次</font>');
											alert('學生資料無法讀取，按確定後重新登入選課系統。');
											//載入主畫面
											window.location = '/login';
										}
                                    }
                                });
                            }
                        }
                    );
                }
            }]  
        },
        { header: '學期課號', dataIndex: 'semcourseid', width: 120, hidden: true},
        { header: '來源課號', dataIndex: 'courseid', width: 120, hidden: true },
        { header: '課程名稱', dataIndex: 'semcoursename', flex: 1 },
		{ header: '學分', dataIndex: 'credit', width: 40 },
		{ header: '開課系所', dataIndex: 'unitname', width: 90 },
        { header: '教師', dataIndex: 'teachername' },		
        { header: '星期/節', dataIndex: 'coursetime_view' },
        { header: '上課地點', dataIndex: 'roomname' },
        { header: '已選', dataIndex: 'selectedcount', width: 50 },
        { header: '上限', dataIndex: 'maxcount', width: 50 }
    ]
});

Ext.define('Module.SchoolCourse.UnregisterCourse.MainPanel', {
    extend: 'Ext.Panel',
    frame: false,
    closable: true,
    title: '退選',
    icon: __SILK_ICONS_URL + 'application_view_columns.png',
    layout: 'border',
    tbar: [{
        xtype: 'button',
        icon: __SILK_ICONS_URL + 'arrow_rotate_clockwise.png',
        text: '重新整理',
		scale: 'medium',
        handler: function(button, e) {
            Ext.defer(function() {
                var store3 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal3');
                store3.load();
            }, 1);
        }
    }],
    items: [{
        xtype: 'SchoolCourse-UnregisterCourse-Grid1',
        itemId: 'grid1',
        border: true,
        region: 'center',
        autoHeight: true,
        autoScroll: true,
    }],
    bbar: [{
        xtype: 'tbtext',
        text: ''
    }]
});

/**
 * 模組主程式定義區
 */
Ext.define('Module.SchoolCourse.UnregisterCourse', {
    extend: 'Module.Prototype.Module',
    statics: {
        _previous: null
    },
    moduleLoad: function() {
        var thisModule = this;
        
        //將目前的模組記錄在 URL HASH
    	window.location.hash = '#'+this.$className;

        var tabpanel = Ext.getCmp('portal-tabpanel');

        //判斷 Panel 是否已經存在 Tab（建立或切換）
        var panel = Module.SchoolCourse.UnregisterCourse._previous;

        if (!panel) {
            //使用新頁籤建立主畫面
            //tabpanel.setLoading('讀取中');
            var panel = Ext.create('Module.SchoolCourse.UnregisterCourse.MainPanel', {
                listeners: {
                    beforeclose: function(panel, eOpts) {
                        thisModule.moduleUnload();
                        Module.SchoolCourse.UnregisterCourse._previous = null;
                    },
                    afterrender: function(panel, eOpts) {
                        //載入資料
                        Ext.defer(function() {
                            var store3 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal3');
                            store3.load();
                        }, 100);
                    }
                }
            });

            //新增主畫面到 Tab
            tabpanel.add(panel);

            //記錄已建立的新 Panel
            Module.SchoolCourse.UnregisterCourse._previous = panel;
        }

        //切換到 Panel
        tabpanel.setActiveTab(panel);
    },
    moduleUnload: function() {
        //從 URL HASH 移除目前的模組記錄
        if (window.location.hash == '#'+this.$className) {
            window.location.hash = '';
        }
    }
});
/**
 * Package Manager
 */
Ext.define('Module.SchoolCourse.Package', {
	extend: 'Module.Prototype.Package',
	requires: [
		'Module.SchoolCourse.Store0',
		'Module.SchoolCourse.Store1',
		'Module.SchoolCourse.Store1a',
		'Module.SchoolCourse.Store2',
		'Module.SchoolCourse.Store3',
		'Module.SchoolCourse.Store4',
		'Module.SchoolCourse.Store5',
		'Module.SchoolCourse.StoreReal1',
		'Module.SchoolCourse.StoreReal1a',
		'Module.SchoolCourse.StoreReal2',
		'Module.SchoolCourse.StoreReal3',
		'Module.SchoolCourse.StoreReal4',
		'Module.SchoolCourse.StoreReal5',
		'Module.SchoolCourse.BookingCourse',
		'Module.SchoolCourse.RealtimeCourse',
		'Module.SchoolCourse.RegisterCourse',
		'Module.SchoolCourse.ShowCourse',
		'Module.SchoolCourse.ShowCourseReal',
		'Module.SchoolCourse.UnregisterCourse'
	],
	packageInit: function() {
		this.requireStore('Module.SchoolCourse.Store0', 'SchoolCourse-Store0');
		this.requireStore('Module.SchoolCourse.Store1', 'SchoolCourse-Store1');
		this.requireStore('Module.SchoolCourse.Store1a', 'SchoolCourse-Store1a');
		this.requireStore('Module.SchoolCourse.Store2', 'SchoolCourse-Store2');
		this.requireStore('Module.SchoolCourse.Store3', 'SchoolCourse-Store3');
		this.requireStore('Module.SchoolCourse.Store4', 'SchoolCourse-Store4');
		this.requireStore('Module.SchoolCourse.Store5', 'SchoolCourse-Store5');
		this.requireStore('Module.SchoolCourse.StoreReal1', 'SchoolCourse-StoreReal1'); //即選即上_加選區
		this.requireStore('Module.SchoolCourse.StoreReal1a', 'SchoolCourse-StoreReal1a'); //即選即上_加選區左側
		this.requireStore('Module.SchoolCourse.StoreReal2', 'SchoolCourse-StoreReal2'); //即選即上_候選
		this.requireStore('Module.SchoolCourse.StoreReal3', 'SchoolCourse-StoreReal3'); //即選即上_退選區
		this.requireStore('Module.SchoolCourse.StoreReal4', 'SchoolCourse-StoreReal4'); //即選即上_課表
		this.requireStore('Module.SchoolCourse.StoreReal5', 'SchoolCourse-StoreReal5'); //即選即上_已選課程
	}
});





