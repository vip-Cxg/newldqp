'use strict';

function color(hex){
  hex=hex.replace('#','');
  return new cc.Color(parseInt(hex.substr(0,2),16),parseInt(hex.substr(2,2),16),parseInt(hex.substr(4,2),16),255);
}
function node(name,w,h,x,y,parent){
  var n=new cc.Node(name); n.setContentSize(w,h); n.setPosition(x||0,y||0); if(parent) parent.addChild(n); return n;
}
function block(name,w,h,x,y,c,parent){
  var n=node(name,w,h,x,y,parent);
  var g=n.addComponent(cc.Graphics);
  g.fillColor=color(c);
  g.rect(-w/2,-h/2,w,h);
  g.fill();
  return n;
}
function label(name,text,w,h,x,y,size,c,parent,align){
  var n=node(name,w,h,x,y,parent), l=n.addComponent(cc.Label);
  l.string=text; l.fontSize=size||24; l.lineHeight=(size||24)+6; l.overflow=cc.Label.Overflow.SHRINK;
  l.horizontalAlign=align==null?cc.Label.HorizontalAlign.CENTER:align;
  l.verticalAlign=cc.Label.VerticalAlign.CENTER; n.color=color(c||'#FFFFFF'); return n;
}
function button(name,text,w,h,x,y,c,parent){
  var n=block(name,w,h,x,y,c,parent); n.addComponent(cc.Button);
  label('Label',text,w,h,0,0,24,'#FFFFFF',n); return n;
}
function input(name,hint,w,h,x,y,parent){
  var n=block(name,w,h,x,y,'#FFF8EC',parent), e=n.addComponent(cc.EditBox);
  e.placeholder=hint||''; e.fontSize=26; e.placeholderFontSize=26; return n;
}
function mask(parent){
  var n=block('Mask',1334,750,0,0,'#000000',parent); n.opacity=190; return n;
}
function popupBase(name,title,w,h,parent){
  var root=node(name,1334,750,0,0,parent); root.active=false;
  mask(root);
  var panel=block('Panel',w,h,0,0,'#B39388',root);
  block('TitleBar',w,h>550?66:64,0,h/2-32,'#6760B2',panel);
  label('Title',title,w-120,60,0,h/2-32,36,'#FFFFFF',panel);
  button('BtnClose','×',58,58,w/2-15,h/2-10,'#5141B2',panel);
  return {root:root,panel:panel};
}
function leftMenu(parent){
  var m=block('LeftMenu',225,580,-520,-15,'#A88D82',parent);
  var names=['统计','合伙人','成员管理','代理统计','奖励明细','操作记录','奖励提取'];
  for(var i=0;i<names.length;i++){
    button('Tab_'+i,names[i],200,70,0,250-i*82,i===2?'#F98B2B':'#45B866',m);
  }
  return m;
}
function memberRow(parent,idx){
  var y=105-idx*188, r=block('MemberRow_'+idx,1025,178,112,y,'#F4C995',parent);
  block('InfoBg',1025,98,0,40,'#FFF0D0',r);
  block('Avatar',70,70,-475,43,'#D8B67A',r);
  label('Role',idx===0?'队\n长':'',24,60,-515,45,18,'#FFFFFF',r);
  label('Name','玩家信息',110,32,-385,58,20,'#995126',r);
  label('ID','123456',110,28,-385,28,19,'#995126',r);
  label('Status',idx===0?'在线':'离线',110,60,-255,40,28,idx===0?'#1DAF46':'#555555',r);
  label('Rounds',''+(idx?1:0)+'\n0',120,70,-65,42,20,'#8B4A22',r);
  label('Contribution','2.78\n0',120,70,105,42,20,'#8B4A22',r);
  label('Achievement',idx?'-38.9\n0':'0\n0',120,70,275,42,20,'#8B4A22',r);
  label('Score',idx?'7.4':'100.8',100,60,450,42,20,'#8B4A22',r);
  label('Today','今日：'+(idx?'-38.9':'0'),160,28,-405,-45,18,'#FFFFFF',r,cc.Label.HorizontalAlign.LEFT);
  label('Yesterday','昨日：0',160,28,-405,-78,18,'#FFFFFF',r,cc.Label.HorizontalAlign.LEFT);
  button('BtnPartner','设置合伙人',130,42,-110,-55,'#31BE88',r);
  if(idx) button('BtnLimit','禁止游戏',120,42,40,-55,'#E44B43',r);
  button('BtnDetail','战绩明细',120,42,190,-55,'#1AADE0',r);
  button('BtnAddScore','上分',125,56,350,-55,'#2EC28A',r);
  button('BtnSubScore','下分',125,56,485,-55,'#F3B51D',r);
}
function buildPartner(parent){
  var p=popupBase('PartnerPopup','添加合伙人',580,440,parent), panel=p.panel;
  label('L1','房费比例:',140,55,-190,80,28,'#FFFFFF',panel);
  input('RoomRate','0',325,58,60,80,panel); label('Pct1','%',40,55,250,80,28,'#FFFFFF',panel);
  label('L2','抽水比例:',140,55,-190,-15,28,'#FFFFFF',panel);
  input('PumpRate','0',325,58,60,-15,panel); label('Pct2','%',40,55,250,-15,28,'#FFFFFF',panel);
  button('BtnConfirm','确定',130,58,0,-125,'#2EC28A',panel);
}
function buildSearch(parent){
  var p=popupBase('SearchMemberPopup','搜索成员',850,645,parent), panel=p.panel;
  label('IDText','输入ID号:',250,75,-280,225,34,'#FFFFFF',panel);
  input('IDInput','',455,62,90,225,panel);
  var keys=['1','2','3','4','5','6','7','8','9','重输','0','删除'];
  for(var i=0;i<12;i++){ var col=i%3,row=Math.floor(i/3); button('Key_'+i,keys[i],265,105,-275+col*275,105-row*115,'#6960B9',panel); }
}
function buildScore(parent){
  var p=popupBase('ScorePopup','加减积分',890,610,parent), panel=p.panel;
  var side=block('ModeArea',220,520,-325,-20,'#B39388',panel);
  button('BtnAddMode','增加积分',200,70,0,210,'#F58B2A',side);
  button('BtnSubMode','减少积分',200,70,0,125,'#43B865',side);
  input('ScoreInput','+0',550,70,105,205,panel);
  var keys=['1','2','3','4','5','6','7','8','9','.','0','重输'];
  for(var i=0;i<12;i++){var col=i%3,row=Math.floor(i/3);button('ScoreKey_'+i,keys[i],205,78,-105+col*210,110-row*84,'#6960B9',panel);}
  label('MyScore','我的积分：99999',390,55,-70,-245,28,'#5E56A9',panel);
  button('BtnConfirm','确认操作',200,70,285,-235,'#31BE88',panel);
}
function buildReplay(parent){
  var p=popupBase('BattleReplayPopup','战绩回放',1075,600,parent), panel=p.panel;
  block('TopInfo',1020,42,0,225,'#5BAA63',panel);
  label('Room','房间号：9999999',260,38,-370,225,20,'#FFFFFF',panel);
  label('Round','局数：7',180,38,-120,225,20,'#FFFFFF',panel);
  for(var r=0;r<2;r++){
    var row=block('ReplayRow_'+r,1010,185,0,100-r*205,'#FFF0D0',panel);
    label('Result',r?'赢 1/7':'输 1/7',190,150,-405,0,38,r?'#A56C2A':'#6251B4',row);
    for(var i=0;i<8;i++){
      label('P'+i,'玩家昵称...\n'+(i===1?'-180':'+18'),135,55,-250+(i%2)*265,60-Math.floor(i/2)*42,20,i===1?'#2B9E45':'#2879FF',row);
    }
    button('BtnViewReplay','查看回放',150,48,405,0,'#1AADE0',row);
  }
}
function buildDetail(parent){
  var p=popupBase('BattleDetailPopup','战绩明细',1075,600,parent), panel=p.panel;
  var dates=['06月28日','06月27日','06月27日','06月27日','06月27日','06月27日','06月27日'];
  for(var i=0;i<7;i++) button('Date_'+i,dates[i],135,48,-430+i*145,225,i===0?'#F58B2A':'#43B865',panel);
  var info=block('PlayerInfo',1010,100,0,145,'#FFF0D0',panel);
  block('Avatar',70,70,-470,0,'#D8B67A',info);
  label('Name','玩家信息\n123456',110,65,-380,0,20,'#995126',info);
  label('TodayRound','今日局数：1',260,60,-70,0,26,'#995126',info);
  label('WinLose','输赢：-35.6',260,60,330,0,26,'#3D9B55',info);
  var game=block('GameRow',1010,190,0,-10,'#FFF0D0',panel);
  block('GameHead',1010,42,0,74,'#5BAA63',game);
  label('GameMeta','房间ID:123456   2019-12-12 12:12          牛牛0.5底          回放码：WEEWTEDGDEGDEGAF',960,38,-10,74,20,'#FFFFFF',game);
  for(var j=0;j<8;j++){
    block('Avatar_'+j,60,60,-450+j*92,20,'#D8B67A',game);
    label('Player_'+j,'哇卡一为...\n12****6\n'+(j?'-36':'+3605'),85,80,-450+j*92,-48,16,j?'#286FFF':'#E79A12',game);
  }
  button('BtnCopyCode','复制回放码',150,48,420,20,'#1AADE0',game);
  button('BtnViewReplay','查看回放',150,48,420,-50,'#1AADE0',game);
}
function buildMain(parent){
  var page=node('MemberManagePage',1334,750,0,0,parent);
  block('Frame',1310,720,0,0,'#6760B2',page);
  block('Body',1280,600,0,-15,'#FFF8EC',page);
  label('Title','经营分析',500,70,0,330,46,'#FFFFFF',page);
  button('BtnClose','×',58,58,635,335,'#5141B2',page);
  leftMenu(page);
  var table=block('MemberTable',1040,580,115,-15,'#B39388',page);
  block('Header',1040,64,0,258,'#3FA455',table);
  var hs=[['成员信息',-420],['状态',-245],['今日局数\n昨日局数',-65],['今日贡献\n昨日贡献',105],['今日战绩\n昨日战绩',275],['积分',450]];
  for(var i=0;i<hs.length;i++) label('Header_'+i,hs[i][0],150,58,hs[i][1],258,20,'#FFFFFF',table);
  memberRow(table,0); memberRow(table,1);
  input('SearchInput','',300,50,-320,-255,table);
  button('BtnSearch','查询',125,55,-120,-255,'#F3B51D',table);
}
module.exports={
  'generate-member-module'(event,args){
    var canvas=cc.find('Canvas');
    if(!canvas){Editor.error('请先打开带 Canvas 的场景');event.reply(null);return;}
    var old=canvas.getChildByName('MemberManageModule'); if(old) old.destroy();
    var root=node('MemberManageModule',1334,750,0,0,canvas);
    buildMain(root);
    var layer=node('PopupLayer',1334,750,0,0,root);
    buildPartner(layer); buildSearch(layer); buildScore(layer); buildReplay(layer); buildDetail(layer);
    Editor.Selection.select('node',root.uuid);
    Editor.log('[ui-generator] 已生成 MemberManageModule：主页面 + Partner/Search/Score/BattleDetail/BattleReplay');
    event.reply(null,{uuid:root.uuid});
  }
};
