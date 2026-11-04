window.invitation = {
  names: ['서준', '지우'],
  date: '2027-02-27T12:30:00+09:00',
  venue: '서울, 어느 따뜻한 공간',
  address: '예식 장소와 주소를 입력해 주세요',
  greeting: '서로의 계절이 포개어져,\n더 따뜻한 시간이 시작됩니다.\n그 소중한 첫날에\n여러분을 초대합니다.',
  accounts: {
    groom: [{ bank: '예시은행', number: '000-0000-0000', holder: '김서준' }],
    bride: [{ bank: '예시은행', number: '000-0000-0001', holder: '이지우' }]
  },
  rsvpUrl: '',
  location: {
    // 실제 예식장 정보가 확정되면 true로 변경합니다.
    ready: false,
    mapImage: '',
    naverUrl: '',
    kakaoUrl: '',
    tmapUrl: '',
    transit: [
      { title: '지하철', text: '가까운 역과 출구, 도보 이동 시간을 입력해 주세요.' },
      { title: '버스', text: '하차 정류장과 이용 가능한 노선을 입력해 주세요.' },
      { title: '주차', text: '주차장 입구와 무료 주차 시간을 입력해 주세요.' }
    ]
  },
  // 실제 이미지 파일을 assets/에 넣고 경로를 지정하면 시안 이미지가 교체됩니다.
  coverImage: 'assets/cover-illustration.webp',
  gallery: [
    { src: 'assets/photos/bridge.webp', caption: '너와 마주한 겨울' },
    { src: 'assets/photos/rings.webp', caption: '우리의 작은 약속' },
    { src: 'assets/photos/tram.webp', caption: '같은 방향으로' },
    { src: 'assets/photos/cameras.webp', caption: '너를 담는 순간' },
    { src: 'assets/photos/stop.webp', caption: '함께 기다리는 시간' },
    { src: 'assets/photos/sunset.webp', caption: '오늘도, 내일도 너와' }
  ]
};
