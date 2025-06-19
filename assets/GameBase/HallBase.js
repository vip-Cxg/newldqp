// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

let preCreate = ['winCreate00', '', 'winCreate02', 'winCreate03', 'winCreate04', 'winCreate05', 'winCreate06', 'winCreate07', 'winCreate08', 'winCreate09', 'winCreate10', 'winCreate11', 'winCreate12', 'winCreate13', 'winCreate14', '', 'winCreate16', "winCreate17", "winCreate18", "winCreate19", "winCreate20", "winCreate21", "winCreate22", "winCreate23", "winCreate24", "winCreate25", "winCreate26", "winCreate27", "winCreate28", "winCreate29"];
let moduleCreate = ['ModuleCreate00', '', 'ModuleCreate02', 'ModuleCreate03', 'ModuleCreate04', 'ModuleCreate05', 'ModuleCreate06', 'ModuleCreate07', 'ModuleCreate08', 'ModuleCreate09', 'ModuleCreate10', 'ModuleCreate11', 'ModuleCreate12', 'ModuleCreate13', 'ModuleCreate14', '', 'ModuleCreate16', "ModuleCreate17", "ModuleCreate18", "ModuleCreate19", "ModuleCreate20", "ModuleCreate21", "ModuleCreate22", "ModuleCreate23", "ModuleCreate24", "ModuleCreate25", "ModuleCreate26", "ModuleCreate27", "ModuleCreate28", "ModuleCreate29"];
let db = require('DataBase');
let connector = require('Connector');
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    initHallBase() {
        this.clan = null;
        this.create = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
        this.join = null;
        this.history = null;
        this.rule = null;
        // this.initWinClan();
        // this.initWinCreate();
        // this.initWinJoin();
        // this.initWinHistory();
        // this.initWinRule();
        // this.initWinBill();
        // this.initWinPay();
    },

    // initWinClan() {
    //     cc.loader.loadRes("Main/Prefab/winClub", (err, prefab) => {
    //         if (!err) {
    //             this.clan = cc.instantiate(prefab).getComponent('ModuleClub');
    //         } else {
    //             //this.initWinClan();
    //             //cc.log('error to load club');
    //         }
    //     });
    // },

    // initWinCreate() {
    //     cc.loader.loadRes(`Main/Prefab/${preCreate[db.gameType]}`, (err, prefab) => {
    //         if (!err) {
    //             if (this.create == null || typeof (this.create) == 'undefined') {
    //                 let msg = "";
    //                 try {
    //                     msg = `currentScene:${cc.director.getScene().name} this.sprHead:${this.sprHead} HallBase -> initWinCreate()`;
    //                 } catch (ex) {
    //                     msg = "anys Message Error";
    //                 }
    //                 connector.commitError(msg,"bugReport");
    //             } else
    //                 this.create[db.gameType] = cc.instantiate(prefab).getComponent(moduleCreate[db.gameType]);
    //         } 
    //     });
    // },

    // initWinJoin() {
    //     cc.loader.loadRes("Main/Prefab/winJoin", (err, prefab) => {
    //         if (!err) {
    //             this.join = cc.instantiate(prefab).getComponent('ModuleJoinRoom');
    //         }
    //     });
    // },


    // initWinHistory() {
    //     cc.loader.loadRes("Main/Prefab/winHistory", (err, prefab) => {
    //         if (!err) {
    //             this.history = cc.instantiate(prefab).getComponent('ModuleHistory');
    //         }
    //     });
    // },

    // initWinRule() {
    //     cc.loader.loadRes("Main/Prefab/winRule", (err, prefab) => {
    //         if (!err) {
    //             this.rule = cc.instantiate(prefab).getComponent('ModuleRule');
    //         } 
    //     });
    // },

    // initWinPay() {
    //     cc.loader.loadRes("Main/Prefab/winPay", (err, prefab) => {
    //         if (!err) {
    //             this.pay = cc.instantiate(prefab).getComponent('ModulePay');
    //         } 
    //     });
    // },

    // initWinBill() {
    //     cc.loader.loadRes("Main/Prefab/winBill", (err, prefab) => {
    //         if (!err) {
    //             this.bill = cc.instantiate(prefab).getComponent('ModuleBill');
    //         } 
    //     });
    // }
});
