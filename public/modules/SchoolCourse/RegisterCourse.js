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

    var weekdays = params.weekdays?params.weekdays:null;

    var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
    var store1 = Ext.data.StoreManager.lookup('SchoolCourse-Store1');
    var store1a = Ext.data.StoreManager.lookup('SchoolCourse-Store1a');

    store1.removeAll();
    //store1a.removeAll();

    Ext.defer(function() {
        store1a.filterBy(function(record) {
            return (record.get('coursetype')==val);
        });
    }, 100);

    Ext.defer(function() {
        var result = store0.queryBy(function(record) {
            if (record.get('coursetype')==val) {
                if (weekdays) {

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

                    var result = false;

                    Ext.Array.each(weekdays, function(item) {
                        if (weeksetup[item]) result = true;
                    });

                    return result;
                }

                return true;
            }
        });
        store1.loadRecords(result.items);
        store1.sort();
    }, 100);
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
        itemclick: function(grid, record, item, index, e, eOpts) {
            var store1 = Ext.data.StoreManager.lookup('SchoolCourse-Store1');
            store1.filterBy(function(record2) {
                return (record2.get('courseid')==record.get('courseid'));
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
            width: 50,
            hideable: false,
            sortable: false,
            align: 'center',
            items: [{
                icon: __SILK_ICONS_URL+'add.png',
                tooltip: '加選',
                getClass: function(value, metadata, record) {
                    return 'x-grid-center-icon';
                },
                handler: function(grid, rowIndex, colIndex) {
                    //設定選課來源資料
                    var store1 = grid.getStore();
                    var record = store1.getAt(rowIndex);

                    Ext.MessageBox.confirm(
                        '符合選課條件',
                        '<span class="portal-message">請按「是」將課程<strong>'+record.get('semcoursename')+'</strong>放入候選區！<br/>請按<strong style="color:red">確定加選</strong>按鈕送出所有候選區資料！</span>',
                        function (btn, text) {
                            if (btn=='yes') {
                                //將選課資料移到待選區
                                var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
                                store2.add(record);
                            }
                        }
                    );
                }
            }]  
        },
        { header: '學期課號', dataIndex: 'semcourseid', width: 120, hidden: true },
        { header: '來源課號', dataIndex: 'courseid', width: 120, hidden: true },
        { header: '課程名稱', dataIndex: 'semcoursename', flex: 1 },
        { header: '教師', dataIndex: 'teachername', width: 80 },
        { header: '星期/節', dataIndex: 'coursetime_view', width: 100 },
        { header: '上課地點', dataIndex: 'roomname' },
        { header: '已選', dataIndex: 'selectedcount', width: 50 },
        { header: '上限', dataIndex: 'maxcount', width: 50 }
    ]
});

Ext.define('Module.SchoolCourse.RegisterCourse.Grid2', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-RegisterCourse-Grid2',
    store: 'SchoolCourse-Store2',
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
                    var store2 = grid.getStore();
                    var record = store2.getAt(rowIndex);
                    
                    Ext.MessageBox.confirm(
                        '移除候選區課程',
                        '<span class="portal-message">此動作將會移除候選區課程<strong>'+record.get('semcoursename')+'</strong>！</span>',
                        function (btn, text) {
                            if (btn=='yes') {
                                //將選課資料移到待選區
                                store2.removeAt(rowIndex);
                                //changeFilterHandler();
                            }
                        }
                    );
                }
            }]
        },
        { header: '學期課號', dataIndex: 'semcourseid', width: 120, hidden: true },
        { header: '來源課號', dataIndex: 'courseid', width: 120, hidden: true },
        { header: '課程名稱', dataIndex: 'semcoursename', flex: 1 },
        { header: '教師', dataIndex: 'teachername', width: 80 },
        { header: '星期/節', dataIndex: 'coursetime_view', width: 100 },
        { header: '上課地點', dataIndex: 'roomname' },
        { header: '已選', dataIndex: 'selectedcount', width: 50 },
        { header: '上限', dataIndex: 'maxcount', width: 50 }
    ]
});

