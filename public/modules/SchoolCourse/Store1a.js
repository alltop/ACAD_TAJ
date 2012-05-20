/**
 * 畫面左方課程清單
 */
Ext.define('Module.SchoolCourse.Store1a', {
    extend: 'Ext.data.Store',
    autoLoad: false,
    autoSync: false,
    fields: [
        'courseid', 'coursetype', 'semcoursename', 'coursetime', 'choose',
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
