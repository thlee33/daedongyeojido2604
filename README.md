# 대동여지도 디지털 트윈 웹 뷰어 (Daedongyeojido Digital Twin) 🗺️

조선시대 김정호가 제작한 '대동여지도(大東輿地圖)'의 원본 이미지 장표와 현대의 공간 지리 벡터 데이터를 통합하여 브라우저에서 인터랙티브하게 탐색할 수 있는 **고성능 공간 시각화 어플리케이션**입니다.

## ✨ 주요 기능 (Key Features)

*   **히스토리컬 듀얼 맵 (Historical Dual Map):** 좌측에는 국토지리정보원의 대동여지도를, 우측에는 브이월드(Vworld)의 현대 위성/일반 지도를 띄워 두 지도를 완벽하게 스크롤 및 줌 동기화합니다.
*   **POI의 LOD 표시:** 지도 위 지명들을 기능 단위(영아·읍치, 산성·진보, 역참, 봉수, 기타)로 분류하여 한글로 표시합니다. 
*   **행정구역 범주형 시각화:** 행정 구역명(nm_kor)을 기반으로 색상을 표시하여 해당 시기의 행정구역을 볼 수 있습니다.

## 📂 디렉토리 구조 (Directory Structure)

```text
web_viewer/
│
├── public/                 # 정적 리소스 모음
│   └── data/               # 대동여지도 GeoJSON 백터 데이터 그룹
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
*   **지명 등 벡터 데이터:** 조선 대동여지도 DB 구축 프로젝트 (https://www.hisgeo.info/wiki/)
*   **현대 배경지도:** 공간정보 오픈플랫폼 브이월드 (VWorld)

## 예시 화면
![그림 1](https://github.com/thlee33/daedongyeojido2604/blob/main/image/%EC%8A%AC%EB%9D%BC%EC%9D%B4%EB%93%9C1.PNG)  

![그림 2](https://github.com/thlee33/daedongyeojido2604/blob/main/image/%EC%8A%AC%EB%9D%BC%EC%9D%B4%EB%93%9C2.PNG)  

![그림 3](https://github.com/thlee33/daedongyeojido2604/blob/main/image/%EC%8A%AC%EB%9D%BC%EC%9D%B4%EB%93%9C3.PNG)  

![그림 4](https://github.com/thlee33/daedongyeojido2604/blob/main/image/%EC%8A%AC%EB%9D%BC%EC%9D%B4%EB%93%9C4.PNG)  

![그림 5](https://github.com/thlee33/daedongyeojido2604/blob/main/image/%EC%8A%AC%EB%9D%BC%EC%9D%B4%EB%93%9C5.PNG)  

