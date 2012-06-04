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
            if (result && college) {
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
        store1a.filterBy(__filter_proc);
		if (store1a.getCount() == 0 && val == '5') alert("因所有課程為配課 或 已修，故無課程顯示");
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
                    //設定選課來源資料
                    var store1 = grid.getStore();
                    var record = store1.getAt(rowIndex);
                    store1.remove(record);

                    //將選課資料移到待選區
                    var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
                    store2.add(record);
                    store2.generateSerialno();

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
        changeFilterHandler(code);

        //通識特別處理：學門領域下拉選單啟用
        var cmp = this.up('panel').getComponent('filterbar').getComponent('gpid-filter');
        if (cmp) {
            cmp.setVisible(code == '1-1' || code == '1-2');
        }

        //切換[英文]顯示級別欄位
        this.up('panel').getComponent('grid1').getView().getHeaderCt().getHeaderAtIndex(9).setVisible(code=='7');
        this.up('panel').getComponent('grid2').getView().getHeaderCt().getHeaderAtIndex(9).setVisible(code=='7');
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
            hidden: false,
            toggleGroup: 'grid1-filter',
            handler: __createFilterHandler('3', '院訂選修...')
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
			pressed: true,
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
            value: ClientSession.user.unitid,
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
            value: ClientSession.user.grade,
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
                        changeFilterHandler('5', {
                            grade: ClientSession.user.grade,
                            unitid: ClientSession.user.unitid
                        });
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