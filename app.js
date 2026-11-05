const config = window.invitation;
document.querySelectorAll('.couple').forEach(el => el.textContent = config.names.join('  ·  '));
document.querySelector('.greeting').textContent = config.greeting;
document.querySelector('.venue-name').textContent = config.venue;
document.querySelector('.address').textContent = config.address;
const attendanceDialog = document.querySelector('.attendance-dialog');
const illustrationCard = document.querySelector('.illustration-card');
illustrationCard.addEventListener('click', () => {
 attendanceDialog.showModal(); document.body.classList.add('modal-open');
});
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
function startCover() {
 clearTimeout(typeTimer); const run = ++coverRun;
 if (motionPreference.matches) { showFullCover(); return; }
 cover.dataset.phase = 'kicker';
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
 typeTimer = setTimeout(() => { if(run === coverRun) { cover.dataset.phase = 'typing'; nextCharacter(); } }, 650);
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
document.querySelector('.attendance-names').textContent = config.names.join(' 그리고 ');
document.querySelector('.attendance-venue').textContent = config.venue;
function imageNode(item) {
  if (item.src) { const img = document.createElement('img'); img.src = item.src; img.alt = item.caption; img.loading = 'lazy'; img.decoding = 'async'; return img; }
  const art = document.createElement('span'); art.className = `art art-${item.art}`; art.role = 'img'; art.setAttribute('aria-label', item.caption); return art;
}
if (config.coverImage) document.querySelector('.cover-illustration').src = config.coverImage;

const gallery = document.querySelector('.gallery-stack');
config.gallery.forEach((item, index) => {
 const button = document.createElement('button'); button.className = 'gallery-card'; button.type = 'button'; button.setAttribute('aria-label', `${item.caption} 확대 보기`); button.append(imageNode(item)); button.addEventListener('click', () => openImage(index)); gallery.append(button);
});
const dialog = document.querySelector('.lightbox');
let current = 0;
function renderImage() {
 const item = config.gallery[current]; document.querySelector('.lightbox-image').replaceChildren(imageNode(item)); document.querySelector('.image-count').textContent = `${String(current + 1).padStart(2, '0')} / ${String(config.gallery.length).padStart(2, '0')}`; document.querySelector('.image-caption').textContent = item.caption;
}
function openImage(index) { current = index; renderImage(); dialog.showModal(); document.body.classList.add('modal-open'); }
function step(delta) { current = (current + delta + config.gallery.length) % config.gallery.length; renderImage(); }
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
document.querySelector('.countdown').textContent = remaining > 0 ? `우리의 첫 번째 계절까지 ${remaining}일` : remaining === 0 ? '오늘, 우리의 새로운 이야기가 시작됩니다.' : '함께해 주신 마음, 감사합니다.';
document.querySelector('.rsvp').addEventListener('click', () => {
 if(config.rsvpUrl && /^https?:\/\//.test(config.rsvpUrl)) window.open(config.rsvpUrl, '_blank', 'noopener,noreferrer');
 else document.querySelector('.rsvp-status').textContent = '참석 알림 링크는 준비 중입니다.';
});
if ('IntersectionObserver' in window) {
 document.documentElement.classList.add('js-ready');
 const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  entry.target.classList.toggle('in-view', entry.isIntersecting);
 }), {threshold:.45});
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
if (locationInfo.mapImage) {
 const image = document.createElement('img'); image.src = locationInfo.mapImage; image.alt = `${config.venue} 오시는 길 약도`; image.loading = 'lazy'; document.querySelector('.map-frame').replaceChildren(image);
}
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
