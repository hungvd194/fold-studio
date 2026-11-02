'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const app=fs.readFileSync(require.resolve('../dist/app.js'),'utf8');

test('render path never scales physical dimensions to fit paper',()=>{
  const section=app.slice(app.indexOf('function keepDesignOnPaper()'),app.indexOf('function updateFitFeedback()'));
  assert.match(section,/fitResult=null/);
  assert.doesNotMatch(section,/G\.fitDesign|p\s*=\s*next|p\.w\s*=/);
});

test('manual fit requires explicit confirmation before changing dimensions',()=>{
  const section=app.slice(app.indexOf('fitPaper:()=>'),app.indexOf('\n});',app.indexOf('fitPaper:()=>'));
  assert.match(section,/window\.confirm/);
  assert(section.indexOf('window.confirm')<section.indexOf('p=next'));
});

test('recovery prompt and browser-local backup disclosure exist',()=>{
  assert.match(app,/fold-recovery-draft-v1/);
  assert.match(app,/recoverDraft\(\)/);
  const html=fs.readFileSync(require.resolve('../dist/index.html'),'utf8');
  assert.match(html,/Clearing browser data/);
  assert.match(html,/sheetOverflowHelp/);
});
