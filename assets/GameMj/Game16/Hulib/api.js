"use strict";

exports.MTableMgr = require( './table_mgr.js' );
exports.MHulib = require( './hulib.js' );

exports.Init = function()
{
	// console.log("start  production...");
    this.MTableMgr.Init();
    this.MTableMgr.LoadTable();
};

exports.getInfo = function(cards){
    return this.MHulib.get_hu_info( cards, 34, 33, 34);
};