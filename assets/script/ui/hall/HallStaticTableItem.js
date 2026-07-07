const { GameConfig } = require("../../../GameBase/GameConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        avatarSprites: cc.SpriteAtlas,
    },

    onLoad() {
        this.tableArt = this.node.getChildByName("TableArt");
        this.ruleLabel = this.findLabel("RuleLabel");
        this.roundLabel = this.findLabel("RoundLabel");
        this.avatarSeats = [];
        for (let i = 1; i <= 8; i++) {
            this.avatarSeats.push(this.findAvatarSeat(i));
        }
    },

    render(data, spriteFrame) {
        if (!this.tableArt) {
            this.onLoad();
        }
        this.currentGameKey = data.game && data.game.key || "";
        this.collectAvatarFrames();
        this.node.setContentSize(cc.size(360, 182));
        this.setTableArt(spriteFrame, data);
        this.applyGameLayout(data);
        this.setLabel(this.ruleLabel, data.rule || "");
        this.setLabel(this.roundLabel, (data.entryText || "") + "\n" + (data.occupied || 0) + "人/" + (data.totalRound || 10) + "局");
        this.applyRuleTextStyle();
        if (this.roundLabel) {
            this.roundLabel.lineHeight = Math.max(18, Math.floor(this.roundLabel.fontSize * 1.05));
            this.roundLabel.enableWrapText = false;
            this.roundLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            this.roundLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
            this.roundLabel.overflow = cc.Label.Overflow.CLAMP;
        }
        this.renderAvatars(data);
    },

    applyRuleTextStyle() {
        let yellow = cc.color(255, 231, 120, 255);
        let outlineColor = cc.color(65, 35, 50, 210);
        [this.ruleLabel, this.roundLabel].forEach((label) => {
            if (!label || !label.node) return;
            label.node.color = yellow;
            let outline = label.node.getComponent(cc.LabelOutline) || label.node.addComponent(cc.LabelOutline);
            outline.color = outlineColor;
            outline.width = 2;
        });
    },

    applyGameLayout(data) {
        let key = data.game && data.game.key;
        let layout = this.getGameLayout(key);
        let ruleNode = this.ruleLabel && this.ruleLabel.node;
        if (ruleNode && layout.rule) {
            ruleNode.setPosition(cc.v2(layout.rule.x, layout.rule.y));
        }
        let roundNode = this.roundLabel && this.roundLabel.node;
        if (roundNode && layout.rule) {
            roundNode.setPosition(cc.v2(layout.rule.x, layout.rule.y - 32));
            roundNode.setContentSize(cc.size(160, 42));
        }
    },

    setTableArt(spriteFrame, data) {
        if (!this.tableArt) return;
        let sprite = this.tableArt.getComponent(cc.Sprite) || this.tableArt.addComponent(cc.Sprite);
        if (spriteFrame && this.lastSpriteFrame !== spriteFrame) {
            sprite.spriteFrame = spriteFrame;
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            this.lastSpriteFrame = spriteFrame;
        }
        this.tableArt.color = cc.Color.WHITE;
        this.tableArt.active = true;
    },

    renderAvatars(data) {
        let seatCount = data.game && data.game.seats || 8;
        let occupied = Math.min(data.occupied || 0, seatCount);
        let positions = this.getSeatPositions(seatCount);
        let style = this.getAvatarStyle();
        this.avatarSeats.forEach((seatData, index) => {
            if (!seatData || !seatData.seat) return;
            let seat = seatData.seat;
            seat.active = false;
            let pos = positions[index];
            if (!pos || index >= occupied) return;
            seat.active = true;
            seat.setPosition(cc.v2(pos.x, pos.y));
            this.applyAvatarStyle(seatData, style);
            let player = this.getPlayer(data, index);
            this.setSeatAvatar(seatData, index, player);
            this.setSeatName(seatData, this.getPlayerName(player, index));
        });
    },

    findAvatarSeat(index) {
        let seat = this.node.getChildByName("AvatarSeat" + index) || this.node.getChildByName("Avatar" + index);
        if (!seat) return null;
        let mask = seat.getChildByName("avatarMask") || seat.getChildByName("avatarMask" + index);
        let spriteNode = mask && mask.getChildByName("avatarSprite");
        let nameNode = seat.getChildByName("nameLabel") || seat.getChildByName("Name");
        let nameBg = seat.getChildByName("nameBg");
        return {
            seat,
            mask,
            spriteNode,
            sprite: spriteNode && (spriteNode.getComponent(cc.Sprite) || spriteNode.addComponent(cc.Sprite)),
            avatar: spriteNode && spriteNode.getComponent("Avatar"),
            nameLabel: nameNode && nameNode.getComponent(cc.Label),
            nameBg,
        };
    },

    applyAvatarStyle(seatData, style) {
        if (seatData.mask) {
            seatData.mask.setPosition(cc.v2(0, 0));
            seatData.mask.setContentSize(cc.size(style.size, style.size));
        }
        if (seatData.spriteNode) {
            seatData.spriteNode.setPosition(cc.v2(0, 0));
            seatData.spriteNode.setContentSize(cc.size(style.size, style.size));
            if (seatData.sprite) {
                seatData.sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            }
        }
        if (seatData.nameLabel) {
            let labelNode = seatData.nameLabel.node;
            labelNode.setPosition(cc.v2(0, style.nameY));
            labelNode.setContentSize(cc.size(style.nameWidth, style.nameHeight));
            labelNode.zIndex = 20;
            seatData.nameLabel.fontSize = style.fontSize;
            seatData.nameLabel.lineHeight = style.nameHeight;
            seatData.nameLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            seatData.nameLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
            seatData.nameLabel.overflow = cc.Label.Overflow.CLAMP;
            seatData.nameLabel.enableWrapText = false;
            this.applyNameBgStyle(seatData, style);
        }
    },

    applyNameBgStyle(seatData, style) {
        let bg = seatData.nameBg;
        if (!bg || !bg.isValid) return;
        bg.setPosition(cc.v2(0, style.nameY));
        bg.setContentSize(cc.size(style.nameWidth, style.nameHeight));
        bg.color = cc.Color.BLACK;

        // let sprite = bg.getComponent(cc.Sprite);
        // if (sprite) {
        //     sprite.spriteFrame = null;
        //     sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        // }
    },

    setSeatName(seatData, name) {
        if (!seatData.nameLabel) return;
        seatData.nameLabel.string = this.ellipsisName(name);
    },

    setSeatAvatar(seatData, index, player) {
        if (!seatData.sprite) return;
        let head = this.getPlayerHead(player);
        if (head) {
            this.setActualAvatar(seatData, head);
            return;
        }
        this.setAtlasAvatar(seatData, index);
    },

    setAtlasAvatar(seatData, index) {
        if (!this.avatarFrames || !this.avatarFrames.length) return;
        let frame = this.avatarFrames[index % this.avatarFrames.length];
        if (!frame || seatData.lastAvatarFrame === frame) return;
        seatData.sprite.spriteFrame = frame;
        seatData.sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        seatData.lastAvatarFrame = frame;
        seatData.lastHead = "";
    },

    setActualAvatar(seatData, head) {
        if (seatData.lastHead === head) return;
        seatData.lastHead = head;

        if (seatData.avatar) {
            seatData.avatar.avatarUrl = head;
            return;
        }

        let localFrame = this.getLocalAvatarFrame(head);
        if (localFrame) {
            seatData.sprite.spriteFrame = localFrame;
            seatData.sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            seatData.lastAvatarFrame = localFrame;
            return;
        }

        let url = this.normalizeHeadUrl(head);
        if (!url) return;
        cc.loader.load(this.appendAvatarCacheKey(url), (err, tex) => {
            if (err || !cc.isValid(seatData.sprite && seatData.sprite.node, true) || seatData.lastHead !== head) return;
            try {
                seatData.sprite.spriteFrame = new cc.SpriteFrame(tex);
                seatData.sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            } catch (error) {
            }
        });
    },

    collectAvatarFrames() {
        if (this.avatarFrames || !this.avatarSprites) return;
        if (this.avatarSprites.getSpriteFrames) {
            this.avatarFrames = this.avatarSprites.getSpriteFrames() || [];
            return;
        }

        let names = ["mj_face0", "mj_face1", "mj_face2", "mj_face3", "mj_face4", "mj_face5", "mj_face6", "mj_face7", "mj_face8", "mj_face9", "mj_face10", "mj_face11"];
        this.avatarFrames = [];
        names.forEach((name) => {
            let frame = this.avatarSprites.getSpriteFrame(name) || this.avatarSprites.getSpriteFrame(name + ".png");
            if (frame) this.avatarFrames.push(frame);
        });
    },

    getPlayer(data, index) {
        let players = data.players || data.seats || [];
        return players[index] || null;
    },

    getPlayerName(player, index) {
        if (!player) return "";
        return player.name || player.nickName || player.nickname || (player.user && (player.user.name || player.user.nickName || player.user.nickname)) || "";
    },

    getPlayerHead(player) {
        if (!player) return "";
        return player.head || player.avatarUrl || player.avatar || (player.user && (player.user.head || player.user.avatarUrl || player.user.avatar)) || (player.prop && player.prop.head) || "";
    },

    getLocalAvatarFrame(head) {
        if (!this.avatarSprites || !head || String(head).indexOf("file://") !== 0) return null;
        let name = "mj_face" + String(head).split("file://")[1];
        return this.avatarSprites.getSpriteFrame(name) || this.avatarSprites.getSpriteFrame(name + ".png");
    },

    normalizeHeadUrl(head) {
        if (!head) return "";
        let value = String(head);
        if (value.indexOf("file://") === 0) return "";
        if (value.indexOf("://") !== -1) return value;
        return (GameConfig.HeadUrl || "") + value;
    },

    appendAvatarCacheKey(url) {
        if (!url) return url;
        return url.indexOf("?") === -1 ? url + "?file=a.png" : url;
    },

    ellipsisName(name) {
        if (!name) return "";
        let max = 5;
        let length = 0;
        let result = "";
        for (let i = 0; i < name.length; i++) {
            let code = name.charCodeAt(i);
            length += code > 255 ? 1 : 0.55;
            if (length > max) return result + "...";
            result += name[i];
        }
        return result;
    },

    getAvatarStyle() {
        let map = {
            DNIU: { size: 44, nameWidth: 54, nameHeight: 16, nameY: -14, fontSize: 12 },
            JH: { size: 42, nameWidth: 52, nameHeight: 16, nameY: -14, fontSize: 12 },
            HSMJ: { size: 46, nameWidth: 56, nameHeight: 17, nameY: -15, fontSize: 12 },
            ZMZ: { size: 46, nameWidth: 56, nameHeight: 17, nameY: -15, fontSize: 12 },
            PDK: { size: 46, nameWidth: 56, nameHeight: 17, nameY: -15, fontSize: 12 },
        };
        return map[this.currentGameKey] || { size: 42, nameWidth: 52, nameHeight: 16, nameY: -14, fontSize: 12 };
    },

    getSeatPositions(seats) {
        let key = this.currentGameKey || "";
        let layout = this.getGameLayout(key);
        if (layout.seats) return layout.seats;
        return [{ x: -120, y: 23 }, { x: 120, y: 23 }];
    },

    getGameLayout(key) {
        let map = {
            DNIU: {
                rule: { x: 0, y: 28 },
                seats: [
                    { x: -161, y: 47 },
                    { x: -161, y: -28 },
                    { x: -88, y: -44 },
                    { x: 75, y: -44 },
                    { x: 161, y: -28 },
                    { x: 161, y: 47 },
                    { x: 75, y: 72 },
                    { x: -88, y: 72 },
                ],
            },
            JH: {
                rule: { x: 0, y: 54 },
                seats: [
                    { x: -161, y: 69 },
                    { x: -161, y: -23 },
                    { x: -85, y: -32 },
                    { x: 83, y: -32 },
                    { x: 161, y: -23 },
                    { x: 161, y: 69 },
                ],
            },
            HSMJ: {
                rule: { x: -12, y: 40 },
                seats: [
                    { x: -143, y: 63 },
                    { x: 93, y: -30 },
                ],
            },
            ZMZ: {
                rule: { x: -12, y: 40 },
                seats: [
                    { x: -143, y: 63 },
                    { x: 119, y: -19 },
                ],
            },
            PDK: {
                rule: { x: -12, y: 40 },
                seats: [
                    { x: -143, y: 63 },
                    { x: 119, y: -19 },
                ],
            },
        };
        return map[key] || {};
    },

    findLabel(name) {
        let node = this.node.getChildByName(name);
        return node && node.getComponent(cc.Label);
    },

    setLabel(label, value) {
        if (!label) return;
        label.string = value;
    },
});
