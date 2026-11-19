/* DayFlow Ultimate 5.0 — browser-only planner, no dependencies */
(() => {
  'use strict';

  const STORE = 'dayflow.v5.state';
  const VERSION = 5;
  const MAX_TASKS = 3000;
  const MAX_HABITS = 200;
  const CATEGORIES = {study:'Оқу',work:'Жұмыс',sport:'Спорт',rest:'Демалыс',personal:'Жеке істер'};
  const PRIORITIES = {low:'Төмен',medium:'Орташа',high:'Жоғары'};
  const REPEATS = {none:'Бір рет',daily:'Күн сайын',weekdays:'Жұмыс күндері',weekly:'Әр апта'};
  const MONTHS = ['қаңтар','ақпан','наурыз','сәуір','мамыр','маусым','шілде','тамыз','қыркүйек','қазан','қараша','желтоқсан'];
  const DAYS = ['жексенбі','дүйсенбі','сейсенбі','сәрсенбі','бейсенбі','жұма','сенбі'];
  const SHORT_DAYS = ['Жс','Дс','Сс','Ср','Бс','Жм','Сб'];
  const DAY_ICONS = {study:'📚',work:'💼',sport:'🏐',rest:'☕',personal:'✨'};
  const NAV = [
    {id:'dashboard',name:'Басты бет',icon:'home'},
    {id:'tasks',name:'Менің тапсырмаларым',icon:'list'},
    {id:'timeline',name:'Күн тәртібі',icon:'clock'},
    {id:'calendar',name:'Күнтізбе',icon:'calendar'},
    {id:'habits',name:'Әдеттер',icon:'sparkles'},
    {id:'stats',name:'Статистика',icon:'chart'},
    {id:'settings',name:'Баптаулар',icon:'settings'}
  ];
  const PATHS = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    list:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 9h.01M12 9h5M8 15h.01M12 15h5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
    sparkles:'<path d="m12 2 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6ZM19 17l.7 1.3L21 19l-1.3.7L19 21l-.7-1.3L17 19l1.3-.7Z"/>',
    chart:'<path d="M4 20h16M7 17v-5M12 17V5M17 17V9"/>',
    settings:'<path d="M9.5 3h5l.6 2a7 7 0 0 1 2 .9l1.9-1 2.5 4.2-1.7 1.5a7 7 0 0 1 0 2.8l1.7 1.5-2.5 4.2-1.9-1a7 7 0 0 1-2 .9l-.6 2h-5l-.6-2a7 7 0 0 1-2-.9l-1.9 1L2.5 15l1.7-1.5a7 7 0 0 1 0-2.8L2.5 9.2 5 5l1.9 1a7 7 0 0 1 2-.9L9.5 3Z"/><circle cx="12" cy="12" r="3"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    check:'<path d="m5 12 5 5L20 7"/>',
    close:'<path d="M18 6 6 18M6 6l12 12"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    left:'<path d="m15 18-6-6 6-6"/>',right:'<path d="m9 18 6-6-6-6"/>',
    edit:'<path d="m15 5 4 4M4 20l4-.7L19 8a2.8 2.8 0 0 0-4-4L4 15.3Z"/>',
    trash:'<path d="M4 7h16M9 7V4h6v3m3 0-.8 13H6.8L6 7M10 11v5m4-5v5"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:'<path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5 8.5 8.5 0 1 0 20.5 14.1Z"/>',
    bell:'<path d="M6 17h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v5ZM10 20a2 2 0 0 0 4 0"/>',
    volume:'<path d="M4 9h4l5-4v14l-5-4H4V9Zm12 1a3 3 0 0 1 0 4m2-7a7 7 0 0 1 0 10"/>',
    mute:'<path d="M4 9h4l5-4v14l-5-4H4V9Zm12 1 5 5m0-5-5 5"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
    upload:'<path d="M12 16V4M7 9l5-5 5 5M4 17v4h16v-4"/>',
    refresh:'<path d="M20 7V3h-4M4 17v4h4M5 9a7 7 0 0 1 12-3l3 1M4 17l3 1a7 7 0 0 0 12-4"/>',
    repeat:'<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    play:'<path d="m8 5 11 7-11 7V5Z"/>',pause:'<path d="M8 5v14M16 5v14"/>',
    flame:'<path d="M12 22c-4 0-7-3-7-7 0-3 1-5 4-8 0 3 2 4 3 5 1-4 3-7 3-10 4 5 6 9 6 13 0 4-4 7-9 7Z"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    shield:'<path d="m12 2 9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    pin:'<path d="M8 3h8l-1 7 3 3v2H6v-2l3-3-1-7Zm4 12v7"/>',
    filter:'<path d="M3 5h18M6 12h12m-9 7h6"/>',
    coffee:'<path d="M3 8h14v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5Zm14 1h2a3 3 0 0 1 0 6h-2M7 3v2m5-2v2"/>'
  };
  const svg = (key,size=20) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[key] || PATHS.info}</svg>`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = n => String(n).padStart(2,'0');
  const localDay = (d=new Date()) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const parseDay = key => new Date(`${key}T12:00:00`);
  const addDays = (key,n) => { const d=parseDay(key);d.setDate(d.getDate()+n);return localDay(d) };
  const monday = key => addDays(key,-((parseDay(key).getDay()+6)%7));
  const validDay = key => typeof key==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(key)&&!Number.isNaN(parseDay(key).getTime())&&localDay(parseDay(key))===key;
  const validTime = s => typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
  const toMins = t => parseInt(t.slice(0,2),10)*60+parseInt(t.slice(3),10);
  const dateLabel = (key,weekday=false) => {const d=parseDay(key);return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}${weekday?', '+DAYS[d.getDay()]:''}`};
  const dateShort = key => {const d=parseDay(key);return `${d.getDate()} ${MONTHS[d.getMonth()]}`};
  const monthLabel = (y,m) => `${MONTHS[m]} ${y}`;
  const uid = () => globalThis.crypto?.randomUUID?.() || `df-${Date.now()}-${Math.random().toString(36).slice(2,12)}`;
  const pct = (n,total) => total ? Math.round(100*n/total) : 0;
  const nowDay = () => localDay();
  const todayDate = () => new Date();
  const safeObject = x => x && typeof x==='object' && !Array.isArray(x);
  const byTime = (a,b) => a.start.localeCompare(b.start)||a.title.localeCompare(b.title,'kk');
  const greeting = () => {const h=new Date().getHours();return h<11?'Қайырлы таң':h<18?'Қайырлы күн':'Қайырлы кеш'};
  const DAILY = [
    ['Ояну','07:00','07:20','personal','low'],
    ['Таңғы жаттығу','07:30','07:55','sport','medium'],
    ['Таңғы ас','08:00','08:35','personal','low'],
    ['Оқу','09:00','12:30','study','high'],
    ['Түскі ас','13:00','13:45','personal','low'],
    ['Үй тапсырмалары','15:00','17:00','study','high'],
    ['Спорт','18:00','19:00','sport','medium'],
    ['Демалыс','20:00','21:00','rest','low'],
    ['Ұйқыға дайындалу','22:30','23:00','personal','low']
  ];
  const DEFAULT_HABITS = [['Су ішу','💧'],['Кітап оқу','📖'],['Спортпен айналысу','🏐'],['Ерте тұру','☀️'],['Уақытында ұйықтау','🌙']];
  const quotes = [
    'Бүгінгі кішкентай қадам — ертеңгі үлкен жетістік.',
    'Жоспар жасалғанда армандар нақты мақсатқа айналады.',
    'Жақсы күн — өз уақытыңды бағалаудан басталады.',
    'Тұрақтылық таланттан да күшті бола алады.',
    'Әр аяқталған іс — жаңа мүмкіндікке орын.',
    'Кішкентай жеңістер үлкен сенімді қалыптастырады.',
    'Жолыңды жалғастыр: бүгінгі еңбегің маңызды.'
  ];

  function freshState() {
    const today=nowDay();
    return {
      version:VERSION,
      settings:{name:'Досым',theme:'light',sound:true,alerts:true,notifications:false,lead:10,focusMinutes:25},
      tasks:DAILY.map(([title,start,end,category,priority])=>({id:uid(),title,description:'',date:today,start,end,category,priority,repeat:'daily',until:'',completed:false,doneDates:{},skipDates:{},reminder:true,alarm:true,createdAt:Date.now()})),
      habits:DEFAULT_HABITS.map(([name,emoji])=>({id:uid(),name,emoji,history:{}})),
      alertLog:{},
      focus:{mode:'focus',duration:1500,remaining:1500,running:false,endAt:0,cycles:0}
    };
  }
  const blankState = () => ({version:VERSION,settings:{name:'Досым',theme:'light',sound:true,alerts:true,notifications:false,lead:10,focusMinutes:25},tasks:[],habits:[],alertLog:{},focus:{mode:'focus',duration:1500,remaining:1500,running:false,endAt:0,cycles:0}});

  function normalTask(t,strict=true) {
    if (!safeObject(t)) throw Error('Тапсырма жазбасы жарамсыз.');
    const o={
      id:t.id,title:t.title,description:t.description??'',date:t.date,start:t.start,end:t.end,
      category:t.category??'personal',priority:t.priority??'medium',repeat:t.repeat??'none',until:t.until??'',
      completed:t.completed??false,doneDates:t.doneDates??{},skipDates:t.skipDates??{},
      reminder:t.reminder??true,alarm:t.alarm??true,createdAt:t.createdAt??Date.now()
    };
    if(typeof o.id!=='string'||o.id.length<1||o.id.length>180||typeof o.title!=='string'||!o.title.trim()||o.title.length>120||typeof o.description!=='string'||o.description.length>1200||!validDay(o.date)||!validTime(o.start)||!validTime(o.end)||toMins(o.start)>=toMins(o.end)||!Object.hasOwn(CATEGORIES,o.category)||!Object.hasOwn(PRIORITIES,o.priority)||!Object.hasOwn(REPEATS,o.repeat)||typeof o.until!=='string'||(o.until&&!validDay(o.until))||(o.until&&o.until<o.date)||typeof o.completed!=='boolean'||typeof o.reminder!=='boolean'||typeof o.alarm!=='boolean'||!safeObject(o.doneDates)||!safeObject(o.skipDates))throw Error('Тапсырмада атау, күн, уақыт немесе басқа қате мән бар.');
    for(const key of ['doneDates','skipDates']){
      const obj=Object.create(null);
      for(const [date,val] of Object.entries(o[key])){
        if(!validDay(date)||val!==true)throw Error('Тапсырма тарихында қате дерек бар.');
        obj[date]=true;
      }
      o[key]=obj;
    }
    o.createdAt=Number.isFinite(o.createdAt)?o.createdAt:Date.now();
    o.title=o.title.trim();
    return o;
  }
  function normalHabit(h) {
    if(!safeObject(h)||typeof h.id!=='string'||!h.id||h.id.length>180||typeof h.name!=='string'||!h.name.trim()||h.name.length>90||typeof h.emoji!=='string'||h.emoji.length>16||!safeObject(h.history))throw Error('Әдет жазбасы жарамсыз.');
    const history=Object.create(null);
    for(const [date,val] of Object.entries(h.history)){
      if(!validDay(date)||val!==true)throw Error('Әдет тарихындағы күн жарамсыз.');
      history[date]=true;
    }
    return {id:h.id,name:h.name.trim(),emoji:h.emoji,history};
  }
  function validateState(data) {
    if(!safeObject(data)||!Array.isArray(data.tasks)||!Array.isArray(data.habits)||!safeObject(data.settings))throw Error('JSON ішінде tasks, habits немесе settings бөлімі қате.');
    if(data.tasks.length>MAX_TASKS||data.habits.length>MAX_HABITS)throw Error('Тым көп тапсырма немесе әдет бар.');
    const seen=new Set();
    const tasks=data.tasks.map(t=>{const a=normalTask(t);if(seen.has(a.id))throw Error('Тапсырма ID қайталанады.');seen.add(a.id);return a});
    seen.clear();
    const habits=data.habits.map(h=>{const a=normalHabit(h);if(seen.has(a.id))throw Error('Әдет ID қайталанады.');seen.add(a.id);return a});
    const s=data.settings;
    if(typeof s.name!=='string'||!s.name.trim()||s.name.length>60)throw Error('Пайдаланушы аты қате.');
    if(s.theme!==undefined&&!['light','dark'].includes(s.theme))throw Error('Тақырып күйі қате.');
    for(const k of ['sound','alerts','notifications'])if(s[k]!==undefined&&typeof s[k]!=='boolean')throw Error('Хабарлама баптауында қате бар.');
    const lead=s.lead===undefined?10:Number(s.lead),focusMinutes=s.focusMinutes===undefined?25:Number(s.focusMinutes);
    if(![0,5,10,15,30,60].includes(lead)||![15,25,45].includes(focusMinutes))throw Error('Еске салғыш уақыты қате.');
    const defaults=blankState();
    const settings={...defaults.settings,name:s.name.trim(),theme:s.theme??'light',sound:s.sound??true,alerts:s.alerts??true,notifications:s.notifications??false,lead,focusMinutes};
    const cleanLog=Object.create(null);
    if(safeObject(data.alertLog))for(const [k,v] of Object.entries(data.alertLog).slice(-500))if(k.length<250&&Number.isFinite(v))cleanLog[k]=v;
    const f=data.focus;
    let focus=defaults.focus;
    if(safeObject(f)&&['focus','break'].includes(f.mode)&&Number.isFinite(f.duration)&&f.duration>0&&f.duration<4000&&Number.isFinite(f.remaining)&&f.remaining>=0&&f.remaining<=4000&&typeof f.running==='boolean'&&Number.isFinite(f.endAt)){
      focus={mode:f.mode,duration:f.duration,remaining:f.remaining,running:f.running,endAt:f.endAt,cycles:Number.isSafeInteger(f.cycles)&&f.cycles>=0?f.cycles:0};
    }
    return {version:VERSION,settings,tasks,habits,alertLog:cleanLog,focus};
  }
  function loadLegacy() {
    // Previous DayFlow installations used these keys. Preserve their tasks and history when feasible.
    for(const key of ['dayflow.v4.state','dayflow.v3.state','dayflow.redesign.state']){
      try{
        const raw=localStorage.getItem(key);if(!raw)continue;
        const legacy=JSON.parse(raw);if(!safeObject(legacy)||!Array.isArray(legacy.tasks)||!Array.isArray(legacy.habits))continue;
        const obj={settings:legacy.settings||{name:'Досым'},tasks:legacy.tasks.map(t=>{
          const matched=DAILY.some(([title,start,,category])=>t.title===title&&t.start===start&&t.category===category);
          const repeat=t.repeat??(matched?'daily':'none');
          const doneDates=t.doneDates??(matched&&t.completed&&validDay(t.date)?{[t.date]:true}:{});
          return {...t,repeat,doneDates,skipDates:t.skipDates??{},reminder:t.reminder??true,alarm:t.alarm??true};
        }),habits:legacy.habits};
        return validateState(obj);
      } catch(err) {console.warn('Ескі DayFlow деректерін көшіру мүмкін болмады:',err.message)}
    }
    return null;
  }
  function readLocalBackup() {
    try {
      const text=localStorage.getItem(STORE);
      return text===null?loadLegacy():validateState(JSON.parse(text));
    } catch(e){console.warn('DayFlow: жергілікті деректі оқу қатесі:',e.message);return null}
  }

  let state=null;
  let saveState=null;
  const ui={route:'dashboard',tasksQuery:'',tasksCategory:'all',tasksStatus:'all',tasksDate:'',taskScope:'all',calendarYear:new Date().getFullYear(),calendarMonth:new Date().getMonth(),selectedDate:nowDay(),timelineDate:nowDay(),habitWeek:monday(nowDay()),modal:false,alarmCount:0};
  const dom={app:document.getElementById('app'),nav:document.getElementById('sidebarNav'),mobile:document.getElementById('mobileNav'),modal:document.getElementById('modalRoot'),toasts:document.getElementById('toastRoot')};
  const shownThisVisit=new Set();
  let audioContext=null;
  let lastDay=nowDay();
  let pendingConfirm=null;
  let lastSearchFocus=null;

  function persist() {
    const serialized=JSON.stringify(state);
    if(!saveState||new TextEncoder().encode(serialized).length>900000){
      toast('Деректер сақталмады','Дерек көлемі Firebase шегінен асты.','error');
      return false;
    }
    saveState(serialized);
    return true;
  }
  function commit(){persist();render();}
  function occurs(t,day) {
    if(day<t.date||(t.until&&day>t.until)||t.skipDates?.[day])return false;
    if(t.repeat==='none')return day===t.date;
    if(t.repeat==='daily')return true;
    if(t.repeat==='weekdays')return [1,2,3,4,5].includes(parseDay(day).getDay());
    return parseDay(t.date).getDay()===parseDay(day).getDay();
  }
  const isDone = (t,day) => t.repeat==='none'?t.completed:!!t.doneDates[day];
  const dailyTasks = day => state.tasks.filter(t=>occurs(t,day)).sort(byTime);
  const isOverdue = (t,day) => !isDone(t,day)&&new Date(`${day}T${t.end}:00`).getTime()<Date.now();
  const nextOccurrence = () => {
    const now=Date.now();let result=null;
    for(let n=0;n<30;n++){
      const day=addDays(nowDay(),n);
      for(const t of dailyTasks(day)){
        const starts=new Date(`${day}T${t.start}:00`).getTime();
        if(starts>now&&!isDone(t,day)&&(!result||starts<result.when))result={task:t,day,when:starts};
      }
      if(result)break;
    }
    return result;
  };
  function clockRemaining(ms){const m=Math.max(0,Math.ceil(ms/60000));const d=Math.floor(m/1440),h=Math.floor(m%1440/60),min=m%60;return [d?`${d} күн`:null,h?`${h} сағ`:null,min||(!d&&!h)?`${min} мин`:null].filter(Boolean).join(' ')}
  function metric(label,value,iconName,color='violet',side='') {
    return `<div class="metric-card card hover-card"><div class="metric-head"><span class="metric-icon ${color==='violet'?'':color}">${svg(iconName)}</span>${side?`<span class="metric-side">${esc(side)}</span>`:''}</div><div class="metric-value">${value}</div><div class="metric-label">${esc(label)}</div></div>`;
  }
  const empty = (name,description,button='') => `<div class="empty-state"><div class="empty-icon">${svg('list')}</div><h3>${esc(name)}</h3><p>${esc(description)}</p>${button}</div>`;
  const actionButton = (date='') => `<button type="button" class="btn btn-primary" data-action="new-task" ${date?`data-date="${esc(date)}"`:''}>${svg('plus')} Тапсырма қосу</button>`;
  function pageHeader(kicker,title,sub,actions='') {return `<div class="page-heading"><div><div class="page-eyebrow">✦ ${esc(kicker)}</div><h1>${title}</h1><p class="page-subtitle">${esc(sub)}</p></div>${actions?`<div class="heading-actions">${actions}</div>`:''}</div>`}
  function checkButton(task,day){return `<button type="button" class="check-btn ${isDone(task,day)?'checked':''}" data-action="toggle-task" data-id="${esc(task.id)}" data-date="${day}" aria-label="${isDone(task,day)?'Орындалмаған деп белгілеу':'Орындалды деп белгілеу'}" title="Мәртебесін ауыстыру">${isDone(task,day)?svg('check'):''}</button>`}
  function scheduleRow(t,day) {
    return `<div class="schedule-row ${isDone(t,day)?'is-complete':''}"><div class="schedule-time">${t.start}</div><div class="schedule-line"></div><div class="schedule-content ${t.priority}"><strong>${esc(t.title)}</strong><small>${esc(CATEGORIES[t.category])} · ${t.end} дейін${t.repeat!=='none'?' · ↻':''}${isOverdue(t,day)?' · Мерзімі өтті':''}</small></div>${checkButton(t,day)}</div>`;
  }
  function taskEntry(t,day){
    const done=isDone(t,day),overdue=isOverdue(t,day);
    return `<article class="task-entry ${done?'done':''}">${checkButton(t,day)}<div class="task-body"><strong class="task-title">${esc(t.title)}</strong>${t.description?`<span class="task-desc">${esc(t.description)}</span>`:''}<div class="task-detail"><span class="pill">${svg('calendar')}${dateShort(day)}</span><span class="pill">${svg('clock')}${t.start}–${t.end}</span><span class="pill blue">${esc(CATEGORIES[t.category])}</span><span class="pill ${t.priority==='high'?'danger':t.priority==='low'?'success':'warn'}">${esc(PRIORITIES[t.priority])}</span>${t.repeat!=='none'?`<span class="pill success">${svg('repeat')}${esc(REPEATS[t.repeat])}</span>`:''}${overdue?'<span class="pill danger">Мерзімі өтті</span>':''}</div></div><div class="task-actions"><button class="icon-btn" data-action="edit-task" data-id="${esc(t.id)}" aria-label="Өңдеу" title="Өңдеу">${svg('edit')}</button><button class="icon-btn" data-action="delete-task" data-id="${esc(t.id)}" data-date="${day}" aria-label="Жою" title="Жою">${svg('trash')}</button></div></article>`;
  }
  function renderChrome() {
    document.documentElement.dataset.theme=state.settings.theme;
    document.querySelector('meta[name="theme-color"]').content=state.settings.theme==='dark'?'#10121f':'#f5f6ff';
    const navHtml=(n)=>`<button type="button" class="nav-btn ${ui.route===n.id?'active':''}" data-route="${n.id}" aria-current="${ui.route===n.id?'page':'false'}">${svg(n.icon)}<span>${n.name}</span></button>`;
    dom.nav.innerHTML=NAV.map(navHtml).join('');
    dom.mobile.innerHTML=NAV.slice(0,4).map(n=>`<button type="button" class="mobile-link ${ui.route===n.id?'active':''}" data-route="${n.id}">${svg(n.icon)}<span>${n.id==='tasks'?'Істер':n.name}</span></button>`).join('')+`<button type="button" class="mobile-link ${['habits','stats','settings'].includes(ui.route)?'active':''}" data-action="mobile-menu">${svg('more')}<span>Тағы</span></button>`;
    document.getElementById('currentRouteLabel').textContent=NAV.find(n=>n.id===ui.route)?.name||'Басты бет';
    document.getElementById('themeButton').innerHTML=svg(state.settings.theme==='dark'?'sun':'moon');
    document.getElementById('themeButton').setAttribute('aria-label',state.settings.theme==='dark'?'Жарық режимге ауыстыру':'Қараңғы режимге ауыстыру');
    document.getElementById('notificationButton').innerHTML=svg('bell');
    document.getElementById('headerAvatar').textContent=(state.settings.name[0]||'D').toLocaleUpperCase('kk');
    document.getElementById('sidebarProfile').innerHTML=`<span class="profile-avatar">${esc((state.settings.name[0]||'D').toUpperCase())}</span><span><strong>${esc(state.settings.name)}</strong><small>Жеке профиль</small></span>${svg('right')}`;
    document.getElementById('liveClock').textContent=liveClockString();
  }
  function liveClockString(){const d=new Date();return `${pad(d.getHours())}:${pad(d.getMinutes())} · ${d.getDate()} ${MONTHS[d.getMonth()]}`}
  function render(){if(!state)return;renderChrome();const map={dashboard:renderDashboard,tasks:renderTasks,timeline:renderTimeline,calendar:renderCalendar,habits:renderHabits,stats:renderStats,settings:renderSettings};try{dom.app.innerHTML=`<div class="page-animate">${(map[ui.route]||renderDashboard)()}</div>`}catch(e){console.error('DayFlow rendering error',e);dom.app.innerHTML=empty('Бөлімді ашу мүмкін болмады','Бетті жаңартып көріңіз.')}}
  function navigate(route) {if(!NAV.some(n=>n.id===route))route='dashboard';closeModal();ui.route=route;history.replaceState(null,'',`#${route}`);render();window.scrollTo({top:0,behavior:'auto'})}
  function toast(title,subtitle='',type='success') {
    const node=document.createElement('div');node.className=`toast ${type==='warn'?'warn':type==='error'?'error':''}`;
    const i=document.createElement('span');i.className='toast-icon';i.innerHTML=svg(type==='success'?'check':type==='warn'?'bell':'info');
    const body=document.createElement('div'),h=document.createElement('strong');h.textContent=title;body.append(h);
    if(subtitle){const p=document.createElement('p');p.textContent=subtitle;body.append(p)}
    const x=document.createElement('button');x.type='button';x.className='icon-btn';x.setAttribute('aria-label','Хабарламаны жабу');x.innerHTML=svg('close');x.addEventListener('click',()=>node.remove());
    node.append(i,body,x);dom.toasts.append(node);window.setTimeout(()=>node.remove(),7000);
  }

  function renderDashboard() {
    const day=nowDay(),tasks=dailyTasks(day),done=tasks.filter(t=>isDone(t,day)).length,rate=pct(done,tasks.length),next=nextOccurrence();
    const recurring=tasks.filter(t=>t.repeat!=='none');
    const habitsDone=state.habits.filter(h=>h.history[day]).length;
    const quote=quotes[Math.floor(parseDay(day).getTime()/86400000)%quotes.length];
    return `${pageHeader('СІЗДІҢ КҮНІҢІЗ',`${greeting()}, ${esc(state.settings.name)}! <span aria-hidden="true">👋</span>`,'Кішкентай қадамдардан үлкен нәтижелер басталады.',actionButton(day))}
      <div class="hero-grid"><section class="hero-panel"><div><div class="hero-eyebrow"><span>✦</span> БҮГІНГІ ШАБЫТ</div><h2>Әр күніңізді<br>мағыналы өткізіңіз!</h2><p>Ойыңыздағы жоспарды әрекетке айналдырыңыз. Әр ісіңіз маңызды.</p><button type="button" class="btn" data-route="timeline">Күн тәртібін көру ${svg('arrow')}</button></div><div class="hero-art" aria-hidden="true"><div class="glass-disc">${svg('target')}</div><span class="star a">✦</span><span class="star b">✧</span></div></section>
      <section class="next-card card hover-card"><div class="card-top"><h2>Келесі тапсырма</h2><span class="pill blue">${svg('bell')} Жоспарда</span></div><div class="next-visual">${svg('clock')}</div>${next?`<div><div class="next-name">${esc(next.task.title)}</div><div class="next-meta">${dateShort(next.day)} · ${next.task.start} – ${next.task.end}</div></div><p class="countdown-text">Басталуына: <strong id="nextCountdown">${clockRemaining(next.when-Date.now())}</strong></p>`:`<div class="next-name">Барлығы дайын! ✨</div><p class="next-meta">Алда тапсырма жоқ. Жаңа жоспар құруға болады.</p>`}</section></div>
      <div class="stats-row">${metric('Бүгінгі тапсырмалар',tasks.length,'list','violet','Бүгін')}${metric('Орындалғандары',done,'check','green',`${rate}%`)}${metric('Қалған істер',tasks.length-done,'clock','orange','Алда')}${metric('Күндік прогресс',`${rate}%`,'chart','blue','Өсу')}</div>
      <div class="dash-main"><div class="dash-column"><section class="card card-pad"><div class="section-head"><div><h2>Бүгінгі жоспар</h2><p class="card-desc">${dateLabel(day,true)} · ${tasks.length} тапсырма</p></div><button type="button" class="btn-link" data-route="tasks">Барлығын көру ${svg('arrow')}</button></div>${tasks.length?`<div class="schedule-list">${tasks.slice(0,8).map(t=>scheduleRow(t,day)).join('')}</div>`:empty('Бүгінгі жоспар бос','Жаңа тапсырма қосып бастаңыз.',actionButton(day))}</section>
      <section class="card card-pad"><div class="section-head"><div><h2>${svg('repeat')} Күнделікті істер</h2><p class="card-desc">Бұл істер әр күні қайта пайда болады және жоғалмайды.</p></div><span class="pill success">${recurring.filter(t=>isDone(t,day)).length}/${recurring.length}</span></div>${recurring.length?`<div class="schedule-list">${recurring.slice(0,6).map(t=>`<div class="daily-row ${isDone(t,day)?'done':''}"><span class="daily-icon">${DAY_ICONS[t.category]}</span><span class="daily-body"><strong>${esc(t.title)}</strong><small>${t.start}–${t.end} · ${esc(REPEATS[t.repeat])}</small></span>${checkButton(t,day)}</div>`).join('')}</div><button type="button" class="btn-link" data-route="tasks" style="margin-top:16px">Барлық тұрақты тапсырмалар ${svg('arrow')}</button>`:empty('Әзірге қайталанатын іс жоқ','Жаңа тапсырма қосқанда «Күн сайын» таңдаңыз.')}</section></div>
      <div class="dash-column"><section class="card card-pad"><div class="section-head"><div><h2>Күндік нәтиже</h2><p class="card-desc">Мақсатқа жақындап келесіз</p></div><span class="pill">${rate}%</span></div><div class="ring-wrap"><div class="progress-ring" style="--pct:${rate}"><div class="ring-inner"><strong>${rate}%</strong><span>Орындалды</span></div></div><div class="ring-legend"><span><i class="legend-dot"></i>${done} аяқталды</span><span><i class="legend-dot muted"></i>${tasks.length-done} қалды</span></div></div></section>
      <section class="card card-pad"><div class="section-head"><div><h2>Бүгінгі әдеттер</h2><p class="card-desc">${habitsDone}/${state.habits.length} әдет орындалды</p></div><button type="button" class="btn-link" data-route="habits">Барлығы ${svg('arrow')}</button></div>${state.habits.length?state.habits.slice(0,5).map(h=>`<div class="daily-row ${h.history[day]?'done':''}"><span class="daily-icon">${esc(h.emoji)}</span><span class="daily-body"><strong>${esc(h.name)}</strong><small>Бүгінгі белгі</small></span><button type="button" class="check-btn ${h.history[day]?'checked':''}" data-action="toggle-habit" data-id="${esc(h.id)}" data-date="${day}" aria-label="${esc(h.name)}: белгілеу">${h.history[day]?svg('check'):''}</button></div>`).join(''):empty('Әдеттер жоқ','Бірінші әдетті қосыңыз.')}</section>
      ${renderFocusCard()}<section class="quote-card"><small>✦ КҮННІҢ ШАБЫТЫ</small><p>“${esc(quote)}”</p></section></div></div>`;
  }

  function focusRemaining(){return state.focus.running ? Math.max(0,Math.ceil((state.focus.endAt-Date.now())/1000)) : state.focus.remaining}
  function formatSeconds(seconds){const safe=Math.max(0,seconds);return `${pad(Math.floor(safe/60))}:${pad(safe%60)}`}
  function renderFocusCard(){
    const f=state.focus;
    return `<section class="focus-widget card"><div class="section-head"><div><h2>Фокус таймері</h2><p class="card-desc">Назарды бір іске аударыңыз</p></div><span class="pill">${svg('target')} Pomodoro</span></div><div id="focusDisplay" class="focus-time">${formatSeconds(focusRemaining())}</div><p class="card-desc">${f.mode==='focus'?'Жұмыс уақыты':'Қысқа үзіліс'} · ${f.cycles} фокус сессиясы</p><div class="focus-options">${[15,25,45].map(v=>`<button type="button" class="focus-chip ${state.settings.focusMinutes===v?'active':''}" data-action="focus-duration" data-duration="${v}">${v} мин</button>`).join('')}</div><div class="heading-actions"><button class="btn btn-primary btn-small" data-action="focus-toggle">${svg(f.running?'pause':'play')} ${f.running?'Тоқтату':'Бастау'}</button><button class="btn btn-secondary btn-small" data-action="focus-reset">${svg('refresh')} Қалпына</button><button class="btn btn-soft btn-small" data-action="focus-mode">${f.mode==='focus'?'Үзіліс':'Жұмыс'}</button></div></section>`;
  }
  function collectTaskRows(){
    const date=ui.tasksDate||nowDay();
    let items=date==='all'
      ? state.tasks.map(t=>({task:t,day:t.repeat==='none'?t.date:(occurs(t,nowDay())?nowDay():t.date)})).sort((a,b)=>a.day.localeCompare(b.day)||byTime(a.task,b.task))
      : dailyTasks(date).map(t=>({task:t,day:date}));
    const query=ui.tasksQuery.trim().toLocaleLowerCase('kk-KZ');
    items=items.filter(({task:t,day})=>(ui.tasksCategory==='all'||t.category===ui.tasksCategory)&&
      (ui.taskScope==='all'||(ui.taskScope==='repeat'&&t.repeat!=='none')||(ui.taskScope==='once'&&t.repeat==='none'))&&
      (ui.tasksStatus==='all'||(ui.tasksStatus==='done'&&isDone(t,day))||(ui.tasksStatus==='pending'&&!isDone(t,day))||(ui.tasksStatus==='overdue'&&isOverdue(t,day)))&&
      (!query||`${t.title} ${t.description} ${CATEGORIES[t.category]}`.toLocaleLowerCase('kk-KZ').includes(query)));
    return items;
  }
  const selectOptions=(data,selected)=>data.map(([val,name])=>`<option value="${esc(val)}" ${selected===val?'selected':''}>${esc(name)}</option>`).join('');
  function renderTasksList(){const items=collectTaskRows();return items.length?items.map(({task,day})=>taskEntry(task,day)).join(''):empty('Тапсырма табылмады','Сүзгіні өзгертіңіз немесе жаңа тапсырма қосыңыз.',actionButton(ui.tasksDate||nowDay()))}
  function renderTasks(){
    const date=ui.tasksDate||nowDay(),all=date==='all'?state.tasks:dailyTasks(date),repeat=all.filter(t=>t.repeat!=='none');
    return `${pageHeader('ТАПСЫРМАЛАР','Менің тапсырмаларым','Күнделікті және жеке тапсырмаларды бір жерден басқарыңыз.',actionButton(date==='all'?'':date))}
      <section class="daily-pinned"><div class="card-top"><div><h3>${svg('pin')} Күнделікті тұрақты жоспар</h3><p class="pin-note">${repeat.length} қайталанатын іс. Олар келесі күндері де автоматты түрде көрінеді.</p></div><span class="pill success">↻ Тұрақты</span></div></section>
      <div class="task-toolbar card"><label class="search-box">${svg('search')}<input id="tasksSearch" class="input" type="search" value="${esc(ui.tasksQuery)}" placeholder="Тапсырма іздеу..." aria-label="Тапсырмаларды іздеу" maxlength="120"></label>
        <select class="select" id="tasksCategory" aria-label="Санат сүзгісі">${selectOptions([['all','Барлық санаттар'],...Object.entries(CATEGORIES)],ui.tasksCategory)}</select>
        <select class="select" id="tasksStatus" aria-label="Мәртебе сүзгісі">${selectOptions([['all','Барлық мәртебе'],['done','Орындалды'],['pending','Орындалмаған'],['overdue','Мерзімі өткен']],ui.tasksStatus)}</select>
        <input class="input" type="date" id="tasksDate" value="${date==='all'?'':esc(date)}" aria-label="Күн бойынша сүзгі">
        <button class="btn btn-secondary btn-small" type="button" data-action="all-dates">${svg('calendar')} Барлық күн</button><button class="btn btn-secondary btn-small" type="button" data-action="clear-filters">${svg('refresh')} Тазарту</button></div>
      <div class="heading-actions" style="margin-bottom:15px"><button class="btn ${ui.taskScope==='all'?'btn-soft':'btn-secondary'} btn-small" data-action="task-scope" data-scope="all">Барлығы</button><button class="btn ${ui.taskScope==='repeat'?'btn-soft':'btn-secondary'} btn-small" data-action="task-scope" data-scope="repeat">${svg('repeat')} Қайталанатын</button><button class="btn ${ui.taskScope==='once'?'btn-soft':'btn-secondary'} btn-small" data-action="task-scope" data-scope="once">Бір реттік</button></div>
      <section class="task-table card"><div class="table-head"><div><h2>Тапсырмалар <span id="taskCount" style="color:var(--muted)">(${collectTaskRows().length})</span></h2><p class="card-desc">${date==='all'?'Барлық сақталған тапсырмалар':dateLabel(date,true)}</p></div><span class="pill blue">Уақыт бойынша</span></div><div id="taskRows">${renderTasksList()}</div></section>`;
  }
  function renderTimeline(){
    const day=ui.timelineDate,items=dailyTasks(day),done=items.filter(t=>isDone(t,day)).length,rate=pct(done,items.length),now=todayDate();
    const hours=Array.from({length:24},(_,i)=>i);
    return `${pageHeader('УАҚЫТТЫ БАСҚАРУ','Күн тәртібі','Күніңізді нақты сағаттар бойынша бақылаңыз.',actionButton(day))}
      <div class="timeline-layout"><section class="timeline-card card"><div class="card-top"><div><h2>${dateLabel(day,true)}</h2><p class="card-desc">24 сағаттық уақыт шкаласы</p></div><div class="date-switch"><button class="icon-btn" data-action="timeline-prev" aria-label="Алдыңғы күн">${svg('left')}</button><button class="btn btn-soft btn-small" data-action="timeline-today">Бүгін</button><button class="icon-btn" data-action="timeline-next" aria-label="Келесі күн">${svg('right')}</button></div></div><div class="timeline-scroll" id="timelineScroll">${hours.map(hour=>{
        const list=items.filter(t=>Number(t.start.slice(0,2))===hour);
        return `<div class="hour-block"><span class="hour-label">${pad(hour)}:00</span><div class="hour-slot ${day===nowDay()&&hour===now.getHours()?'now':''}">${list.map(t=>`<button class="time-block ${t.priority} ${isDone(t,day)?'done':''}" data-action="edit-task" data-id="${esc(t.id)}"><span><strong>${esc(t.title)}</strong><small>${t.start}–${t.end} · ${esc(CATEGORIES[t.category])}${t.repeat!=='none'?' · ↻':''}</small></span>${svg('edit')}</button>`).join('')}</div></div>`}).join('')}</div></section>
      <aside class="card card-pad"><h2>Күндік шолу</h2><p class="card-desc">Таңдалған күннің нәтижесі</p><div class="ring-wrap"><div class="progress-ring" style="--pct:${rate}"><div class="ring-inner"><strong>${rate}%</strong><span>Аяқталды</span></div></div></div><div class="category-row"><span>Барлығы</span><div class="progress-bar"><span class="progress-fill" style="--width:100%"></span></div><strong>${items.length}</strong></div><div class="category-row"><span>Орындалды</span><div class="progress-bar"><span class="progress-fill" style="--width:${rate}%"></span></div><strong>${done}</strong></div><div class="category-row"><span>Қалғаны</span><div class="progress-bar"><span class="progress-fill" style="--width:${100-rate}%"></span></div><strong>${items.length-done}</strong></div><button class="btn btn-primary" style="width:100%;margin-top:20px" data-action="new-task" data-date="${day}">${svg('plus')} Осы күнге қосу</button></aside></div>`;
  }
  function renderCalendar(){
    const y=ui.calendarYear,m=ui.calendarMonth,first=new Date(y,m,1),offset=(first.getDay()+6)%7,start=new Date(y,m,1-offset),days=Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d});
    const selected=ui.selectedDate,selectedTasks=dailyTasks(selected);
    return `${pageHeader('ЖОСПАРЛАУ','Күнтізбе','Күндерді таңдап, барлық жоспарды көріңіз.',actionButton(selected))}
      <div class="calendar-layout"><section class="calendar-card card"><div class="calendar-head"><h2>${monthLabel(y,m)}</h2><div class="date-switch"><button class="btn btn-soft btn-small" data-action="calendar-today">Бүгін</button><button class="icon-btn" data-action="calendar-prev" aria-label="Алдыңғы ай">${svg('left')}</button><button class="icon-btn" data-action="calendar-next" aria-label="Келесі ай">${svg('right')}</button></div></div><div class="calendar-weekdays">${['Дс','Сс','Ср','Бс','Жм','Сб','Жс'].map(x=>`<span>${x}</span>`).join('')}</div><div class="calendar-grid">${days.map(d=>{
        const key=localDay(d),list=dailyTasks(key),off=d.getMonth()!==m;
        return `<button class="calendar-day ${off?'other':''} ${key===nowDay()?'today':''} ${key===selected?'selected':''}" data-action="calendar-select" data-date="${key}" aria-label="${dateLabel(key)}, ${list.length} тапсырма"><span>${d.getDate()}</span><span class="calendar-dots">${list.slice(0,3).map(t=>`<i class="${isDone(t,key)?'done':''}"></i>`).join('')}</span></button>`;
      }).join('')}</div><p class="card-desc" style="margin-top:18px">Күлгін нүкте — жоспар, жасыл нүкте — орындалған іс</p></section>
      <aside class="card card-pad"><div class="section-head"><div><p class="page-eyebrow">ТАҢДАЛҒАН КҮН</p><h2>${dateLabel(selected,true)}</h2><p class="card-desc">${selectedTasks.length} тапсырма</p></div></div>${selectedTasks.length?selectedTasks.map(t=>`<div class="daily-row ${isDone(t,selected)?'done':''}"><span class="daily-icon">${DAY_ICONS[t.category]}</span><span class="daily-body"><strong>${esc(t.title)}</strong><small>${t.start}–${t.end}</small></span>${checkButton(t,selected)}</div>`).join(''):empty('Бұл күнге жоспар жоқ','Осы күнге бірінші тапсырманы қосыңыз.')}
      <button type="button" class="btn btn-primary" style="width:100%;margin-top:20px" data-action="new-task" data-date="${selected}">${svg('plus')} Осы күнге қосу</button></aside></div>`;
  }
  function weekDays(start){return Array.from({length:7},(_,i)=>addDays(start,i))}
  function renderHabits(){
    const days=weekDays(ui.habitWeek),today=nowDay();const total=state.habits.length,todayDone=state.habits.filter(h=>h.history[today]).length;
    const possible=days.filter(d=>d<=today).length*total;
    const done=state.habits.reduce((sum,h)=>sum+days.filter(d=>d<=today&&h.history[d]).length,0);
    return `${pageHeader('ТҰРАҚТЫЛЫҚ','Әдеттерді бақылау','Күн сайын өзіңізге берген уәдені орындаңыз.',`<button class="btn btn-primary" data-action="new-habit">${svg('plus')} Әдет қосу</button>`)}
      <div class="habit-overview">${metric('Барлық әдет',total,'sparkles')}${metric('Бүгін орындалды',todayDone,'check','green')}${metric('Апталық прогресс',`${pct(done,possible)}%`,'chart','blue')}</div>
      <div class="section-head"><div><h2>Апталық бақылау</h2><p class="card-desc">${dateShort(days[0])} – ${dateShort(days[6])}</p></div><div class="date-switch"><button class="icon-btn" data-action="habits-prev" aria-label="Алдыңғы апта">${svg('left')}</button><button class="btn btn-soft btn-small" data-action="habits-today">Осы апта</button><button class="icon-btn" data-action="habits-next" aria-label="Келесі апта">${svg('right')}</button></div></div>
      ${state.habits.length?state.habits.map(h=>{
        const achieved=days.filter(d=>h.history[d]).length;
        const history=Array.from({length:28},(_,i)=>addDays(today,i-27));
        return `<article class="habit-card card"><div class="habit-top"><span class="habit-symbol">${esc(h.emoji)}</span><span class="habit-title"><strong>${esc(h.name)}</strong><small>${achieved}/7 күн · ${pct(achieved,days.filter(d=>d<=today).length)}% орындалды</small></span><div class="task-actions"><button class="icon-btn" data-action="edit-habit" data-id="${esc(h.id)}" aria-label="Әдетті өңдеу">${svg('edit')}</button><button class="icon-btn" data-action="delete-habit" data-id="${esc(h.id)}" aria-label="Әдетті жою">${svg('trash')}</button></div></div><div class="habit-grid">${days.map(d=>`<button type="button" class="habit-day ${h.history[d]?'checked':''}" data-action="toggle-habit" data-id="${esc(h.id)}" data-date="${d}" ${d>today?'disabled':''} aria-label="${esc(h.name)}: ${dateLabel(d)}"><small>${SHORT_DAYS[parseDay(d).getDay()]}</small><span>${h.history[d]?svg('check'):parseDay(d).getDate()}</span></button>`).join('')}</div><div class="card-top" style="margin-top:17px"><p class="card-desc">Соңғы 28 күн тарихы</p><span class="pill success">${history.filter(d=>h.history[d]).length}/28</span></div><div class="habit-history">${history.map(d=>`<span class="history-dot ${h.history[d]?'active':''}" title="${dateLabel(d)}: ${h.history[d]?'Орындалды':'Белгіленбеген'}"></span>`).join('')}</div></article>`;
      }).join(''):empty('Әзірге әдет жоқ','Бірінші әдетті қосып, прогресті қадағалаңыз.',`<button class="btn btn-primary" data-action="new-habit">${svg('plus')} Әдет қосу</button>`)}`;
  }
  function renderStats(){
    const today=nowDay(),days=Array.from({length:7},(_,i)=>addDays(today,i-6)),data=days.map(day=>{const t=dailyTasks(day);return {day,total:t.length,done:t.filter(x=>isDone(x,day)).length}});
    const total=data.reduce((sum,d)=>sum+d.total,0),done=data.reduce((sum,d)=>sum+d.done,0),ratio=pct(done,total);
    const categories=Object.keys(CATEGORIES).map(key=>({key,count:data.reduce((sum,d)=>sum+dailyTasks(d.day).filter(t=>t.category===key).length,0)}));
    const habitStats=state.habits.map(h=>({name:h.name,rate:pct(days.filter(d=>h.history[d]).length,7)}));
    return `${pageHeader('НӘТИЖЕЛЕР','Статистика','Нақты жоспарлар мен әдеттердің соңғы 7 күндегі нәтижесі.')}
      <div class="stats-row">${metric('Жоспарланған істер',total,'list')}${metric('Орындалғандары',done,'check','green')}${metric('Орындалмағаны',total-done,'clock','orange')}${metric('Өнімділік',`${ratio}%`,'chart','blue')}</div>
      <div class="chart-layout"><section class="chart-card card"><div class="section-head"><div><h2>Апталық өнімділік</h2><p class="card-desc">Орындалған тапсырмалар · 7 күн</p></div><span class="pill">7 күн</span></div>${total?`<div class="weekly-bars">${data.map(d=>{const max=Math.max(1,...data.map(a=>a.total));return `<div class="bar-col ${d.day===today?'today':''}" title="${dateLabel(d.day)}: ${d.done}/${d.total}"><span class="bar-num">${d.done}</span><div class="bar-track"><span class="bar-fill" style="--height:${pct(d.done,max)}%"></span></div><span class="bar-day">${SHORT_DAYS[parseDay(d.day).getDay()]}</span></div>`}).join('')}</div>`:empty('Әзірге статистика жоқ','Тапсырмалар қосқанда график пайда болады.')}</section>
      <section class="chart-card card"><div class="section-head"><div><h2>Санаттар бойынша</h2><p class="card-desc">Барлық жоспарлардың таралуы · 7 күн</p></div>${svg('filter')}</div>${total?categories.map(c=>`<div class="category-row"><span class="category-name">${CATEGORIES[c.key]}</span><div class="progress-bar"><span class="progress-fill" style="--width:${pct(c.count,total)}%"></span></div><strong class="category-count">${c.count}</strong></div>`).join(''):empty('Деректер жоқ','Тапсырма қосыңыз.')}</section>
      <section class="chart-card card"><div class="section-head"><div><h2>Әдеттер нәтижесі</h2><p class="card-desc">Соңғы 7 күн · әр әдеттің үлесі</p></div>${svg('sparkles')}</div>${habitStats.length?habitStats.map(h=>`<div class="category-row"><span class="category-name" style="overflow-wrap:anywhere">${esc(h.name)}</span><div class="progress-bar"><span class="progress-fill" style="--width:${h.rate}%;background:var(--success)"></span></div><strong class="category-count">${h.rate}%</strong></div>`).join(''):empty('Әдеттер жоқ','Жаңа әдет қосыңыз.')}</section>
      <section class="chart-card card"><div class="section-head"><div><h2>Жалпы жетістік</h2><p class="card-desc">Соңғы жеті күннің орындалуы</p></div>${svg('target')}</div><div class="ring-wrap"><div class="progress-ring" style="--pct:${ratio}"><div class="ring-inner"><strong>${ratio}%</strong><span>Орындалды</span></div></div><div class="ring-legend"><span><i class="legend-dot"></i>${done} орындалды</span><span><i class="legend-dot muted"></i>${total-done} орындалмады</span></div></div></section></div>`;
  }
  function renderSettings(){
    const s=state.settings;
    const toggle=(name,label,description,value)=>`<div class="setting-row"><div><h3>${label}</h3><p>${description}</p></div><button class="setting-toggle ${value?'on':''}" type="button" role="switch" aria-checked="${value}" aria-label="${label}" data-action="setting-toggle" data-setting="${name}"></button></div>`;
    return `${pageHeader('ЖЕКЕ БАПТАУЛАР','Баптаулар','DayFlow-ды өз талғамыңызға сай реттеңіз.')}
      <div class="settings-layout"><div class="settings-list"><section class="setting-card card"><h2>Жеке профиль</h2><p class="card-desc">Бұл ат сәлемдесуде көрсетіледі.</p><form id="nameForm" class="name-form"><input class="input" name="name" aria-label="Пайдаланушы аты" value="${esc(s.name)}" maxlength="60" required><button class="btn btn-primary" type="submit">Сақтау</button></form><div class="input-error" id="nameError"></div></section>
      <section class="setting-card card"><h2>Көрініс</h2><p class="card-desc">Көзге ыңғайлы режим таңдаңыз.</p><div class="setting-actions" style="margin-top:16px"><button class="btn ${s.theme==='light'?'btn-primary':'btn-secondary'}" data-action="set-theme" data-theme="light">${svg('sun')} Жарық</button><button class="btn ${s.theme==='dark'?'btn-primary':'btn-secondary'}" data-action="set-theme" data-theme="dark">${svg('moon')} Қараңғы</button></div></section>
      <section class="setting-card card"><h2>Еске салғыш және будильник</h2><p class="card-desc">Уақыт басталғанда және дедлайн жақындағанда ескерту.</p><div style="display:grid;gap:17px;margin-top:20px">${toggle('alerts','Сайт ішіндегі ескертулер','DayFlow ашық кезде хабарлама шығады.',s.alerts)}${toggle('sound','Будильник дыбысы','Сайт ашық және дыбысқа рұқсат берілгенде сигнал беріледі.',s.sound)}${toggle('notifications','Браузер хабарламалары','HTTPS не localhost мекенжайында рұқсат қажет.',s.notifications)}</div>
      <div class="field" style="margin-top:20px"><label for="leadSelect">Дедлайнға қанша минут қалғанда?</label><select id="leadSelect" class="select">${selectOptions([['0','Дедлайн сәтінде'],['5','5 минут'],['10','10 минут'],['15','15 минут'],['30','30 минут'],['60','60 минут']],String(s.lead))}</select></div>
      <div class="setting-actions" style="margin-top:16px"><button class="btn btn-soft" data-action="test-alert">${svg('bell')} Ескертуді тексеру</button><button class="btn btn-secondary" data-action="test-sound">${svg('volume')} Дыбысты тексеру</button></div><p class="card-desc" style="margin-top:10px">Ескерту үшін сайт ашық болуы керек. Браузер жабылса хабарламаның келуіне кепілдік жоқ.</p></section>
      <section class="setting-card card"><h2>Деректерді басқару</h2><p class="card-desc">Өзгерістер аккаунтыңызға сақталады.</p><div class="setting-actions" style="margin-top:18px"><button class="btn btn-secondary" data-action="export">${svg('download')} JSON экспорт</button><button class="btn btn-secondary" data-action="import">${svg('upload')} JSON импорт</button><button class="btn btn-secondary" data-action="restore-local">Браузердегі ескі деректі көшіру</button><button class="btn btn-danger" data-action="clear-data">${svg('trash')} Барлығын тазарту</button></div></section></div>
      <aside class="settings-list"><section class="setting-card card"><div class="section-head"><h2>Деректер қауіпсіздігі</h2><span class="metric-icon green">${svg('shield')}</span></div><p class="card-desc">Жоспарларыңызға осы аккаунтпен кіргенде ғана қол жеткізе аласыз.</p><div class="category-row"><span>Тапсырмалар</span><div class="progress-bar"><span class="progress-fill" style="--width:100%"></span></div><strong>${state.tasks.length}</strong></div><div class="category-row"><span>Әдеттер</span><div class="progress-bar"><span class="progress-fill" style="--width:100%"></span></div><strong>${state.habits.length}</strong></div></section>
      <section class="quote-card"><small>✦ ЕСКЕ САЛУ</small><p>Жоспар жасаңыз, істерді орындаңыз, нәтижені бағалаңыз.</p></section></aside></div>`;
  }

  function openModal(inner,small=false){
    dom.modal.innerHTML=`<div class="modal-layer" data-action="backdrop"><div class="modal ${small?'small':''}" role="dialog" aria-modal="true" aria-label="DayFlow терезесі">${inner}</div></div>`;
    document.body.classList.add('is-modal');ui.modal=true;
    setTimeout(()=>dom.modal.querySelector('input:not([type="hidden"]),button')?.focus(),10);
  }
  function closeModal(){dom.modal.innerHTML='';document.body.classList.remove('is-modal');ui.modal=false;pendingConfirm=null}
  function modalHeader(title,subtitle=''){return `<div class="modal-title"><div><h2>${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div><button type="button" class="icon-btn" data-action="close-modal" aria-label="Жабу">${svg('close')}</button></div>`}
  function field(label,html){return `<div class="field"><label>${label}</label>${html}</div>`}
  function openTaskModal(id='',date=''){
    const t=state.tasks.find(x=>x.id===id);
    const data=t||{title:'',description:'',date:date||nowDay(),start:'09:00',end:'10:00',category:'study',priority:'medium',repeat:'none',until:'',reminder:true,alarm:true};
    openModal(`${modalHeader(t?'Тапсырманы өңдеу':'Жаңа тапсырма','Жоспар мен уақытты белгілеп, сақтаңыз.')}
      <form id="taskForm" class="modal-form" data-id="${t?esc(t.id):''}">
      ${field('Тапсырма атауы *',`<input type="text" class="input" name="title" maxlength="120" required placeholder="Мысалы: Қазақ тілі сабағы" value="${esc(data.title)}">`)}
      ${field('Сипаттама',`<textarea class="textarea" name="description" maxlength="1200" placeholder="Қосымша ақпарат...">${esc(data.description)}</textarea>`)}
      <div class="form-grid">${field('Күні *',`<input class="input" type="date" name="date" required value="${esc(data.date)}">`)}${field('Қайталану',`<select class="select" name="repeat">${selectOptions(Object.entries(REPEATS),data.repeat)}</select>`)}</div>
      <div class="form-grid">${field('Басталуы *',`<input class="input" type="time" name="start" required value="${esc(data.start)}">`)}${field('Аяқталуы *',`<input class="input" type="time" name="end" required value="${esc(data.end)}">`)}</div>
      <div class="form-grid">${field('Санаты',`<select class="select" name="category">${selectOptions(Object.entries(CATEGORIES),data.category)}</select>`)}${field('Маңыздылығы',`<select class="select" name="priority">${selectOptions(Object.entries(PRIORITIES),data.priority)}</select>`)}</div>
      ${field('Қайталауды тоқтату күні (міндетті емес)',`<input type="date" class="input" name="until" value="${esc(data.until)}">`)}
      <div class="form-grid">${field('Басталу ескертпесі',`<select class="select" name="reminder">${selectOptions([['true','Қосулы'],['false','Өшірулі']],String(data.reminder))}</select>`)}${field('Дыбыстық сигнал',`<select class="select" name="alarm">${selectOptions([['true','Қосулы'],['false','Өшірулі']],String(data.alarm))}</select>`)}</div>
      <div class="form-warning" id="taskOverlap" hidden>Бұл уақыт аралығында басқа тапсырма бар. Қаласаңыз, бәрібір сақтауға болады.</div>
      <div class="input-error" id="taskError" role="alert"></div><div class="form-actions"><button type="button" class="btn btn-secondary" data-action="close-modal">Бас тарту</button><button type="submit" class="btn btn-primary">${svg('check')} ${t?'Өзгерістерді сақтау':'Тапсырманы сақтау'}</button></div>
      </form>`);
    updateOverlap();
  }
  function valuesFromTaskForm(f){
    const x=name=>f.elements.namedItem(name).value;
    return {id:f.dataset.id||uid(),title:x('title').trim(),description:x('description').trim(),date:x('date'),start:x('start'),end:x('end'),category:x('category'),priority:x('priority'),repeat:x('repeat'),until:x('until'),reminder:x('reminder')==='true',alarm:x('alarm')==='true'};
  }
  function findOverlap(draft){
    if(!validDay(draft.date)||!validTime(draft.start)||!validTime(draft.end)||toMins(draft.start)>=toMins(draft.end))return false;
    const days=[draft.date];
    if(draft.repeat!=='none')for(let i=1;i<=13;i++)days.push(addDays(draft.date,i));
    return state.tasks.some(t=>t.id!==draft.id&&days.some(day=>{
      const newOccurs=(day===draft.date||draft.repeat!=='none'&&(draft.repeat==='daily'||draft.repeat==='weekdays'&&[1,2,3,4,5].includes(parseDay(day).getDay())||draft.repeat==='weekly'&&parseDay(day).getDay()===parseDay(draft.date).getDay()))&&(!draft.until||day<=draft.until);
      return newOccurs&&occurs(t,day)&&draft.start<t.end&&draft.end>t.start;
    }));
  }
  function updateOverlap(){
    const f=document.getElementById('taskForm'),box=document.getElementById('taskOverlap');if(!f||!box)return;
    box.hidden=!findOverlap(valuesFromTaskForm(f));
  }
  function submitTask(form){
    const input=valuesFromTaskForm(form),error=document.getElementById('taskError');
    if(!input.title||!validDay(input.date)||!validTime(input.start)||!validTime(input.end)){error.textContent='Атауды, күнді және уақытты дұрыс толтырыңыз.';return}
    if(toMins(input.start)>=toMins(input.end)){error.textContent='Аяқталу уақыты басталу уақытынан кеш болуы керек.';return}
    if(input.until&&(!validDay(input.until)||input.until<input.date)){error.textContent='Қайталанудың соңғы күні бастапқы күннен бұрын болмауы керек.';return}
    if(!Object.hasOwn(CATEGORIES,input.category)||!Object.hasOwn(PRIORITIES,input.priority)||!Object.hasOwn(REPEATS,input.repeat)){error.textContent='Санат немесе қайталану түрі қате.';return}
    const dup=state.tasks.some(t=>t.id!==input.id&&t.title.toLocaleLowerCase('kk')===input.title.toLocaleLowerCase('kk')&&t.date===input.date&&t.start===input.start&&t.end===input.end);
    if(dup){error.textContent='Дәл осындай тапсырма бұрыннан бар. Қайта сақталмады.';return}
    if(input.title.length>120||input.description.length>1200){error.textContent='Мәтін тым ұзын.';return}
    const index=state.tasks.findIndex(t=>t.id===input.id);
    if(index<0&&state.tasks.length>=MAX_TASKS){error.textContent='Тапсырмалар саны шегіне жетті.';return}
    const current=index>=0?state.tasks[index]:null;
    // Editing a repeating series preserves its per-day completion history.
    const task=normalTask({...input,doneDates:current?.doneDates||{},skipDates:current?.skipDates||{},completed:current?.completed||false,createdAt:current?.createdAt||Date.now()});
    if(index>=0)state.tasks[index]=task;else state.tasks.push(task);
    persist();closeModal();render();toast(index>=0?'Тапсырма жаңартылды':'Тапсырма сақталды',input.repeat!=='none'?`Қайталану: ${REPEATS[input.repeat]}`:'Жоспарға қосылды.');
  }
  function openHabitModal(id=''){
    const h=state.habits.find(x=>x.id===id);
    openModal(`${modalHeader(h?'Әдетті өзгерту':'Жаңа әдет','Күн сайын жасауға болатын бір әрекет таңдаңыз.')}
    <form id="habitForm" class="modal-form" data-id="${h?esc(h.id):''}">${field('Әдет атауы *',`<input class="input" name="name" required maxlength="90" value="${esc(h?.name||'')}" placeholder="Мысалы: 20 минут кітап оқу">`)}${field('Белгі (emoji)',`<input class="input" name="emoji" maxlength="16" value="${esc(h?.emoji||'✨')}" placeholder="📖">`)}<div class="input-error" id="habitError" role="alert"></div><div class="form-actions"><button class="btn btn-secondary" type="button" data-action="close-modal">Бас тарту</button><button class="btn btn-primary" type="submit">${svg('check')} Сақтау</button></div></form>`,true);
  }
  function submitHabit(f){
    const name=f.elements.namedItem('name').value.trim(),emoji=f.elements.namedItem('emoji').value.trim()||'✨';
    const e=document.getElementById('habitError');if(!name||name.length>90||emoji.length>16){e.textContent='Әдет атауын және белгісін дұрыс толтырыңыз.';return}
    const idx=state.habits.findIndex(h=>h.id===f.dataset.id);
    if(idx<0&&state.habits.length>=MAX_HABITS){e.textContent='Әдеттер саны шегіне жетті.';return}
    if(state.habits.some(h=>h.id!==f.dataset.id&&h.name.toLocaleLowerCase('kk')===name.toLocaleLowerCase('kk'))){e.textContent='Дәл осындай әдет бұрыннан бар.';return}
    const h=normalHabit({id:f.dataset.id||uid(),name,emoji,history:idx>=0?state.habits[idx].history:{}});
    if(idx>=0)state.habits[idx]=h;else state.habits.push(h);
    persist();closeModal();render();toast(idx>=0?'Әдет өзгертілді':'Жаңа әдет қосылды');
  }
  function confirmation(title,description,buttons){
    pendingConfirm=buttons;
    openModal(`${modalHeader(esc(title))}<p class="confirm-description">${esc(description)}</p><div class="form-actions">${buttons.map((b,i)=>`<button type="button" class="btn ${b.danger?'btn-danger':b.cancel?'btn-secondary':'btn-soft'}" data-action="confirm-choice" data-index="${i}">${esc(b.label)}</button>`).join('')}</div>`,true);
  }
  function taskDelete(t,day){
    if(!t)return;
    const buttons=[{label:'Бас тарту',cancel:true,callback:()=>{}}];
    if(t.repeat!=='none'&&day&&occurs(t,day))buttons.push({label:'Тек осы күннен алып тастау',callback:()=>{t.skipDates[day]=true;commit();toast('Осы күннен алынды','Қалған күндерге қайталануы сақталады.')}});
    buttons.push({label:'Толығымен жою',danger:true,callback:()=>{state.tasks=state.tasks.filter(x=>x.id!==t.id);commit();toast('Тапсырма жойылды')}});
    confirmation('Тапсырманы жою',`«${t.title}» тапсырмасын жою тәсілін таңдаңыз.`,buttons);
  }
  function exportData(){
    const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`DayFlow-${nowDay()}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),8000);toast('Сақтық көшірме жүктелді','JSON файлды қауіпсіз жерде сақтаңыз.');
  }
  async function importData(file){
    if(!file||!state)return;
    const importer=saveState;
    if(file.size>8*1024*1024){toast('Файл тым үлкен','JSON файлы 8 МБ-тан аспауы керек.','error');return}
    try{
      const parsed=JSON.parse(await file.text()),incoming=validateState(parsed);
      if(importer!==saveState)return;
      const previous=state;state=incoming;
      if(!persist()){state=previous;return}
      closeModal();render();toast('Деректер импортталды',`${state.tasks.length} тапсырма, ${state.habits.length} әдет қалпына келді.`);
    }catch(err){toast('JSON файлын импорттау мүмкін болмады',err instanceof SyntaxError?'JSON пішімі дұрыс емес.':err.message,'error')}
  }
  function restoreLocal(){
    const backup=readLocalBackup();
    if(!backup){toast('Браузерде ескі дерек табылмады');return}
    confirmation('Ескі деректерді көшіру','Браузердегі деректер аккаунттағы қазіргі жоспарды алмастырады.',[
      {label:'Бас тарту',cancel:true,callback:()=>{}},
      {label:'Көшіру',callback:()=>{
        const previous=state;state=backup;
        if(!persist())state=previous;
        render();
      }}
    ]);
  }
  function clearAll(){confirmation('Барлық деректі тазарту','Барлық тапсырмалар мен әдеттер және олардың тарихы өшіріледі. Демонстрациялық деректер автоматты түрде қайтып келмейді.',[
    {label:'Бас тарту',cancel:true,callback:()=>{}},
    {label:'Барлығын өшіру',danger:true,callback:()=>{state=blankState();ui.tasksQuery='';ui.tasksCategory='all';ui.tasksStatus='all';ui.tasksDate='';ui.taskScope='all';persist();render();toast('Деректер тазартылды')}}
  ])}
  function showMobileMenu(){openModal(`${modalHeader('Мәзір','Қажетті бөлімге өтіңіз.')}${NAV.map(n=>`<button class="nav-btn ${ui.route===n.id?'active':''}" data-route="${n.id}">${svg(n.icon)} ${n.name}</button>`).join('')}`,true)}
  function notificationCenter(){
    const today=nowDay();const alerts=dailyTasks(today).filter(t=>!isDone(t,today)).map(t=>({task:t,day:today}));
    openModal(`${modalHeader('Ескертулер','Сайт ашық болса, уақытында ескерту көрсетіледі.')}<div class="setting-card" style="padding:0;border:0;box-shadow:none">${alerts.length?alerts.slice(0,7).map(x=>`<div class="daily-row"><span class="daily-icon">${svg('bell')}</span><span class="daily-body"><strong>${esc(x.task.title)}</strong><small>${x.task.start}–${x.task.end} · ${dateShort(x.day)}</small></span></div>`).join(''):empty('Жаңа ескерту жоқ','Барлық істер орындалған немесе жоспар бос.')}</div><button class="btn btn-soft" style="width:100%;margin-top:16px" data-route="settings">${svg('settings')} Еске салғышты баптау</button>`,true);
  }
  function settingToggle(name){
    if(!['sound','alerts','notifications'].includes(name))return;
    if(name==='notifications'&&!state.settings.notifications){
      if(typeof Notification==='undefined'){toast('Браузер хабарламасы қолжетімсіз','Бұл браузерде Notification API жоқ.','warn');return}
      if(!window.isSecureContext){toast('Қорғалған байланыс қажет','HTTPS немесе localhost пайдаланыңыз.','warn');return}
      if(Notification.permission==='denied'){toast('Хабарламаға рұқсат берілмеген','Браузердің сайт баптауларынан рұқсатты өзгертіңіз.','warn');return}
      Promise.resolve(Notification.requestPermission()).then(permission=>{state.settings.notifications=permission==='granted';commit();toast(permission==='granted'?'Хабарламалар қосылды':'Рұқсат берілмеді',permission==='granted'?'Сайт ашық кезде хабарлама келеді.':'Сайт ішіндегі хабарламалар жұмыс істей береді.',permission==='granted'?'success':'warn')});return;
    }
    state.settings[name]=!state.settings[name];commit();toast('Баптау сақталды');
  }
  function ensureAudio(){
    if(audioContext)return;
    try{const C=window.AudioContext||window.webkitAudioContext;if(C)audioContext=new C()}catch(_){/* audio may be unavailable */}
  }
  function ringAlarm(force=false){
    if(!state.settings.sound&&!force)return;
    ensureAudio();if(!audioContext)return;
    try{
      if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});
      const base=audioContext.currentTime;
      [0,.21,.44].forEach((offset,i)=>{
        const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=i===1?880:740;
        gain.gain.setValueAtTime(0.0001,base+offset);gain.gain.exponentialRampToValueAtTime(.13,base+offset+.018);gain.gain.exponentialRampToValueAtTime(.0001,base+offset+.16);
        osc.connect(gain);gain.connect(audioContext.destination);osc.start(base+offset);osc.stop(base+offset+.19);
      });
    }catch(err){console.warn('DayFlow дыбысын ойнату мүмкін болмады:',err.message)}
  }
  function notify(title,message,withSound=false){
    if(state.settings.alerts)toast(title,message,'warn');
    if(withSound)ringAlarm();
    if(state.settings.notifications&&typeof Notification!=='undefined'&&Notification.permission==='granted'){
      try{new Notification(`DayFlow · ${title}`,{body:message,icon:'./assets/favicon.svg'})}catch(_){/* notification is optional */}
    }
  }
  function checkAlarms(){
    if(!state)return;
    const now=Date.now(),day=nowDay();if(!state.settings.alerts&&!state.settings.notifications&&!state.settings.sound)return;
    const days=[day,addDays(day,-1)];
    for(const d of days)for(const t of dailyTasks(d)){
      if(isDone(t,d)||!t.reminder)continue;
      const start=new Date(`${d}T${t.start}:00`).getTime(),end=new Date(`${d}T${t.end}:00`).getTime();
      const events=[['start',start,'Тапсырма басталды',`${t.title} · ${t.start}`],['deadline',end-state.settings.lead*60000,'Дедлайн жақындап қалды',`${t.title} · ${t.end} дейін ${state.settings.lead} мин`]];
      for(const [event,at,title,message] of events){
        const key=`${t.id}:${d}:${event}`;
        if(shownThisVisit.has(key)||state.alertLog[key])continue;
        // Small grace window allows active tabs to catch an alarm without firing stale events on every reload.
        if(now>=at&&now<at+180000&&at>=start-3600000){
          shownThisVisit.add(key);state.alertLog[key]=now;
          notify(title,message,t.alarm);persist();
        }
      }
    }
    const keys=Object.keys(state.alertLog);if(keys.length>400){const trim=keys.sort((a,b)=>state.alertLog[a]-state.alertLog[b]).slice(0,keys.length-300);trim.forEach(k=>delete state.alertLog[k]);persist()}
  }
  function finishFocus(){
    const mode=state.focus.mode;
    if(mode==='focus')state.focus.cycles+=1;
    state.focus.running=false;
    state.focus.mode=mode==='focus'?'break':'focus';
    state.focus.duration=mode==='focus'?5*60:state.settings.focusMinutes*60;
    state.focus.remaining=state.focus.duration;state.focus.endAt=0;persist();
    notify(mode==='focus'?'Фокус сессиясы аяқталды':'Үзіліс аяқталды',mode==='focus'?'5 минут демалып алыңыз.':'Қайта жұмысқа кірісуге болады.',true);
    if(ui.route==='dashboard')render();
  }
  function tick(){
    if(!state)return;
    const time=document.getElementById('liveClock');if(time)time.textContent=liveClockString();
    const next=document.getElementById('nextCountdown');if(next){const n=nextOccurrence();next.textContent=n?clockRemaining(n.when-Date.now()):'Алдағы іс жоқ'}
    const focus=document.getElementById('focusDisplay');if(focus)focus.textContent=formatSeconds(focusRemaining());
    if(state.focus.running&&Date.now()>=state.focus.endAt)finishFocus();
    const d=nowDay();if(d!==lastDay){lastDay=d;ui.selectedDate=d;ui.timelineDate=d;ui.habitWeek=monday(d);ui.tasksDate='';render()}
  }
  function focusAction(action,amount=''){
    const f=state.focus;
    if(action==='focus-toggle'){
      if(f.running){f.remaining=focusRemaining();f.running=false;f.endAt=0}
      else{if(f.remaining<=0)f.remaining=f.duration;f.running=true;f.endAt=Date.now()+f.remaining*1000}
    } else if(action==='focus-reset'){f.running=false;f.endAt=0;f.remaining=f.duration}
    else if(action==='focus-mode'){f.running=false;f.endAt=0;f.mode=f.mode==='focus'?'break':'focus';f.duration=f.mode==='focus'?state.settings.focusMinutes*60:5*60;f.remaining=f.duration}
    else if(action==='focus-duration'){const v=Number(amount);if(![15,25,45].includes(v))return;state.settings.focusMinutes=v;if(f.mode==='focus'){f.running=false;f.endAt=0;f.duration=v*60;f.remaining=f.duration}}
    commit();
  }

  document.addEventListener('click',event=>{
    if(!state)return;
    // Unlock Web Audio during a user gesture where the browser permits it.
    if(state.settings.sound&&!audioContext)ensureAudio();
    if(event.target.classList?.contains('modal-layer')){closeModal();return}
    const route=event.target.closest('[data-route]');if(route){event.preventDefault();navigate(route.dataset.route);return}
    const btn=event.target.closest('[data-action]');if(!btn)return;
    const {action,id,date}=btn.dataset;
    switch(action){
      case 'new-task':openTaskModal('',date||'');break;
      case 'edit-task':openTaskModal(id);break;
      case 'delete-task':taskDelete(state.tasks.find(t=>t.id===id),date||ui.tasksDate||nowDay());break;
      case 'toggle-task':{
        const t=state.tasks.find(x=>x.id===id);if(!t)return;
        const day=date||nowDay();if(t.repeat==='none')t.completed=!t.completed;
        else if(t.doneDates[day])delete t.doneDates[day];else t.doneDates[day]=true;
        commit();break;
      }
      case 'clear-filters':ui.tasksQuery='';ui.tasksCategory='all';ui.tasksStatus='all';ui.tasksDate='';ui.taskScope='all';render();break;
      case 'all-dates':ui.tasksDate='all';render();break;
      case 'task-scope':ui.taskScope=['all','repeat','once'].includes(btn.dataset.scope)?btn.dataset.scope:'all';render();break;
      case 'timeline-prev':ui.timelineDate=addDays(ui.timelineDate,-1);render();break;
      case 'timeline-next':ui.timelineDate=addDays(ui.timelineDate,1);render();break;
      case 'timeline-today':ui.timelineDate=nowDay();render();break;
      case 'calendar-prev':{const d=new Date(ui.calendarYear,ui.calendarMonth-1,1);ui.calendarYear=d.getFullYear();ui.calendarMonth=d.getMonth();render();break}
      case 'calendar-next':{const d=new Date(ui.calendarYear,ui.calendarMonth+1,1);ui.calendarYear=d.getFullYear();ui.calendarMonth=d.getMonth();render();break}
      case 'calendar-today':{const d=new Date();ui.calendarYear=d.getFullYear();ui.calendarMonth=d.getMonth();ui.selectedDate=nowDay();render();break}
      case 'calendar-select':{ui.selectedDate=date;const d=parseDay(date);ui.calendarYear=d.getFullYear();ui.calendarMonth=d.getMonth();render();break}
      case 'new-habit':openHabitModal();break;
      case 'edit-habit':openHabitModal(id);break;
      case 'delete-habit':{
        const h=state.habits.find(x=>x.id===id);if(!h)return;
        confirmation('Әдетті жою',`«${h.name}» және оның тарихын толығымен өшіресіз бе?`,[
          {label:'Бас тарту',cancel:true,callback:()=>{}},
          {label:'Жою',danger:true,callback:()=>{state.habits=state.habits.filter(x=>x.id!==id);commit();toast('Әдет жойылды')}}
        ]);break;
      }
      case 'toggle-habit':{
        if(!validDay(date)||date>nowDay()){toast('Болашақ күнді белгілеуге болмайды','','warn');return}
        const h=state.habits.find(x=>x.id===id);if(!h)return;
        if(h.history[date])delete h.history[date];else h.history[date]=true;commit();break;
      }
      case 'habits-prev':ui.habitWeek=addDays(ui.habitWeek,-7);render();break;
      case 'habits-next':ui.habitWeek=addDays(ui.habitWeek,7);render();break;
      case 'habits-today':ui.habitWeek=monday(nowDay());render();break;
      case 'toggle-theme':state.settings.theme=state.settings.theme==='dark'?'light':'dark';commit();break;
      case 'set-theme':state.settings.theme=btn.dataset.theme==='dark'?'dark':'light';commit();break;
      case 'setting-toggle':settingToggle(btn.dataset.setting);break;
      case 'test-alert':toast('Тексеру хабарламасы','Еске салғыш дұрыс жұмыс істеп тұр.','warn');break;
      case 'test-sound':ringAlarm(true);toast('Дыбыс тексерілді','Егер естілмесе, браузер дыбысын қосыңыз.');break;
      case 'export':exportData();break;
      case 'import':document.getElementById('importInput').click();break;
      case 'restore-local':restoreLocal();break;
      case 'clear-data':clearAll();break;
      case 'close-modal':closeModal();break;
      case 'confirm-choice':{
        const chosen=pendingConfirm?.[Number(btn.dataset.index)];const callback=chosen?.callback;closeModal();if(typeof callback==='function')callback();break;
      }
      case 'backdrop':if(event.target===btn)closeModal();break;
      case 'mobile-menu':showMobileMenu();break;
      case 'notification-center':notificationCenter();break;
      case 'focus-toggle':case 'focus-reset':case 'focus-mode':case 'focus-duration':focusAction(action,btn.dataset.duration);break;
      default:break;
    }
  });
  function syncRows(){const root=document.getElementById('taskRows');if(!root)return;root.innerHTML=renderTasksList();const n=document.getElementById('taskCount');if(n)n.textContent=`(${collectTaskRows().length})`}
  document.addEventListener('input',event=>{
    if(event.target.id==='tasksSearch'){ui.tasksQuery=event.target.value;syncRows()}
    if(event.target.closest('#taskForm')&&['date','start','end','repeat','until'].includes(event.target.name))updateOverlap();
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='tasksCategory'){ui.tasksCategory=event.target.value;syncRows()}
    if(event.target.id==='tasksStatus'){ui.tasksStatus=event.target.value;syncRows()}
    if(event.target.id==='tasksDate'){ui.tasksDate=validDay(event.target.value)?event.target.value:'all';render()}
    if(event.target.id==='leadSelect'){const val=Number(event.target.value);if([0,5,10,15,30,60].includes(val)){state.settings.lead=val;persist();toast('Дедлайн ескертуі сақталды')}}
    if(event.target.id==='importInput'){const file=event.target.files?.[0];event.target.value='';importData(file)}
  });
  document.addEventListener('submit',event=>{
    if(event.target.id==='taskForm'){event.preventDefault();submitTask(event.target)}
    if(event.target.id==='habitForm'){event.preventDefault();submitHabit(event.target)}
    if(event.target.id==='nameForm'){
      event.preventDefault();const value=event.target.elements.namedItem('name').value.trim();
      if(!value||value.length>60){document.getElementById('nameError').textContent='Аты-жөніңізді 60 таңбадан асырмай енгізіңіз.';return}
      state.settings.name=value;commit();toast('Атыңыз сақталды');
    }
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&ui.modal)closeModal();
    if(state&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
      event.preventDefault();navigate('tasks');document.getElementById('tasksSearch')?.focus();
    }
  });
  window.addEventListener('hashchange',()=>{
    const route=location.hash.slice(1);if(NAV.some(n=>n.id===route)&&route!==ui.route){ui.route=route;closeModal();render()}
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){tick();checkAlarms()}});
  window.dayFlow = {
    start(serialized, save) {
      state=serialized===null?freshState():validateState(JSON.parse(serialized));
      saveState=save;
      const today=nowDay(),initial=location.hash.slice(1);
      const date=new Date();
      Object.assign(ui,{route:NAV.some(n=>n.id===initial)?initial:'dashboard',tasksQuery:'',tasksCategory:'all',tasksStatus:'all',tasksDate:'',taskScope:'all',calendarYear:date.getFullYear(),calendarMonth:date.getMonth(),selectedDate:today,timelineDate:today,habitWeek:monday(today),alarmCount:0});
      shownThisVisit.clear();
      lastDay=today;
      if(serialized===null)persist();
      render();tick();checkAlarms();
    },
    stop() {
      closeModal();
      state=null;
      saveState=null;
      lastSearchFocus=null;
      dom.app.replaceChildren();
      dom.toasts.replaceChildren();
      document.documentElement.dataset.theme='light';
    },
    readLocalBackup
  };

  window.setInterval(tick,1000);
  window.setInterval(checkAlarms,10000);
})();
