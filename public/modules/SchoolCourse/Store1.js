/**
 * 畫面右方課程清單
 */
Ext.define('Module.SchoolCourse.Store1', {
    extend: 'Ext.data.Store',
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount',
        'unitid', 'collegeid', 'studytype', 'selectgpid'
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
            root: 'results'
        }
    }
});
