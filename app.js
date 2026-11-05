// 폰트별로 준비를 확인합니다. 큰 손글씨 파일 때문에 첫 화면까지 기다리지 않습니다.
async function prepareFont(key, font) {
 let timer;
 try {
  const faces = await Promise.race([
   document.fonts.load(font),
   new Promise(resolve => { timer = setTimeout(() => resolve([]), 3500); })
  ]);
  if (!faces.length) document.documentElement.classList.add(`font-fallback-${key}`);
 } catch { document.documentElement.classList.add(`font-fallback-${key}`); }
 finally { clearTimeout(timer); }
}
const orbitFontReady = prepareFont('orbit','16px Orbit');
const scriptFontReady = prepareFont('script','16px Parisienne');
const coverFontsReady = Promise.all([orbitFontReady, scriptFontReady]).then(() => document.documentElement.classList.remove('cover-font-loading'));
const greetingFontReady = prepareFont('hand','25px "Daughter To Mom"').then(() => document.documentElement.classList.remove('greeting-font-loading'));
Promise.all([coverFontsReady, greetingFontReady]).then(() => document.documentElement.classList.remove('fonts-loading'));
const config = window.invitation;
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
if ('IntersectionObserver' in window) {
 document.documentElement.classList.add('cover-motion');
 const coverObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
   if (entry.isIntersecting) startCover(); else { clearTimeout(typeTimer); coverRun++; cover.dataset.phase = 'idle'; }
  }
 }, {threshold:.55});
 coverObserver.observe(cover);
} else startCover();
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
let galleryItems = [];
function updateGallery() {
 galleryItems = galleryEntries.filter(item => item.loaded);
 gallery.hidden = galleryItems.length === 0;
 gallerySection.classList.toggle('no-images', galleryItems.length === 0);
 galleryItems.forEach((item,index) => item.button.style.setProperty('--photo-order', index));
}
updateGallery();
(Array.isArray(config.gallery) ? config.gallery : []).forEach(item => {
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
const calendar = document.querySelector('.calendar');
['일','월','화','수','목','금','토'].forEach(day => {const el = document.createElement('span'); el.className = 'weekday'; el.textContent = day; calendar.append(el);});
calendar.append(document.createElement('span'));
for(let day = 1; day <= 28; day++) { const el = document.createElement('span'); el.textContent = day; if(day === 27) {el.className = 'wedding-date'; el.setAttribute('aria-label','27일 결혼식');} calendar.append(el); }
const remaining = Math.ceil((new Date(config.date) - new Date()) / 86400000);
document.querySelector('.countdown').textContent = remaining > 0 ? `결혼식까지 ${remaining}일 남았습니다` : remaining === 0 ? '오늘, 우리의 새로운 이야기가 시작됩니다.' : '함께해 주신 마음, 감사합니다.';
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
responseForm.addEventListener('change', () => {
 const absent = responseForm.elements.attendance.value === 'no';
 document.querySelector('.attending-fields').hidden = absent;
 document.querySelector('.companion-fields').hidden = absent;
 for (const field of responseForm.querySelectorAll('.attending-fields input,.companion-fields input')) field.disabled = absent;
});
responseForm.addEventListener('submit', event => {
 event.preventDefault();
 const status = document.querySelector('.rsvp-status');
 if (config.rsvpUrl && /^https:\/\//.test(config.rsvpUrl)) {
  window.open(config.rsvpUrl, '_blank', 'noopener,noreferrer');
  status.textContent = '구글폼이 열렸습니다. 응답은 구글폼에서 입력하고 제출해 주세요. 여기 입력한 내용은 전달되지 않습니다.';
 } else status.textContent = '아직 응답이 전달되지 않았습니다. 구글폼 연결 후 이용해 주세요.';
});
if ('IntersectionObserver' in window) {
 document.documentElement.classList.add('js-ready');
 const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.intersectionRatio >= .18 && !entry.target.classList.contains('in-view')) {
   entry.target.classList.add('in-view');
   if (entry.target.id === 'invitation') typeGreeting();
  } else if (entry.intersectionRatio <= .01) {
   entry.target.classList.remove('in-view');
   if (entry.target.id === 'invitation') finishGreeting();
  }
 }), {threshold:[0,.18]});
 document.querySelectorAll('.section').forEach(section => {
  section.querySelectorAll('.reveal').forEach((el,index) => el.style.setProperty('--reveal-order', index));
  observer.observe(section);
 });
}
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

// Keep native vertical scrolling and the gallery viewer, without page pinch zoom.
for (const eventName of ['gesturestart', 'gesturechange']) {
 document.addEventListener(eventName, event => event.preventDefault(), {passive:false});
}
document.addEventListener('touchstart', event => { if (event.touches.length > 1) event.preventDefault(); }, {passive:false});
