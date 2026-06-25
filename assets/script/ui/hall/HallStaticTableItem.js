cc.Class({
    extends: cc.Component,

    properties: {
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
        this.node.setContentSize(cc.size(360, 182));
        this.setTableArt(spriteFrame, data);
        this.applyGameLayout(data);
        this.setLabel(this.ruleLabel, data.rule || "");
        this.setLabel(this.roundLabel, (data.occupied || 0) + "人/" + (data.totalRound || 20) + "局");
        this.renderAvatars(data);
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
            roundNode.setPosition(cc.v2(layout.rule.x, layout.rule.y - 28));
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
            this.setSeatName(seatData, "测" + (index + 1));
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
            sprite: spriteNode && spriteNode.getComponent(cc.Sprite),
            spriteNode,
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
            seatData.nameLabel.fontSize = style.fontSize;
            seatData.nameLabel.lineHeight = style.nameHeight;
            seatData.nameLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            seatData.nameLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
            this.ensureNameBg(seatData, style);
        }
    },

    ensureNameBg(seatData, style) {
        if (!seatData.nameLabel) return;
        let bg = seatData.nameBg;
        if (!bg || !bg.isValid) {
            bg = new cc.Node("nameBg");
            seatData.seat.addChild(bg);
            seatData.nameBg = bg;
        }
        bg.setPosition(cc.v2(0, style.nameY));
        bg.setContentSize(cc.size(style.nameWidth, style.nameHeight));
        bg.zIndex = (seatData.nameLabel.node.zIndex || 0) - 1;

        let graphics = bg.getComponent(cc.Graphics) || bg.addComponent(cc.Graphics);
        let styleKey = [style.nameWidth, style.nameHeight, style.nameY].join("_");
        if (bg._hallStyleKey === styleKey) return;
        bg._hallStyleKey = styleKey;
        graphics.clear();
        graphics.fillColor = new cc.Color(0, 0, 0, 150);
        graphics.roundRect(-style.nameWidth / 2, -style.nameHeight / 2, style.nameWidth, style.nameHeight, 3);
        graphics.fill();
    },

    setSeatName(seatData, name) {
        if (!seatData.nameLabel) return;
        seatData.nameLabel.string = name;
    },

    getAvatarStyle() {
        let map = {
            DNIU: { size: 44, nameWidth: 52, nameHeight: 16, nameY: -18, fontSize: 12 },
            JH: { size: 42, nameWidth: 50, nameHeight: 16, nameY: -18, fontSize: 12 },
            HSMJ: { size: 46, nameWidth: 54, nameHeight: 17, nameY: -19, fontSize: 12 },
            ZMZ: { size: 46, nameWidth: 54, nameHeight: 17, nameY: -19, fontSize: 12 },
            PDK: { size: 46, nameWidth: 54, nameHeight: 17, nameY: -19, fontSize: 12 },
        };
        return map[this.currentGameKey] || { size: 42, nameWidth: 50, nameHeight: 16, nameY: -18, fontSize: 12 };
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
