export const layerConfigs = [
    { id: 'poi-cities', name: '영아·읍치', color: '#e74c3c', noOpacity: true },
    { id: 'poi-forts', name: '산성·진보', color: '#f39c12', noOpacity: true },
    { id: 'poi-stations', name: '역참(驛站)', color: '#27ae60', noOpacity: true },
    { id: 'poi-beacons', name: '봉수(烽燧)', color: '#c0392b', noOpacity: true },
    { id: 'poi-others', name: '기타 지명', color: '#333333', noOpacity: true },
    { id: 'road', name: '도로망', type: 'line', color: '#2c3e50', width: 2.0, opacity: 0.8, hasWidth: true },
    { id: 'mountains', name: '산맥', type: 'line', color: '#16a085', width: 3.5, opacity: 0.7, hasWidth: true },
    { id: 'rivers', name: '수계', type: 'line', color: '#2980b9', width: 3.5, opacity: 0.7, hasWidth: true },
    { id: 'admin', name: '행정구역(군현)', type: 'fill', color: 'categorical', opacity: 0.25 },
    { id: 'ddy-wms', name: '대동여지도 이미지', type: 'raster', opacity: 1.0, isSpecial: true }
];

export async function setupLayers(map) {
    const reversedConfigs = [...layerConfigs].reverse();
    for (const config of reversedConfigs) {
        if (config.id.startsWith('poi-') || config.id === 'ddy-wms') continue;
        const sourceId = `src-${config.id}`;
        const layerId = `layer-${config.id}`;
        
        let data = `./data/${(config.id === 'road') ? 'ddy_road_network_v2.geojson' : config.id + '.geojson'}`;
        
        // 행정구역 범주형 시각화(Categorical) 전처리 로직 복구
        if (config.id === 'admin') {
            try {
                const res = await fetch(data);
                const geojson = await res.json();
                geojson.features.forEach(f => {
                    const name = f.properties.nm_kor || 'unknown';
                    let hash = 0;
                    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
                    f.properties._color = `hsl(${Math.abs(hash % 360)}, 70%, 50%)`;
                });
                data = geojson;
            } catch (e) {}
        }

        map.addSource(sourceId, { type: 'geojson', data: data });

        if (config.type === 'fill') {
            map.addLayer({ 
                id: layerId, type: 'fill', source: sourceId, 
                paint: { 
                    'fill-color': config.id === 'admin' ? ['get', '_color'] : config.color, 
                    'fill-opacity': config.opacity, 
                    'fill-outline-color': 'rgba(255,255,255,0.4)' 
                } 
            });
        } else if (config.type === 'line') {
            map.addLayer({ id: layerId, type: 'line', source: sourceId, layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': config.color, 'line-width': config.width, 'line-opacity': config.opacity } });
        }
    }

    await setupPlacesLabels(map);

    layerConfigs.forEach(config => {
        createLayerControl(config, (changes) => {
            const layerId = (config.id === 'ddy-wms') ? 'ddy-wms' : `layer-${config.id}`;
            if (changes.visible !== undefined) map.setLayoutProperty(layerId, 'visibility', changes.visible ? 'visible' : 'none');
            if (changes.opacity !== undefined) {
                if (config.id.startsWith('poi-')) {
                    map.setPaintProperty(layerId, 'text-opacity', changes.opacity);
                } else if (config.id === 'ddy-wms') {
                    map.setPaintProperty(layerId, 'raster-opacity', changes.opacity);
                } else {
                    const prop = config.type === 'fill' ? 'fill-opacity' : 'line-opacity';
                    map.setPaintProperty(layerId, prop, changes.opacity);
                }
            }
            if (changes.width !== undefined && config.hasWidth) {
                map.setPaintProperty(layerId, 'line-width', changes.width);
            }
        });
    });
}

function createLayerControl(config, onChange) {
    const container = document.getElementById('layer-controls');
    const item = document.createElement('div');
    item.className = 'layer-control-item';
    const showOpacity = !config.noOpacity;
    const showWidth = config.hasWidth;
    const textColor = (config.id === 'ddy-wms') ? '#000' : (config.id === 'admin' ? '#c0392b' : (config.color === 'categorical' ? '#e74c3c' : config.color || '#fff'));
    const haloShadow = (config.id === 'ddy-wms') ? '0 0 5px rgba(255,255,255,1)' : '0 0 4px rgba(255,255,255,1)';

    item.innerHTML = `
        <div class="control-row header-row">
            <span class="layer-name" style="color:${textColor}; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, ${haloShadow}">${config.name}</span>
            <input type="checkbox" checked id="chk-${config.id}">
        </div>
        <div class="control-row slider-row">
            ${showOpacity ? `<div class="slider-group"><label>Alpha</label><input type="range" id="sld-op-${config.id}" min="0" max="1" step="0.1" value="${config.opacity || 1.0}"></div>` : ''}
            ${showWidth ? `<div class="slider-group"><label>Width</label><input type="range" id="sld-sh-${config.id}" min="0.5" max="8" step="0.5" value="${config.width || 3.0}"></div>` : ''}
        </div>
    `;
    container.appendChild(item);
    document.getElementById(`chk-${config.id}`).addEventListener('change', (e) => onChange({ visible: e.target.checked }));
    if (showOpacity) document.getElementById(`sld-op-${config.id}`).addEventListener('input', (e) => onChange({ opacity: parseFloat(e.target.value) }));
    if (showWidth) document.getElementById(`sld-sh-${config.id}`).addEventListener('input', (e) => onChange({ width: parseFloat(e.target.value) }));
}

async function setupPlacesLabels(map) {
    if (!map.getSource('src-places')) {
        map.addSource('src-places', { type: 'geojson', data: './data/places.geojson' });
    }

    const cityMatch = ['영아', '읍치', '도성'];
    const fortMatch = ['산성', '+고산성', '진보', '+진보'];
    const stationMatch = ['역참', '+역참'];
    const beaconMatch = ['봉수', '+봉수'];
    const allKeyMatch = [...cityMatch, ...fortMatch, ...stationMatch, ...beaconMatch];

    const labelLayout = {
        'text-field': ['get', 'nm_kor'],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
        'text-anchor': 'center'
    };

    const labelPaint = (color) => ({
        'text-color': color, 'text-halo-color': '#ffffff', 'text-halo-width': 2.5, 'text-halo-blur': 0.5, 'text-opacity': 1.0
    });

    map.addLayer({ id: 'layer-poi-cities', type: 'symbol', source: 'src-places', filter: ['any', ['match', ['get', 'feature_cd'], cityMatch, true, false], ['match', ['get', 'nm_suffix'], ['영', '읍'], true, false]], minzoom: 5, layout: { ...labelLayout, 'text-size': 14 }, paint: labelPaint('#e74c3c') });
    map.addLayer({ id: 'layer-poi-forts', type: 'symbol', source: 'src-places', filter: ['any', ['match', ['get', 'feature_cd'], fortMatch, true, false], ['match', ['get', 'nm_suffix'], ['성', '보'], true, false]], minzoom: 7, layout: { ...labelLayout, 'text-size': 13 }, paint: labelPaint('#f39c12') });
    map.addLayer({ id: 'layer-poi-stations', type: 'symbol', source: 'src-places', filter: ['any', ['match', ['get', 'feature_cd'], stationMatch, true, false], ['match', ['get', 'nm_suffix'], ['역'], true, false]], minzoom: 8, layout: { ...labelLayout, 'text-size': 12 }, paint: labelPaint('#27ae60') });
    map.addLayer({ id: 'layer-poi-beacons', type: 'symbol', source: 'src-places', filter: ['any', ['match', ['get', 'feature_cd'], beaconMatch, true, false]], minzoom: 8, layout: { ...labelLayout, 'text-size': 12 }, paint: labelPaint('#c0392b') });
    map.addLayer({ id: 'layer-poi-others', type: 'symbol', source: 'src-places', filter: ['!', ['any', ['match', ['get', 'feature_cd'], allKeyMatch, true, false], ['match', ['get', 'nm_suffix'], ['영', '읍', '성', '보', '역'], true, false]]], minzoom: 11, layout: { ...labelLayout, 'text-size': 12 }, paint: labelPaint('#333333') });
}
