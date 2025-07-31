/**
 * 坐标系转换工具
 * 处理WGS84、GCJ02坐标系之间的转换
 */

var PI = 3.1415926535897932384626;
var a = 6378245.0;
var ee = 0.00669342162296594323;

/**
 * 判断是否在中国范围内
 */
function outOfChina(lng, lat) {
  return (lng < 72.004 || lng > 137.8347) || (lat < 0.8293 || lat > 55.8271);
}

/**
 * 纬度转换
 */
function transformlat(lng, lat) {
  var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 
           0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
  return ret;
}

/**
 * 经度转换
 */
function transformlng(lng, lat) {
  var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 
           0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
  return ret;
}

/**
 * WGS84转GCJ02坐标
 * @param {number} lng WGS84经度
 * @param {number} lat WGS84纬度
 * @returns {object} {lng: GCJ02经度, lat: GCJ02纬度}
 */
function wgs84togcj02(lng, lat) {
  if (outOfChina(lng, lat)) {
    return { lng: lng, lat: lat };
  } else {
    var dlat = transformlat(lng - 105.0, lat - 35.0);
    var dlng = transformlng(lng - 105.0, lat - 35.0);
    var radlat = lat / 180.0 * PI;
    var magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    var sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
    var mglat = lat + dlat;
    var mglng = lng + dlng;
    return { lng: mglng, lat: mglat };
  }
}

/**
 * 批量转换机场坐标
 * @param {Array} airports 机场数据数组
 * @returns {Array} 转换后的机场数据数组
 */
function convertAirportsCoordinates(airports) {
  return airports.map(function(airport) {
    var converted = wgs84togcj02(airport.Longitude, airport.Latitude);
    return {
      ...airport,
      // 保留原始坐标
      OriginalLongitude: airport.Longitude,
      OriginalLatitude: airport.Latitude,
      // 更新为转换后的坐标
      Longitude: converted.lng,
      Latitude: converted.lat
    };
  });
}

/**
 * 转换单个坐标点
 * @param {number} lng 经度
 * @param {number} lat 纬度
 * @returns {object} 转换后的坐标
 */
function convertCoordinate(lng, lat) {
  return wgs84togcj02(lng, lat);
}

module.exports = {
  wgs84togcj02: wgs84togcj02,
  convertAirportsCoordinates: convertAirportsCoordinates,
  convertCoordinate: convertCoordinate,
  outOfChina: outOfChina
};