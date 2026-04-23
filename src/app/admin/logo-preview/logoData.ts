export interface LogoPalette {
  hex: string;
  label: string;
}

export interface LogoConcept {
  version: string;
  name: string;
  concept: string;
  lightSrc: string;
  darkSrc: string | null;
  palette: LogoPalette[];
}

export const LOGO_CONCEPTS: LogoConcept[] = [
  {
    version: 'v01',
    name: 'Bold P-Mark',
    concept: '파란 정사각형 배경에 굵은 P 아이콘, pack(굵게)+linx(얇게) 2단 웨이트 워드마크. 명확하고 강렬한 B2B 인상.',
    lightSrc: '/logos/packlinx-v01.svg',
    darkSrc: null,
    palette: [
      { hex: '#005EFF', label: '애저 블루' },
      { hex: '#0A0F1E', label: '딥 네이비' },
      { hex: '#FFFFFF', label: '화이트' },
    ],
  },
  {
    version: 'v02',
    name: '노드 네트워크',
    concept: 'P자 형태로 연결된 세 노드(점·선)가 공급망 연결을 시각화. 퍼플 톤으로 기술적·혁신적 느낌 강조.',
    lightSrc: '/logos/packlinx-v02.svg',
    darkSrc: null,
    palette: [
      { hex: '#7C3AED', label: '바이올렛' },
      { hex: '#C4B5FD', label: '라벤더' },
      { hex: '#1E1B4B', label: '인디고 다크' },
    ],
  },
  {
    version: 'v03',
    name: '박스 아웃라인',
    concept: '패키징 박스를 선(outline)으로 단순화한 아이콘. 뚜껑 있는 실루엣으로 업종 직관성 극대화. 레드 포인트.',
    lightSrc: '/logos/packlinx-v03.svg',
    darkSrc: null,
    palette: [
      { hex: '#DC2626', label: '레드' },
      { hex: '#FEE2E2', label: '라이트 레드' },
      { hex: '#1A1A1A', label: '차콜' },
    ],
  },
  {
    version: 'v04',
    name: '슬랩 세리프 타입',
    concept: 'PACK / LINX 분리 세리프 타이포그래피. 앰버 수직 바 액센트로 산업적·고급스러운 인쇄물 느낌.',
    lightSrc: '/logos/packlinx-v04.svg',
    darkSrc: null,
    palette: [
      { hex: '#D97706', label: '앰버' },
      { hex: '#1C1917', label: '스톤 다크' },
      { hex: '#92400E', label: '브라운' },
    ],
  },
  {
    version: 'v05',
    name: '헥사 링크',
    concept: '육각형 셀 아이콘과 이중 무게 워드마크. 에메랄드 그린으로 친환경·신뢰 이미지. 한국어 서브태그 포함.',
    lightSrc: '/logos/packlinx-v05.svg',
    darkSrc: null,
    palette: [
      { hex: '#059669', label: '에메랄드' },
      { hex: '#064E3B', label: '딥 그린' },
      { hex: '#6EE7B7', label: '민트' },
    ],
  },
  {
    version: 'v06',
    name: '스택 레이어',
    concept: '크기가 다른 세 패널이 쌓인 레이어 아이콘. 패키징 재고/물류 스택 연상. 사이언 블루 계열.',
    lightSrc: '/logos/packlinx-v06.svg',
    darkSrc: null,
    palette: [
      { hex: '#0EA5E9', label: '스카이 블루' },
      { hex: '#38BDF8', label: '라이트 블루' },
      { hex: '#BAE6FD', label: '페일 블루' },
    ],
  },
  {
    version: 'v07',
    name: '원형 P-마크',
    concept: '진한 파란 원 안에 흰 P가 새겨진 심플한 씰. 정부·공공기관 인증 느낌으로 신뢰감 극대화.',
    lightSrc: '/logos/packlinx-v07.svg',
    darkSrc: null,
    palette: [
      { hex: '#0052CC', label: '로열 블루' },
      { hex: '#172B4D', label: '미드나잇' },
      { hex: '#FFFFFF', label: '화이트' },
    ],
  },
  {
    version: 'v08',
    name: '모듈 그리드',
    concept: '2×3 모듈 격자가 명도 그라데이션으로 구성. 패키지 규격·카탈로그 데이터 구조를 시각화한 추상 아이콘.',
    lightSrc: '/logos/packlinx-v08.svg',
    darkSrc: null,
    palette: [
      { hex: '#7C3AED', label: '바이올렛' },
      { hex: '#A78BFA', label: '퍼플 미드' },
      { hex: '#DDD6FE', label: '라벤더' },
    ],
  },
  {
    version: 'v09',
    name: '화살표 링크',
    concept: '상향 화살표와 P-곡선이 결합한 성장·연결 아이콘. 핑크-로즈 팔레트로 여성 구매자층도 친숙하게.',
    lightSrc: '/logos/packlinx-v09.svg',
    darkSrc: null,
    palette: [
      { hex: '#DB2777', label: '로즈' },
      { hex: '#FBCFE8', label: '핑크' },
      { hex: '#831843', label: '딥 로즈' },
    ],
  },
  {
    version: 'v10',
    name: '미니멀 라인',
    concept: '초경량 웨이트 소문자 워드마크에 블루 버티컬 바 하나. 최대한 단순화해 어디에 올려도 방해 안 되는 디자인.',
    lightSrc: '/logos/packlinx-v10.svg',
    darkSrc: null,
    palette: [
      { hex: '#3B82F6', label: '블루' },
      { hex: '#111827', label: '그레이-900' },
      { hex: '#9CA3AF', label: '그레이-400' },
    ],
  },
];
