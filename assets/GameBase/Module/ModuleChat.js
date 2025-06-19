const MASSAGE_TYPE = {
    FACE: 0,
    MESSAGE: 1,
    CUSTOMER: 2,
    VOICE: 3,
    INTERACT: 4
};
let TableInfo = require("TableInfo");
let cache = require("../../Main/Script/Cache");//require("Cache");
let ROUTE = require("ROUTE");
let connector = require("Connector");
let db = require("DataBase");
const { GameConfig } = require("../GameConfig");
let posPlayer = [cc.v2(-502, -200), cc.v2(502, 255), cc.v2(-502, 255)];
let clip_config = [
    ['base_bomb_0', 'base_bomb_1', 'base_bomb_2', 'base_bomb_3', 'base_bomb_4', 'base_bomb_5'],
    ['base_cheers_0', 'base_cheers_1', 'base_cheers_2', 'base_cheers_3', 'base_cheers_4', 'base_cheers_5', 'base_cheers_6', 'base_cheers_7', 'base_cheers_8'],
    ['base_egg_0', 'base_egg_1', 'base_egg_2', 'base_egg_3', 'base_egg_4', 'base_egg_5', 'base_egg_6'],
    ['base_flower_0', 'base_flower_1', 'base_flower_2', 'base_flower_3', 'base_flower_4', 'base_flower_5', 'base_flower_6', 'base_flower_7', 'base_flower_8', 'base_flower_9', 'base_flower_10'],
    ['base_love_0', 'base_love_1', 'base_love_2', 'base_love_3', 'base_love_4', 'base_love_5', 'base_love_6', 'base_love_7', 'base_love_8', 'base_love_9', 'base_love_10', 'base_love_11', 'base_love_12', 'base_love_13']
];

