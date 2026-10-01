const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const key='daily-tarot-journal-v1';
const server=http.createServer(async(req,res)=>{
  try{
    const file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html');
    res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'text/javascript':'application/octet-stream');
    res.end(await fs.readFile(file));
  }catch{res.writeHead(404);res.end();}
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try{
    browser=await chromium.launch({channel:'msedge',headless:true});
    const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
    await context.addInitScript(({key})=>{
      if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({days:{},reminders:[],tasks:[{id:'t1',name:'待删除任务',house:6,planIds:['p1']},{id:'t2',name:'保留任务',house:6,planIds:[]}],plans:[{id:'p1',taskId:'t1',name:'待删除任务',house:6,freq:'daily'}],checklog:{'2026-09-01':['p1']}}));
    },{key});
    const page=await context.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.locator('#tab-profile').click();
    await page.locator('#chart .chart-sect').nth(5).click();
    const del=page.getByRole('button',{name:'删除任务：待删除任务',exact:true});
    await del.waitFor();
    page.once('dialog',dialog=>dialog.dismiss());
    await del.click();
    assert.equal(await del.count(),1,'cancel keeps task');
    page.once('dialog',dialog=>dialog.accept());
    await del.click();
    assert.equal(await del.count(),0);
    const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
    assert.deepEqual(saved.tasks.map(t=>t.id),['t2']);
    assert.equal(saved.plans.length,0);
    assert.deepEqual(saved.checklog['2026-09-01'],['p1']);
    await page.reload();
    await page.locator('#tab-profile').click();
    await page.locator('#chart .chart-sect').nth(5).click();
    assert.equal(await del.count(),0,'task stays deleted after reload');
    assert.equal(await page.getByRole('button',{name:'删除任务：保留任务',exact:true}).count(),1);
    console.log('PASS task deletion, cancel, linked plan removal, history preservation, reload');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
