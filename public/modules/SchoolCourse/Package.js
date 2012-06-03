/**
 * Package Manager
 */
Ext.define('Module.SchoolCourse.Package', {
	extend: 'Module.Prototype.Package',
	packageInit: function() {
		this.requireStore('Module.SchoolCourse.Store0', 'SchoolCourse-Store0');
		this.requireStore('Module.SchoolCourse.Store1', 'SchoolCourse-Store1');
		this.requireStore('Module.SchoolCourse.Store1a', 'SchoolCourse-Store1a');
		this.requireStore('Module.SchoolCourse.Store2', 'SchoolCourse-Store2');
		this.requireStore('Module.SchoolCourse.Store3', 'SchoolCourse-Store3');
		this.requireStore('Module.SchoolCourse.Store4', 'SchoolCourse-Store4');
		this.requireStore('Module.SchoolCourse.Store5', 'SchoolCourse-Store5');
		this.requireStore('Module.SchoolCourse.StoreReal1', 'SchoolCourse-StoreReal1'); //即選即上_加選區
		this.requireStore('Module.SchoolCourse.StoreReal1a', 'SchoolCourse-StoreReal1a'); //即選即上_加選區左側
		this.requireStore('Module.SchoolCourse.StoreReal2', 'SchoolCourse-StoreReal2'); //即選即上_候選
		this.requireStore('Module.SchoolCourse.StoreReal3', 'SchoolCourse-StoreReal3'); //即選即上_已選
		this.requireStore('Module.SchoolCourse.StoreReal4', 'SchoolCourse-StoreReal4'); //即選即上_課表
	}
});