const $ = selector => document.querySelector(selector);
const wa = 'https://wa.me/996709139603';
const paths = {
  instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.6" r="1" fill="currentColor" stroke="none"/>',
  share:'<path d="M12 15V3m-4 4 4-4 4 4M6 11H4v10h16V11h-2"/>',
  copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>',
  check:'<path d="m4 12 5 5L20 6"/>',
  telegram:'<path d="m3 10 18-7-4 18-6-5-3 3v-6l9-7-11 6Z"/>',
  wa:'<path d="M20.5 11.6a8.6 8.6 0 0 1-12.8 7.5L3 20.5l1.3-4.6a8.6 8.6 0 1 1 16.2-4.3Z"/><path d="M8.3 7.3c.7-.5 1.1 0 1.4.9l.4 1c.1.4-.3.8-.6 1.1.7 1.3 1.8 2.4 3.4 3.1l.9-1.1c.2-.3.5-.2.8-.1l1.6.8c.4.2.4.5.2 1.1-.3 1.1-1.3 1.6-2.3 1.4-3.6-.7-6.2-3.2-7.1-6-.3-1 .3-1.9 1.3-2.2Z" stroke-width="1.2"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  calendar:'<rect x="3.5" y="5" width="17" height="16" rx="3"/><path d="M7.5 3v4m9-4v4M4 10h16"/>',
  arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',upRight:'<path d="M6 18 18 6M7 6h11v11"/>',
  down:'<path d="m6 9 6 6 6-6"/>',left:'<path d="m14 6-6 6 6 6"/>',right:'<path d="m10 6 6 6-6 6"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',all:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'
};
const icon = key => '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+paths[key]+'</svg>';
document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML=icon(el.dataset.icon));
const closeButton = '<button class="close" data-close aria-label="Закрыть">'+icon('close')+'</button>';
const dateDialog=$('#dates'), infoDialog=$('#info');
const inUsePhotos = new Set(['nailer','compressor','sander','multi','router']);
const selectedProduct=products.find(p=>p.id===document.body.dataset.item);
let category='all';
const normalize = s => s.toLocaleLowerCase('ru').replaceAll('ё','е').trim();
function renderCatalog(){
  const words=normalize($('#search').value).split(/\s+/);
  const shown=products.filter(p => {
    const haystack=normalize([p.name,p.model,p.description,p.feature,p.keywords,categories[p.cat]].join(' '));
    return (category==='all'||category===p.cat)&&words.every(word=>haystack.includes(word));
  });
  $('#count').textContent=shown.length;
  $('#grid').innerHTML=shown.map((p,i)=>`<a class="card" href="tools/${p.id}.html" aria-label="Взять в аренду: ${p.name}">
    <span class="pic ${inUsePhotos.has(p.id)?'action':''}"><img src="assets/${p.id}.webp" alt="${p.name}" loading="${i<4?'eager':'lazy'}"></span>
    <span class="card-info"><span class="category">${categories[p.cat]}</span><strong class="tool-name">${p.name}</strong><span class="model">${p.model}</span>
    <span class="card-bottom">Взять в аренду<span class="round-arrow">${icon('upRight')}</span></span></span></a>`).join('')||'<div class="empty">Инструменты не найдены<br><button id="reset">Сбросить поиск и фильтр</button></div>';
  updateDateLinks();
  document.querySelectorAll('[data-cat]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cat===category)));
}
const iso=(date)=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
const parseDate=key=>new Date(key+'T12:00:00');
function todayKey(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bishkek',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  return ['year','month','day'].map(t=>parts.find(p=>p.type===t).value).join('-');
}
const dateText=(key,year=false)=>parseDate(key).toLocaleDateString('ru-RU',{day:'numeric',month:'short',...(year?{year:'numeric'}:{})});
let start='',end='',draftStart='',draftEnd='',month;
const query = new URLSearchParams(location.search);
function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return iso(parseDate(value)) === value;
}
if (isCalendarDate(query.get('from')) && isCalendarDate(query.get('to'))) {
  start = query.get('from');
  end = query.get('to');
}
function validRange(){return start>=todayKey()&&end>=start;}
function updateDateLinks() {
  const hasDates = validRange();
  for (const link of document.querySelectorAll('.card, .hero-product, .annotation, [data-catalog-link]')) {
    const url = new URL(link.href);
    if (hasDates) {
      url.searchParams.set('from', start);
      url.searchParams.set('to', end);
    } else {
      url.searchParams.delete('from');
      url.searchParams.delete('to');
    }
    link.href = url.href;
  }
}
function rememberRange() {
  const url = new URL(location.href);
  url.searchParams.delete('from');
  url.searchParams.delete('to');
  if (validRange()) {
    url.searchParams.set('from', start);
    url.searchParams.set('to', end);
  }
  // Some browsers disallow replacing the query on a local file.
  try { history.replaceState(history.state, '', url); } catch {}
  refreshBooking();
}
function rangeLabel(){return validRange()?dateText(start)+' — '+dateText(end):'Даты аренды';}
function refreshBooking(){
  updateDateLinks();
  if(!selectedProduct){
    $('#main-dates span').textContent=rangeLabel();
    return;
  }
  $('#product-dates span').textContent=validRange()?rangeLabel():'Выбрать даты аренды';
  const order=$('#order');
  if(validRange()){
    const message=['Здравствуйте! Хочу взять инструмент в аренду в USTAPROKAT.',selectedProduct.name,'С '+dateText(start,true)+' по '+dateText(end,true)+' включительно.','Подскажите, пожалуйста, стоимость и наличие на эти даты.'].join('\n');
    order.href=wa+'?text='+encodeURIComponent(message);
    order.textContent='Оформить в WhatsApp'; order.dataset.ready='true';
  }else{
    order.removeAttribute('href');order.dataset.ready='false';order.setAttribute('tabindex','0');order.textContent='Оформить в WhatsApp';
  }
  order.insertAdjacentHTML('afterbegin',icon('wa'));
}
function initShare() {
  const wrap = $('.share-wrap');
  if (!wrap) return;
  const trigger = $('#share'), menu = $('#share-options'), copy = $('#share-copy');
  const manual = $('#manual-link'), label = copy.querySelector('span'), glyph = copy.querySelector('i');
  const url = new URL(location.href);
  url.search = '';
  url.hash = '';
  $('#share-wa').href = 'https://wa.me/?text=' + encodeURIComponent(url.href);
  $('#share-tg').href = 'https://t.me/share/url?url=' + encodeURIComponent(url.href);
  let session = 0;
  function setOpen(open) {
    session++;
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    manual.hidden = true;
    label.textContent = 'Скопировать ссылку';
    glyph.innerHTML = icon('copy');
  }
  trigger.addEventListener('click', () => setOpen(menu.hidden));
  document.addEventListener('click', e => {
    if (!menu.hidden && !wrap.contains(e.target)) setOpen(false);
  });
  wrap.addEventListener('focusout', e => {
    if (!menu.hidden && e.relatedTarget && !wrap.contains(e.relatedTarget)) setOpen(false);
  });
  wrap.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      trigger.focus();
    }
  });
  copy.addEventListener('click', async () => {
    const current = session;
    try {
      await navigator.clipboard.writeText(url.href);
    } catch {
      if (session !== current) return;
      manual.hidden = false;
      const input = manual.querySelector('input');
      input.value = url.href;
      input.focus();
      input.select();
      try { if (!document.execCommand('copy')) return; } catch { return; }
      copy.focus();
    }
    if (session !== current) return;
    manual.hidden = true;
    glyph.innerHTML = icon('check');
    label.textContent = 'Скопировано';
  });
}
initShare();
function openDates(){
  draftStart=validRange()?start:'';draftEnd=validRange()?end:'';
  const today=parseDate(todayKey()); month=new Date(today.getFullYear(),today.getMonth(),1,12);
  renderCalendar();dateDialog.showModal();
}
function renderCalendar(){
  const today=todayKey(), visible=iso(month).slice(0,7);
  const blanks=(month.getDay()+6)%7;
  const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const cells=Array.from({length:count},(_,i)=>{
    const key=visible+'-'+String(i+1).padStart(2,'0');
    const edge=key===draftStart||key===draftEnd;
    const within=draftEnd&&key>draftStart&&key<draftEnd;
    return `<button class="day ${edge?'edge':''} ${within?'range':''} ${key===today?'today':''}" data-day="${key}" aria-label="${dateText(key,true)}" aria-pressed="${!!(edge||within)}" ${key<today?'disabled':''}>${i+1}</button>`;
  }).join('');
  const caption=draftStart&&!draftEnd?'Выберите последний день аренды':draftEnd?'Период выбран':'Выберите первый день аренды';
  dateDialog.innerHTML=`<header><h2 id="date-title">Даты аренды</h2>${closeButton}</header>
  <div class="date-bounds"><div><small>Начало аренды</small>${draftStart?dateText(draftStart):'Выберите дату'}</div><div><small>Конец аренды</small>${draftEnd?dateText(draftEnd):'Выберите дату'}</div></div>
  <div class="month-head"><button data-month="-1" class="icon-button" aria-label="Предыдущий месяц" ${visible<=today.slice(0,7)?'disabled':''}>${icon('left')}</button><strong>${month.toLocaleDateString('ru-RU',{month:'long',year:'numeric'}).replace(' г.','')}</strong><button data-month="1" class="icon-button" aria-label="Следующий месяц">${icon('right')}</button></div>
  <div class="days">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(s=>'<small>'+s+'</small>').join('')}${'<span></span>'.repeat(blanks)}${cells}</div>
  <p class="cal-tip" aria-live="polite">${caption}</p><div class="cal-foot"><button class="clear-date" data-clear>Сбросить</button><button class="primary" id="apply" ${!draftEnd?'disabled':''}>Применить</button></div>`;
}
function showInfo(key){
  const rent=key==='rent';
  infoDialog.innerHTML='<header><h2 id="info-title">'+(rent?'Как арендовать':'Контакты')+'</h2>'+closeButton+'</header><div class="dialog-copy">'+(rent?'<ol><li>Найдите инструмент в каталоге и откройте карточку.</li><li>Выберите в календаре первый и последний день аренды. Для аренды на один день дважды нажмите на одну дату.</li><li>Нажмите «Оформить в WhatsApp» и отправьте готовую заявку. Менеджер подтвердит наличие, стоимость и условия получения.</li></ol>':'<p>По вопросам аренды напишите в WhatsApp или позвоните.</p><a href="tel:+996709139603">+996 709 139 603</a><a class="primary" href="'+wa+'" target="_blank" rel="noopener">'+icon('wa')+'Написать в WhatsApp</a>')+'</div>';
  infoDialog.showModal();
}
document.addEventListener('click',event=>{
  const el=event.target.closest('button,a');
  if(!el)return;
  if(el.hasAttribute('data-close'))return el.closest('dialog').close();
  if(el.dataset.info)return showInfo(el.dataset.info);
  if(el.dataset.cat){category=el.dataset.cat;return renderCatalog();}
  if(el.id==='reset'){$('#search').value='';category='all';renderCatalog();return $('#search').focus();}
  if(el.id==='main-dates'||el.id==='product-dates'||(el.id==='order'&&el.dataset.ready==='false')){event.preventDefault();return openDates();}
  if(el.dataset.month){month.setMonth(month.getMonth()+Number(el.dataset.month));renderCalendar();(dateDialog.querySelector('[data-month="'+el.dataset.month+'"]:enabled')||dateDialog.querySelector('[data-month="1"]')).focus();return;}
  if(el.dataset.day){
    const key=el.dataset.day;
    if(!draftStart||draftEnd||key<draftStart){draftStart=key;draftEnd='';}else{draftEnd=key;}
    renderCalendar();dateDialog.querySelector('[data-day="'+key+'"]').focus();return;
  }
  if(el.hasAttribute('data-clear')){start='';end='';rememberRange();return dateDialog.close();}
  if(el.id==='apply'&&draftStart>=todayKey()&&draftEnd>=draftStart){start=draftStart;end=draftEnd;dateDialog.close();rememberRange();}
});
document.addEventListener('keydown',event=>{if(event.target.id==='order'&&event.target.dataset.ready==='false'&&['Enter',' '].includes(event.key)){event.preventDefault();openDates();}});
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
}));
if ($('#grid')) {
  $('#filters').innerHTML=Object.entries(categories).map(([id,name])=>`<button class="chip" data-cat="${id}">${id==='all'?icon('all'):''}${name}</button>`).join('');
  $('#search').addEventListener('input',renderCatalog);
  renderCatalog();
}
refreshBooking();
