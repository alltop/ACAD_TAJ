Ext.define('Module.SchoolCourse.StoreReal2', {
    extend: 'Ext.data.Store',
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount', 'choose', 'grade',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel',
        'serialno', 'credit', 'unitname'
    ],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    /**
     * 產生志願順序
     */
    generateSerialno: function() {
        var store2 = this;
        store2.each(function(record) {
            var record_index = store2.indexOf(record);
            var record_semcoursename = record.get('semcoursename');
            var result = store2.queryBy(function(record2) {
                if (store2.indexOf(record2) >= record_index) return false;
                return (record2.get('semcoursename')==record_semcoursename);
            });
            record.set('serialno', result.items.length + 1);
        });
        store2.sort([
            {property: 'semcoursename', direction: 'ASC'},
            {property: 'serialno', direction: 'ASC'}
        ]);
    }
});
