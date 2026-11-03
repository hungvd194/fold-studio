'use strict';
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const server=spawn(process.execPath,['serve.cjs'],{stdio:'pipe'});
async function ready(){for(let i=0;i<60;i++){try{const r=await fetch('http://127.0.0.1:4381');if(r.ok)return}catch{}await new Promise(r=>setTimeout(r,200))}throw Error('server not ready')}
(async()=>{
 let browser;
 try{
  await ready();browser=await chromium.launch({headless:true});
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:4381/',{waitUntil:'load'});
   await page.locator('#easyMode').click();
   if(viewport.width>800){
    const before=await page.locator('[data-param="w"]').inputValue();
    const flapBefore=await page.locator('[data-param="bottom"]').inputValue();
    const handle=page.locator('#drawing [data-key="scale-all"]');
    assert.equal(await handle.count(),1,'One whole-design resize handle');
    const point=await handle.boundingBox();
    assert(point,'Whole-design handle must be visible');
    await page.mouse.move(point.x+point.width/2,point.y+point.height/2);
    await page.mouse.down();await page.mouse.move(point.x+point.width/2+35,point.y+point.height/2+35,{steps:8});await page.mouse.up();
    const after=await page.locator('[data-param="w"]').inputValue();
    const flapAfter=await page.locator('[data-param="bottom"]').inputValue();
    assert.notEqual(after,before,'Body width should change by dragging corner');
    assert.notEqual(flapAfter,flapBefore,'Flaps should scale together with body');
   }
   assert.equal(await page.locator('#easySteps').isVisible(),true);
   assert.equal(await page.locator('[data-easy-step]').count(),4);
   await page.locator('[data-easy-step="2"]').click();
   assert.equal(await page.locator('#tab-size').getAttribute('aria-selected'),'true');
   await page.locator('[data-easy-step="3"]').click();
   assert.equal(await page.locator('#tab-background').getAttribute('aria-selected'),'true');
   await page.locator('[data-easy-step="4"]').click();
   assert.equal(await page.locator('#tab-sheet').getAttribute('aria-selected'),'true');
   await page.locator('#tab-arrange').click();
   assert.equal(await page.locator('#tab-arrange').getAttribute('aria-selected'),'true');
   assert.equal(await page.locator('#layoutRotate').isVisible(),true);
   await page.locator('#layoutRotate').click();
   assert.equal(await page.locator('#layoutAngle').inputValue(),'90');
   await page.locator('#advancedMode').click();
   assert.equal(await page.locator('#easySteps').isVisible(),false);
   await page.locator('#easyMode').click();
   assert.equal(await page.locator('#easySteps').isVisible(),true);
   if(viewport.width>800){
    const canvas=await page.locator('#canvas').boundingBox();
    assert(canvas&&canvas.height>250,'Canvas must remain large on desktop');
    const nav=await page.locator('.easy-toolbar').boundingBox();
    assert(nav&&nav.height<=40,'Beginner toolbar must stay compact');
   }
   assert.deepEqual(errors,[],'No uncaught browser exceptions');
   await page.close();
  }
  console.log('Browser smoke passed: desktop and mobile');
 }finally{if(browser)await browser.close();server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1});
