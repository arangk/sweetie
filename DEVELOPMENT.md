# 디자인 프로토타입

`/workspace/sweetie`에서 `python3 -m http.server 4173 --bind 0.0.0.0`으로 실행합니다. 별도 빌드나 패키지 설치는 없습니다.

- `index.html`: 화면 구조
- `styles.css`: 반응형 디자인, 뒤집기, 스크롤 등장, 갤러리 hover
- `app.js`: 갤러리 모달, 키보드/스와이프 이동, 달력, D-day
- `config.js`: 예시 이름, 날짜, 장소, 초대글, 이미지 경로, RSVP 링크

이름·날짜·장소는 예시이며 계좌와 RSVP는 미연결 상태입니다. 달력과 화면의 날짜 표기는 현재 시안의 2027년 2월 27일 기준입니다. 날짜를 변경할 때 이 표기도 함께 변경해야 합니다.

카드 뒷면은 기준 커플 사진으로 새로 생성한 `assets/cover-illustration.webp`를 사용합니다. 갤러리는 생성 사진 여섯 장을 `assets/photos/`에 저장하고 원본 비율로 표시합니다. 본문 연필화와 마지막 풍경은 기존 디자인 보드에서 보여주는 임시 이미지입니다.

`orbit.html`은 영문 Parisienne 필기체 + 한글 Orbit 비교 버전입니다. 두 폰트는 공식 Google Fonts 저장소에서 받은 파일과 OFL 라이선스를 `assets/fonts/`에 포함합니다. 기본 버전의 명조 폰트는 Google Fonts 연결이 불가능하면 시스템 명조체로 표시됩니다. `design.html`에서 사진 디자인 시안 이미지를 볼 수 있습니다.

이름·날짜·장소, OG 이미지/URL과 RSVP는 실제 정보로 교체해야 합니다.

브라우저 검증: 320/390/430px 가로 넘침, 카드 뒤집기, 갤러리 모달·방향키·Escape, 계좌 접기, RSVP 준비 안내, reduced-motion, JS 예외 없음.

오시는 길: `config.js`의 `venue`, `address`, `location`을 수정합니다. `location.mapImage`에 약도 파일, 각 지도 URL에 실제 장소 링크, `transit`에 교통·주차 안내를 넣고 `ready: true`로 바꾸세요. 장소 미확정 상태에서는 주소 복사와 길찾기를 비활성화합니다. 외부 지도 API 키는 필요하지 않습니다.
