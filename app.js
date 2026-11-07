const config = window.invitation;
// 폰트별로 준비를 확인합니다. 큰 손글씨 파일 때문에 첫 화면까지 기다리지 않습니다.
async function prepareFont(key, font, sample = " ") {
 try {
  await document.fonts.load(font, sample.replace(/[\r\n\t]/g, ' '));
 } catch { document.documentElement.classList.add(`font-fallback-${key}`); }
}
const orbitFontReady = prepareFont('orbit','16px Orbit');
const scriptFontReady = prepareFont('script','16px Parisienne');
const coverFontsReady = scriptFontReady.then(() => document.documentElement.classList.remove('cover-font-loading'));
const greetingFontReady = prepareFont('hand','25px "Daughter To Mom"',config.greeting).then(() => document.documentElement.classList.remove('greeting-font-loading'));
Promise.all([orbitFontReady, coverFontsReady, greetingFontReady]).then(() => document.documentElement.classList.remove('fonts-loading'));
document.querySelectorAll('.couple').forEach(el => el.textContent = config.names.join('  ·  '));
document.querySelector('.greeting').textContent = config.greeting;
document.querySelector('.venue-name').textContent = config.venue;
document.querySelector('.address').textContent = config.address;
const attendanceDialog = document.querySelector('.attendance-dialog');
const illustrationCard = document.querySelector('.illustration-card');
function openAttendance() { showAttendanceIntro(); attendanceDialog.showModal(); document.body.classList.add('modal-open'); }
illustrationCard.addEventListener('click', openAttendance);
document.querySelectorAll('.open-attendance').forEach(button => button.addEventListener('click', () => {
 showAttendanceForm(); attendanceDialog.showModal(); document.body.classList.add('modal-open');
 document.querySelector('.back-to-invitation').focus({preventScroll:true});
}));
document.querySelector('.close-attendance').addEventListener('click', () => attendanceDialog.close());
attendanceDialog.addEventListener('close', () => document.body.classList.remove('modal-open'));

// Run the cover as one sequence: kicker, typing, subtitle, card, footer.
const cover = document.querySelector('.cover');
const title = document.querySelector('#cover-title');
const typeLines = [...title.querySelectorAll('.type-line')];
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let typeTimer;
let coverRun = 0;
function showFullCover() {
 clearTimeout(typeTimer); coverRun++;
 typeLines.forEach(line => { line.textContent = line.dataset.text; line.classList.remove('typing'); });
 cover.dataset.phase = 'complete';
}
async function startCover() {
 clearTimeout(typeTimer); const run = ++coverRun;
 await coverFontsReady;
 if (run !== coverRun) return;
 if (motionPreference.matches) { showFullCover(); return; }
 cover.dataset.phase = 'typing';
 typeLines.forEach(line => { line.textContent = ''; line.classList.remove('typing'); });
 let lineIndex = 0, character = 0;
 function nextCharacter() {
  if (run !== coverRun) return;
  const line = typeLines[lineIndex]; line.classList.add('typing');
  line.textContent = line.dataset.text.slice(0, ++character);
  if (character < line.dataset.text.length) typeTimer = setTimeout(nextCharacter, 75);
  else {
   line.classList.remove('typing'); lineIndex++; character = 0;
   if (lineIndex < typeLines.length) typeTimer = setTimeout(nextCharacter, 110);
   else { cover.dataset.phase = 'details'; typeTimer = setTimeout(() => { if (run === coverRun) cover.dataset.phase = 'complete'; }, 1300); }
  }
 }
 typeTimer = setTimeout(() => { if(run === coverRun) { cover.dataset.phase = 'typing'; nextCharacter(); } }, 120);
}
document.documentElement.classList.add('cover-motion');
motionPreference.addEventListener('change', showFullCover);
const greeting = document.querySelector('.greeting');
const greetingLetters = Array.from(config.greeting);
greeting.setAttribute('aria-label', config.greeting);
const greetingText = document.createElement('span');
greetingText.setAttribute('aria-hidden', 'true');
greetingText.textContent = config.greeting;
greeting.replaceChildren(greetingText);
let greetingTimer;
let greetingRun = 0;
function finishGreeting() { greetingRun++; clearTimeout(greetingTimer); greetingText.textContent = config.greeting; }
async function typeGreeting() {
 clearTimeout(greetingTimer);
 const run = ++greetingRun;
 await greetingFontReady;
 if (run !== greetingRun) return;
 if (motionPreference.matches) { finishGreeting(); return; }
 greetingText.textContent = '';
 let position = 0;
 function nextLetter() {
  if (run !== greetingRun) return;
  greetingText.textContent = greetingLetters.slice(0, ++position).join('');
  if (position < greetingLetters.length) greetingTimer = setTimeout(nextLetter, 65);
 }
 greetingTimer = setTimeout(nextLetter, 180);
}
motionPreference.addEventListener('change', finishGreeting);

