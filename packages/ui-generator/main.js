const path = require('path');
const generator = require('./generator');

function projectRoot() {
  if (global.Editor && Editor.Project && Editor.Project.path) return Editor.Project.path;
  return path.resolve(__dirname, '../..');
}

function install() {
  if (global.Editor) Editor.log('[ui-generator] installed');
}

function generateMemberModule(options) {
  const result = generator.generateMemberModule(projectRoot(), options || {});
  if (global.Editor) Editor.log('[ui-generator] generated ' + result.prefabs.length + ' prefabs');
  return result;
}

function validateMemberModule() {
  const result = generator.validateMemberModule(projectRoot());
  if (global.Editor) Editor.log('[ui-generator] validate ok');
  return result;
}

function pullLayouts() {
  const result = generator.pullLayoutsFromPrefabs(projectRoot());
  if (global.Editor) Editor.log('[ui-generator] pulled layouts: ' + result.pulled.join(', '));
  return result;
}

function validateLayouts() {
  const result = generator.validateLayoutFiles(projectRoot());
  if (global.Editor) Editor.log('[ui-generator] layout validation differences: ' + result.differences.length);
  return result;
}

function forceRebuildLayout() {
  if (global.Editor) Editor.warn('[ui-generator] force rebuild layout: this will ignore layout json and overwrite manual positions.');
  return generateMemberModule({ forceRebuildLayout: true });
}

module.exports = {
  load: install,
  unload() {},
  install,
  generateMemberModule,
  validateMemberModule,
  pullLayouts,
  validateLayouts,
  forceRebuildLayout,
  messages: {
    'generate-member-module'() {
      generateMemberModule();
    },
    'validate-member-module'() {
      validateMemberModule();
    },
    'pull-layouts'() {
      pullLayouts();
    },
    'validate-layouts'() {
      validateLayouts();
    },
    'force-rebuild-layout'() {
      forceRebuildLayout();
    }
  }
};

if (require.main === module) {
  const cmd = process.argv[2] || 'generate';
  const root = projectRoot();
  if (cmd === 'validate') {
    console.log(JSON.stringify(generator.validateMemberModule(root), null, 2));
  } else if (cmd === 'pull-layouts') {
    console.log(JSON.stringify(generator.pullLayoutsFromPrefabs(root), null, 2));
  } else if (cmd === 'validate-layouts') {
    console.log(JSON.stringify(generator.validateLayoutFiles(root), null, 2));
  } else if (cmd === 'force-generate') {
    console.log(JSON.stringify(generator.generateMemberModule(root, { forceRebuildLayout: true }), null, 2));
  } else {
    console.log(JSON.stringify(generator.generateMemberModule(root), null, 2));
  }
}
