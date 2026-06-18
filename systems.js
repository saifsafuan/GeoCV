/* =============================================================================
 *  Coordinate System Database
 *  Each entry registers a proj4 definition and carries display metadata.
 *
 *  type:   "geographic" (lon/lat in degrees)  |  "projected" (E/N in metres)
 *  group:  category used to build the grouped <select>
 *  axis:   labels + the order coordinates are entered/displayed
 *          for geographic -> {x:'Longitude', y:'Latitude'}
 *          for projected  -> {x:'Easting',   y:'Northing'}
 * ========================================================================== */

const SYSTEMS = [];

function defSystem(s) {
  if (s.proj4 && window.proj4) {
    try { proj4.defs(s.code, s.proj4); } catch (e) { /* ignore */ }
  }
  SYSTEMS.push(s);
}

/* ---- Global / reference ------------------------------------------------- */
defSystem({
  code: 'EPSG:4326', name: 'WGS 84 — GPS (lat/long)', group: 'Global / Reference',
  type: 'geographic', axis: { x: 'Longitude', y: 'Latitude' },
  proj4: '+proj=longlat +datum=WGS84 +no_defs'
});
defSystem({
  code: 'EPSG:4979', name: 'WGS 84 (3D, lat/long)', group: 'Global / Reference',
  type: 'geographic', axis: { x: 'Longitude', y: 'Latitude' },
  proj4: '+proj=longlat +datum=WGS84 +no_defs'
});
defSystem({
  code: 'EPSG:3857', name: 'Web Mercator (Google/OSM/Bing)', group: 'Global / Reference',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +no_defs'
});
defSystem({
  code: 'EPSG:4269', name: 'NAD83 (lat/long)', group: 'Global / Reference',
  type: 'geographic', axis: { x: 'Longitude', y: 'Latitude' },
  proj4: '+proj=longlat +datum=NAD83 +no_defs'
});
defSystem({
  code: 'EPSG:4267', name: 'NAD27 (lat/long)', group: 'Global / Reference',
  type: 'geographic', axis: { x: 'Longitude', y: 'Latitude' },
  proj4: '+proj=longlat +datum=NAD27 +no_defs'
});
defSystem({
  code: 'EPSG:4258', name: 'ETRS89 (lat/long)', group: 'Global / Reference',
  type: 'geographic', axis: { x: 'Longitude', y: 'Latitude' },
  proj4: '+proj=longlat +ellps=GRS80 +no_defs'
});
defSystem({
  code: 'EPSG:3035', name: 'ETRS89 / LAEA Europe', group: 'Global / Reference',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'MGRS', name: 'MGRS / USNG (Military Grid)', group: 'Global / Reference',
  type: 'grid', axis: { x: 'Grid reference', y: null },
  proj4: null
});

/* ---- UTM (WGS84) zones 1–60, North & South ------------------------------ */
for (let z = 1; z <= 60; z++) {
  const lon0 = z * 6 - 183;
  defSystem({
    code: 'EPSG:' + (32600 + z),
    name: 'UTM Zone ' + z + 'N (WGS84)', group: 'UTM — Northern Hemisphere',
    type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
    proj4: '+proj=utm +zone=' + z + ' +datum=WGS84 +units=m +no_defs'
  });
  defSystem({
    code: 'EPSG:' + (32700 + z),
    name: 'UTM Zone ' + z + 'S (WGS84)', group: 'UTM — Southern Hemisphere',
    type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
    proj4: '+proj=utm +zone=' + z + ' +south +datum=WGS84 +units=m +no_defs'
  });
}

/* ---- Europe ------------------------------------------------------------- */
defSystem({
  code: 'EPSG:27700', name: 'OSGB36 / British National Grid', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:29903', name: 'Irish Grid (TM75)', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=mod_airy +towgs84=482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:2157', name: 'Irish Transverse Mercator (ITM)', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=0.99982 +x_0=600000 +y_0=750000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:2154', name: 'RGF93 / Lambert-93 (France)', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:25831', name: 'ETRS89 / UTM 31N (Spain/France)', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:25832', name: 'ETRS89 / UTM 32N (Germany W)', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:25833', name: 'ETRS89 / UTM 33N (Germany E)', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:31467', name: 'DHDN / Gauss-Krüger Zone 3 (Germany)', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:28992', name: 'Amersfoort / RD New (Netherlands)', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:31370', name: 'Belgian Lambert 72', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 +lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.8686,52.2978,-103.7239,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:3812', name: 'ETRS89 / Belgian Lambert 2008', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=lcc +lat_1=49.83333333333334 +lat_2=51.16666666666666 +lat_0=50.797815 +lon_0=4.359215833333333 +x_0=649328 +y_0=665262 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:3003', name: 'Monte Mario / Italy Zone 1', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl +towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:2056', name: 'CH1903+ / LV95 (Switzerland)', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:3006', name: 'SWEREF99 TM (Sweden)', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:25830', name: 'ETRS89 / UTM 30N (Spain/UK)', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:3035b', name: 'ETRS89 / UTM 34N (Poland/Baltics)', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=utm +zone=34 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:2180', name: 'ETRS89 / Poland CS92', group: 'Europe',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});

