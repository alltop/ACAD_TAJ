Ext.define('Module.SchoolCourse.Store3', {
    extend: 'Ext.data.Store',
    fields: ['semcourseid', 'courseid', 'coursetype', 'coursetypename', 'semcoursename', 'teachername', 'coursetime_view', 'roomname', 'maxcount', 'selectedcount'],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'results'
        }
    }
});
