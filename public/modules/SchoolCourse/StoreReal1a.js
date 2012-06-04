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