/* ---- North America ------------------------------------------------------ */
defSystem({
  code: 'EPSG:3358', name: 'NAD83 / North Carolina (m)', group: 'United States (State Plane)',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=lcc +lat_1=36.16666666666666 +lat_2=34.33333333333334 +lat_0=33.75 +lon_0=-79 +x_0=609601.22 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:2227', name: 'NAD83 / California Zone 3 (US ft)', group: 'United States (State Plane)',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=lcc +lat_1=38.43333333333333 +lat_2=37.06666666666667 +lat_0=36.5 +lon_0=-120.5 +x_0=2000000.0001016 +y_0=500000.0001016001 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs'
});
defSystem({
  code: 'EPSG:2263', name: 'NAD83 / New York Long Island (US ft)', group: 'United States (State Plane)',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=lcc +lat_1=41.03333333333333 +lat_2=40.66666666666666 +lat_0=40.16666666666666 +lon_0=-74 +x_0=300000.0000000001 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs'
});
defSystem({
  code: 'EPSG:2236', name: 'NAD83 / Florida East (US ft)', group: 'United States (State Plane)',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=tmerc +lat_0=24.33333333333333 +lon_0=-81 +k=0.999941177 +x_0=200000.0001016002 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs'
});
defSystem({
  code: 'EPSG:3978', name: 'NAD83 / Canada Atlas Lambert', group: 'North America',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:6622', name: 'NAD83(CSRS) / Quebec Lambert', group: 'North America',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=lcc +lat_1=50 +lat_2=46 +lat_0=44 +lon_0=-70 +x_0=800000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:6372', name: 'Mexico ITRF2008 / LCC', group: 'North America',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=lcc +lat_1=17.5 +lat_2=29.5 +lat_0=12 +lon_0=-102 +x_0=2500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});

/* ---- Asia --------------------------------------------------------------- */
defSystem({
  code: 'EPSG:4326-IN', name: 'India — use UTM 43N/44N (see UTM)', group: 'Asia',
  type: 'geographic', axis: { x: 'Longitude', y: 'Latitude' },
  proj4: '+proj=longlat +datum=WGS84 +no_defs'
});
defSystem({
  code: 'EPSG:7755', name: 'WGS84 / India NSF LCC', group: 'Asia',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=lcc +lat_1=12.472944 +lat_2=35.17280444444444 +lat_0=24 +lon_0=80 +x_0=4000000 +y_0=4000000 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:4612', name: 'JGD2000 (Japan, lat/long)', group: 'Asia',
  type: 'geographic', axis: { x: 'Longitude', y: 'Latitude' },
  proj4: '+proj=longlat +ellps=GRS80 +no_defs'
});
defSystem({
  code: 'EPSG:6677', name: 'JGD2011 / Japan Plane IX (Tokyo)', group: 'Asia',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=tmerc +lat_0=36 +lon_0=139.8333333333333 +k=0.9999 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:4490', name: 'CGCS2000 (China, lat/long)', group: 'Asia',
  type: 'geographic', axis: { x: 'Longitude', y: 'Latitude' },
  proj4: '+proj=longlat +ellps=GRS80 +no_defs'
});
defSystem({
  code: 'EPSG:4548', name: 'CGCS2000 / 3-degree GK CM 117E (China)', group: 'Asia',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:5179', name: 'Korea 2000 / Unified CS', group: 'Asia',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});

/* ---- Oceania ------------------------------------------------------------ */
defSystem({
  code: 'EPSG:3577', name: 'GDA94 / Australian Albers', group: 'Oceania',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=aea +lat_1=-18 +lat_2=-36 +lat_0=0 +lon_0=132 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:28355', name: 'GDA94 / MGA Zone 55 (Melbourne/Sydney)', group: 'Oceania',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=utm +zone=55 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:28356', name: 'GDA94 / MGA Zone 56 (Brisbane)', group: 'Oceania',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=utm +zone=56 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:7855', name: 'GDA2020 / MGA Zone 55', group: 'Oceania',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=utm +zone=55 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:2193', name: 'NZGD2000 / NZ Transverse Mercator', group: 'Oceania',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=tmerc +lat_0=0 +lon_0=173 +k=0.9996 +x_0=1600000 +y_0=10000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});

/* ---- Africa & South America -------------------------------------------- */
defSystem({
  code: 'EPSG:22234', name: 'Cape / UTM-like (South Africa Lo)', group: 'Africa',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=tmerc +lat_0=0 +lon_0=21 +k=1 +x_0=0 +y_0=0 +axis=wsu +ellps=clrk80 +towgs84=-136,-108,-292,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:32733', name: 'WGS84 / UTM 33S (Southern Africa)', group: 'Africa',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=utm +zone=33 +south +datum=WGS84 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:29193', name: 'SAD69 / UTM 23S (Brazil)', group: 'South America',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=utm +zone=23 +south +ellps=aust_SA +towgs84=-67.35,3.88,-38.22,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:31983', name: 'SIRGAS 2000 / UTM 23S (Brazil)', group: 'South America',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=utm +zone=23 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});
defSystem({
  code: 'EPSG:5347', name: 'POSGAR 2007 / Argentina 5', group: 'South America',
  type: 'projected', axis: { x: 'Easting (X)', y: 'Northing (Y)' },
  proj4: '+proj=tmerc +lat_0=-90 +lon_0=-60 +k=1 +x_0=5500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
});

window.SYSTEMS = SYSTEMS;
