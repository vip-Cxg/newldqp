Editor.Panel.extend({
  style: `
    :host { margin: 14px; }
    h2 { color:#f90; margin-bottom:8px; }
    .desc { color:#aaa; line-height:22px; margin-bottom:12px; }
    ui-button { width:100%; height:38px; margin-top:10px; }
    #status { margin-top:16px; color:#9f9; white-space:pre-line; }
  `,
  template: `
    <h2>联盟 UI Generator</h2>
    <div class="desc">Cocos Creator 2.4.14 / JS<br>按成员管理效果图生成完整节点模块</div>
    <hr>
    <ui-button id="generate">生成成员管理完整模块</ui-button>
    <div id="status">等待生成</div>
  `,
  $: { generate:'#generate', status:'#status' },
  ready () {
    this.$generate.addEventListener('confirm', () => {
      this.$status.innerText='正在生成主页面 + 5 个弹窗...';
      Editor.Ipc.sendToMain('ui-generator:generate-member-module');
      setTimeout(()=>{ this.$status.innerText='已发送生成命令，请查看层级管理器和控制台。'; },500);
    });
  }
});
