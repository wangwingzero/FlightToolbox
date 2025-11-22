var STORAGE_KEY = 'pilot_level_progress_v1';

function getSegmentName(level) {
  if (level > 100) {
    return '总飞行师';
  }
  if (level === 100) {
    return '飞行之神';
  }
  if (level >= 95) {
    return '机型师';
  }
  if (level >= 90) {
    return '本场教员';
  }
  if (level >= 85) {
    return '型别教员';
  }
  if (level >= 80) {
    return '航线教员';
  }
  if (level >= 70) {
    return '资深机长';
  }
  if (level >= 60) {
    return '机长';
  }
  if (level >= 50) {
    return '巡航机长';
  }
  if (level >= 40) {
    return '资深副驾驶';
  }
  if (level >= 30) {
    return '副驾驶';
  }
  if (level >= 20) {
    return '见习副驾驶';
  }
  if (level >= 15) {
    return '新雇员';
  }
  if (level >= 10) {
    return '航校学员';
  }
  if (level >= 5) {
    return '理论课学员';
  }
  return '招飞学员';
}

function getLevelName(level) {
  var segment = getSegmentName(level);
  if (level >= 100) {
    return segment;
  }
  return segment + ' Lv.' + level;
}

function buildLevels() {
  var levels = [];
  var totalXp = 0;

  for (var lvl = 1; lvl <= 100; lvl++) {
    if (lvl === 1) {
      totalXp = 0;
    } else {
      var increment = 30 + Math.floor((lvl - 1) * 2);
      totalXp += increment;
    }

    levels.push({
      level: lvl,
      xp: totalXp,
      name: getLevelName(lvl)
    });
  }

  return levels;
}

var LEVELS = buildLevels();

var NEW_AIRPORT_XP = 200;
var REPEAT_AIRPORT_XP = 20;
var DAILY_ACTIVE_XP = 20;
var REWARDED_AD_XP = 20;

function getTodayDate() {
  var d = new Date();
  var y = d.getFullYear();
  var m = d.getMonth() + 1;
  var day = d.getDate();
  var mm = m < 10 ? '0' + m : '' + m;
  var dd = day < 10 ? '0' + day : '' + day;
  return y + '-' + mm + '-' + dd;
}

function getDefaultState() {
  return {
    totalXp: 0,
    level: 1,
    levelName: getLevelName(1),
    nextLevelXp: LEVELS.length > 1 ? LEVELS[1].xp : 100,
    progress: 0,
    stats: {
      totalNewAirports: 0,
      totalRepeatCheckins: 0,
      activeDays: 0,
      lastActiveDate: '',
      airportCount: 0,
      totalRewardedAds: 0
    }
  };
}

function loadState() {
  try {
    var stored = wx.getStorageSync(STORAGE_KEY);
    if (stored && typeof stored === 'object') {
      if (!stored.stats) {
        stored.stats = getDefaultState().stats;
      }
      return stored;
    }
  } catch (error) {
    console.warn('读取飞行员等级状态失败:', error);
  }
  return getDefaultState();
}

function saveState(state) {
  try {
    wx.setStorageSync(STORAGE_KEY, state);
  } catch (error) {
    console.error('保存飞行员等级状态失败:', error);
  }
}

function getLevelConfigForXp(totalXp) {
  var result = LEVELS[0];
  for (var i = 0; i < LEVELS.length; i++) {
    if (totalXp >= LEVELS[i].xp) {
      result = LEVELS[i];
    } else {
      break;
    }
  }
  return result;
}

function getNextLevelConfig(currentLevel) {
  for (var i = 0; i < LEVELS.length; i++) {
    if (LEVELS[i].level === currentLevel && i < LEVELS.length - 1) {
      return LEVELS[i + 1];
    }
  }
  return null;
}

function applyLevel(state) {
  var config = getLevelConfigForXp(state.totalXp);
  state.level = config.level;
  state.levelName = config.name;
  var next = getNextLevelConfig(state.level);
  state.nextLevelXp = next ? next.xp : state.totalXp;
  return state;
}

function addXpInternal(state, amount) {
  if (typeof amount !== 'number' || amount <= 0) {
    return state;
  }
  state.totalXp += amount;
  if (state.totalXp < 0) {
    state.totalXp = 0;
  }
  applyLevel(state);
  saveState(state);
  return state;
}

function recordNewAirportCheckin(airportCount) {
  var state = loadState();
  state.stats.totalNewAirports += 1;
  if (typeof airportCount === 'number' && airportCount >= 0) {
    state.stats.airportCount = airportCount;
  }
  return addXpInternal(state, NEW_AIRPORT_XP);
}

function recordRepeatAirportVisit() {
  var state = loadState();
  state.stats.totalRepeatCheckins += 1;
  return addXpInternal(state, REPEAT_AIRPORT_XP);
}

function recordDailyActive() {
  var state = loadState();
  var today = getTodayDate();
  if (state.stats.lastActiveDate !== today) {
    state.stats.lastActiveDate = today;
    state.stats.activeDays += 1;
    addXpInternal(state, DAILY_ACTIVE_XP);
  }
  return state;
}

function recordRewardedAdWatch() {
  var state = loadState();
  if (!state.stats) {
    state.stats = getDefaultState().stats;
  }
  if (!state.stats.totalRewardedAds) {
    state.stats.totalRewardedAds = 0;
  }
  state.stats.totalRewardedAds += 1;
  return addXpInternal(state, REWARDED_AD_XP);
}

function getDisplayState(options) {
  var state = loadState();
  if (options && typeof options.airportCount === 'number' && options.airportCount >= 0) {
    state.stats.airportCount = options.airportCount;
  }
  var baseFromStats = 0;
  if (state.stats) {
    baseFromStats += (state.stats.airportCount || 0) * NEW_AIRPORT_XP;
    baseFromStats += (state.stats.activeDays || 0) * DAILY_ACTIVE_XP;
  }
  if (state.totalXp < baseFromStats) {
    state.totalXp = baseFromStats;
  }
  applyLevel(state);
  var currentConfig = getLevelConfigForXp(state.totalXp);
  var next = getNextLevelConfig(state.level);
  var baseXp = currentConfig ? currentConfig.xp : 0;
  var nextXp = next ? next.xp : state.totalXp;
  var progress = 0;
  if (nextXp > baseXp) {
    progress = (state.totalXp - baseXp) / (nextXp - baseXp);
    if (progress < 0) {
      progress = 0;
    }
    if (progress > 1) {
      progress = 1;
    }
  } else {
    progress = 1;
  }
  state.progress = progress;
  saveState(state);
  return {
    level: state.level,
    levelName: state.levelName,
    segmentName: getSegmentName(state.level),
    totalXp: state.totalXp,
    nextLevelXp: nextXp,
    progress: state.progress,
    stats: state.stats
  };
}

module.exports = {
  recordNewAirportCheckin: recordNewAirportCheckin,
  recordRepeatAirportVisit: recordRepeatAirportVisit,
  recordDailyActive: recordDailyActive,
  recordRewardedAdWatch: recordRewardedAdWatch,
  getDisplayState: getDisplayState
};
