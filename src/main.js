import maplibregl from 'maplibre-gl';
import { setupLayers } from './layers.js';
import { initializeRouting } from './routing.js';

// Vworld API Key (보통 localhost에서는 테스트용으로 동작하지만 필요시 발급 필요)
const VWORLD_KEY = '7E38B315-E583-3367-9FA5-867375252877'; // 테스트용 예시

const state = {
    isSyncing: false,
    isFullscreen: false,
    activeBasemap: 'satellite'
};

// 1. 맵 초기화
const mapLeft = new maplibregl.Map({
    container: 'map-left',
    style: {
        version: 8,
        sources: {},
        layers: [],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
    },
    center: [127.7669, 35.9078],
    zoom: 7,
    attributionControl: false
});

const mapRight = new maplibregl.Map({
    container: 'map-right',
    style: {
        version: 8,
        sources: {
            'vworld-satellite': {
                type: 'raster',
                tiles: [window.location.origin + '/v-sat/{z}/{x}/{y}.jpeg'],
                tileSize: 256
            },
            'vworld-hybrid': {
                type: 'raster',
                tiles: [window.location.origin + '/v-hybrid/{z}/{x}/{y}.png'],
                tileSize: 256
            }
        },
        layers: [
            { id: 'vworld-satellite', type: 'raster', source: 'vworld-satellite' },
            { id: 'vworld-hybrid', type: 'raster', source: 'vworld-hybrid' }
        ]
    },
    center: [127.7669, 35.9078],
    zoom: 7,
    attributionControl: false
});

// 2. 맵 동기화 로직
const syncMaps = (source, target) => {
    if (state.isSyncing) return;
    state.isSyncing = true;
    target.jumpTo({
        center: source.getCenter(),
        zoom: source.getZoom(),
        bearing: source.getBearing(),
        pitch: source.getPitch()
    });
    state.isSyncing = false;
};

mapLeft.on('move', () => syncMaps(mapLeft, mapRight));
mapRight.on('move', () => syncMaps(mapRight, mapLeft));

// 3. 레이어 설정 및 UI 바인딩
mapLeft.on('load', async () => {
    // 국토정보원 WMS 레이어 추가 (배경) - 프록시 우회 적용
    // 국토정보원 WMS는 EPSG:3857 미지원 → EPSG:4326으로 요청해야 함
    const wmsProxyUrl = window.location.origin + '/proxy/ngii';
    mapLeft.addSource('ddy-wms', {
        type: 'raster',
        tiles: [`${wmsProxyUrl}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=korea_old_map:korea_oldmap_addAlphaChannel&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256`],
        tileSize: 256
    });
    mapLeft.addLayer({ id: 'ddy-wms', type: 'raster', source: 'ddy-wms' });

    // 벡터 레이어 로드 및 스타일링
    await setupLayers(mapLeft);
});

// 4. UI 이벤트 리스너
const setupForestLayer = () => {
    const forestProxyUrl = window.location.origin + '/proxy-forest';
    // iServer의 ZXY 타일 방식이 MapLibre에서 더 안정적입니다.
    const tileUrl = `${forestProxyUrl}/gis1/iserver/services/map-fdms/rest/maps/TB_FGDI_FS_BD100/zxyTileImage.png?z={z}&x={x}&y={y}&width=256&height=256&transparent=true`;

    if (!mapRight.getSource('forest-bd')) {
        mapRight.addSource('forest-bd', {
            type: 'raster',
            tiles: [tileUrl],
            tileSize: 256
        });
    }

    if (!mapRight.getLayer('forest-bd')) {
        mapRight.addLayer({
            id: 'forest-bd',
            type: 'raster',
            source: 'forest-bd',
            layout: { visibility: 'none' },
            paint: { 'raster-opacity': 1.0 }
        });
    }
};

mapRight.on('load', setupForestLayer);
// 가끔 'load' 이후에 코드가 실행될 경우를 대비
if (mapRight.loaded()) setupForestLayer();

document.getElementById('chk-forest-bd').addEventListener('change', (e) => {
    if (!mapRight.getLayer('forest-bd')) setupForestLayer();
    mapRight.setLayoutProperty('forest-bd', 'visibility', e.target.checked ? 'visible' : 'none');
});

document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});

document.getElementById('btn-fullscreen').addEventListener('click', (e) => {
    const app = document.getElementById('app');
    state.isFullscreen = !state.isFullscreen;
    if (state.isFullscreen) {
        app.classList.add('fullscreen-mode');
        e.target.innerText = '원 화면으로';
    } else {
        app.classList.remove('fullscreen-mode');
        e.target.innerText = '전체 화면으로 보기';
    }
    // 맵 리사이즈 강제 호출
    mapLeft.resize();
    mapRight.resize();
});

// 브이월드 배경지도 토글
document.getElementById('btn-base-satellite').addEventListener('click', (e) => {
    updateBasemap('satellite');
    e.target.classList.add('active');
    document.getElementById('btn-base-general').classList.remove('active');
});

document.getElementById('btn-base-general').addEventListener('click', (e) => {
    updateBasemap('Base');
    e.target.classList.add('active');
    document.getElementById('btn-base-satellite').classList.remove('active');
});

function updateBasemap(type) {
    const isSate = type.toLowerCase() === 'satellite';
    
    // 1. 영상지도 + 하이브리드 라벨 제어
    if (mapRight.getLayer('vworld-satellite')) {
        mapRight.setLayoutProperty('vworld-satellite', 'visibility', isSate ? 'visible' : 'none');
    }
    if (mapRight.getLayer('vworld-hybrid')) {
        mapRight.setLayoutProperty('vworld-hybrid', 'visibility', isSate ? 'visible' : 'none');
    }

    // 2. 일반지도(Base) 레이어 제어
    if (isSate) {
        if (mapRight.getLayer('vworld-base')) {
            mapRight.setLayoutProperty('vworld-base', 'visibility', 'none');
        }
    } else {
        // Base 레이어가 없으면 생성
        if (!mapRight.getSource('vworld-base')) {
            mapRight.addSource('vworld-base', {
                type: 'raster',
                tiles: [window.location.origin + '/v-base/{z}/{x}/{y}.png'],
                tileSize: 256
            });
            mapRight.addLayer({ id: 'vworld-base', type: 'raster', source: 'vworld-base' }, 'vworld-satellite');
        }
        mapRight.setLayoutProperty('vworld-base', 'visibility', 'visible');
    }
}

// 모달 제어
document.getElementById('btn-info').addEventListener('click', () => {
    document.getElementById('modal-info').classList.remove('hidden');
});
document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('modal-info').classList.add('hidden');
});
window.addEventListener('click', (e) => {
    if (e.target.id === 'modal-info') document.getElementById('modal-info').classList.add('hidden');
});
