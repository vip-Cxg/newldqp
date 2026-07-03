'use strict';
module.exports = {
  load () { Editor.log('[ui-generator] loaded'); },
  unload () {},
  messages: {
    'open' () { Editor.Panel.open('ui-generator'); },
    'generate-member-module' () {
      Editor.Scene.callSceneScript('ui-generator','generate-member-module',{},function(err,result){
        if (err) { Editor.error(err); return; }
        Editor.log('[ui-generator] 成员管理完整模块创建完成');
      });
    }
  }
};
