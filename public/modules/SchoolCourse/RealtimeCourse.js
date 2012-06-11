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