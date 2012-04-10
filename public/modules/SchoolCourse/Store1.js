Ext.define('Module.SchoolCourse.Store1', {
    extend: 'Ext.data.Store',
    fields: ['semcourseid', 'coursetype', 'coursetypename', 'semcoursename', 'teachername', 'coursetime_view', 'roomname', 'maxcount', 'selectedcount'],
    sorters: [{
        property : 'semcoursename',
        direction: 'DESC'
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
