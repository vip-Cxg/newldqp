let cache =require("../Script/Cache") //require("Cache");
let utils = require("../Script/utils")//require("utils");

function _arrayBufferToBase64( raw ) {
    var base64 = '';
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var bytes = new Uint8Array(raw);
    var byteLength = bytes.byteLength;
    var byteRemainder = byteLength % 3;
    var mainLength = byteLength - byteRemainder;
    var a, b, c, d;
    var chunk;  
    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
     // Combine the three bytes into a single integer
     chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
     // Use bitmasks to extract 6-bit segments from the triplet
     a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
     b = (chunk & 258048) >> 12; // 258048 = (2^6 - 1) << 12
     c = (chunk & 4032) >> 6; // 4032 = (2^6 - 1) << 6
     d = chunk & 63; // 63 = 2^6 - 1
     // Convert the raw binary segments to the appropriate ASCII encoding
     base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }
    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
     chunk = bytes[mainLength];
     a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2;
     // Set the 4 least significant bits to zero
     b = (chunk & 3) << 4 // 3 = 2^2 - 1;
     base64 += encodings[a] + encodings[b] + '==';
    }
    else if (byteRemainder == 2) {
     chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
     a = (chunk & 16128) >> 8 // 16128 = (2^6 - 1) << 8;
     b = (chunk & 1008) >> 4 // 1008 = (2^6 - 1) << 4;
     // Set the 2 least significant bits to zero
     c = (chunk & 15) << 2 // 15 = 2^4 - 1;
     base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }
    return "data:image/jpeg;base64," + base64;
 }


cc.Class({
    extends: cc.Component,

    properties: {
        sprHead: cc.Sprite,
        lblName: cc.Label,
        lblId: cc.Label,
        lblPhone: cc.Label,
        nodeChgInfo: cc.Node,
        editName:cc.EditBox,
        preHead:cc.Prefab,
        layerHead:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    init(player){
        this.playerName =utils.getStringByLength(player.name,6) ;
        this.lblId.string = player.id;
        this.lblName.string = player.name;
        this.lblPhone.string = player.phone;
        utils.setHead(this.sprHead,player.head);
    },

    hide(){
        this.node.active = false;
    },

    showChgInfo(){
        this.nodeChgInfo.active = true;
        this.editName.string = '';
        this.initHead();
    },

    hiddeChgInfo(){
        this.nodeChgInfo.active = false;
    },

    confirm(){
        let empName = this.editName.string;
        if(empName.trim() == ''){
            cache.showTipsMsg(`名字不能为空`);
            return;  
        }
        this.save(this.currentPath);
    },

    save(filePath){
        if(this.currentPath == '')
            return;
    	// let nodePersonCenter = cc.find('Canvas/nodePersonCenter').getComponent("nodePersonCenter");
        // let hall = cc.find('Canvas').getComponent("Hall");
        // cc.log("jsbjsbjsbjsbjsbjsbjsb",jsb);
        if(!cc.sys.isNative) return;
        let fileData = jsb.fileUtils.getDataFromFile(filePath);
        if (fileData) {
            let base = _arrayBufferToBase64(fileData);
            // cc.log("basebasebasebasebasebase",base);
            connector.request("uploadHead", {userId:db.player.user_id,base:base},(data)=>{
            cc.log("更新头像------",data);
        		cc.loader.load(data.head,  (err, tex)=> {
		            if (!err) {
		                var spriteFrame = new cc.SpriteFrame(tex);
		               	nodePersonCenter.sprHead.spriteFrame = spriteFrame;
				    	hall.sprHead.spriteFrame = spriteFrame;
				    	db.player.user_head = data.head;
				    	this.node.active = false; 
		            }
		        })		
            });
        }    
    },

    initHead(){
        this.lblName.string = this.playerName;
        this.layerHead.destroyAllChildren();
        for(let i=0;i<8;i++){
            let item = cc.instantiate(this.preHead);
            item.parent = this.layerHead;
            let key = 'head_'+i;
            item.getComponent(cc.Sprite).spriteFrame = cache.sprHead[key];
            if(i==0){
                item.getChildByName("nodeSel").active = true;	
                this.currentPath = '';
            }

            item.on("touchend",()=>{
            	this.layerHead.children.forEach(n=>n.getChildByName("nodeSel").active = false);
                item.getChildByName("nodeSel").active = true;
                this.currentPath = cache.sprHead[key]._textureFilename;
                // cc.loader.loadRes(`head/${key}`,(err,pic)=>{
		        //     if(!err){
		        //     	var spriteFrame = new cc.SpriteFrame(pic);
                // 		this.sprHead.spriteFrame = spriteFrame;
                //         this.currentPath = pic.nativeUrl;
		        //     }
		        // });
            })
        }
    }
});
