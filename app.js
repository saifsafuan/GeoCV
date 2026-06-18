/* =============================================================================
 *  GeoConvert — application logic
 * ========================================================================== */
(function () {
  'use strict';

  const WGS84 = 'EPSG:4326';
  const byCode = {};
  SYSTEMS.forEach(s => { byCode[s.code] = s; });

  // ---- DOM ----
  const el = id => document.getElementById(id);
  const fromSel = el('fromSystem'), toSel = el('toSystem');
  const inX = el('inX'), inY = el('inY'), inGrid = el('inGrid');
  const inLabelX = el('inLabelX'), inLabelY = el('inLabelY');
  const gridField = el('gridField'), inputFields = el('inputFields');
  const dmsFields = el('dmsFields');
  const latD = el('latD'), latM = el('latM'), latS = el('latS'), latH = el('latH');
  const lngD = el('lngD'), lngM = el('lngM'), lngS = el('lngS'), lngH = el('lngH');
  const dmsToggle = el('dmsToggle'), dmsToggleWrap = el('dmsToggleWrap');
  const inputTypeBadge = el('inputTypeBadge'), outputTypeBadge = el('outputTypeBadge');
  const outX = el('outX'), outY = el('outY'), outWgs = el('outWgs'), outDms = el('outDms');
  const outLabelX = el('outLabelX'), outLabelY = el('outLabelY');
  const statusEl = el('status');

  // -------------------------------------------------------------------------
  //  Populate selects (grouped)
  // -------------------------------------------------------------------------
  function buildOptions(select, selectedCode) {
    const groups = {};
    SYSTEMS.forEach(s => { (groups[s.group] = groups[s.group] || []).push(s); });
    select.innerHTML = '';
    Object.keys(groups).forEach(g => {
      const og = document.createElement('optgroup');
      og.label = g;
      groups[g].forEach(s => {
        const o = document.createElement('option');
        o.value = s.code;
        const showCode = /^EPSG:\d+$/.test(s.code); // hide internal disambiguators
        o.textContent = s.name + (showCode ? '  ·  ' + s.code : '');
        if (s.code === selectedCode) o.selected = true;
        og.appendChild(o);
      });
      select.appendChild(og);
    });
  }
  buildOptions(fromSel, WGS84);
  buildOptions(toSel, 'EPSG:27700');
  el('systemCount').textContent = SYSTEMS.length + ' coordinate systems';

  // -------------------------------------------------------------------------
  //  DMS helpers
  // -------------------------------------------------------------------------
  function toDMS(dec, isLat) {
    const hemi = dec < 0 ? (isLat ? 'S' : 'W') : (isLat ? 'N' : 'E');
    const a = Math.abs(dec);
    let d = Math.floor(a);
    let m = Math.floor((a - d) * 60);
    let s = ((a - d) * 60 - m) * 60;
    if (s >= 59.9995) { s = 0; m++; }
    if (m === 60) { m = 0; d++; }
    return d + '° ' + String(m).padStart(2, '0') + "' " + s.toFixed(3) + '" ' + hemi;
  }
  // Split a decimal degree into {d, m, s, hemi} for the structured fields
  function dmsParts(dec, isLat) {
    const hemi = dec < 0 ? (isLat ? 'S' : 'W') : (isLat ? 'N' : 'E');
    const a = Math.abs(dec);
    let d = Math.floor(a);
    let m = Math.floor((a - d) * 60);
    let s = ((a - d) * 60 - m) * 60;
    if (s >= 59.9995) { s = 0; m++; }
    if (m === 60) { m = 0; d++; }
    return { d: d, m: m, s: +s.toFixed(3), hemi: hemi };
  }
  // Assemble structured D/M/S fields into a decimal degree
  function dmsToDecimal(d, m, s, hemi) {
    d = Number(d) || 0; m = Number(m) || 0; s = Number(s) || 0;
    let dec = Math.abs(d) + m / 60 + s / 3600;
    if (hemi === 'S' || hemi === 'W' || d < 0) dec = -dec;
    return dec;
  }

  // Parse a DMS or decimal string into decimal degrees
  function parseFlexible(str) {
    if (str == null) return NaN;
    str = String(str).trim();
    if (str === '') return NaN;
    const plain = Number(str);
    if (!isNaN(plain) && /^[+-]?[\d.]+$/.test(str)) return plain;
    const hemi = (str.match(/[NSEW]/i) || [''])[0].toUpperCase();
    const nums = str.replace(/[^\d.\-]+/g, ' ').trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
    if (!nums.length) return NaN;
    let dec = Math.abs(nums[0]) + (nums[1] || 0) / 60 + (nums[2] || 0) / 3600;
    if (hemi === 'S' || hemi === 'W' || nums[0] < 0) dec = -dec;
    return dec;
  }

  // -------------------------------------------------------------------------
  //  UI sync for the chosen systems
  // -------------------------------------------------------------------------
  function syncInputUI() {
    const s = byCode[fromSel.value];
    inputTypeBadge.textContent = s.type;
    const isGrid = s.type === 'grid';
    const isGeo = s.type === 'geographic';
    const dms = isGeo && dmsToggle.checked;
    gridField.style.display = isGrid ? 'flex' : 'none';
    dmsFields.style.display = dms ? 'flex' : 'none';
    inputFields.style.display = (isGrid || dms) ? 'none' : 'grid';
    dmsToggleWrap.style.display = isGeo ? 'flex' : 'none';
    if (!isGrid) {
      inLabelY.textContent = s.axis.y;
      inLabelX.textContent = s.axis.x;
    }
  }
  function syncOutputUI() {
    const s = byCode[toSel.value];
    outputTypeBadge.textContent = s.type;
    if (s.type === 'grid') {
      outLabelY.textContent = 'Grid reference';
      outLabelX.textContent = '—';
    } else {
      outLabelY.textContent = s.axis.y;
      outLabelX.textContent = s.axis.x;
    }
  }

  // -------------------------------------------------------------------------
  //  Core conversion.  Returns { lat, lng, outA, outB } or throws.
  //  Internal pivot is always WGS84 lon/lat.
  // -------------------------------------------------------------------------
  function toWgs(sys, a, b) {
    // a = first field (Y / lat / northing), b = second field (X / lng / easting)
    if (sys.type === 'grid') {
      const pt = window.mgrs.toPoint(String(a).replace(/\s+/g, '').toUpperCase());
      return { lng: pt[0], lat: pt[1] };
    }
    if (sys.code === WGS84 || sys.proj4.indexOf('+proj=longlat') === 0 || sys.type === 'geographic') {
      // geographic: a=lat, b=lng — reproject through its datum to WGS84
      const r = proj4(sys.code, WGS84, [b, a]); // proj4 wants [lng, lat]
      return { lng: r[0], lat: r[1] };
    }
    // projected: a=northing(Y), b=easting(X) — proj4 wants [easting, northing]
    const r = proj4(sys.code, WGS84, [b, a]);
    return { lng: r[0], lat: r[1] };
  }
  function fromWgs(sys, lng, lat) {
    if (sys.type === 'grid') {
      const g = window.mgrs.forward([lng, lat], 5);
      // format 30UXC9904009328 -> spaced for readability
      return { grid: g.replace(/^(\d+[C-X])([A-Z]{2})(\d+)$/, (_, z, sq, n) => {
        const h = n.length / 2;
        return z + ' ' + sq + ' ' + n.slice(0, h) + ' ' + n.slice(h);
      }) };
    }
    if (sys.type === 'geographic') {
      const r = proj4(WGS84, sys.code, [lng, lat]); // [lng, lat]
      return { x: r[0], y: r[1] }; // x=lng, y=lat
    }
    const r = proj4(WGS84, sys.code, [lng, lat]); // [easting, northing]
    return { x: r[0], y: r[1] };
  }

  function fmt(n, type, isY) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    if (type === 'geographic') return n.toFixed(8);
    return n.toFixed(3);
  }

  // -------------------------------------------------------------------------
  function convert(opts) {
    opts = opts || {};
    const from = byCode[fromSel.value];
    const to = byCode[toSel.value];
    setStatus('');

    let wgs;
    try {
      if (from.type === 'grid') {
        if (!inGrid.value.trim()) { return; }
        wgs = toWgs(from, inGrid.value.trim());
      } else {
        let a, b;
        if (from.type === 'geographic' && dmsToggle.checked) {
          // structured degrees / minutes / seconds fields
          a = dmsToDecimal(latD.value, latM.value, latS.value, latH.value);
          b = dmsToDecimal(lngD.value, lngM.value, lngS.value, lngH.value);
          if ([latD, latM, latS, lngD, lngM, lngS].every(f => f.value.trim() === '')) {
            if (!opts.silent) setStatus('Enter the degrees / minutes / seconds values.', 'err');
            return;
          }
        } else {
          a = parseFlexible(inY.value); b = parseFlexible(inX.value);
        }
        if (isNaN(a) || isNaN(b)) {
          if (!opts.silent) setStatus('Enter valid numbers in both fields.', 'err');
          return;
        }
        wgs = toWgs(from, a, b);
      }
    } catch (e) {
      setStatus('Could not read the input: ' + e.message, 'err');
      return;
    }

    if (!wgs || isNaN(wgs.lat) || isNaN(wgs.lng) || Math.abs(wgs.lat) > 90.0001) {
      setStatus('Input is out of range for this coordinate system.', 'err');
      return;
    }

    // Output system
    try {
      const res = fromWgs(to, wgs.lng, wgs.lat);
      if (to.type === 'grid') {
        outY.textContent = res.grid;
        outX.textContent = '—';
      } else {
        outY.textContent = fmt(res.y, to.type, true);
        outX.textContent = fmt(res.x, to.type, false);
      }
    } catch (e) {
      outY.textContent = '—'; outX.textContent = '—';
      setStatus('Target projection failed: ' + e.message, 'err');
    }

    outWgs.textContent = wgs.lat.toFixed(8) + ', ' + wgs.lng.toFixed(8);
    outDms.textContent = toDMS(wgs.lat, true) + '   ' + toDMS(wgs.lng, false);

    updateMap(wgs.lat, wgs.lng, opts.fromMap);
    if (!opts.silent) setStatus('Converted successfully.', 'ok');
  }

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = 'status' + (kind ? ' ' + kind : '');
  }

  // -------------------------------------------------------------------------
  //  Map
  // -------------------------------------------------------------------------
  const map = L.map('map', { zoomControl: true, worldCopyJump: true })
    .setView([30, 10], 2);

  const bases = {
    streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap'
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, attribution: 'Tiles © Esri'
    }),
    topo: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, attribution: 'Tiles © Esri'
    })
  };
  bases.streets.addTo(map);
  let activeBase = bases.streets;

  // Leaflet must recompute its pixel size whenever the container changes size
  // (window resize, preview-pane resize, or the initial layout settling in a
  // flex container) — otherwise it renders blank/gray tiles and looks broken.
  function refreshMapSize() { map.invalidateSize(false); }
  window.addEventListener('load', refreshMapSize);
  window.addEventListener('resize', refreshMapSize);
  setTimeout(refreshMapSize, 200);
  setTimeout(refreshMapSize, 800);
  if (window.ResizeObserver) {
    new ResizeObserver(refreshMapSize).observe(document.getElementById('map'));
  }

  let marker = null;

  function updateMap(lat, lng, fromMap) {
    const ll = [lat, lng];
    if (!marker) {
      marker = L.marker(ll, { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const p = marker.getLatLng();
        setFromLatLng(p.lat, p.lng);
      });
    } else {
      marker.setLatLng(ll);
    }
    marker.bindPopup('<b>WGS84</b><br>' + lat.toFixed(6) + ', ' + lng.toFixed(6)).openPopup();
    if (!fromMap) {
      map.setView(ll, Math.max(map.getZoom(), 12), { animate: true });
    }
    el('mapReadout').textContent = 'Point: ' + lat.toFixed(6) + ', ' + lng.toFixed(6) + ' (WGS84)';
  }

  // Fill BOTH the decimal and D/M/S fields so the two stay in sync
  function fillLatLng(lat, lng) {
    if (isNaN(lat) || isNaN(lng)) return;
    inY.value = lat.toFixed(8);
    inX.value = lng.toFixed(8);
    const la = dmsParts(lat, true), lo = dmsParts(lng, false);
    latD.value = la.d; latM.value = la.m; latS.value = la.s; latH.value = la.hemi;
    lngD.value = lo.d; lngM.value = lo.m; lngS.value = lo.s; lngH.value = lo.hemi;
  }
  // Read the current geographic input as decimal lat/lng (either entry mode)
  function currentGeoDecimal() {
    if (dmsToggle.checked) {
      return {
        lat: dmsToDecimal(latD.value, latM.value, latS.value, latH.value),
        lng: dmsToDecimal(lngD.value, lngM.value, lngS.value, lngH.value)
      };
    }
    return { lat: parseFlexible(inY.value), lng: parseFlexible(inX.value) };
  }

  // When the map is clicked/dragged, push WGS84 back into the input fields
  function setFromLatLng(lat, lng) {
    // Switch source to WGS84 so the round-trip is exact and intuitive
    fromSel.value = WGS84;
    syncInputUI();
    fillLatLng(lat, lng);
    convert({ fromMap: true, silent: true });
  }

  map.on('click', e => setFromLatLng(e.latlng.lat, e.latlng.lng));

  // Basemap switcher
  document.querySelectorAll('.base-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.base-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      map.removeLayer(activeBase);
      activeBase = bases[btn.dataset.base];
      activeBase.addTo(map);
    });
  });

  // -------------------------------------------------------------------------
  //  Events
  // -------------------------------------------------------------------------
  el('convertBtn').addEventListener('click', () => convert());
  fromSel.addEventListener('change', () => { syncInputUI(); convert({ silent: true }); });
  toSel.addEventListener('change', () => { syncOutputUI(); convert({ silent: true }); });
  dmsToggle.addEventListener('change', () => {
    // carry the current value across to the newly shown fields
    const c = currentGeoDecimal();
    fillLatLng(c.lat, c.lng);
    syncInputUI();
    convert({ silent: true });
  });
  [inX, inY, inGrid, latD, latM, latS, lngD, lngM, lngS].forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') convert(); });
  });

  el('swapBtn').addEventListener('click', () => {
    const f = fromSel.value, t = toSel.value;
    fromSel.value = t; toSel.value = f;
    syncInputUI(); syncOutputUI();
    // seed input from current output (via WGS84 round trip)
    convert({ silent: true });
  });

  // Quick-location chips
  document.querySelectorAll('.chip[data-lat]').forEach(c => {
    c.addEventListener('click', () => {
      fromSel.value = WGS84; syncInputUI();
      fillLatLng(parseFloat(c.dataset.lat), parseFloat(c.dataset.lng));
      convert();
    });
  });

  // Use my current location (browser Geolocation API)
  const locateBtn = el('locateBtn');
  let accuracyCircle = null;
  locateBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by this browser.', 'err');
      return;
    }
    const label = locateBtn.querySelector('svg').outerHTML;
    locateBtn.disabled = true;
    locateBtn.innerHTML = label + ' Locating…';
    setStatus('Requesting your location…', '');
    navigator.geolocation.getCurrentPosition(
      pos => {
        locateBtn.disabled = false;
        locateBtn.innerHTML = label + ' Use my location';
        const lat = pos.coords.latitude, lng = pos.coords.longitude, acc = pos.coords.accuracy;
        fromSel.value = WGS84; syncInputUI();
        fillLatLng(lat, lng);
        convert();
        if (accuracyCircle) map.removeLayer(accuracyCircle);
        accuracyCircle = L.circle([lat, lng], {
          radius: acc, color: '#1f6feb', weight: 1, fillColor: '#1f6feb', fillOpacity: 0.12
        }).addTo(map);
        setStatus('Located you (±' + Math.round(acc) + ' m). Coordinate set as WGS84 input.', 'ok');
      },
      err => {
        locateBtn.disabled = false;
        locateBtn.innerHTML = label + ' Use my location';
        let msg = 'Could not get your location.';
        if (err.code === 1) msg = 'Location permission denied — enable it in your browser to use this.';
        else if (err.code === 2) msg = 'Your location is unavailable right now.';
        else if (err.code === 3) msg = 'The location request timed out — try again.';
        setStatus(msg, 'err');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });

  // Copy buttons
  document.querySelectorAll('.copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const txt = el(btn.dataset.copy).textContent;
      if (!txt || txt === '—') return;
      navigator.clipboard.writeText(txt).then(() => {
        btn.classList.add('copied'); btn.textContent = '✓';
        setTimeout(() => { btn.classList.remove('copied'); btn.textContent = '⧉'; }, 1200);
      });
    });
  });

  // -------------------------------------------------------------------------
  //  Init
  // -------------------------------------------------------------------------
  syncInputUI();
  syncOutputUI();
  fillLatLng(51.477928, -0.001545);
  convert({ silent: true });
  setStatus('Ready. Enter coordinates and click Convert, or click anywhere on the map.', '');
})();