document.querySelector('.attendance-names').textContent = config.names.join(' 그리고 ');
document.querySelector('.attendance-venue').textContent = config.venue;
// 파일 이름과 확장자는 설정값을 그대로 사용하고, 실패한 이미지 자리만 숨깁니다.
function loadConfiguredImage(image, path, onLoad, onError) {
 const source = typeof path === 'string' ? path.trim() : '';
 image.hidden = true;
 if (!source) { onError(); return; }
 image.decoding = 'async';
 image.onload = () => {
  if (!image.naturalWidth) { onError(); return; }
  image.hidden = false;
  onLoad(source);
 };
 image.onerror = () => { image.hidden = true; onError(); };
 image.src = source;
}
const coverStage = document.querySelector('.cover-card-stage');
const footerArt = document.querySelector('.landscape-art');
loadConfiguredImage(document.querySelector('.cover-illustration'), config.coverImage, source => {
 coverStage.hidden = false;
 footerArt.style.backgroundImage = `url(${JSON.stringify(source)})`;
 footerArt.hidden = false;
}, () => { coverStage.hidden = true; footerArt.hidden = true; });
const invitationSection = document.querySelector('#invitation');
invitationSection.classList.add('no-portrait');
const portrait = document.querySelector('.invitation-art');
portrait.loading = 'eager';
loadConfiguredImage(portrait, config.portraitImage, () => invitationSection.classList.remove('no-portrait'), () => invitationSection.classList.add('no-portrait'));

const gallery = document.querySelector('.gallery-stack');
const gallerySection = document.querySelector('.gallery-section');
const galleryEntries = [];
const requestedGalleryCount = config.galleryCount;
const numericGalleryCount = Number(requestedGalleryCount);
const galleryLimit = requestedGalleryCount == null || requestedGalleryCount === '' || !Number.isFinite(numericGalleryCount) || numericGalleryCount < 0
 ? Infinity : Math.floor(numericGalleryCount);
