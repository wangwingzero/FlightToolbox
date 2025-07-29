/**
 * 坐标转换工具模块
 * 
 * 提供各种坐标格式之间的转换功能，包括：
 * - 度分秒(DMS)格式与小数度格式互转
 * - 坐标格式化显示
 * - 坐标验证
 * - 距离和方位计算
 */

var CoordinateUtils = {
  
  /**
   * 小数度转换为度分秒格式
   * @param {Number} decimal 小数度
   * @returns {Object} {degrees: Number, minutes: Number, seconds: Number}
   */
  decimalToDMS: function(decimal) {
    var absDecimal = Math.abs(decimal);
    var degrees = Math.floor(absDecimal);
    var minutesFloat = (absDecimal - degrees) * 60;
    var minutes = Math.floor(minutesFloat);
    var seconds = (minutesFloat - minutes) * 60;
    
    return {
      degrees: degrees,
      minutes: minutes,
      seconds: Math.round(seconds * 100) / 100 // 保留2位小数
    };
  },
  
  /**
   * 度分秒格式转换为小数度
   * @param {Number} degrees 度
   * @param {Number} minutes 分
   * @param {Number} seconds 秒
   * @returns {Number} 小数度
   */
  dmsToDecimal: function(degrees, minutes, seconds) {
    return Math.abs(degrees) + (minutes || 0) / 60 + (seconds || 0) / 3600;
  },
  
  /**
   * 格式化坐标为度分秒字符串
   * @param {Number} lat 纬度
   * @param {Number} lng 经度
   * @param {Number} precision 秒的精度（小数位数）
   * @returns {String} 格式化的坐标字符串
   */
  formatDMS: function(lat, lng, precision) {
    precision = precision || 2;
    
    var latDMS = this.decimalToDMS(lat);
    var lngDMS = this.decimalToDMS(lng);
    
    var latHem = lat >= 0 ? 'N' : 'S';
    var lngHem = lng >= 0 ? 'E' : 'W';
    
    var latStr = latDMS.degrees + '°' + 
                 this.padZero(latDMS.minutes) + '\'' + 
                 latDMS.seconds.toFixed(precision) + '"' + latHem;
                 
    var lngStr = lngDMS.degrees + '°' + 
                 this.padZero(lngDMS.minutes) + '\'' + 
                 lngDMS.seconds.toFixed(precision) + '"' + lngHem;
    
    return latStr + ', ' + lngStr;
  },
  
  /**
   * 格式化坐标为小数度字符串
   * @param {Number} lat 纬度
   * @param {Number} lng 经度
   * @param {Number} precision 小数位数
   * @returns {String} 格式化的坐标字符串
   */
  formatDecimal: function(lat, lng, precision) {
    precision = precision || 6;
    return lat.toFixed(precision) + ', ' + lng.toFixed(precision);
  },
  
  /**
   * 解析度分秒字符串为小数度
   * @param {String} dmsString 度分秒字符串，如 "39°54'26.4\"N"
   * @returns {Number} 小数度，如果解析失败返回null
   */
  parseDMS: function(dmsString) {
    if (!dmsString || typeof dmsString !== 'string') {
      return null;
    }
    
    // 匹配度分秒格式的正则表达式
    var regex = /^(\d+)°\s*(\d+)'\s*([\d.]+)"\s*([NSEW])$/i;
    var match = dmsString.trim().match(regex);
    
    if (!match) {
      return null;
    }
    
    var degrees = parseInt(match[1]);
    var minutes = parseInt(match[2]);
    var seconds = parseFloat(match[3]);
    var hemisphere = match[4].toUpperCase();
    
    var decimal = this.dmsToDecimal(degrees, minutes, seconds);
    
    // 根据半球调整符号
    if (hemisphere === 'S' || hemisphere === 'W') {
      decimal = -decimal;
    }
    
    return decimal;
  },
  
  /**
   * 验证坐标是否有效
   * @param {Number} lat 纬度
   * @param {Number} lng 经度
   * @returns {Object} {valid: Boolean, errors: Array}
   */
  validateCoordinates: function(lat, lng) {
    var errors = [];
    
    if (typeof lat !== 'number' || isNaN(lat)) {
      errors.push('纬度必须是有效数字');
    } else if (lat < -90 || lat > 90) {
      errors.push('纬度必须在-90到90度之间');
    }
    
    if (typeof lng !== 'number' || isNaN(lng)) {
      errors.push('经度必须是有效数字');
    } else if (lng < -180 || lng > 180) {
      errors.push('经度必须在-180到180度之间');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  /**
   * 计算两点之间的距离（海里）
   * @param {Number} lat1 起点纬度
   * @param {Number} lng1 起点经度
   * @param {Number} lat2 终点纬度
   * @param {Number} lng2 终点经度
   * @returns {Number} 距离（海里）
   */
  calculateDistance: function(lat1, lng1, lat2, lng2) {
    var R = 3440.065; // 地球半径（海里）
    var dLat = this.toRadians(lat2 - lat1);
    var dLng = this.toRadians(lng2 - lng1);
    
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  },
  
  /**
   * 计算两点之间的方位角（度）
   * @param {Number} lat1 起点纬度
   * @param {Number} lng1 起点经度
   * @param {Number} lat2 终点纬度
   * @param {Number} lng2 终点经度
   * @returns {Number} 方位角（0-360度）
   */
  calculateBearing: function(lat1, lng1, lat2, lng2) {
    var dLng = this.toRadians(lng2 - lng1);
    var lat1Rad = this.toRadians(lat1);
    var lat2Rad = this.toRadians(lat2);
    
    var y = Math.sin(dLng) * Math.cos(lat2Rad);
    var x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    var bearing = this.toDegrees(Math.atan2(y, x));
    
    // 标准化到0-360度
    return (bearing + 360) % 360;
  },
  
  /**
   * 根据起点、距离和方位角计算终点坐标
   * @param {Number} lat 起点纬度
   * @param {Number} lng 起点经度
   * @param {Number} distance 距离（海里）
   * @param {Number} bearing 方位角（度）
   * @returns {Object} {lat: Number, lng: Number}
   */
  calculateDestination: function(lat, lng, distance, bearing) {
    var R = 3440.065; // 地球半径（海里）
    var angularDistance = distance / R;
    var bearingRad = this.toRadians(bearing);
    var latRad = this.toRadians(lat);
    var lngRad = this.toRadians(lng);
    
    var lat2Rad = Math.asin(
      Math.sin(latRad) * Math.cos(angularDistance) +
      Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearingRad)
    );
    
    var lng2Rad = lngRad + Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(lat2Rad)
    );
    
    return {
      lat: this.toDegrees(lat2Rad),
      lng: this.toDegrees(lng2Rad)
    };
  },
  
  /**
   * 检查点是否在圆形区域内
   * @param {Number} pointLat 点的纬度
   * @param {Number} pointLng 点的经度
   * @param {Number} centerLat 中心点纬度
   * @param {Number} centerLng 中心点经度
   * @param {Number} radius 半径（海里）
   * @returns {Boolean} 是否在区域内
   */
  isPointInCircle: function(pointLat, pointLng, centerLat, centerLng, radius) {
    var distance = this.calculateDistance(pointLat, pointLng, centerLat, centerLng);
    return distance <= radius;
  },
  
  /**
   * 格式化距离显示
   * @param {Number} distance 距离（海里）
   * @returns {String} 格式化的距离字符串
   */
  formatDistance: function(distance) {
    if (distance < 0.1) {
      return Math.round(distance * 6076.12) + 'ft'; // 转换为英尺
    } else if (distance < 1) {
      return (distance * 1852).toFixed(0) + 'm'; // 转换为米
    } else if (distance < 10) {
      return distance.toFixed(1) + 'NM';
    } else {
      return Math.round(distance) + 'NM';
    }
  },
  
  /**
   * 格式化方位角显示
   * @param {Number} bearing 方位角（度）
   * @returns {String} 格式化的方位角字符串
   */
  formatBearing: function(bearing) {
    var directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    
    var index = Math.round(bearing / 22.5) % 16;
    var direction = directions[index];
    
    return Math.round(bearing) + '° (' + direction + ')';
  },
  
  /**
   * 工具函数：角度转弧度
   * @param {Number} degrees 角度
   * @returns {Number} 弧度
   */
  toRadians: function(degrees) {
    return degrees * Math.PI / 180;
  },
  
  /**
   * 工具函数：弧度转角度
   * @param {Number} radians 弧度
   * @returns {Number} 角度
   */
  toDegrees: function(radians) {
    return radians * 180 / Math.PI;
  },
  
  /**
   * 工具函数：数字补零
   * @param {Number} num 数字
   * @param {Number} width 宽度
   * @returns {String} 补零后的字符串
   */
  padZero: function(num, width) {
    width = width || 2;
    var str = num.toString();
    return str.length >= width ? str : new Array(width - str.length + 1).join('0') + str;
  },
  
  /**
   * 工具函数：限制数字范围
   * @param {Number} value 值
   * @param {Number} min 最小值
   * @param {Number} max 最大值
   * @returns {Number} 限制后的值
   */
  clamp: function(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },
  
  /**
   * 坐标系转换：WGS84转GCJ02（火星坐标系）
   * @param {Number} lng 经度
   * @param {Number} lat 纬度
   * @returns {Object} {lng: Number, lat: Number}
   */
  wgs84ToGcj02: function(lng, lat) {
    var a = 6378245.0;
    var ee = 0.00669342162296594323;
    
    var dlat = this.transformlat(lng - 105.0, lat - 35.0);
    var dlng = this.transformlng(lng - 105.0, lat - 35.0);
    
    var radlat = lat / 180.0 * Math.PI;
    var magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    var sqrtmagic = Math.sqrt(magic);
    
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * Math.PI);
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * Math.PI);
    
    return {
      lat: lat + dlat,
      lng: lng + dlng
    };
  },
  
  /**
   * 坐标系转换辅助函数
   */
  transformlat: function(lng, lat) {
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 
              0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  },
  
  /**
   * 坐标系转换辅助函数
   */
  transformlng: function(lng, lat) {
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 
              0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
  }
};

module.exports = CoordinateUtils;