Ext.define('Module.SchoolCourse.RegisterCourse.Grid3', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-RegisterCourse-Grid3',
    store: Ext.data.StoreManager.lookup('SchoolCourse-Store3'),
    columns: [
        { header: '必修學分數', dataIndex: 'num1', sortable: false },
        { header: '必選的學分數', dataIndex: 'num2', sortable: false },
        { header: '選修的學分數', dataIndex: 'num3', sortable: false },
        { header: '最低學分數', dataIndex: 'num4', sortable: false },
        { header: '最高學分數', dataIndex: 'num5', sortable: false, flex: true }
    ]
});

Ext.define('Module.SchoolCourse.RegisterCourse.MainPanel', {
    extend: 'Ext.Panel',
    frame: false,
    closable: true,
    icon: __SILK_ICONS_URL+'application_view_columns.png',
    title: '加選 - 全校',
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
            handler: function(button, e) {
                button.toggle(true);
                changeFilterHandler('1');
                var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                label.setText('通識選修限制：1.畢業前必須修完五大領域。2.已修過領域不顯示。3.每人只能選一科。');
            }
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL+'bullet_green.png',
            text: '體育選修',
            toggleGroup: 'grid1-filter',
            handler: function(button, e) {
                button.toggle(true);
                changeFilterHandler('2');
                var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                label.setText('體育選修...');
            }
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL+'bullet_green.png',
            text: '院訂選修',
            toggleGroup: 'grid1-filter',
            handler: function(button, e) {
                button.toggle(true);
                changeFilterHandler('3');
                var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                label.setText('院訂選修...');
            }
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL+'bullet_green.png',
            text: '軍訓課程',
            toggleGroup: 'grid1-filter',
            handler: function(button, e) {
                button.toggle(true);
                changeFilterHandler('4');
                var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                label.setText('軍訓課程...');
            }
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL+'bullet_green.png',
            text: '專業課程',
            toggleGroup: 'grid1-filter',
            handler: function(button, e) {
                button.toggle(true);
                changeFilterHandler('5');
                var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                label.setText('專業課程...');
            }
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL+'bullet_green.png',
            text: '英文課程',
            toggleGroup: 'grid1-filter',
            handler: function(button, e) {
                button.toggle(true);
                changeFilterHandler('7');
                var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                label.setText('英文課程...');
            }
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL+'bullet_green.png',
            text: '服務教育',
            toggleGroup: 'grid1-filter',
            handler: function(button, e) {
                button.toggle(true);
                changeFilterHandler('8');
                var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                label.setText('服務教育...');
            }
        }, '-', {
            xtype: 'tbtext',
            text: '最低學分/最高學分：16學分/28學分'
        }]
    }, {
        xtype: 'toolbar',
        dock: 'top',
        items: [{
            xtype: 'checkboxgroup',
            width: 180,
            items: [{
                xtype: 'checkbox',
                boxLabel: '全校',
                name: 'password'
            }, {
                xtype: 'checkbox',
                boxLabel: '跨部',
                name: 'password'
            }, {
                xtype: 'checkbox',
                boxLabel: '院',
                name: 'password'
            }, {
                xtype: 'checkbox',
                boxLabel: '系所',
                name: 'studentno',
            }]
        }, {
            itemId: 'week-filter',
            xtype: 'checkboxgroup',
            fieldLabel: '星期',
            labelAlign: 'right',
            labelWidth: 30,
            width: 320,
            items: [
                { xtype: 'checkbox', boxLabel: '全時段', name: 'days', inputValue: 0, checked: true, width: 60 },
                { xtype: 'checkbox', boxLabel: '一', name: 'days', inputValue: 1, checked: true },
                { xtype: 'checkbox', boxLabel: '二', name: 'days', inputValue: 2, checked: true },
                { xtype: 'checkbox', boxLabel: '三', name: 'days', inputValue: 3, checked: true },
                { xtype: 'checkbox', boxLabel: '四', name: 'days', inputValue: 4, checked: true },
                { xtype: 'checkbox', boxLabel: '五', name: 'days', inputValue: 5, checked: true },
                { xtype: 'checkbox', boxLabel: '六', name: 'days', inputValue: 6, checked: true },
                { xtype: 'checkbox', boxLabel: '日', name: 'days', inputValue: 7, checked: true }
            ]
        }, '-', {
            xtype: 'button',
            icon: __SILK_ICONS_URL+'magnifier.png',
            tooltip: '加選',
            text: '查詢',
            handler: function() {
                var cbg = this.up('toolbar').getComponent('week-filter');

                //取得勾選的星期資料（陣列）
                var weekdays = cbg.getValue().days;

                //重新篩選查詢
                changeFilterHandler(null, {weekdays: weekdays});
            }
        }]
    }, {
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        itemId: 'footbar',
        items: [{
            icon: __SILK_ICONS_URL+'accept.png',
            text: '確定加選',
            handler: function() {
                var courses = new Array();

                var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
                var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');

                store2.each(function(record) {
                    courses.push(record.get('semcourseid') + ':' + record.get('courseid'));
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
                        success: function(response) {
                            Ext.Msg.hide();

                            var obj = Ext.JSON.decode(response.responseText);

                            Ext.Msg.alert("伺服器回應", response.responseText);

                            if (obj.success) {
                                store2.removeAll();
                                store3.load();
                            }
                        }
                    });
                }
            }
        }, {
            icon: __SILK_ICONS_URL+'lightning_add.png',
            text: '快速加選',
            handler: function() {
                Ext.Msg.prompt(
                    '加入課程候選區',
                    '<span class="portal-message">請輸入學期課號，將會快速判斷您是否可選這堂課，並放入課程候選區！！<br/>&nbsp;<br/>學期課號：</span>',
                    function(btn, text){
                        if (btn == 'ok'){
                            //設定選課來源資料
                            var store1 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
                            var rowIndex = store1.findBy(function(record, id) {
                                if (record.get('semcourseid')==text) {
                                    return true;
                                }
                                return false;
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
            text: '清除候選區'
        }, {
            xtype: 'tbtext',
            text: '必修/必選的學分數: 4 選修的學分數: 0'
        }, {
            xtype: 'tbtext',
            itemId: 'label-status',
            text: '顯示全部'
        }]
    }],
    items: [{
        xtype: 'SchoolCourse-RegisterCourse-Grid1a',
        itemId: 'grid1a',
        border: true,
        resizable: true,
        region: 'west',
        autoScroll: true,
        width: 180,
        margins: '5 0 0 5'
    }, {
        xtype: 'SchoolCourse-RegisterCourse-Grid1',
        itemId: 'grid1',
        border: true,
        resizable: true,
        region: 'center',
        autoScroll: true,
        margins: '5 5 0 5'
    }, {
        xtype: 'SchoolCourse-RegisterCourse-Grid2',
        itemId: 'grid2',
        border: true,
        resizable: true,
        region: 'south',
        title: '候選區',
        icon: __SILK_ICONS_URL+'cart_add.png',
        autoScroll: true,
        height: 150,
        margins: '5 5 5 5'
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
        
        var tabpanel = Ext.getCmp('portal-tabpanel');

        //判斷 Panel 是否已經存在 Tab（建立或切換）
        var panel = Module.SchoolCourse.RegisterCourse._previous;

        if (!panel) {
            //使用新頁籤建立主畫面
            //tabpanel.setLoading('讀取中');
            var panel = Ext.create('Module.SchoolCourse.RegisterCourse.MainPanel', {
                listeners: {
                    beforeclose: function(panel, eOpts) {
                        thisModule.moduleUnload();
                        Module.SchoolCourse.RegisterCourse._previous = null;
                    },
                    afterrender: function(panel, eOpts) {
                        //載入資料
                        changeFilterHandler('1');
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