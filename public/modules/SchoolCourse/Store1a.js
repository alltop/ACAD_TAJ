/**
 * 畫面左方課程清單
 */
Ext.define('Module.SchoolCourse.Store1a', {
    extend: 'Ext.data.Store',
    fields: ['courseid', 'coursetype', 'semcoursename', 'coursetime'],
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
