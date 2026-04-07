import * as turf from '@turf/turf';

let roadNetwork = null;
let mapRef = null;

export async function initializeRouting(map) {
    mapRef = map;
    const response = await fetch('./data/ddy_road_network_v2.geojson');
    roadNetwork = await response.json();

    // 터프(Turf)의 기능을 이용하여 가장 가까운 지점(Snap) 찾기
    const findNearestNode = (coords) => {
        const point = turf.point(coords);
        let nearest = null;
        let minDist = Infinity;
        
        // 도로망의 모든 정점(Vertex)을 대상으로 가장 가까운 것 찾기
        roadNetwork.features.forEach(f => {
            const exploded = turf.explode(f);
            exploded.features.forEach(v => {
                const d = turf.distance(point, v);
                if (d < minDist) { minDist = d; nearest = v; }
            });
        });
        return nearest;
    };

    const handleRouting = () => {
        const startRaw = document.getElementById('origin-select').value;
        const endRaw = document.getElementById('destination-select').value;
        if (!startRaw || !endRaw) return;

        const start = startRaw.split(',').map(Number);
        const end = endRaw.split(',').map(Number);

        // 클라이언트 사이드 경로 탐색 (여기서는 개념 증명을 위해 직선 유사 경로 및 속성 합계 시뮬레이션)
        // 실제로는 geojson-path-finder 등을 사용함.
        calculateRoute(start, end);
    };

    document.getElementById('origin-select').addEventListener('change', handleRouting);
    document.getElementById('destination-select').addEventListener('change', handleRouting);
}

function calculateRoute(start, end) {
    // 1. 길찾기 결과용 레이어 초기화 (없으면 생성)
    if (!mapRef.getSource('src-route')) {
        mapRef.addSource('src-route', { type: 'geojson', data: turf.featureCollection([]) });
        mapRef.addLayer({
            id: 'layer-route-highlight',
            type: 'line',
            source: 'src-route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#f1c40f', 'line-width': 6, 'line-opacity': 0.9 }
        });
    }

    // 2. 가상의 다익스트라 결과 (실제 구현 시 geojson-path-finder 인스턴스 사용 가능)
    // 여기서는 도로망 내에서 시작/끝점과 가장 가까운 선형들을 필터링하여 결과를 시뮬레이션합니다.
    // 사용자는 '리(里)' 단위 거리를 원하므로, 해당 필드들을 합산합니다.
    
    // [UI 업데이트]
    const resultPanel = document.getElementById('routing-result');
    resultPanel.classList.remove('hidden');
    
    // 실제 전체 네트워크 탐색 로직 (Dijkstra)은 데이터 크기에 따라 별도 워커 활용 권장
    // 본 예제에서는 거리/시간 계산 결과값 바인딩 구조를 보여줌
    const dummyDistRi = Math.round(Math.random() * 300 + 50); // 예시 리(里)
    const dummyKm = (dummyDistRi * 0.4).toFixed(1);
    const dummyTime = (dummyKm / 4).toFixed(1);

    document.getElementById('route-dist-ri').innerText = `📐 총 거리: ${dummyDistRi} 리 (里)`;
    document.getElementById('route-dist-km').innerText = `🛰️ 현대 기준: 약 ${dummyKm} km`;
    document.getElementById('route-time-walk').innerText = `🕒 예상 도보: 약 ${dummyTime} 시간`;
    
    // 지도에 시작-끝 직선 표시 (샘플)
    const line = turf.lineString([start, end]);
    mapRef.getSource('src-route').setData(line);
    
    // 경로로 지도 이동
    const bbox = turf.bbox(line);
    mapRef.fitBounds(bbox, { padding: 50 });
}
