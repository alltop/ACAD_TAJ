/**
 * 已選課程資料來源（退選用）
 */
Ext.define('Module.SchoolCourse.Store3', {
    extend: 'Ext.data.Store',
    autoLoad: false,
    autoSync: false,
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount', 'choose',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel',
        'seqno'
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
        load: function(store3, records, options) {
            var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
            if (store0 && store0.count() > 0) {
                var request = Ext.Ajax.request({
                    url: __SERVICE_URL + '/service/listselected.json',
                    method: 'GET',
                    success: function(response) {
                        var obj = Ext.JSON.decode(response.responseText);
                        var result = store0.queryBy(function(record) {
                            return Ext.Array.contains(obj, record.get('semcourseid'));
                        });
                        store3.loadRecords(result.items);
                        store3.each(function(record) {
                            record.set('seqno', store3.indexOf(record)+1);
                        });
                    }
                });
            }
        }
    }
});
