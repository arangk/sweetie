# 모바일 페이지 이동 재검증

## 변경

- 기본 세로 패닝과 touchmove의 preventDefault를 섞던 방식을 제거했습니다.
- 페이지와 그 안의 스크롤 컨테이너에 touch-action을 명시하고 Pointer Events로 이동을 처리합니다.
- 터치가 이미지에서 main으로 캡처될 때 자식의 lostpointercapture 이벤트가 제스처를 지우지 않도록 했습니다.
- 표지와 인사말은 내부 스크롤로 잘못 판단하지 않습니다. 다른 긴 섹션은 손가락 드래그로 내부 내용을 보고 경계에서 다음 페이지로 이동합니다.
- dialog는 이 처리 대상 밖에 있어 입력과 기본 스크롤을 유지합니다.
- CSS/JS 버전 쿼리를 변경했습니다.

## 검사 실행

로컬 HTTP 서버를 실행하고 Playwright/Chromium이 있는 개발 환경에서:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright node _internal/verification/tests/mobile-navigation.cjs
```

BASE_URL과 CHROMIUM_PATH도 환경에 맞게 지정할 수 있습니다.

검사는 CDP의 연속 touchStart/touchMove/touchEnd 입력을 사용합니다. JS로 페이지 이동 함수를 직접 부르지 않습니다.

- 393×752, 402×874, 430×932에서 첫 화면부터 마지막까지 및 역방향 이동
- 짧은 스와이프, 느린 스와이프, 카드/제목에서 시작한 스와이프
- 움직이는 카드에 실제 탭 입력으로 팝업 열기
- 하단 RSVP 폼 열기, 내부 스크롤, 닫은 뒤 이동
- 사진 12장의 긴 갤러리에서 내부 스크롤 및 경계에서 다음 화면 이동
- 별도 데스크톱 검사: 휠 연속 입력은 한 화면 이동, 역방향 및 리사이즈 정렬 유지

위 자동 검사와 별도 데스크톱 검사는 모두 통과했습니다.

## 검증 범위

Chromium 모바일 터치 에뮬레이션이며 실물 iPhone Safari 검증은 아닙니다. Playwright WebKit 설치를 시도했으나 환경의 다운로드 도메인 정책(403 Domain forbidden)으로 설치하지 못했습니다.
