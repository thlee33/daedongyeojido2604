# 대동여지도 디지털 트윈 웹 뷰어 (Daedongyeojido Digital Twin) 🗺️

조선시대 김정호가 제작한 '대동여지도(大東輿地圖)'의 원본 이미지 장표와 현대의 공간 지리 벡터 데이터를 통합하여 브라우저에서 인터랙티브하게 탐색할 수 있는 **고성능 공간 시각화 어플리케이션**입니다.

## ✨ 주요 기능 (Key Features)

*   **히스토리컬 듀얼 맵 (Historical Dual Map):** 좌측에는 국토지리정보원의 대동여지도 원본 WMS를, 우측에는 브이월드(Vworld)의 현대 위성/일반 지도를 띄워 두 지도를 완벽하게 스크롤 및 줌 동기화합니다.
*   **고밀도 POI의 5단계 LOD 범주화:** 지도 위 수만 개의 역사 지명들을 기능 단위(영아·읍치, 산성·진보, 역참, 봉수, 기타 자연 지형)로 자동 매칭해 심볼링 처리하여 렌더링 부하를 줄이면서도 정보 누락이 없습니다.
*   **행정구역 범주형 자동 배색 (Categorical Coloring):** 행정 구역명(nm_kor)을 런타임에서 문자열 해시 기반 함수로 계산해 겹침이 없는 다채로운 HSL 팔레트로 시각적 경계를 구현했습니다.
*   **강조된 글래스모피즘(Glassmorphism) UI:** 지도 가독성을 극대화하기 위해 UI 패널 배경과 요소들을 반투명 굴절 효과로 구현했으며, 화이트 할로(Halo) 대비 효과를 통해 고지도 이미지 위에서도 글씨가 또렷하게 읽히도록 최적화되어 있습니다.

## 🛠️ 기술 스택 (Tech Stack)

*   **Core:** Vanilla JavaScript (ESM)
*   **Engine:** MapLibre GL JS v4.x
*   **Styling:** Vanilla CSS3 (CSS Variables, Flexbox, Glassmorphism)
*   **Build & Dev:** Vite
*   **Data Sources:** GeoJSON (로컬 벡터 데이터), Vworld API (현대 타일 맵), NGII (WMS)

## 🚀 빠른 시작 (Getting Started)

### 1. 요구사항 (Prerequisites)
- [Node.js](https://nodejs.org/) 버전을 설치해주세요.
- 이 프로젝트는 `npm` (혹은 `pnpm`, `yarn`) 명령어를 사용합니다.

### 2. 설치 및 실행 (Installation & Run)
```bash
# 1. 원격지 저장소 로드 후 폴더 이동
cd projects/greateast/code/web_viewer

# 2. 패키지 설치
npm install

# 3. 로컬 개발 서버(Proxy 모드 포함) 실행
npm run dev
```

### 3. 접속
터미널에 표시된 `http://localhost:5173` 링크로 접속하면 대동여지도 디지털 트윈 환경 구성이 즉시 구동됩니다.

## 📂 디렉토리 구조 (Directory Structure)

```text
web_viewer/
│
├── public/                 # 정적 리소스 모음
│   ├── data/               # 대동여지도 GeoJSON 백터 데이터 그룹
│   └── icons/              # 심볼 아이콘
│
├── src/                    # 개발 핵심 소스코드
│   ├── main.js             # 애플리케이션 진입점 및 듀얼 맵 초기화
│   ├── layers.js           # POI 라벨링, 필터링 로직 및 UI 제어 모듈 생성
│   └── style.css           # 뷰포트 레이아웃 및 Glassmorphism 디자인 시스템
│
├── index.html              # 마크업 뼈대 
├── vite.config.js          # Vite 빌드/CORS Proxy 설정 
└── package.json            # 의존성 패키지 관리
```

## 📝 라이선스 & 출처안내
*   **배경지도 WMS:** 국토지리정보원
*   **지명 속성 벡터 데이터:** 조선 대동여지도 DB 구축 프로젝트 (https://www.hisgeo.info/wiki/)
*   **현대 배경지도:** 공간정보 오픈플랫폼 브이월드 (VWorld)
