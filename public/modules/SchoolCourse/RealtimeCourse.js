/**
 * 「加選 - 即選即上」功能模組
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

    var weekdays = params.weekdays?params.weekdays:null;
    var depttypes = params.depttypes?params.depttypes:null;
	var gpid = params.gpid?params.gpid:null;
    var semcoursename = params.semcoursename?params.semcoursename:null;

    var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
    var store1 = Ext.data.StoreManager.lookup('SchoolCourse-Store1');
    var store1a = Ext.data.StoreManager.lookup('SchoolCourse-Store1a');

    store1.removeAll();
    //store1a.removeAll();

    var __filter_proc = function(record) {
        var result = false;

        if (record.get('coursetype')==val) {
            result = true;

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
        store1a.filterBy(__filter_proc);
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

Ext.define('Module.SchoolCourse.RealtimeCourse.Grid1', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-RealtimeCourse-Grid1',
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
                icon: __SILK_ICONS_URL + 'add.png',
                tooltip: '加選',
                getClass: function(value, metadata, record) {
                    //如果課程已經在已選清單中，就不顯示加選按鈕
                    var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store-real3');
                    var record_semcourseid = record.get('semcourseid');
                    var exists = store3.find('semcourseid', record_semcourseid);
                    if (exists >= 0) {
                       return 'x-hide-display';
                    }
                    return 'x-grid-center-icon';
                },
                handler: function(view, rowIndex, colIndex, item, e) {
                    //設定選課來源資料
                    var store1 = view.getStore();
                    var record = store1.getAt(rowIndex);
					store1.remove(record);

                    console.log(item);
					var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store-real2');
                    store2.add(record);

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
    store: 'SchoolCourse-Store-real2',
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
		{ header: '學分', dataIndex: 'credit', width: 40 },
		{ header: '開課系所', dataIndex: 'unitname', width: 90 },
        { header: '教師', dataIndex: 'teachername', width: 80 },
        { header: '星期/節', dataIndex: 'coursetime_view', width: 100 },
        { header: '上課地點', dataIndex: 'roomname' },
        { header: '已選', dataIndex: 'selectedcount', width: 50 },
        { header: '上限', dataIndex: 'maxcount', width: 50 }
    ]
});

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
            handler: function(button, e) {
                button.toggle(true);
                changeFilterHandler('1');
                var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                label.setText('通識選修限制：1.畢業前必須修完五大領域。2.已修過領域不顯示。3.每人只能選一科。');
            }
        }, {
            xtype: 'button',
            icon: __SILK_ICONS_URL+'bullet_green.png',
            text: '體育課程 ',
            toggleGroup: 'grid1-filter',
            handler: function(button, e) {
                button.toggle(true);
                changeFilterHandler('2');
                var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                label.setText('體育選修');
            }
        }, '-', {
            xtype: 'tbtext',
            text: ''
        }]
    }, {
        xtype: 'toolbar',
        dock: 'top',
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
			width: 150,
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
            handler: function() {
                //取得勾選的星期資料（陣列）
                var weekdays = this.up('toolbar').getComponent('week-filter').getValue().days;

                //學門領域
                var gpid = this.up('toolbar').getComponent('gpid-filter').getValue();

                //課程名稱
                var semcoursename = this.up('toolbar').getComponent('semcoursename-filter').getValue();

                //重新篩選查詢
                changeFilterHandler(null, {
                    weekdays: weekdays,
                    gpid: gpid,
                    semcoursename: semcoursename
                });
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

                var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store-real2');
                var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store-real3');

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
                            success: function(response, opts) {
                                Ext.Msg.hide();

                                var obj = Ext.JSON.decode(response.responseText);

                                //Ext.Msg.alert("伺服器回應", response.responseText);

                                if (obj.success) {
                                    store2.removeAll();
                                    store3.load();

                                    Ext.getCmp('notifier').setText('<font color="green">選課登記完成</font>');
                                }
                                else {
                                    Ext.getCmp('notifier').setText('<font color="red">選課登記失敗，請重新操作一次</font>');
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
            handler: function() {
                Ext.Msg.confirm(
                    '清除確認',
                    '請按「是」將候選區資料清空；按「否」取消動作。',
                    function(btn, text){
                        if (btn == 'yes'){
                            var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
                            store2.removeAll();
                        }
                    }
                );
            }
        }, {
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
        margins: '5 0 0 5'
    }, {
        xtype: 'SchoolCourse-RealtimeCourse-Grid1',
        itemId: 'grid1',
        border: true,
        resizable: false,
        region: 'center',
        autoScroll: true,
        margins: '5 5 0 5'
    }, {
        xtype: 'SchoolCourse-RealtimeCourse-Grid2',
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
            panel = Ext.create('Module.SchoolCourse.RealtimeCourse.MainPanel', {
                listeners: {
                    beforeclose: function(panel, eOpts) {
					
						//候選區有資料禁止關閉 Tab 視窗
                        var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store-real2');
                        if (store2.count() > 0) {
                            Ext.Msg.alert('無法關閉', '候選區尚有課程資料！');
                            return false;
                        }
						
                        thisModule.moduleUnload();
                        Module.SchoolCourse.RealtimeCourse._previous = null;
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