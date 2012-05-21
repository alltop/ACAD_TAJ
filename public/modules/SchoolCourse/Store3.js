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
    listeners: {
        load: function(store3, records, options) {
            var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
            if (store0 && store0.count() > 0) {
                var request = Ext.Ajax.request({
                    url: __SERVICE_URL + '/service/listselected.json',
                    method: 'GET',
                    success: function(response) {
                        var obj = Ext.JSON.decode(response.responseText);

                        var semcourseid_array = new Array();
                        var serialno_map = new Ext.util.HashMap();

                        Ext.Array.each(obj, function(item) {
                            var tokens = item.split(':');
                            semcourseid_array.push(tokens[0]);
                            serialno_map.add(tokens[0], tokens[1]);
                        });

                        //console.log(semcourseid_array);

                        var records = new Array();

                        store0.each(function(record) {
                            if (Ext.Array.contains(semcourseid_array, record.get('semcourseid'))) {
                                records.push(record);
                            }
                        });
                        store3.loadRecords(records);
                        store3.each(function(record) {
                            record.set('serialno', serialno_map.get(record.get('semcourseid')));
                        });
                        store3.sort([
                            {property: 'semcoursename', direction: 'ASC'},
                            {property: 'serialno', direction: 'ASC'}
                        ]);
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
        store3.sort([
            {property: 'semcoursename', direction: 'ASC'},
            {property: 'serialno', direction: 'ASC'}
        ]);
    }
});