cc.Class({
    extends: cc.Component,
    properties: {
        preChatWordItem: cc.Prefab,
        layoutWordContent: cc.Layout,
        nodeFace: cc.Prefab,
        nodeMsg: cc.Prefab,
        // editBoxChat: cc.EditBox,
        preChatContent: cc.Prefab,
        lastTime: 0,
        // aniSpriteFrame: [cc.SpriteFrame],
        // clips: [cc.AnimationClip],
        audioClips: {
            type: cc.AudioClip, // use 'type:' to define an array of Texture2D objects
            default: []
        },
        // animationSprite: cc.SpriteAtlas,
        clipsPre: cc.Prefab,

        spineAnimArr: [sp.SkeletonData],

        wordContent: cc.Node,
        faceContent: cc.Node,
        bgNode: cc.Node,
        clipSprArr: [cc.SpriteFrame],

    },
    onLoad: function () {
    },


    showChat: function () {
        if (this.checkDurationTime()) {
            this.pleaseWaite();
            return;
        }
        try {
            cc.find('Canvas').addChild(this.node);
        } catch (error) {

        }
        this.showPopAnim()
        //清除输入框
        // this.editBoxChat.string = "";
    },

    playChatAudio: function (msg) {
        //let game = voiceUrl[db.gameType];
        if (!cc.sys.isNative) {
            return;
        }
        let game = db.gameType < 10 ? ("Game0" + db.gameType) : ("Game" + db.gameType);
        let url = jsb.fileUtils.getWritablePath() + "remote-asset/Audio/" + game + "/" + msg;
        cc.loader.load(url, function (err, data) {
            let audioCtrl = require("audio-ctrl");
            audioCtrl.getInstance().playSFX(data);
        });
    },

    init(data) {
        this.str = data.str;
        posPlayer = data.aniPos;
        this.facePos = data.facePos;
        this.msgPos = data.msgPos;
        this.faceAnchor = data.faceAnchor;
        this.layoutWordContent.node.destroyAllChildren();
        this.str.forEach((empStr, i) => {
            let node = cc.instantiate(this.preChatWordItem);
            node.parent = this.layoutWordContent.node;
            node.getChildByName("word").x = 0;
            node.getChildByName("word").getComponent(cc.Label).string = empStr;
            node.on('touchend', () => {
                let msg = i < 10 ? ("0" + i) : i;
                cache.playSfx();
                this.storageCurrentTime();
                connector.gameMessage(ROUTE.CS_GAME_CHAT, { messageType: MASSAGE_TYPE.MESSAGE, content: msg });
                this.hide();
            })
        })
        // this.loadClips();
    },

    exitChat: function () {
        cache.playSfx();
        this.node.removeFromParent(false);
    },

    systemNotice: function (msg) {
        let node = cc.instantiate(this.preChatContent);
        node.parent = cc.find('Canvas');
        node.setPosition(900, 100);
        let nodeLbl = node.getChildByName("lblContent");
        let str = nodeLbl.getComponent(cc.Label);
        str.string = "系统消息:" + msg;
        nodeLbl.color = cc.color(255, 255, 0);
        node.runAction(cc.sequence(cc.moveTo(4.5, -900, 100), cc.removeSelf()));
    },



    contentFly(data) {


        let realIdx = TableInfo.realIdx[data.idx];
        let name = TableInfo.players[data.idx].prop.name;
        // let sex =  TableInfo.players[data.idx].prop.sex;
        //cc.log("realIdx",realIdx);
        let node = cc.instantiate(this.preChatContent);
        node.parent = cc.find('Canvas');
        let Range = 200 + 200;
        let Rand = Math.random() * Range;
        let num = Rand - 200;
        node.setPosition(900, num);
        let nodeLbl = node.getChildByName("lblContent");
        let str = nodeLbl.getComponent(cc.Label);
        // FACE: 0,
        // MESSAGE: 1,
        // CUSTOMER: 2,
        // VOICE: 3,
        // INTERACT: 4
        switch (data.messageType) {
            case MASSAGE_TYPE.FACE:
                let nodeFace = cc.instantiate(this.nodeFace);
                nodeFace.parent = cc.find('Canvas');
                nodeFace.getComponent('ModuleNodeFace').init(realIdx, data.content, this.facePos, this.faceAnchor);
                break;
            case MASSAGE_TYPE.MESSAGE:
                this.playChatAudio('male_chat_' + data.content + '.mp3');
                let nodeMsg = cc.instantiate(this.nodeMsg);
                nodeMsg.parent = cc.find('Canvas');
                if (realIdx == 1 && GameConfig.CurrentGameType.indexOf(GameConfig.GameType.LDZP) == -1) {
                nodeMsg.scaleX = -1;
                nodeMsg.getChildByName("word").scaleX = -1;
                nodeMsg.getChildByName("word").anchorX = 0.5;
                }
                nodeMsg.position = this.msgPos[realIdx];
                nodeMsg.getChildByName("word").getComponent(cc.Label).string = " " + this.str[parseInt(data.content)] + " ";
                nodeMsg.runAction(cc.sequence(cc.delayTime(3), cc.fadeOut(1), cc.removeSelf()));
                break;
            case MASSAGE_TYPE.CUSTOMER:
                str.string = name + ":" + " " + " " + data.content;
                node.runAction(cc.sequence(cc.moveTo(4.5, -900, num), cc.removeSelf()));
                break;
            case MASSAGE_TYPE.INTERACT:

                let clipsNode = cc.instantiate(this.clipsPre);
                let clipAnimation = clipsNode.getComponent(cc.Animation);
                clipAnimation.on('finished', () => {
                    setTimeout(() => {
                        clipsNode.destroy();
                        node.destroy();
                    }, 500);
                }, this);
                clipAnimation.playOnLoad = true;
                cc.find('Canvas').addChild(clipsNode);

                let startPos = posPlayer[TableInfo.realIdx[data.idx]];
                let endPos = posPlayer[TableInfo.realIdx[data.target]];
                switch (data.content) {
                    case "1":
                        clipsNode.scale = 2;
                        break;

                    case "0":
                        clipsNode.scale = 3;
                        break;
                    case "2":
                        break;
                    case "3":
                        break;
                    case "4":
                        break;
                }
                clipsNode.getComponent(cc.Sprite).spriteFrame = this.clipSprArr[parseInt(data.content)];
                clipsNode.position = startPos;

                clipsNode.runAction(cc.sequence(cc.moveTo(0.8, endPos).easing(cc.easeSineInOut()), cc.callFunc(() => {
                    cache.playAnimSound(data.content);
                    clipAnimation.play(
                        clipAnimation.getClips()[parseInt(data.content)].name
                    );
                })))
                break;
        }
    },

    hide: function () {
        this.node.removeFromParent(false);
    },
    /**发送表情 */
    sendChatContentFace: function (event, msg) {
        cache.playSfx();
        if (this.checkDurationTime()) {
            this.pleaseWaite();
            return;
        }
        connector.gameMessage(ROUTE.CS_GAME_CHAT, { messageType: MASSAGE_TYPE.FACE, content: parseInt(msg) });
        this.hide();
        this.storageCurrentTime();
    },
    /**发送文字 */
    sendChatContentWord: function (event, msg) {
        connector.gameMessage(ROUTE.CS_GAME_CHAT, { messageType: MASSAGE_TYPE.MESSAGE, content: parseInt(msg) });
        this.storageCurrentTime();
        this.hide();

    },
    /**发送自定义消息 */
    // sendChatContentCustom: function (event) {
    //     let msg = this.editBoxChat.string;
    //     // if(msg == '111' && !cc.find('Canvas/logger')){
    //     //     //cc.log('enter=======');
    //     //     let a = {a:1}
    //     //     utils.logInfo(a);
    //     //     utils.showLogger();
    //     // }
    //     connector.gameMessage(ROUTE.CS_GAME_CHAT, { messageType: MASSAGE_TYPE.CUSTOMER, content: msg });
    //     this.storageCurrentTime();
    //     this.hide();

    // },

    sendAnimation: function (msg, idx) {
        cc.log('sendAnimation');
        if (this.checkDurationTime()) {
            this.pleaseWaite();
            return;
        }
        connector.gameMessage(ROUTE.CS_GAME_CHAT, { messageType: MASSAGE_TYPE.INTERACT, content: msg, target: idx });
        this.storageCurrentTime();

    },

    checkDurationTime: function () {
        let myDate = new Date();
        let currentTime = myDate.getTime();
        cc.log('currentTime', currentTime);
        cc.log('lastTime', this.lastTime);
        return currentTime - this.lastTime < 3000;
    },

    storageCurrentTime: function () {
        let myDate = new Date();
        cc.log('storageCurrentTime', myDate.getTime());
        this.lastTime = myDate.getTime();
    },

    pleaseWaite: function () {
        cache.alertTip("发言间隔需要3秒");
    },
    calcAngel(p0, p1) {
        let angel = 0;
        let dy = p1.y - p0.y;
        let dx = p1.x - p0.x;
        if (dx > 0.02 && dx < 0.02) {
            return angel;
        }
        let radian = Math.atan2(dy, dx);
        angel = (180 / Math.PI) * radian;
        return angel;
    },
    /**显示文字内容 */
    showWordContent() {
        this.wordContent.active = true;
        this.faceContent.active = false;
    },
    /**显示表情内容 */
    showFaceContent() {
        this.wordContent.active = false;
        this.faceContent.active = true;
    },
    /**窗口进入动画 */
    showPopAnim() {
        this.bgNode.stopAllActions();
        let parentNode = cc.find('Canvas')
        this.bgNode.x = parentNode.width / 2 + this.bgNode.width / 2 + 200;
        let ap = cc.moveTo(0.5, cc.v2(parentNode.width / 2 - this.bgNode.width / 2, this.bgNode.y)).easing(cc.easeBackInOut());;
        this.bgNode.runAction(ap);
    }
});

