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
