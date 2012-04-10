/**
 * Package Manager
 */
Ext.define('Module.SchoolCourse.Package', {
	extend: 'Module.Prototype.Package',
	packageInit: function() {
		this.requireStore('Module.SchoolCourse.Store0', 'SchoolCourse-Store0');
		this.requireStore('Module.SchoolCourse.Store1', 'SchoolCourse-Store1');
		this.requireStore('Module.SchoolCourse.Store2', 'SchoolCourse-Store2');
		this.requireStore('Module.SchoolCourse.Store3', 'SchoolCourse-Store3');
	}
});