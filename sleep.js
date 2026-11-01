window.PawSleep=(state,save)=>{
 const data=state.sleep||(state.sleep={wake:'07:00',target:8,records:[]});
 const el=document.createElement('section');el.id='sleep-page';el.hidden=true;el.setAttribute('role','tabpanel');el.setAttribute('aria-label','睡眠设置与记录');document.querySelector('main').append(el);
 const home=()=>{el.hidden=true;document.getElementById('tab-home').click()};
 const open=()=>{document.querySelectorAll('[role=tabpanel]').forEach(p=>p.hidden=p!==el);document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected','false'));render();window.scrollTo({top:0})};
 function renderCard(){
 const tile=document.getElementById('sleep-tile'),r=active(),w=r?.wakes?.find(x=>!x.end),pending=!r?data.records.find(x=>x.end&&x.feelingPending):null;
 tile.replaceChildren();const title=document.createElement('h2');title.textContent='睡眠打卡';tile.append(title);
 const body=document.createElement('div');body.className='sleep-body';tile.append(body);
 const moon=document.createElement('span');moon.className='sleep-moon';moon.setAttribute('aria-hidden','true');moon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/></svg>';body.append(moon);
 const status=document.createElement('p');status.className='muted';status.setAttribute('aria-live','polite');status.textContent=(r?(w?'夜间醒来':'休息中'):'准备休息')+' · 夜醒 '+(r?(night(r).count??'—'):0)+' 次';body.append(status);
 const actions=document.createElement('div');actions.className='sleep-actions';body.append(actions);
 const button=(label,fn)=>{const b=document.createElement('button');b.className='sleep-action';b.innerHTML=moon.innerHTML;const text=document.createElement('span');text.textContent=label;b.append(text);b.onclick=()=>{fn();commit()};actions.append(b)};
 if(pending){moon.hidden=true;status.textContent='起床后感觉怎么样？';actions.classList.add('sleep-feelings');for(const feeling of ['疲惫','一般','正常','精神'])button(feeling,()=>{pending.feeling=feeling;delete pending.feelingPending})}
 else if(!r)button('准备睡觉',()=>data.records.unshift({id:Date.now(),start:Date.now(),end:null,wakes:[],feeling:''}));
 else {button(w?'继续睡觉':'我醒了',()=>{
 if(w){w.end=Date.now();if(w.pending&&r.wakeCount!==undefined)r.wakeCount=(r.wakeCount||0)+1;delete w.pending;if(r.wakeMinutes!==undefined)r.wakeMinutes=(r.wakeMinutes||0)+(w.end-w.start)/60000}
 else {if(!r.wakes)r.wakes=[];r.wakes.push({start:Date.now(),end:null,pending:true,reason:'未选择'})}
 });button('正式起床',()=>{
 r.end=Date.now();r.feelingPending=true;
 if(w){r.wakes.splice(r.wakes.indexOf(w),1);if(!w.pending&&r.wakeCount!==undefined)r.wakeCount=Math.max(0,(r.wakeCount||0)-1)}
 })}
 const link=document.createElement('button');link.className='link sleep-footer';link.textContent='睡眠记录 →';link.onclick=open;tile.append(link);
 }
 const local=t=>{const d=new Date(t);return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,16)};
 const fmt=m=>`${Math.floor(m/60)}小时${Math.round(m%60)}分`;
 const night=r=>({count:r.wakeCount!==undefined?r.wakeCount:(Array.isArray(r.wakes)?r.wakes.filter(w=>w.end).length:null),minutes:r.wakeMinutes!==undefined?r.wakeMinutes:(r.wakes?.length?r.wakes.filter(w=>w.end).reduce((n,w)=>n+(w.end-w.start)/60000,0):0)});
 const duration=r=>Number.isFinite(r.start)&&Number.isFinite(r.end)&&r.end>r.start?{bed:(r.end-r.start)/60000}:null;
 let range=7;
 const active=()=>data.records.find(r=>r.start&&!r.end);
 function commit(){save();renderCard();render()}
 function render(){
 el.innerHTML=`<div class="page-heading"><button id="sl-close" class="text-button">← 首页</button><h2>睡眠记录</h2></div>
 <div class="journal-panel"><div class="page-heading"><h3>睡眠目标</h3><button id="sl-goal-edit" class="text-button">编辑</button></div><div class="sl-goals"><div><span>固定起床</span><strong id="sl-wake-value"></strong></div><div><span>目标卧床</span><strong id="sl-target-value"></strong></div></div><form id="sl-goal-form" hidden><label>固定起床时间<input id="sl-wake" type="time" required></label><label>目标卧床时长（小时）<input id="sl-target" type="number" min="1" max="24" step="0.5" required></label><button class="sl-button">保存目标</button></form></div>
 <div class="journal-panel"><div class="page-heading"><h3>睡眠趋势</h3><div class="sl-tabs"><button id="sl-7">7天</button><button id="sl-30">30天</button></div></div><div id="sl-stats" class="sl-metrics"></div><div id="sl-chart" class="sl-chart"></div><p class="sl-hint">仅统计卧床时长，不代表实际睡眠；时间不完整的记录不参与时长统计。</p></div>
 <div class="journal-panel"><div class="page-heading"><h3>历史记录</h3><button id="sl-add" class="text-button">＋ 补记</button></div><div id="sl-history"></div></div>`;
 el.querySelector('#sl-close').onclick=home;
 el.querySelector('#sl-wake-value').textContent=data.wake;el.querySelector('#sl-target-value').textContent=data.target+' 小时';
 const form=el.querySelector('#sl-goal-form');el.querySelector('#sl-wake').value=data.wake;el.querySelector('#sl-target').value=data.target;
 el.querySelector('#sl-goal-edit').onclick=()=>{form.hidden=!form.hidden;if(!form.hidden)el.querySelector('#sl-wake').focus()};
 form.onsubmit=e=>{e.preventDefault();data.wake=el.querySelector('#sl-wake').value;data.target=Number(el.querySelector('#sl-target').value);commit()};
 for(const n of [7,30]){const b=el.querySelector('#sl-'+n);b.setAttribute('aria-pressed',range===n);b.onclick=()=>{range=n;render()}}
 el.querySelector('#sl-add').onclick=()=>edit({id:Date.now(),start:Date.now()-8*3600000,end:Date.now(),wakeCount:null,wakeMinutes:null,feeling:''},true);
 const dateKey=t=>local(t).slice(0,10),today=new Date();today.setHours(0,0,0,0);const start=new Date(today);start.setDate(start.getDate()-range+1);
 const rows=data.records.filter(r=>duration(r)&&r.end>=+start&&r.end<=Date.now());
 const avg=rows.length?rows.reduce((s,r)=>s+duration(r).bed,0)/rows.length:null;
 const goal=data.wake.split(':').map(Number),dev=rows.map(r=>{const d=new Date(r.end),v=Math.abs(d.getHours()*60+d.getMinutes()-goal[0]*60-goal[1]);return Math.min(v,1440-v)});
 [['平均卧床',avg===null?'—':fmt(avg)],['夜醒总次数',rows.length?(rows.some(r=>night(r).count!==null)?rows.reduce((s,r)=>s+(night(r).count||0),0)+' 次':'—'):'—'],['夜醒累计清醒',rows.some(r=>night(r).minutes!==null)?fmt(rows.reduce((s,r)=>s+(night(r).minutes||0),0)):'—'],['平均起床偏差',dev.length?Math.round(dev.reduce((a,b)=>a+b,0)/dev.length)+' 分钟':'—']].forEach(([label,value])=>{const box=document.createElement('div');const small=document.createElement('span');small.textContent=label;const strong=document.createElement('strong');strong.textContent=value;box.append(small,strong);el.querySelector('#sl-stats').append(box)});
 const chart=el.querySelector('#sl-chart');chart.setAttribute('role','img');chart.setAttribute('aria-label',`近${range}天卧床时长趋势，${rows.length}条完整记录`);
 const max=Math.max(data.target,12,...rows.map(r=>duration(r).bed/60));
 for(let i=0;i<range;i++){const d=new Date(start);d.setDate(d.getDate()+i);const matches=rows.filter(r=>dateKey(r.end)===dateKey(+d));const hours=matches.length?matches.reduce((s,r)=>s+duration(r).bed,0)/60:null;const col=document.createElement('div');col.className='sl-bar-col';col.title=(d.getMonth()+1)+'/'+d.getDate()+' · '+(hours===null?'—':fmt(hours*60));const bar=document.createElement('div');bar.className='sl-bar'+(hours===null?' sl-missing':'');bar.style.height=hours===null?'2px':Math.max(2,hours/max*100)+'%';col.append(bar);chart.append(col)}
 const axis=document.createElement('div');axis.className='sl-axis';axis.textContent=(start.getMonth()+1)+'/'+start.getDate()+'　 —　 '+(today.getMonth()+1)+'/'+today.getDate()+' · 单位：小时';chart.after(axis);
 const history=el.querySelector('#sl-history');if(!data.records.length)history.innerHTML='<p class="sl-hint">还没有睡眠记录，点击补记开始。</p>';
 data.records.slice().sort((a,b)=>b.start-a.start).forEach(r=>{const b=document.createElement('button');b.className='sl-history-row';const info=document.createElement('span'),main=document.createElement('strong'),sub=document.createElement('small');main.textContent=new Date(r.start).toLocaleDateString('zh-CN',{month:'short',day:'numeric'});const dur=duration(r);sub.textContent=dur?'夜醒 '+(night(r).count===null?'—':night(r).count+' 次')+' · 清醒 '+(night(r).minutes===null?'—':fmt(night(r).minutes))+' · '+(r.feeling||'精神状态未记'):'记录不完整';info.append(main,sub);const value=document.createElement('span');value.className='sl-history-value';value.textContent=(dur?'卧床 '+fmt(dur.bed):'—')+' ›';b.append(info,value);b.onclick=()=>edit(r);
 const row=document.createElement('div');row.className='sl-history-item';
 const del=document.createElement('button');del.className='sl-history-delete';del.textContent='删除';del.setAttribute('aria-label','删除睡眠记录：'+main.textContent);
 const confirm=document.createElement('div');confirm.className='sl-delete-confirm';confirm.hidden=true;
 const prompt=document.createElement('span');prompt.textContent='删除这条睡眠记录？';
 const yes=document.createElement('button');yes.textContent='确认删除';yes.className='sl-history-delete';yes.onclick=()=>{const index=data.records.indexOf(r);if(index<0)return;data.records.splice(index,1);if(save()){renderCard();render()}else{data.records.splice(index,0,r);prompt.textContent='未能保存删除，请检查存储状态。'}};
 const no=document.createElement('button');no.textContent='取消';no.className='text-button';no.onclick=()=>{confirm.hidden=true;del.hidden=false};
 del.onclick=()=>{confirm.hidden=false;del.hidden=true};confirm.append(prompt,yes,no);row.append(b,del,confirm);history.append(row)})
 }
 function edit(r,isNew=false){
 const modal=document.createElement('dialog');modal.className='sl-edit-dialog';modal.setAttribute('aria-label',isNew?'补记睡眠':'修改睡眠');
 const panel=document.createElement('div');panel.id='sleep-editor';modal.append(panel);document.body.append(modal);
 const close=()=>modal.close();modal.addEventListener('close',()=>modal.remove(),{once:true});
 modal.addEventListener('click',e=>{if(e.target===modal){const rect=modal.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)close()}});

 panel.innerHTML=`<div class="page-heading"><button type="button" id="sl-back" class="text-button">← 返回</button><h2>${isNew?'补记睡眠':'修改睡眠'}</h2></div><form id="sl-form" class="sl-compact-form"><label>准备睡觉时间<input name="start" type="datetime-local"></label><label>正式起床时间<input name="end" type="datetime-local"></label><label>夜醒次数<input name="count" type="number" min="0" step="1" placeholder="记不清可留空"></label><div id="sl-awake"><span class="sl-field-title">夜醒累计清醒时长</span><div class="sl-time-pair"><label><input name="hours" type="number" min="0" step="0.5" placeholder="记不清可留空">小时</label></div></div><label>醒后精神状态<select name="feeling"><option value="">未记录</option><option>疲惫</option><option>一般</option><option>正常</option><option>精神</option></select></label><p id="sl-error" role="alert"></p><button type="submit" class="sl-save">保存</button></form>`;
 panel.querySelector('#sl-back').onclick=close;
 const f=panel.querySelector('form'),n=night(r);f.elements.start.value=r.start?local(r.start):'';f.elements.end.value=r.end?local(r.end):'';f.elements.count.value=n.count??'';f.elements.hours.value=n.minutes===null?'':Math.round(n.minutes/30)/2;f.elements.feeling.value=({'精神充沛':'精神'}[r.feeling]||r.feeling||'');
 const toggle=()=>{panel.querySelector('#sl-awake').hidden=f.elements.count.value!==''&&Number(f.elements.count.value)===0};toggle();f.elements.count.oninput=toggle;
 modal.showModal();
 f.onsubmit=e=>{e.preventDefault();const readTime=name=>f.elements[name].value?+new Date(f.elements[name].value):null,start=readTime('start'),end=readTime('end'),count=f.elements.count.value===''?null:Number(f.elements.count.value),hours=f.elements.hours.value,wakeMinutes=count===0?0:hours===''?null:Number(hours)*60;
 let error='';if(start&&start>Date.now()||end&&end>Date.now())error='记录时间不能晚于现在';else if(start&&end&&end<=start)error='起床时间应晚于准备睡觉时间，可选择次日日期';else if(start&&end&&wakeMinutes!==null&&wakeMinutes>(end-start)/60000)error='清醒时长不能超过卧床时长';else if(start&&!end&&data.records.some(x=>x!==r&&x.start&&!x.end))error='已有一条未结束的睡眠记录';
 if(error){panel.querySelector('#sl-error').textContent=error;return}
 const updated={...r,start,end,wakeCount:count,wakeMinutes,feeling:f.elements.feeling.value};delete updated.latency;delete updated.wakes;if(updated.feeling)delete updated.feelingPending;
 const index=data.records.indexOf(r);if(isNew)data.records.push(updated);else data.records[index]=updated;
 if(save()){close();renderCard();render()}else{if(isNew)data.records.pop();else data.records[index]=r;panel.querySelector('#sl-error').textContent='保存失败，请检查存储状态。'}
 };
 }
 renderCard();render();
};
