let db = require("DataBase");
let FACE_SCALE = [0.7, 1, 1.2, 1.2, 1, 1, 1.2, 1, 1];
let ani_config = [
    ['wy_thank_0', 'wy_thank_1', 'wy_thank_2', 'wy_thank_3'],
    ['wy_smile_0', 'wy_smile_1', 'wy_smile_2', 'wy_smile_3'],
    ['wy_love_0', 'wy_love_1', 'wy_love_2', 'wy_love_3', 'wy_love_4'],
    ['wy_kongju_0', 'wy_kongju_1', 'wy_kongju_2', 'wy_kongju_3', 'wy_kongju_4'],
    ['wy_flower_0', 'wy_flower_1', 'wy_flower_2', 'wy_flower_3'],
    ['wy_chui_0', 'wy_chui_1', 'wy_chui_2', 'wy_chui_3', 'wy_chui_4'],
    ['wy_angery_0', 'wy_angery_1', 'wy_angery_2', 'wy_angery_3', 'wy_angery_4'],
    ['wy_bomb_0', 'wy_bomb_1', 'wy_bomb_2', 'wy_bomb_3', 'wy_bomb_4', 'wy_bomb_5', 'wy_bomb_6'],
    ['wy_bang_0', 'wy_bang_1', 'wy_bang_2', 'wy_bang_3', 'wy_bang_4'],
]
cc.Class({
    extends: cc.Component,

    properties: {
        spriteFrame: [cc.SpriteFrame],
        nodeFace: cc.Sprite,
        clips: [cc.AnimationClip],
        animationSprite: cc.SpriteAtlas
    },

    init: function (idx, data, pos, anchor) {
        let spriteFrame = [];
        let animIndex = data > 9 ? data + "" : "0" + data;
        // ani_config[data].forEach(a => {
        //    spriteFrame.push(this.animationSprite._spriteFrames[a]);
        // })
        for (let i = 1; i < 6; i++) {
            spriteFrame.push(this.animationSprite._spriteFrames["exp_" + animIndex + "_" + i]);
        }

        this.clips[data] = cc.AnimationClip.createWithSpriteFrames(spriteFrame, 30);
        this.clips[data].wrapMode = 0;
        this.clips[data].speed = 0.3;
        cc.log(idx, pos);
        if (this.node)
            this.node.opacity = 0;
        // if (idx == 1)
        //     this.node.setAnchorPoint(1, 1);
        // if (idx == 2)
        //     this.node.setAnchorPoint(1, 1);
        // if (anchor) {
        //     this.node.setAnchorPoint(anchor[idx].x, anchor[idx].y);
        // }
        this.nodeFace.spriteFrame = this.spriteFrame[data];
        let animation = this.nodeFace.node.getComponent(cc.Animation);
        this.nodeFace.node.position = pos[idx];
        animation.addClip(this.clips[data], 'clip');
        this.node.runAction(cc.sequence(
            // cc.scaleTo(0.3,FACE_SCALE[data]),
            cc.fadeIn(0.3),
            cc.callFunc(() => {
                animation.play('clip');
            })
        ));

        animation.on('finished', () => {
            this.node.runAction(cc.sequence(
                cc.delayTime(0.8),
                cc.fadeIn(0.3),
                cc.callFunc(() => {
                    if (this.node)
                        this.node.destroy();
                })
            ));
        })
    },
});
