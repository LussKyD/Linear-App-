
// Clock App (Alarm, Timer, Stopwatch)
// Lightweight, no dependencies. Alarms use localStorage and only trigger while page is open.
// For production you'd add a service worker + push server to wake the app when closed.

(() => {
  // Utilities
  const $ = id => document.getElementById(id);
  function fmt2(n){return String(n).padStart(2,'0')}

  // Local clock
  const localClock = $('localClock'), localDate = $('localDate');
  function updateLocalClock(){
    const d = new Date();
    localClock.textContent = d.toLocaleTimeString();
    localDate.textContent = d.toLocaleDateString();
  }
  setInterval(updateLocalClock, 1000);
  updateLocalClock();

  // Notifications permission
  if ('Notification' in window){
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(()=>{});
    }
  }

  // Alarm manager
  const AL_KEY = 'clock_app_alarms_v1';
  let alarms = JSON.parse(localStorage.getItem(AL_KEY) || '[]');

  const alarmsList = $('alarmsList');
  function saveAlarms(){ localStorage.setItem(AL_KEY, JSON.stringify(alarms)); renderAlarms(); }
  function renderAlarms(){
    alarmsList.innerHTML = '';
    alarms.forEach((a, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `<div><strong>${a.time}</strong> ${a.label? '- '+a.label: ''}</div>
        <div><button data-idx="${idx}" class="del">Delete</button></div>`;
      alarmsList.appendChild(li);
    });
    alarmsList.querySelectorAll('.del').forEach(btn=>{
      btn.addEventListener('click', e=>{
        const i = parseInt(btn.dataset.idx); alarms.splice(i,1); saveAlarms();
      });
    });
  }
  renderAlarms();

  // Add alarm form
  $('alarmForm').addEventListener('submit', e=>{
    e.preventDefault();
    const time = $('alarmTime').value;
    const label = $('alarmLabel').value.trim();
    if (!time) return;
    alarms.push({time,label, id: Date.now()});
    saveAlarms();
    $('alarmForm').reset();
  });

  // Check alarms every second
  function checkAlarms(){
    const now = new Date();
    const hh = fmt2(now.getHours()), mm = fmt2(now.getMinutes());
    const cur = hh+':'+mm;
    // trigger alarms matching current minute
    alarms.slice().forEach((a, idx) => {
      if (a._firedToday === (new Date()).toDateString()) return; // already fired today
      if (a.time === cur){
        triggerAlarm(a);
        // mark as fired today
        alarms[idx]._firedToday = (new Date()).toDateString();
        saveAlarms();
      }
    });
  }
  function triggerAlarm(a){
    // sound beep using WebAudio
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 880;
      o.connect(g); g.connect(ctx.destination); g.gain.value = 0.0001;
      o.start();
      // ramp up then stop
      g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.02);
      setTimeout(()=>{ g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02); o.stop(); ctx.close(); }, 2500);
    } catch(e){ /* ignore */ }

    // show notification
    if (Notification.permission === 'granted'){
      const n = new Notification('Alarm', { body: a.label || 'Alarm ringing', tag: 'clock-app-alarm' });
      n.onclick = ()=> window.focus();
    } else {
      alert('Alarm: ' + (a.label || a.time));
    }
  }
  setInterval(checkAlarms, 1000);

  // Timer
  const timerDisplay = $('timerDisplay'), timerInput = $('timerInput');
  let timerRemaining = 0, timerInterval = null, timerRunning = false;
  function parseToSeconds(str){
    if (!str) return 0;
    const parts = str.split(':').map(p=>parseInt(p)||0).reverse();
    let sec = 0;
    if (parts[0]) sec += parts[0];
    if (parts[1]) sec += parts[1]*60;
    if (parts[2]) sec += parts[2]*3600;
    return sec;
  }
  function formatHMS(s){
    const h = Math.floor(s/3600); s%=3600;
    const m = Math.floor(s/60); const sec = s%60;
    return `${fmt2(h)}:${fmt2(m)}:${fmt2(sec)}`;
  }
  $('timerStart').addEventListener('click', ()=>{
    if (!timerRunning){
      const val = timerInput.value.trim();
      if (!val && timerRemaining===0) return alert('Enter a time for the timer (mm:ss or hh:mm:ss)');
      if (!timerRemaining) timerRemaining = parseToSeconds(val);
      timerRunning = true;
      timerInterval = setInterval(()=>{
        if (timerRemaining<=0){ clearInterval(timerInterval); timerRunning=false; timerFinished(); return; }
        timerRemaining--; timerDisplay.textContent = formatHMS(timerRemaining);
      },1000);
    }
  });
  $('timerPause').addEventListener('click', ()=>{
    clearInterval(timerInterval); timerRunning=false;
  });
  $('timerReset').addEventListener('click', ()=>{
    clearInterval(timerInterval); timerRunning=false; timerRemaining=0; timerDisplay.textContent='00:00:00';
  });
  function timerFinished(){
    timerDisplay.textContent = '00:00:00';
    try { new Notification('Timer', { body: 'Timer finished' }); } catch(e){}
    alert('Timer finished');
  }

  // Stopwatch
  const swDisplay = $('swDisplay'), swLaps = $('swLaps');
  let swStart = 0, swElapsed = 0, swTimer = null, swRunning = false;
  function formatStopwatch(ms){
    const total = Math.floor(ms);
    const cs = (total % 1000);
    let s = Math.floor(total/1000);
    const hh = Math.floor(s/3600); s%=3600;
    const mm = Math.floor(s/60); const sec = s%60;
    return `${fmt2(hh)}:${fmt2(mm)}:${fmt2(sec)}.${String(cs).padStart(3,'0')}`;
  }
  $('swStart').addEventListener('click', ()=>{
    if (swRunning) return;
    swRunning = true; swStart = performance.now() - swElapsed;
    swTimer = setInterval(()=>{
      swElapsed = performance.now() - swStart;
      swDisplay.textContent = formatStopwatch(swElapsed);
    }, 31);
  });
  $('swStop').addEventListener('click', ()=>{
    if (!swRunning) return;
    swRunning = false; clearInterval(swTimer);
  });
  $('swReset').addEventListener('click', ()=>{
    swRunning=false; clearInterval(swTimer); swStart=0; swElapsed=0; swDisplay.textContent='00:00:00.000'; swLaps.innerHTML='';
  });
  $('swLap').addEventListener('click', ()=>{
    const t = formatStopwatch(swElapsed);
    const li = document.createElement('li'); li.textContent = t; swLaps.prepend(li);
  });

  // Restore some states
  timerDisplay.textContent = '00:00:00';
  swDisplay.textContent = '00:00:00.000';
})();
