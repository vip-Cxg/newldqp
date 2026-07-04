const path = require('path');
const generator = require('./generator');

function projectRoot() {
  if (global.Editor && Editor.Project && Editor.Project.path) return Editor.Project.path;
  return path.resolve(__dirname, '../..');
}

function install() {
  if (global.Editor) Editor.log('[ui-generator] installed');
}

function generateMemberModule() {
  const result = generator.generateMemberModule(projectRoot());
  if (global.Editor) Editor.log('[ui-generator] generated ' + result.prefabs.length + ' prefabs');
  return result;
}

function validateMemberModule() {
  const result = generator.validateMemberModule(projectRoot());
  if (global.Editor) Editor.log('[ui-generator] validate ok');
  return result;
}

module.exports = {
  load: install,
  unload() {},
  install,
  generateMemberModule,
  validateMemberModule,
  messages: {
    'generate-member-module'() {
      generateMemberModule();
    },
    'validate-member-module'() {
      validateMemberModule();
    }
  }
};

if (require.main === module) {
  const cmd = process.argv[2] || 'generate';
  const root = projectRoot();
  if (cmd === 'validate') {
    console.log(JSON.stringify(generator.validateMemberModule(root), null, 2));
  } else {
    console.log(JSON.stringify(generator.generateMemberModule(root), null, 2));
  }
}
