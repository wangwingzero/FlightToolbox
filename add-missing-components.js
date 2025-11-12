const fs = require('fs');
const path = require('path');

// 读取 checkitems.js
const checkitemsPath = './miniprogram/packageWalkaround/data/a330/checkitems.js';
const checkitems = require(checkitemsPath);

// 读取 components.js
const componentsPath = './miniprogram/packageWalkaround/data/a330/components.js';
const components = require(componentsPath);

// 读取原始中文文档
const mdPath = './图片/外部绕机检查-中文版.md';
const mdContent = fs.readFileSync(mdPath, 'utf-8');

// 建立 componentId 到中文名称的映射（从 checkitems.js 推断）
const componentMapping = {
  // 区域5 - 下中部机身
  'ground_hydraulic_connection': { zh: '地面液压接头', en: 'Ground Hydraulic Connection', category: 'hydraulic' },
  'lg_ground_opening_handle_access': { zh: '起落架地面打开手柄口盖', en: 'Landing Gear Ground Opening Handle Access', category: 'landing_gear' },

  // 区域6 - 右机翼中部
  'magnetic_fuel_level': { zh: '磁性油面', en: 'Magnetic Fuel Level', category: 'fuel' },
  'fuel_water_drain_valve': { zh: '燃油放水活门', en: 'Fuel Water Drain Valve', category: 'fuel' },
  'landing_light': { zh: '着陆灯', en: 'Landing Light', category: 'light' },
  'slat': { zh: '缝翼', en: 'Slat', category: 'wing' },

  // 区域7 - 发动机
  'thrust_reverser_pivot_door': { zh: '反推折流门', en: 'Thrust Reverser Pivot Door', category: 'engine' },
  'door_position_sensor_access': { zh: '舱门位置传感器锁带口盖', en: 'Door Position Sensor Access', category: 'engine' },
  'door_pivot_position_sensor_access': { zh: '折流门及位置传感器盖板', en: 'Door Pivot Position Sensor Access', category: 'engine' },
  'idg_oil_fill_access': { zh: 'IDG滑油加注盖板', en: 'IDG Oil Fill Access', category: 'engine' },
  'pressure_relief_access': { zh: '释压和起动活门盖板', en: 'Pressure Relief Access', category: 'engine' },
  'drain_mast_eng': { zh: '排放孔', en: 'Drain Mast', category: 'engine' },
  'thrust_reverser_cowl_door_eng': { zh: '反推折流门', en: 'Thrust Reverser Cowl Door', category: 'engine' },
  'fan_cowl_door_eng': { zh: '风扇罩门', en: 'Fan Cowl Door', category: 'engine' },
  'engine_inlet_eng': { zh: '发动机进口和风扇叶片', en: 'Engine Inlet and Fan Blades', category: 'engine' },
  'engine_oil_filler_access_eng': { zh: '发动机滑油勤务面板', en: 'Engine Oil Filler Access', category: 'engine' },
  'master_chip_detector': { zh: '主磁堵和液压壳体回油滤盖板', en: 'Master Chip Detector Access', category: 'engine' },
  'turbine_exhaust_eng': { zh: '涡轮排气口', en: 'Turbine Exhaust', category: 'engine' },

  // 区域8/9/20 - 机翼前缘
  'refuel_coupling_door': { zh: '加油口盖', en: 'Refuel Coupling Door', category: 'fuel' },
  'fuel_vent_overpressure_disc': { zh: '燃油通气超压指示片', en: 'Fuel Vent Overpressure Disc', category: 'fuel' },
  'wing_fence': { zh: '翼刀', en: 'Wing Fence', category: 'wing' },
  'surge_tank_air_inlet': { zh: '通气油箱进气口', en: 'Surge Tank Air Inlet', category: 'fuel' },

  // 区域10/19 - 翼尖
  'navigation_light': { zh: '航行灯', en: 'Navigation Light', category: 'light' },
  'strobe_light': { zh: '频闪灯', en: 'Strobe Light', category: 'light' },

  // 区域11/18 - 机翼后缘
  'static_dischargers': { zh: '静电放电刷', en: 'Static Dischargers', category: 'structure' },
  'control_surfaces': { zh: '操纵面', en: 'Control Surfaces', category: 'wing' },
  'flaps': { zh: '襟翼和整流罩', en: 'Flaps', category: 'wing' },
  'jettison_outlet': { zh: '放油口', en: 'Jettison Outlet', category: 'fuel' },

  // 区域12/17 - 主起落架
  'chocks': { zh: '轮挡', en: 'Chocks', category: 'landing_gear' },
  'main_wheels': { zh: '轮毂和轮胎', en: 'Main Wheels', category: 'landing_gear' },
  'brakes': { zh: '刹车和刹车磨损指示器', en: 'Brakes and Wear Indicators', category: 'landing_gear' },
  'hydraulic_lines': { zh: '液压管路', en: 'Hydraulic Lines', category: 'hydraulic' },
  'landing_gear_structure': { zh: '起落架结构', en: 'Landing Gear Structure', category: 'landing_gear' },
  'downlock_springs': { zh: '下锁弹簧', en: 'Downlock Springs', category: 'landing_gear' },
  'safety_pin': { zh: '安全销', en: 'Safety Pin', category: 'landing_gear' }
};

// 获取已存在的 componentId
const existingIds = new Set(components.components.map(c => c.id));

// 生成缺失的部件定义
const missingComponents = [];
Object.keys(componentMapping).forEach(id => {
  if (!existingIds.has(id)) {
    const comp = componentMapping[id];
    missingComponents.push({
      id: id,
      name_zh: comp.zh,
      name_en: comp.en,
      category: comp.category,
      function_zh: `${comp.zh}部件`,
      function_en: `${comp.en} component`
    });
  }
});

console.log(`\n找到 ${missingComponents.length} 个缺失的部件定义\n`);

// 生成要添加的代码
console.log('// ===== 以下是缺失的部件定义，请添加到 components.js 的 components 数组末尾 =====\n');
missingComponents.forEach((comp, index) => {
  console.log(`    {
      id: '${comp.id}',
      name_zh: '${comp.name_zh}',
      name_en: '${comp.name_en}',
      category: '${comp.category}',
      function_zh: '${comp.function_zh}',
      function_en: '${comp.function_en}'
    }${index < missingComponents.length - 1 ? ',' : ''}`);
});

console.log('\n// ===== 添加完成 =====\n');
