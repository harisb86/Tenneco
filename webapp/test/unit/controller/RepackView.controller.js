/*global QUnit*/

sap.ui.define([
	"repack/repck/controller/RepackView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("RepackView Controller");

	QUnit.test("I should test the RepackView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
