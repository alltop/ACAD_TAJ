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