let galleryItems = [];
function updateGallery() {
 galleryItems = galleryEntries.filter(item => item.loaded).slice(0,galleryLimit);
 gallery.replaceChildren(...galleryItems.map(item => item.button));
 gallery.dataset.count = galleryItems.length;
 gallery.classList.toggle('many-photos',galleryItems.length > 6);
 gallery.hidden = galleryItems.length === 0;
 gallerySection.classList.toggle('no-images', galleryItems.length === 0);
 galleryItems.forEach((item,index) => item.button.style.setProperty('--photo-order', index));
}
updateGallery();
(galleryLimit > 0 && Array.isArray(config.gallery) ? config.gallery : []).forEach(item => {
 if (!item || typeof item.src !== 'string' || !item.src.trim()) return;
 const entry = {src:item.src.trim(), caption:item.caption || '갤러리 사진', loaded:false};
 const button = document.createElement('button'); button.className = 'gallery-card'; button.type = 'button'; button.hidden = true;
 entry.button = button; galleryEntries.push(entry);
 button.setAttribute('aria-label', `${entry.caption} 확대 보기`);
 const image = document.createElement('img'); image.alt = entry.caption;
 button.append(image); gallery.append(button);
 button.addEventListener('click', () => { const index = galleryItems.indexOf(entry); if (index >= 0) openImage(index); });
 loadConfiguredImage(image, entry.src, () => { entry.loaded = true; button.hidden = false; updateGallery(); }, () => { entry.loaded = false; button.remove(); updateGallery(); });
});
const dialog = document.querySelector('.lightbox');
let current = 0;
function renderImage() {
 const item = galleryItems[current];
 if (!item) return;
 const container = document.querySelector('.lightbox-image');
 const image = document.createElement('img'); image.alt = item.caption; container.replaceChildren(image);
 loadConfiguredImage(image, item.src, () => {}, () => { container.textContent = '이미지를 불러오지 못했습니다.'; });
 document.querySelector('.image-count').textContent = `${String(current + 1).padStart(2, '0')} / ${String(galleryItems.length).padStart(2, '0')}`;
 document.querySelector('.image-caption').textContent = item.caption;
}
function openImage(index) { if (!galleryItems.length) return; current = index; renderImage(); dialog.showModal(); document.body.classList.add('modal-open'); }
function step(delta) { if (!galleryItems.length) return; current = (current + delta + galleryItems.length) % galleryItems.length; renderImage(); }
document.querySelector('.close-lightbox').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
document.querySelector('.previous').addEventListener('click', () => step(-1));
document.querySelector('.next').addEventListener('click', () => step(1));
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
dialog.addEventListener('keydown', event => { if (event.key === 'ArrowRight') { event.preventDefault(); step(1); } if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); } });
let touchX = null;
dialog.addEventListener('touchstart', e => touchX = e.changedTouches[0].clientX, {passive:true});
dialog.addEventListener('touchend', e => { if (touchX !== null) { const delta = e.changedTouches[0].clientX - touchX; if (Math.abs(delta) > 45) step(delta < 0 ? 1 : -1); touchX = null; } }, {passive:true});
// 화면의 모든 예식 날짜·시간·달력은 설정 한 곳에서 계산합니다.
function getWeddingDate(value) {
 const match = typeof value === 'string' && value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(Z|[+-]\d{2}:\d{2})$/);
 if (!match) return null;
 const [year,month,day,hour,minute,second] = match.slice(1,7).map(part => Number(part || 0));
 const lastDay = new Date(Date.UTC(year,month,0)).getUTCDate();
 if (year < 1000 || month < 1 || month > 12 || day < 1 || day > lastDay || hour > 23 || minute > 59 || second > 59) return null;
 const date = new Date(value);
 if (!Number.isFinite(date.getTime())) return null;
 // 열람하는 기기의 시간대와 관계없이 한국 시간으로 표시합니다.
 const korean = new Date(date.getTime() + 9*60*60*1000);
 return {year:korean.getUTCFullYear(),month:korean.getUTCMonth()+1,day:korean.getUTCDate(),weekday:korean.getUTCDay(),hour:korean.getUTCHours(),minute:korean.getUTCMinutes()};
}
const calendar = document.querySelector('.calendar');
const weekNames = ['일','월','화','수','목','금','토'];
for (const day of weekNames) {
 const el = document.createElement('span'); el.className = 'weekday'; el.textContent = day; calendar.append(el);
}
const weddingDate = getWeddingDate(config.date);
function updateWeddingCountdown() {
 const countdown = document.querySelector('.countdown');
 if (!weddingDate) { countdown.textContent = '설정에서 예식 날짜와 시간을 확인해 주세요.'; return; }
 const today = new Date(Date.now() + 9*60*60*1000);
 const todayDay = Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate());
 const weddingDay = Date.UTC(weddingDate.year,weddingDate.month-1,weddingDate.day);
 const remaining = Math.round((weddingDay - todayDay)/86400000);
 countdown.textContent = remaining > 0 ? `결혼식까지 ${remaining}일 남았습니다` : remaining === 0 ? '오늘은 결혼식 날입니다.' : '함께해 주신 마음, 감사합니다.';
}
if (weddingDate) {
 const {year,month,day,weekday,hour,minute} = weddingDate;
 const dateText = `${year}년 ${month}월 ${day}일 ${weekNames[weekday]}요일`;
 const timeText = `${hour < 12 ? '오전' : '오후'} ${hour%12 || 12}시${minute ? ` ${minute}분` : ''}`;
 document.querySelectorAll('.full-wedding-date').forEach(el => el.textContent = `${dateText} · ${timeText}`);
 document.querySelector('.wedding-weekday-time').textContent = `${weekNames[weekday]}요일 ${timeText}`;
 document.querySelector('.wedding-day-number').textContent = day;
 document.querySelector('.wedding-month').textContent = `${year}년 ${month}월`;
 calendar.setAttribute('aria-label',`${year}년 ${month}월 달력, ${day}일 ${weekNames[weekday]}요일 결혼식`);
 const firstWeekday = new Date(Date.UTC(year,month-1,1)).getUTCDay();
 const daysInMonth = new Date(Date.UTC(year,month,0)).getUTCDate();
 calendar.dataset.weeks = Math.ceil((firstWeekday + daysInMonth)/7);
 for (let blank=0;blank<firstWeekday;blank++) { const el=document.createElement('span'); el.setAttribute('aria-hidden','true'); calendar.append(el); }
 for (let number=1;number<=daysInMonth;number++) {
  const el=document.createElement('span'); el.textContent=number;
  if (number===day) { el.className='wedding-date'; el.setAttribute('aria-label',`${month}월 ${day}일 결혼식`); }
  calendar.append(el);
 }
} else {
 document.querySelectorAll('.full-wedding-date,.wedding-weekday-time,.wedding-month').forEach(el=>el.textContent='예식 날짜를 확인해 주세요.');
 document.querySelector('.wedding-day-number').textContent='—';
 calendar.setAttribute('aria-label','예식 날짜가 올바르지 않아 달력을 표시하지 않았습니다.');
}
updateWeddingCountdown();
setInterval(updateWeddingCountdown,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden) updateWeddingCountdown();});
function showAttendanceIntro() {
 document.querySelector('.attendance-intro').hidden = false;
 document.querySelector('.rsvp-form-panel').hidden = true;
 attendanceDialog.classList.remove('form-open');
 attendanceDialog.setAttribute('aria-labelledby','attendance-title');
 attendanceDialog.scrollTop = 0;
}
function showAttendanceForm() {
 document.querySelector('.attendance-intro').hidden = true;
 document.querySelector('.rsvp-form-panel').hidden = false;
 attendanceDialog.classList.add('form-open');
 attendanceDialog.setAttribute('aria-labelledby','rsvp-form-title');
 attendanceDialog.scrollTop = 0;
 document.querySelector('.back-to-invitation').focus({preventScroll:true});
}
document.querySelector('.rsvp').addEventListener('click', showAttendanceForm);
document.querySelector('.back-to-invitation').addEventListener('click', () => { showAttendanceIntro(); document.querySelector('.rsvp').focus(); });
const responseForm = document.querySelector('.rsvp-form');
const fieldDefinitions = [
 {name:'side', label:'하객 구분', aliases:['하객구분','어느측하객이신가요']},
 {name:'attendance', label:'참석 여부', aliases:['참석여부']},
 {name:'meal', label:'식사 여부', aliases:['식사여부'], attendingOnly:true},
 {name:'bus', label:'전세버스 이용 여부', aliases:['전세버스이용여부','전세버스탑승여부','전세버스','버스'], attendingOnly:true},
 {name:'guestName', label:'성함', aliases:['성함','이름']},
 {name:'phone', label:'연락처', aliases:['연락처','전화번호']},
 {name:'companions', label:'동행인 성함', aliases:['동행인성함','동행인이름'], attendingOnly:true},
 {name:'companionCount', label:'동행인 수', aliases:['동행인수','동행인수(본인제외)'], attendingOnly:true}
];
const normalizeField = value => String(value).replace(/\s/g,'');
const configuredFields = new Set((Array.isArray(config.rsvpFields) ? config.rsvpFields : fieldDefinitions.map(field=>field.label)).map(normalizeField));
const enabledFields = fieldDefinitions.filter(field=>field.aliases.some(alias=>configuredFields.has(alias)));
function updateRsvpFields() {
 const hasAttendance = enabledFields.some(field=>field.name==='attendance');
 const absent = hasAttendance && responseForm.elements.attendance.value === 'no';
 for (const field of fieldDefinitions) {
  const container = responseForm.querySelector(`[name="${field.name}"]`).closest('fieldset,.form-field');
  container.dataset.rsvpField = field.name;
  container.hidden = !enabledFields.includes(field) || (absent && field.attendingOnly);
  for (const input of container.querySelectorAll('input')) input.disabled = container.hidden;
 }
 for (const selector of ['.attending-fields','.companion-fields']) {
  const group = document.querySelector(selector);
  group.hidden = [...group.children].every(field=>field.hidden);
 }
 document.querySelector('.submit-rsvp').disabled = enabledFields.length===0;
 document.querySelector('.form-preview-note').textContent = enabledFields.length
  ? '입력 화면 미리보기 · 아직 응답이 전달되지 않습니다.'
  : '아직 입력 항목이 설정되지 않았습니다.';
}
updateRsvpFields();
responseForm.addEventListener('change', updateRsvpFields);
responseForm.addEventListener('submit', event => {
 event.preventDefault();
 const status = document.querySelector('.rsvp-status');
 if (config.rsvpUrl && /^https:\/\//.test(config.rsvpUrl)) {
  window.open(config.rsvpUrl, '_blank', 'noopener,noreferrer');
  status.textContent = '구글폼이 열렸습니다. 응답은 구글폼에서 입력하고 제출해 주세요. 여기 입력한 내용은 전달되지 않습니다.';
 } else status.textContent = '아직 응답이 전달되지 않았습니다. 구글폼 연결 후 이용해 주세요.';
});
const locationInfo = config.location;
document.querySelector('.location-venue').textContent = config.venue;
document.querySelector('.location-street').textContent = config.address;
const locationStatus = document.querySelector('.location-status');
const copyAddress = document.querySelector('.copy-address');
copyAddress.disabled = !locationInfo.ready;
if (!locationInfo.ready) locationStatus.textContent = '장소·지도·교통 안내는 예시입니다.';
copyAddress.addEventListener('click', async () => {
 try { await navigator.clipboard.writeText(config.address); locationStatus.textContent = '주소를 복사했습니다.'; }
 catch { locationStatus.textContent = '주소를 길게 누르거나 선택해서 복사해 주세요.'; }
});
const mapFrame = document.querySelector('.map-frame');
const mapImage = document.createElement('img'); mapImage.alt = `${config.venue} 오시는 길 약도`;
loadConfiguredImage(mapImage, locationInfo.mapImage, () => { mapFrame.replaceChildren(mapImage); mapFrame.hidden = false; }, () => { mapFrame.hidden = true; });
const mapLinks = document.querySelector('.map-links');
for (const [name, url] of [['네이버 지도', locationInfo.naverUrl], ['카카오맵', locationInfo.kakaoUrl], ['티맵', locationInfo.tmapUrl]]) {
 let valid = false;
 try { const parsed = new URL(url); valid = ['https:', 'tmap:'].includes(parsed.protocol); } catch {}
 const link = document.createElement(valid && locationInfo.ready ? 'a' : 'button');
 link.textContent = `${name} ↗`;
 if (valid && locationInfo.ready) { link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
 else { link.type = 'button'; link.disabled = true; link.setAttribute('aria-label', `${name} — 장소 확정 후 연결됩니다`); }
 mapLinks.append(link);
}
for (const item of locationInfo.transit) {
 const row = document.createElement('details'); const heading = document.createElement('summary'); const text = document.createElement('p'); heading.textContent = item.title; text.textContent = item.text; row.append(heading, text); document.querySelector('.transport').append(row);
}

for (const [side, accounts] of Object.entries(config.accounts)) {
 const list = document.querySelector(`[data-side="${side}"]`);
 for (const account of accounts) {
  const row = document.createElement('p'); row.textContent = `${account.bank} ${account.number}`;
  const holder = document.createElement('p'); holder.textContent = `예금주 ${account.holder}`; const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'copy-account'; copy.textContent = '계좌 복사'; copy.setAttribute('aria-label', `${account.holder} 계좌번호 복사`);
  const status = document.createElement('p'); status.className = 'account-copy-status'; status.setAttribute('role', 'status');
  copy.addEventListener('click', async () => {
   try { await navigator.clipboard.writeText(account.number); status.textContent = '계좌번호를 복사했습니다.'; }
   catch { status.textContent = '계좌번호를 선택해서 복사해 주세요.'; }
  });
  list.append(row, holder, copy, status);
 }
}

// 한 번의 휠·스와이프를 한 페이지 이동으로 처리합니다.
// 긴 내용은 페이지 안에서 먼저 스크롤하고, 팝업 입력에는 개입하지 않습니다.
const pageHost = document.querySelector('main');
const pageTrack = document.createElement('div');
pageTrack.className = 'page-track';
pageTrack.append(...pageHost.children);
pageHost.append(pageTrack);
const pages = [...pageTrack.children];
let pageIndex = 0, moving = false, wheelTimer, wheelGesture = false;
document.documentElement.classList.add('paged', 'js-ready');
pages.forEach(page => page.querySelectorAll('.reveal').forEach((el, index) => el.style.setProperty('--reveal-order', index)));
function activatePage() {
 pages.forEach((page, index) => {
  page.classList.toggle('in-view', index === pageIndex);
  page.inert = index !== pageIndex;
 });
 if (pageIndex === 0) startCover();
 if (pages[pageIndex].id === 'invitation') typeGreeting();
}
function movePage(direction) {
 const next = Math.max(0, Math.min(pages.length - 1, pageIndex + direction));
 if (moving || next === pageIndex) return;
 moving = true;
 clearTimeout(typeTimer); coverRun++; cover.dataset.phase = 'idle';
 finishGreeting();
 pages.forEach(page => page.classList.remove('in-view'));
 pageIndex = next;
 pages[pageIndex].scrollTop = 0;
 pageTrack.style.transform = `translate3d(0,${-pageIndex * pageHost.clientHeight}px,0)`;
 const finish = () => { moving = false; activatePage(); };
 if (motionPreference.matches) finish();
 else setTimeout(finish, 480);
}
function inDialog(event) { return event.target.closest('dialog') || document.querySelector('dialog[open]'); }
function canScrollPage(direction) {
 const page = pages[pageIndex];
 if (page === cover || page.id === 'invitation') return false;
 return direction > 0 ? page.scrollTop + page.clientHeight < page.scrollHeight - 4 : page.scrollTop > 4;
}
window.addEventListener('wheel', event => {
 if (inDialog(event) || event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
 const direction = Math.sign(event.deltaY);
 if (!direction) return;
 if (!moving && canScrollPage(direction)) return;
 event.preventDefault();
 clearTimeout(wheelTimer);
 wheelTimer = setTimeout(() => { wheelGesture = false; }, 180);
 if (moving || wheelGesture || Math.abs(event.deltaY) < 8) return;
 wheelGesture = true;
 movePage(direction);
}, {passive:false});
// 터치 제스처를 브라우저의 기본 세로 패닝과 동시에 처리하지 않습니다.
// CSS touch-action과 Pointer Events를 함께 사용하여 손가락을 떼는 이벤트까지 받습니다.
let swipe = null;
pageHost.addEventListener('pointerdown', event => {
 if (event.pointerType === 'mouse' || inDialog(event)) return;
 if (!event.isPrimary) { swipe = null; return; }
 swipe = {
  id: event.pointerId, x: event.clientX, y: event.clientY,
  scrollTop: pages[pageIndex].scrollTop, page: pages[pageIndex],
  mode: null, blocked: moving
 };
});
pageHost.addEventListener('pointermove', event => {
 if (!swipe || swipe.id !== event.pointerId || swipe.blocked) return;
 const dy = swipe.y - event.clientY;
 const dx = swipe.x - event.clientX;
 if (!swipe.mode) {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
  if (Math.abs(dx) > Math.abs(dy)) { swipe.mode = 'horizontal'; return; }
  swipe.mode = canScrollPage(Math.sign(dy)) ? 'content' : 'page';
  pageHost.setPointerCapture(event.pointerId);
 }
 if (swipe.mode === 'content') swipe.page.scrollTop = swipe.scrollTop + dy;
});
pageHost.addEventListener('pointerup', event => {
 if (!swipe || swipe.id !== event.pointerId) return;
 const gesture = swipe; swipe = null;
 const dy = gesture.y - event.clientY;
 const dx = gesture.x - event.clientX;
 if (!gesture.blocked && gesture.mode !== 'content' && Math.abs(dy) >= 35 && Math.abs(dy) > Math.abs(dx)) movePage(Math.sign(dy));
});
pageHost.addEventListener('pointercancel', () => { swipe = null; });
pageHost.addEventListener('lostpointercapture', event => {
 if (event.target === pageHost && swipe?.id === event.pointerId) swipe = null;
});
window.addEventListener('keydown', event => {
 if (inDialog(event) || event.target.closest('input,textarea,select,button,a,summary,[contenteditable]')) return;
 const direction = ['ArrowDown','PageDown',' '].includes(event.key) ? 1 : ['ArrowUp','PageUp'].includes(event.key) ? -1 : 0;
 if (!direction || canScrollPage(direction)) return;
 event.preventDefault(); movePage(direction);
});
window.addEventListener('resize', () => {
 pageTrack.style.transition = 'none';
 pageTrack.style.transform = `translate3d(0,${-pageIndex * pageHost.clientHeight}px,0)`;
 requestAnimationFrame(() => requestAnimationFrame(() => { pageTrack.style.transition = ''; }));
});
activatePage();
