module.exports = {
  schemaVersion: '1.0.0',
  components: [
    {
      id: 'outflow_valve',
      name_zh: '外流活门',
      name_en: 'Outflow Valve',
      category: 'pressurization',
      function_zh: '调节座舱压力，控制外流量',
      function_en: 'Controls cabin pressure relief'
    },
    {
      id: 'static_ports',
      name_zh: '静压孔',
      name_en: 'Static Ports',
      category: 'sensor',
      function_zh: '测量外部静压供航电系统使用',
      function_en: 'Measure static pressure for avionics'
    },
    {
      id: 'aoa_probe',
      name_zh: 'AOA(迎角)探头',
      name_en: 'Angle-of-Attack Probe',
      category: 'sensor',
      function_zh: '感知飞机气流迎角',
      function_en: 'Measures angle of attack'
    },
    {
      id: 'wing_scan_lights',
      name_zh: '机翼和发动机扫视灯',
      name_en: 'Wing Scan Light',
      category: 'light',
      function_zh: '夜间照明机翼与发动机区域',
      function_en: 'Illuminates wing and engine at night'
    },
    {
      id: 'oxygen_discharge_indicator',
      name_zh: '旅客氧气瓶过压释放指示器',
      name_en: 'Oxygen Discharge Indicator',
      category: 'safety',
      function_zh: '显示氧气瓶过压释放状态',
      function_en: 'Shows oxygen cylinder over-pressure status'
    },
    {
      id: 'pitot_probes',
      name_zh: '皮托管探头',
      name_en: 'Pitot Probes',
      category: 'sensor',
      function_zh: '测量动压用于空速指示',
      function_en: 'Measure dynamic pressure for airspeed'
    },
    {
      id: 'tat_probes',
      name_zh: 'TAT(总温)探头',
      name_en: 'Total Air Temperature Probe',
      category: 'sensor',
      function_zh: '测量外部空气总温',
      function_en: 'Measures total air temperature'
    },
    {
      id: 'radome',
      name_zh: '雷达罩和插锁',
      name_en: 'Radome',
      category: 'structure',
      function_zh: '保护机载气象雷达',
      function_en: 'Protects weather radar'
    },
    {
      id: 'avionics_compartment_door',
      name_zh: '电子舱门',
      name_en: 'Avionics Compartment Door',
      category: 'structure',
      function_zh: '航电舱维护入口',
      function_en: 'Access to avionics compartment'
    },
    {
      id: 'ice_detector_probe',
      name_zh: '结冰探头',
      name_en: 'Ice Detector Probe',
      category: 'sensor',
      function_zh: '检测机体结冰情况',
      function_en: 'Detects ice accretion'
    },
    {
      id: 'crew_oxygen_discharge_indicator',
      name_zh: '机组氧气瓶过压释放指示器',
      name_en: 'Crew Oxygen Discharge Indicator',
      category: 'safety',
      function_zh: '显示机组氧瓶过压释放状态',
      function_en: 'Indicates crew oxygen cylinder discharge'
    },
    {
      id: 'nose_wheel_chocks',
      name_zh: '前轮轮挡',
      name_en: 'Nose Wheel Chocks',
      category: 'ground_support',
      function_zh: '停场固定飞机防止移动',
      function_en: 'Prevents aircraft movement on ground'
    },
    {
      id: 'nose_wheels',
      name_zh: '轮毂和轮胎',
      name_en: 'Nose Wheels and Tires',
      category: 'landing_gear',
      function_zh: '支撑和转向飞机机头',
      function_en: 'Provide nose support and steering'
    },
    {
      id: 'nose_lg_structure',
      name_zh: '前起落架结构',
      name_en: 'Nose Landing Gear Structure',
      category: 'landing_gear',
      function_zh: '承受机头载荷',
      function_en: 'Supports nose loads'
    },
    {
      id: 'taxi_toff_light',
      name_zh: '滑行，起飞和跑道转弯灯',
      name_en: 'Taxi/Takeoff Light',
      category: 'light',
      function_zh: '提供滑行、起飞及跑道转弯照明',
      function_en: 'Provides taxi and takeoff lighting'
    },
    {
      id: 'hydraulic_lines_nose',
      name_zh: '液压管路和电路线',
      name_en: 'Nose Gear Hydraulic Lines',
      category: 'hydraulic',
      function_zh: '为前起落架提供液压作动',
      function_en: 'Hydraulic supply for nose gear'
    },
    {
      id: 'wheel_well_nose',
      name_zh: '轮舱',
      name_en: 'Nose Wheel Well',
      category: 'structure',
      function_zh: '提供前轮收纳空间',
      function_en: 'Houses nose landing gear'
    },
    {
      id: 'safety_pin_nose',
      name_zh: '安全销',
      name_en: 'Nose Gear Safety Pin',
      category: 'safety',
      function_zh: '防止地面收起起落架',
      function_en: 'Prevents gear retraction on ground'
    },
    {
      id: 'ground_power_door',
      name_zh: '地面电源盖板(如果不需要)',
      name_en: 'Ground Electrical Power Door',
      category: 'structure',
      function_zh: '连接外部电源接口',
      function_en: 'Access for external electrical power'
    },
    {
      id: 'avionic_vent_overboard_valve',
      name_zh: '电子舱机外排气活门',
      name_en: 'Avionic Vent Overboard Valve',
      category: 'air_conditioning',
      function_zh: '航电冷却排气',
      function_en: 'Ventilation exhaust for avionics'
    },
    {
      id: 'aoa_probes_rh',
      name_zh: 'AOA(迎角)探头',
      name_en: 'RH AOA Probes',
      category: 'sensor',
      function_zh: '检测右侧迎角',
      function_en: 'Measures angle of attack (RH)'
    },
    {
      id: 'pax_oxygen_discharge_indicator',
      name_zh: '旅客氧气瓶过压释放指示器',
      name_en: 'Passenger Oxygen Discharge Indicator',
      category: 'safety',
      function_zh: '显示旅客氧瓶是否释放',
      function_en: 'Indicates passenger oxygen discharge'
    },
    {
      id: 'cargo_loading_access_door',
      name_zh: '货物装载操作盖板门',
      name_en: 'Cargo Loading Operation Access Door',
      category: 'structure',
      function_zh: '货舱操作面板入口',
      function_en: 'Access for cargo loading controls'
    },
    {
      id: 'cargo_door_access',
      name_zh: '货舱门操作盖板门',
      name_en: 'Cargo Door Operation Access Door',
      category: 'structure',
      function_zh: '货舱门控制面板入口',
      function_en: 'Access for cargo door controls'
    },
    {
      id: 'cargo_door',
      name_zh: '货舱门',
      name_en: 'Cargo Door',
      category: 'structure',
      function_zh: '主货舱门，非使用时保持关闭',
      function_en: 'Cargo compartment door'
    },
    {
      id: 'static_ports_rh',
      name_zh: '静压孔',
      name_en: 'RH Static Ports',
      category: 'sensor',
      function_zh: '测量右侧静压',
      function_en: 'Measure static pressure (RH)'
    },
    {
      id: 'antennas',
      name_zh: '天线',
      name_en: 'Antennas',
      category: 'antenna',
      function_zh: '通信、导航及监视天线（含GPS/VHF/ATC/DME/TCAS/VOR/LOC/ADF/HF/ELT/SATCOM等）',
      function_en: 'Communication, navigation and surveillance antennas'
    },
    {
      id: 'drain_mast',
      name_zh: '排放孔',
      name_en: 'Drain Mast',
      category: 'drain',
      function_zh: '排放冷凝水及废液',
      function_en: 'Drains fluids from systems'
    },
    {
      id: 'ram_air_inlet',
      name_zh: '应急冲压空气进口风门',
      name_en: 'Emergency Ram Air Inlet',
      category: 'air_conditioning',
      function_zh: '提供应急通风气源',
      function_en: 'Provides emergency ventilation air'
    },
    {
      id: 'pack_air_intake',
      name_zh: '空调组件空气进出口',
      name_en: 'Pack Air Intakes/Outlets',
      category: 'air_conditioning',
      function_zh: '空调组件进排气',
      function_en: 'Air conditioning pack airflow'
    },
    {
      id: 'anti_collision_light',
      name_zh: '信标灯',
      name_en: 'Anti-Collision Light',
      category: 'light',
      function_zh: '防撞警示灯',
      function_en: 'Anti-collision beacon'
    },
    {
      id: 'hp_ground_connection_door',
      name_zh: 'HP(高压)地面连接门',
      name_en: 'HP Ground Connection Door',
      category: 'ground_support',
      function_zh: '高压空气/液压地面接口',
      function_en: 'High-pressure ground connection'
    },
    {
      id: 'lp_ground_connection_door',
      name_zh: 'LP(低压)地面连接门',
      name_en: 'LP Ground Connection Door',
      category: 'ground_support',
      function_zh: '低压地面接口',
      function_en: 'Low-pressure ground connection'
    },
    {
      id: 'ground_hydraulic_connection_blue',
      name_zh: '蓝系统地面液压接头',
      name_en: 'Ground Hydraulic Connection (Blue)',
      category: 'hydraulic',
      function_zh: '地面液压充注/排放',
      function_en: 'Ground servicing hydraulic blue'
    },
    {
      id: 'ground_hydraulic_connection_yellow',
      name_zh: '黄系统地面液压接头',
      name_en: 'Ground Hydraulic Connection (Yellow)',
      category: 'hydraulic',
      function_zh: '地面液压充注/排放',
      function_en: 'Ground servicing hydraulic yellow'
    },
    {
      id: 'lg_ground_opening_handle_access_lh',
      name_zh: '左起落架地面打开手柄口盖',
      name_en: 'LH L/G Ground Opening Handle Access',
      category: 'landing_gear',
      function_zh: '地面打开起落架门',
      function_en: 'Access to ground opening handle (LH)'
    },
    {
      id: 'lg_ground_opening_handle_access_rh',
      name_zh: '右起落架地面打开手柄口盖',
      name_en: 'RH L/G Ground Opening Handle Access',
      category: 'landing_gear',
      function_zh: '地面打开起落架门',
      function_en: 'Access to ground opening handle (RH)'
    },
    {
      id: 'tank_magnetic_fuel_level_rh',
      name_zh: '内侧油箱磁燃油油面',
      name_en: 'RH Tank Magnetic Fuel Level Indicator',
      category: 'fuel',
      function_zh: '显示右翼油箱燃油量',
      function_en: 'Indicates right wing tank fuel level'
    },
    {
      id: 'fuel_water_drain_valve_rh',
      name_zh: '燃油放水活门(内侧油箱)',
      name_en: 'RH Fuel Water Drain Valve',
      category: 'fuel',
      function_zh: '排除燃油中的水分',
      function_en: 'Drains water from right wing tank'
    },
    {
      id: 'water_drain_valve_door_rh',
      name_zh: '排水活门盖板',
      name_en: 'RH Water Drain Valve Door',
      category: 'fuel',
      function_zh: '保护排水阀组件',
      function_en: 'Protects water drain valve'
    },
    {
      id: 'landing_light_rh',
      name_zh: '着陆灯',
      name_en: 'RH Landing Light',
      category: 'light',
      function_zh: '提供起降照明',
      function_en: 'Provides landing illumination'
    },
    {
      id: 'slat1_rh',
      name_zh: '第1块缝翼',
      name_en: 'RH Slat 1',
      category: 'wing',
      function_zh: '增加低速升力',
      function_en: 'Improves lift at low speed'
    },
    {
      id: 'thrust_reverser_pivot_door_eng2',
      name_zh: '反推折流门',
      name_en: 'ENG2 Thrust Reverser Pivot Door',
      category: 'engine',
      function_zh: '反推装置结构部件',
      function_en: 'Component of thrust reverser'
    },
    {
      id: 'door_position_sensor_access_eng2',
      name_zh: '舱门位置传感器锁带口盖',
      name_en: 'ENG2 Door Position Sensor Access',
      category: 'engine',
      function_zh: '检修传感器布线',
      function_en: 'Access to door position sensors'
    },
    {
      id: 'door_pivot_position_sensor_access_eng2',
      name_zh: '折流门及位置传感器盖板',
      name_en: 'ENG2 Door Pivot and Position Sensor Access',
      category: 'engine',
      function_zh: '反推折流门枢轴及位置传感器检修口',
      function_en: 'Access to pivot door and position sensors'
    },
    {
      id: 'idg_oil_fill_access_eng2',
      name_zh: 'IDG 滑油加注盖板',
      name_en: 'ENG2 IDG Oil Fill Access',
      category: 'engine',
      function_zh: '为集成驱动发电机加注滑油',
      function_en: 'Oil servicing for IDG'
    },
    {
      id: 'pressure_relief_access_eng2',
      name_zh: '释压和起动活门/防冰活门/反推地面安全盖板',
      name_en: 'ENG2 Pressure Relief/Anti-ice Access',
      category: 'engine',
      function_zh: '检查压力释放及防冰阀',
      function_en: 'Access to pressure relief/anti-ice valve'
    },
    {
      id: 'drain_mast_eng2',
      name_zh: '排放孔',
      name_en: 'ENG2 Drain Mast',
      category: 'drain',
      function_zh: '排出油水混合液',
      function_en: 'Drains fluids from ENG2'
    },
    {
      id: 'thrust_reverser_cowl_door_eng2',
      name_zh: '反推折流门',
      name_en: 'ENG2 Thrust Reverser Cowl',
      category: 'engine',
      function_zh: '包覆反推装置',
      function_en: 'Cowl for thrust reverser'
    },
    {
      id: 'fan_cowl_door_eng2',
      name_zh: '风扇罩门',
      name_en: 'ENG2 Fan Cowl Door',
      category: 'engine',
      function_zh: '包覆风扇部分并提供检修口',
      function_en: 'Provides access to fan section'
    },
    {
      id: 'engine_inlet_eng2',
      name_zh: '发动机进口和风扇叶片',
      name_en: 'ENG2 Engine Inlet',
      category: 'engine',
      function_zh: '导入空气进入发动机',
      function_en: 'Allows airflow into engine'
    },
    {
      id: 'engine_oil_filler_access_eng2',
      name_zh: '发动机滑油勤务面板',
      name_en: 'ENG2 Oil Filler Access',
      category: 'engine',
      function_zh: '发动机滑油加注',
      function_en: 'Oil servicing access (ENG2)'
    },
    {
      id: 'master_chip_detector_eng2',
      name_zh: '主磁堵和液压壳体回油滤接近盖板',
      name_en: 'ENG2 Master Chip Detector',
      category: 'engine',
      function_zh: '监控齿轮箱金属屑',
      function_en: 'Monitors metallic debris in gear box'
    },
    {
      id: 'turbine_exhaust_eng2',
      name_zh: '涡轮排气口',
      name_en: 'ENG2 Turbine Exhaust',
      category: 'engine',
      function_zh: '排出发动机废气',
      function_en: 'Exhaust for ENG2'
    },
    {
      id: 'refuel_coupling_door_rh',
      name_zh: '加油口盖',
      name_en: 'RH Refuel Coupling Door',
      category: 'fuel',
      function_zh: '翼内加油接口',
      function_en: 'Access to wing refuel coupling'
    },
    {
      id: 'magnetic_fuel_levels_rh_inner_outer',
      name_zh: '磁性油尺',
      name_en: 'RH Magnetic Fuel Level Indicators',
      category: 'fuel',
      function_zh: '目视读取燃油量',
      function_en: 'Visual indicator for fuel quantity'
    },
    {
      id: 'rat_door',
      name_zh: 'RAT(应急冲压涡轮)盖板',
      name_en: 'RAT Door',
      category: 'emergency',
      function_zh: '冲压空气涡轮舱门',
      function_en: 'Door for Ram Air Turbine'
    },
    {
      id: 'slats_2_3_4_rh',
      name_zh: '第 2，3，4 块缝翼',
      name_en: 'RH Slats 2/3/4',
      category: 'wing',
      function_zh: '提升起降性能',
      function_en: 'Improves lift at low speed'
    },
    {
      id: 'fuel_vent_overpressure_disc_rh',
      name_zh: '燃油通气超压指示片',
      name_en: 'RH Fuel Vent Overpressure Disc',
      category: 'fuel',
      function_zh: '显示油箱溢压排气',
      function_en: 'Indicates overpressure venting'
    },
    {
      id: 'wing_fence_rh',
      name_zh: '翼刀',
      name_en: 'RH Wing Fence',
      category: 'wing',
      function_zh: '改善翼面气流',
      function_en: 'Controls wing airflow'
    },
    {
      id: 'magnetic_fuel_levels_tip_rh',
      name_zh: '油量磁性油面',
      name_en: 'RH Tip Magnetic Fuel Indicator',
      category: 'fuel',
      function_zh: '显示翼尖油量',
      function_en: 'Indicates tip tank fuel'
    },
    {
      id: 'fuel_water_drain_valve_tip_rh',
      name_zh: '燃油放水活门(通风油箱)',
      name_en: 'RH Tip Fuel Water Drain Valve',
      category: 'fuel',
      function_zh: '排除翼尖燃油水分',
      function_en: 'Drains water from tip tank'
    },
    {
      id: 'surge_tank_air_inlet_rh',
      name_zh: '通气油箱进气口',
      name_en: 'RH Surge Tank Air Inlet',
      category: 'fuel',
      function_zh: '油箱平衡通气',
      function_en: 'Ventilation for surge tank'
    },
    {
      id: 'slats_5_6_7_rh',
      name_zh: '第 5，6，7 块缝翼',
      name_en: 'RH Slats 5/6/7',
      category: 'wing',
      function_zh: '增加升力',
      function_en: 'Increase lift at low speed'
    },
    {
      id: 'navigation_light_rh',
      name_zh: '航行灯',
      name_en: 'RH Navigation Light',
      category: 'light',
      function_zh: '指示左右翼位置（绿色）',
      function_en: 'Green nav light on right wing'
    },
    {
      id: 'strobe_light_rh',
      name_zh: '频闪灯',
      name_en: 'RH Strobe Light',
      category: 'light',
      function_zh: '夜间防撞闪光',
      function_en: 'Provides anti-collision strobe'
    },
    {
      id: 'antenna_top_rh',
      name_zh: '机身顶部天线',
      name_en: 'RH Upper Antennas',
      category: 'antenna',
      function_zh: '多种通信/导航天线',
      function_en: 'Various communication antennas'
    },
    {
      id: 'static_dischargers_rh',
      name_zh: '静电放电刷',
      name_en: 'RH Static Dischargers',
      category: 'electrical',
      function_zh: '释放机体静电',
      function_en: 'Dissipates static electricity'
    },
    {
      id: 'control_surfaces_rh',
      name_zh: '操纵面',
      name_en: 'RH Control Surfaces',
      category: 'wing',
      function_zh: '副翼、扰流板等',
      function_en: 'Ailerons/spoilers etc.'
    },
    {
      id: 'flaps_rh',
      name_zh: '襟翼和整流罩',
      name_en: 'RH Flaps',
      category: 'wing',
      function_zh: '起降展开增加升力',
      function_en: 'Increase lift on takeoff/landing'
    },
    {
      id: 'jettison_outlet_rh',
      name_zh: '放油口',
      name_en: 'RH Fuel Jettison Outlet',
      category: 'fuel',
      function_zh: '紧急抛油排放口',
      function_en: 'Outlet for fuel jettison'
    },
    {
      id: 'chocks_rh',
      name_zh: '轮挡',
      name_en: 'RH Wheel Chocks',
      category: 'ground_support',
      function_zh: '固定右主轮',
      function_en: 'Secure right main wheels'
    },
    {
      id: 'main_wheels_rh',
      name_zh: '轮毂和轮胎',
      name_en: 'RH Main Wheels and Tires',
      category: 'landing_gear',
      function_zh: '承载主起落架重量',
      function_en: 'Support right main landing gear'
    },
    {
      id: 'brakes_rh',
      name_zh: '刹车和刹车磨损指示器',
      name_en: 'RH Brake Units',
      category: 'landing_gear',
      function_zh: '提供制动与磨耗指示',
      function_en: 'Provides braking capability'
    },
    {
      id: 'hydraulic_lines_rh',
      name_zh: '液压管路',
      name_en: 'RH Hydraulic Lines',
      category: 'hydraulic',
      function_zh: '液压驱动起落架与刹车',
      function_en: 'Hydraulic supply for RH gear'
    },
    {
      id: 'landing_gear_structure_rh',
      name_zh: '起落架结构',
      name_en: 'RH Landing Gear Structure',
      category: 'landing_gear',
      function_zh: '承载及传递载荷',
      function_en: 'Carries structural loads'
    },
    {
      id: 'downlock_springs_rh',
      name_zh: '下锁弹簧',
      name_en: 'RH Downlock Springs',
      category: 'landing_gear',
      function_zh: '保持起落架展开锁定',
      function_en: 'Keeps gear locked down'
    },
    {
      id: 'safety_pin_rh',
      name_zh: '安全销',
      name_en: 'RH Landing Gear Safety Pin',
      category: 'safety',
      function_zh: '防止地面收轮',
      function_en: 'Prevents inadvertent retraction'
    },
    {
      id: 'refuel_electrical_control_panel',
      name_zh: '加油电控制面板',
      name_en: 'Refuel Electrical Control Panel',
      category: 'fuel',
      function_zh: '控制加油电气系统',
      function_en: 'Controls refuel electrical system'
    },
    {
      id: 'apu_fuel_drain',
      name_zh: 'APU 燃油排油管',
      name_en: 'APU Fuel Drain',
      category: 'fuel',
      function_zh: '排出 APU 系统残余燃油',
      function_en: 'Drains residual fuel from APU'
    },
    {
      id: 'ground_hydraulic_connection_green',
      name_zh: '绿系统地面液压接头和液压油箱加油口',
      name_en: 'Ground Hydraulic Connection (Green)',
      category: 'hydraulic',
      function_zh: '地面服务绿回路',
      function_en: 'Ground servicing hydraulic green'
    },
    {
      id: 'vhf2_antenna',
      name_zh: 'VHF(2) 天线',
      name_en: 'VHF(2) Antenna',
      category: 'antenna',
      function_zh: '甚高频通信2号天线',
      function_en: 'VHF communication antenna (2)'
    },
    {
      id: 'ra_antennas',
      name_zh: '无线电高度表RA天线',
      name_en: 'Radio-Altimeter (RA) Antennas',
      category: 'antenna',
      function_zh: '测量飞机离地高度（双系统冗余）',
      function_en: 'Measures aircraft height above ground (dual system)'
    },
    {
      id: 'potable_water_aft_panel',
      name_zh: '饮用水后排放面板',
      name_en: 'Potable Water Aft Drain Panel',
      category: 'utilities',
      function_zh: '饮用水系统排放',
      function_en: 'Potable water servicing panel'
    },
    {
      id: 'cargo_loading_access_aft',
      name_zh: '货物装载操作盖板门',
      name_en: 'Aft Cargo Loading Access Door',
      category: 'structure',
      function_zh: '后货舱操作入口',
      function_en: 'Access for aft cargo loading'
    },
    {
      id: 'cargo_door_access_aft',
      name_zh: '货舱门操作盖板门',
      name_en: 'Aft Cargo Door Access Door',
      category: 'structure',
      function_zh: '控制后货舱门',
      function_en: 'Access for aft cargo door controls'
    },
    {
      id: 'cargo_door_aft',
      name_zh: '货舱门',
      name_en: 'Aft Cargo Door',
      category: 'structure',
      function_zh: '后部货物装卸',
      function_en: 'Aft cargo loading door'
    },
    {
      id: 'bulk_door',
      name_zh: '散货舱门',
      name_en: 'Bulk Door',
      category: 'structure',
      function_zh: '尾部小货舱入口',
      function_en: 'Bulk cargo door'
    },
    {
      id: 'potable_water_service_panel',
      name_zh: '饮水服务面板',
      name_en: 'Potable Water Service Panel',
      category: 'utilities',
      function_zh: '饮用水补给接口',
      function_en: 'Service potable water system'
    },
    {
      id: 'waste_service_panel',
      name_zh: '污水勤务面板',
      name_en: 'Waste Service Panel',
      category: 'utilities',
      function_zh: '厕所废液排放',
      function_en: 'Waste system servicing'
    },
    {
      id: 'stabilizer',
      name_zh: '水平安定面',
      name_en: 'Horizontal Stabilizer',
      category: 'tail',
      function_zh: '保持纵向稳定',
      function_en: 'Provides longitudinal stability'
    },
    {
      id: 'elevator',
      name_zh: '升降舵',
      name_en: 'Elevator',
      category: 'tail',
      function_zh: '控制俯仰',
      function_en: 'Controls pitch'
    },
    {
      id: 'fin',
      name_zh: '垂直尾翼',
      name_en: 'Vertical Fin',
      category: 'tail',
      function_zh: '提供方向稳定',
      function_en: 'Provides directional stability'
    },
    {
      id: 'rudder',
      name_zh: '方向舵',
      name_en: 'Rudder',
      category: 'tail',
      function_zh: '控制偏航',
      function_en: 'Controls yaw'
    },
    {
      id: 'surge_tank_air_inlet_tail',
      name_zh: '通气油箱进气口',
      name_en: 'Tail Surge Tank Air Inlet',
      category: 'fuel',
      function_zh: '尾部油箱通气',
      function_en: 'Vent for tail surge tank'
    },
    {
      id: 'fuel_water_drain_valves_tail',
      name_zh: '燃油放水活门',
      name_en: 'Tail Fuel Water Drain Valves',
      category: 'fuel',
      function_zh: '排出尾部油箱水分',
      function_en: 'Drain water from tail tank'
    },
    {
      id: 'static_dischargers_tail',
      name_zh: '静电放电刷',
      name_en: 'Tail Static Dischargers',
      category: 'electrical',
      function_zh: '释放尾部静电',
      function_en: 'Dissipates static electricity'
    },
    {
      id: 'tail_lower_structure',
      name_zh: '机身下部结构(机尾擦跑道)',
      name_en: 'Lower Tail Structure',
      category: 'structure',
      function_zh: '检查尾部接地擦伤',
      function_en: 'Inspect for tail strike damage'
    },
    {
      id: 'flight_recorder_access_door',
      name_zh: '飞行记录器盖板门',
      name_en: 'Flight Recorder Access Door',
      category: 'structure',
      function_zh: '记录器维护入口',
      function_en: 'Access to flight recorder'
    },
    {
      id: 'fuel_vent_overpressure_disc_tail',
      name_zh: '燃油通气超压指示片',
      name_en: 'Tail Fuel Vent Overpressure Disc',
      category: 'fuel',
      function_zh: '指示配平油箱溢压',
      function_en: 'Indicates tail tank venting'
    },
    {
      id: 'apu_access_door',
      name_zh: 'APU盖板门',
      name_en: 'APU Access Door',
      category: 'apu',
      function_zh: 'APU 检修入口',
      function_en: 'Access to APU compartment'
    },
    {
      id: 'apu_air_intake',
      name_zh: 'APU 进气口',
      name_en: 'APU Air Intake',
      category: 'apu',
      function_zh: 'APU 吸气入口',
      function_en: 'Air inlet for APU'
    },
    {
      id: 'apu_exhaust',
      name_zh: 'APU 排气口',
      name_en: 'APU Exhaust',
      category: 'apu',
      function_zh: '排出 APU 废气',
      function_en: 'Exhaust outlet for APU'
    },
    {
      id: 'apu_navigation_light',
      name_zh: '航行灯',
      name_en: 'Tail Navigation Light',
      category: 'light',
      function_zh: '尾部白色导航灯',
      function_en: 'Rear navigation light'
    },
    {
      id: 'apu_fire_ext_overpressure_indicator',
      name_zh: 'APU 灭火瓶超压指示(红片)',
      name_en: 'APU Fire Extinguisher Overpressure Indicator',
      category: 'safety',
      function_zh: '显示灭火瓶是否释放',
      function_en: 'Indicates fire bottle discharge'
    },
    {
      id: 'outflow_valve_aft',
      name_zh: '外流活门',
      name_en: 'Aft Outflow Valve',
      category: 'pressurization',
      function_zh: '辅助调节客舱压力',
      function_en: 'Assists cabin pressure control'
    },
    {
      id: 'chocks_lh',
      name_zh: '轮挡',
      name_en: 'LH Wheel Chocks',
      category: 'ground_support',
      function_zh: '固定左主轮',
      function_en: 'Secure left main wheels'
    },
    {
      id: 'main_wheels_lh',
      name_zh: '轮毂和轮胎',
      name_en: 'LH Main Wheels and Tires',
      category: 'landing_gear',
      function_zh: '承载左主起落架',
      function_en: 'Support left main landing gear'
    },
    {
      id: 'brakes_lh',
      name_zh: '刹车和刹车磨损指示器',
      name_en: 'LH Brake Units',
      category: 'landing_gear',
      function_zh: '提供刹车能力',
      function_en: 'Provides braking on LH gear'
    },
    {
      id: 'hydraulic_lines_lh',
      name_zh: '液压管路',
      name_en: 'LH Hydraulic Lines',
      category: 'hydraulic',
      function_zh: '驱动左主起落架与刹车',
      function_en: 'Hydraulic supply for LH gear'
    },
    {
      id: 'landing_gear_structure_lh',
      name_zh: '起落架结构',
      name_en: 'LH Landing Gear Structure',
      category: 'landing_gear',
      function_zh: '承载结构与支撑',
      function_en: 'Carries loads on LH gear'
    },
    {
      id: 'downlock_springs_lh',
      name_zh: '下锁弹簧',
      name_en: 'LH Downlock Springs',
      category: 'landing_gear',
      function_zh: '保持锁定状态',
      function_en: 'Keeps LH gear locked down'
    },
    {
      id: 'safety_pin_lh',
      name_zh: '安全销',
      name_en: 'LH Landing Gear Safety Pin',
      category: 'safety',
      function_zh: '防止地面收轮',
      function_en: 'Prevents LH gear retraction on ground'
    },
    {
      id: 'jettison_outlet_lh',
      name_zh: '放油口',
      name_en: 'LH Fuel Jettison Outlet',
      category: 'fuel',
      function_zh: '紧急抛油排出口',
      function_en: 'Outlet for fuel jettison (LH)'
    },
    {
      id: 'flaps_lh',
      name_zh: '襟翼和整流罩',
      name_en: 'LH Flaps',
      category: 'wing',
      function_zh: '提供附加升力',
      function_en: 'Provide additional lift (LH)'
    },
    {
      id: 'control_surfaces_lh',
      name_zh: '操纵面',
      name_en: 'LH Control Surfaces',
      category: 'wing',
      function_zh: '副翼、扰流板等',
      function_en: 'LH ailerons/spoilers'
    },
    {
      id: 'static_dischargers_lh',
      name_zh: '静电放电刷',
      name_en: 'LH Static Dischargers',
      category: 'electrical',
      function_zh: '释放静电荷',
      function_en: 'Dissipates static electricity'
    },
    {
      id: 'antenna_top_lh',
      name_zh: '机身顶部天线',
      name_en: 'LH Upper Antennas',
      category: 'antenna',
      function_zh: '通信导航天线',
      function_en: 'Communication antennas (LH)'
    },
    {
      id: 'navigation_light_lh',
      name_zh: '航行灯',
      name_en: 'LH Navigation Light',
      category: 'light',
      function_zh: '指示翼尖位置（红色）',
      function_en: 'Red nav light on left wing'
    },
    {
      id: 'strobe_light_lh',
      name_zh: '频闪灯',
      name_en: 'LH Strobe Light',
      category: 'light',
      function_zh: '闪烁防撞',
      function_en: 'Anti-collision strobe (LH)'
    },
    {
      id: 'slats_7_6_5_lh',
      name_zh: '第 7，6，5 块缝翼',
      name_en: 'LH Slats 7/6/5',
      category: 'wing',
      function_zh: '增加升力',
      function_en: 'Improves lift (LH outer slats)'
    },
    {
      id: 'surge_tank_air_inlet_lh',
      name_zh: '通气油箱进气口',
      name_en: 'LH Surge Tank Air Inlet',
      category: 'fuel',
      function_zh: '油箱通气',
      function_en: 'Ventilation for LH surge tank'
    },
    {
      id: 'fuel_water_drain_valve_tip_lh',
      name_zh: '燃油放水活门(通风油箱)',
      name_en: 'LH Tip Fuel Water Drain Valve',
      category: 'fuel',
      function_zh: '排除翼尖水分',
      function_en: 'Drain water from LH tip'
    },
    {
      id: 'magnetic_fuel_levels_tip_lh',
      name_zh: '磁性油尺',
      name_en: 'LH Tip Magnetic Fuel Indicator',
      category: 'fuel',
      function_zh: '读取翼尖燃油量',
      function_en: 'Indicates fuel at LH tip'
    },
    {
      id: 'wing_fence_lh',
      name_zh: '翼刀',
      name_en: 'LH Wing Fence',
      category: 'wing',
      function_zh: '控制翼面气流',
      function_en: 'Controls airflow (LH)'
    },
    {
      id: 'fuel_vent_overpressure_disc_lh',
      name_zh: '燃油通气超压指示片',
      name_en: 'LH Fuel Vent Overpressure Disc',
      category: 'fuel',
      function_zh: '显示燃油溢压排气',
      function_en: 'Indicates fuel venting (LH)'
    },
    {
      id: 'magnetic_fuel_levels_lh_inner_outer',
      name_zh: '磁性油尺',
      name_en: 'LH Magnetic Fuel Level Indicators',
      category: 'fuel',
      function_zh: '读取左翼油箱油量',
      function_en: 'Shows fuel quantity LH wing'
    },
    {
      id: 'fuel_water_drain_valve_lh',
      name_zh: '燃油放水活门(外侧油箱)',
      name_en: 'LH Fuel Water Drain Valve',
      category: 'fuel',
      function_zh: '排除燃油水分',
      function_en: 'Drains water from LH tank'
    },
    {
      id: 'slats_4_3_2_lh',
      name_zh: '第 4，3，2 块缝翼',
      name_en: 'LH Slats 4/3/2',
      category: 'wing',
      function_zh: '提高低速升力',
      function_en: 'Improves lift (LH inner slats)'
    },
    {
      id: 'refuel_coupling_door_lh',
      name_zh: '加油口盖',
      name_en: 'LH Refuel Coupling Door',
      category: 'fuel',
      function_zh: '翼内加油接口',
      function_en: 'Access to LH wing refuel coupling'
    },
    {
      id: 'thrust_reverser_pivot_door_eng1',
      name_zh: '反推折流门',
      name_en: 'ENG1 Thrust Reverser Pivot Door',
      category: 'engine',
      function_zh: '反推装置结构部件',
      function_en: 'Part of thrust reverser assembly'
    },
    {
      id: 'door_position_sensor_access_eng1',
      name_zh: '舱门位置传感器锁带口盖',
      name_en: 'ENG1 Door Position Sensor Access',
      category: 'engine',
      function_zh: '检修传感器布线',
      function_en: 'Access to door position sensors'
    },
    {
      id: 'door_pivot_position_sensor_access_eng1',
      name_zh: '折流门及位置传感器盖板',
      name_en: 'ENG1 Door Pivot and Position Sensor Access',
      category: 'engine',
      function_zh: '反推折流门枢轴及位置传感器检修口',
      function_en: 'Access to pivot door and position sensors'
    },
    {
      id: 'idg_oil_fill_access_eng1',
      name_zh: 'IDG 滑油加注盖板',
      name_en: 'ENG1 IDG Oil Fill Access',
      category: 'engine',
      function_zh: '为集成驱动发电机加注滑油',
      function_en: 'Oil servicing for ENG1 IDG'
    },
    {
      id: 'pressure_relief_access_eng1',
      name_zh: '释压和起动活门/防冰活门/反推地面安全盖板',
      name_en: 'ENG1 Pressure Relief/Anti-ice Access',
      category: 'engine',
      function_zh: '检查压力释放及防冰阀',
      function_en: 'Access to pressure relief/anti-ice valve'
    },
    {
      id: 'drain_mast_eng1',
      name_zh: '排放口',
      name_en: 'ENG1 Drain Mast',
      category: 'drain',
      function_zh: '排出油水混合液',
      function_en: 'Drains fluids from ENG1'
    },
    {
      id: 'thrust_reverser_cowl_door_eng1',
      name_zh: '反推折流门',
      name_en: 'ENG1 Thrust Reverser Cowl',
      category: 'engine',
      function_zh: '包覆反推装置',
      function_en: 'Cowl for thrust reverser (ENG1)'
    },
    {
      id: 'fan_cowl_door_eng1',
      name_zh: '风扇罩门',
      name_en: 'ENG1 Fan Cowl Door',
      category: 'engine',
      function_zh: '包覆风扇部分并提供检修口',
      function_en: 'Provides access to fan section (ENG1)'
    },
    {
      id: 'engine_inlet_eng1',
      name_zh: '发动机进口和风扇叶片',
      name_en: 'ENG1 Engine Inlet',
      category: 'engine',
      function_zh: '导入空气进入发动机',
      function_en: 'Allows airflow into engine (ENG1)'
    },
    {
      id: 'engine_oil_filler_access_eng1',
      name_zh: '发动机滑油勤务面板',
      name_en: 'ENG1 Oil Filler Access',
      category: 'engine',
      function_zh: '发动机滑油加注',
      function_en: 'Oil servicing access (ENG1)'
    },
    {
      id: 'master_chip_detector_eng1',
      name_zh: '主磁堵和液压壳体回油滤接近盖板',
      name_en: 'ENG1 Master Chip Detector',
      category: 'engine',
      function_zh: '监控齿轮箱金属屑',
      function_en: 'Monitors metallic debris (ENG1)'
    },
    {
      id: 'turbine_exhaust_eng1',
      name_zh: '涡轮排气口',
      name_en: 'ENG1 Turbine Exhaust',
      category: 'engine',
      function_zh: '排出发动机废气',
      function_en: 'Exhaust for ENG1'
    },
    {
      id: 'tank_magnetic_fuel_level_lh',
      name_zh: '中央油箱磁性油尺',
      name_en: 'LH Tank Magnetic Fuel Level Indicator',
      category: 'fuel',
      function_zh: '显示左翼油箱燃油量',
      function_en: 'Indicates left wing tank fuel level'
    },
    {
      id: 'water_drain_valve_panel_lh',
      name_zh: '排水活门盖板',
      name_en: 'LH Water Drain Valve Panel',
      category: 'fuel',
      function_zh: '覆盖左翼排水阀',
      function_en: 'Protects LH drain valve'
    },
    {
      id: 'landing_light_lh',
      name_zh: '左翼着陆灯',
      name_en: 'LH Landing Light',
      category: 'light',
      function_zh: '提供起降照明',
      function_en: 'Provides landing illumination (LH)'
    },
    {
      id: 'slat1_lh',
      name_zh: '第 1 块缝翼',
      name_en: 'LH Slat 1',
      category: 'wing',
      function_zh: '增加低速升力',
      function_en: 'Improves lift (LH slat 1)'
    },
    {
      id: 'logo_light',
      name_zh: '标志灯',
      name_en: 'Logo Light',
      category: 'light',
      function_zh: '夜间照亮垂直尾翼上的航空公司标志 (OPTION)',
      function_en: 'Illuminates airline logo on vertical fin at night (OPTION)'
    },
    {
      id: 'engine_scan_light_rh',
      name_zh: '右发动机扫描灯',
      name_en: 'RH Engine Scan Light',
      category: 'light',
      function_zh: '夜间照亮右发动机进气道和风扇叶片 (OPTION)',
      function_en: 'Illuminates RH engine inlet and fan blades at night (OPTION)'
    },
    {
      id: 'engine_scan_light_lh',
      name_zh: '左发动机扫描灯',
      name_en: 'LH Engine Scan Light',
      category: 'light',
      function_zh: '夜间照亮左发动机进气道和风扇叶片 (OPTION)',
      function_en: 'Illuminates LH engine inlet and fan blades at night (OPTION)'
    },
    {
      id: 'ground_hydraulic_connection',
      name_zh: '地面液压接头',
      name_en: 'Ground Hydraulic Connection',
      category: 'hydraulic',
      function_zh: '地面液压系统连接接头',
      function_en: 'Ground hydraulic system connection'
    },
    {
      id: 'lg_ground_opening_handle_access',
      name_zh: '起落架地面打开手柄口盖',
      name_en: 'Landing Gear Ground Opening Handle Access',
      category: 'landing_gear',
      function_zh: '起落架地面打开手柄接近盖板',
      function_en: 'Access panel for landing gear ground opening handle'
    },
    {
      id: 'magnetic_fuel_level',
      name_zh: '磁性油面',
      name_en: 'Magnetic Fuel Level',
      category: 'fuel',
      function_zh: '显示油箱燃油液位',
      function_en: 'Indicates fuel level in tank'
    },
    {
      id: 'fuel_water_drain_valve',
      name_zh: '燃油放水活门',
      name_en: 'Fuel Water Drain Valve',
      category: 'fuel',
      function_zh: '排放油箱底部积水和燃油',
      function_en: 'Drains water and fuel from tank bottom'
    },
    {
      id: 'landing_light',
      name_zh: '着陆灯',
      name_en: 'Landing Light',
      category: 'light',
      function_zh: '提供起降照明',
      function_en: 'Provides landing illumination'
    },
    {
      id: 'slat',
      name_zh: '缝翼',
      name_en: 'Slat',
      category: 'wing',
      function_zh: '增加低速升力',
      function_en: 'Improves low-speed lift'
    },
    {
      id: 'thrust_reverser_pivot_door',
      name_zh: '反推折流门',
      name_en: 'Thrust Reverser Pivot Door',
      category: 'engine',
      function_zh: '反向推力装置的折流门',
      function_en: 'Thrust reverser deflector door'
    },
    {
      id: 'door_position_sensor_access',
      name_zh: '舱门位置传感器锁带口盖',
      name_en: 'Door Position Sensor Access',
      category: 'engine',
      function_zh: '舱门位置传感器接近盖板',
      function_en: 'Access panel for door position sensor'
    },
    {
      id: 'door_pivot_position_sensor_access',
      name_zh: '折流门及位置传感器盖板',
      name_en: 'Door Pivot Position Sensor Access',
      category: 'engine',
      function_zh: '折流门及位置传感器接近盖板',
      function_en: 'Access panel for pivot door position sensor'
    },
    {
      id: 'idg_oil_fill_access',
      name_zh: 'IDG滑油加注盖板',
      name_en: 'IDG Oil Fill Access',
      category: 'engine',
      function_zh: '综合驱动发电机滑油加注接近盖板',
      function_en: 'Integrated Drive Generator oil fill access panel'
    },
    {
      id: 'pressure_relief_access',
      name_zh: '释压和起动活门盖板',
      name_en: 'Pressure Relief Access',
      category: 'engine',
      function_zh: '释压和起动活门接近盖板',
      function_en: 'Access panel for pressure relief and start valve'
    },
    {
      id: 'drain_mast_eng',
      name_zh: '排放孔',
      name_en: 'Drain Mast',
      category: 'engine',
      function_zh: '发动机排放管',
      function_en: 'Engine drain mast'
    },
    {
      id: 'thrust_reverser_cowl_door_eng',
      name_zh: '反推折流门',
      name_en: 'Thrust Reverser Cowl Door',
      category: 'engine',
      function_zh: '反推整流罩门',
      function_en: 'Thrust reverser cowl door'
    },
    {
      id: 'fan_cowl_door_eng',
      name_zh: '风扇罩门',
      name_en: 'Fan Cowl Door',
      category: 'engine',
      function_zh: '风扇整流罩门',
      function_en: 'Fan cowl door'
    },
    {
      id: 'engine_inlet_eng',
      name_zh: '发动机进口和风扇叶片',
      name_en: 'Engine Inlet and Fan Blades',
      category: 'engine',
      function_zh: '发动机进气道和风扇叶片',
      function_en: 'Engine inlet and fan blades'
    },
    {
      id: 'engine_oil_filler_access_eng',
      name_zh: '发动机滑油勤务面板',
      name_en: 'Engine Oil Filler Access',
      category: 'engine',
      function_zh: '发动机滑油加注接近面板',
      function_en: 'Engine oil filler access panel'
    },
    {
      id: 'master_chip_detector',
      name_zh: '主磁堵和液压壳体回油滤盖板',
      name_en: 'Master Chip Detector Access',
      category: 'engine',
      function_zh: '主磁堵和液压壳体回油滤接近盖板',
      function_en: 'Master chip detector and hydraulic return filter access panel'
    },
    {
      id: 'turbine_exhaust_eng',
      name_zh: '涡轮排气口',
      name_en: 'Turbine Exhaust',
      category: 'engine',
      function_zh: '涡轮发动机排气口',
      function_en: 'Turbine engine exhaust'
    },
    {
      id: 'refuel_coupling_door',
      name_zh: '加油口盖',
      name_en: 'Refuel Coupling Door',
      category: 'fuel',
      function_zh: '加油接头盖板',
      function_en: 'Refueling coupling door'
    },
    {
      id: 'fuel_vent_overpressure_disc',
      name_zh: '燃油通气超压指示片',
      name_en: 'Fuel Vent Overpressure Disc',
      category: 'fuel',
      function_zh: '燃油通气超压指示装置',
      function_en: 'Fuel vent overpressure indicator disc'
    },
    {
      id: 'wing_fence',
      name_zh: '翼刀',
      name_en: 'Wing Fence',
      category: 'wing',
      function_zh: '阻止翼面气流横向流动',
      function_en: 'Prevents spanwise airflow on wing'
    },
    {
      id: 'surge_tank_air_inlet',
      name_zh: '通气油箱进气口',
      name_en: 'Surge Tank Air Inlet',
      category: 'fuel',
      function_zh: '通气油箱空气进口',
      function_en: 'Surge tank air inlet'
    },
    {
      id: 'navigation_light',
      name_zh: '航行灯',
      name_en: 'Navigation Light',
      category: 'light',
      function_zh: '显示飞机位置和方向',
      function_en: 'Indicates aircraft position and direction'
    },
    {
      id: 'strobe_light',
      name_zh: '频闪灯',
      name_en: 'Strobe Light',
      category: 'light',
      function_zh: '提供高强度闪烁警示灯光',
      function_en: 'Provides high-intensity flashing warning light'
    },
    {
      id: 'static_dischargers',
      name_zh: '静电放电刷',
      name_en: 'Static Dischargers',
      category: 'structure',
      function_zh: '释放机体静电',
      function_en: 'Discharges static electricity from airframe'
    },
    {
      id: 'control_surfaces',
      name_zh: '操纵面',
      name_en: 'Control Surfaces',
      category: 'wing',
      function_zh: '控制飞机姿态',
      function_en: 'Controls aircraft attitude'
    },
    {
      id: 'flaps',
      name_zh: '襟翼和整流罩',
      name_en: 'Flaps',
      category: 'wing',
      function_zh: '增加升力和阻力',
      function_en: 'Increases lift and drag'
    },
    {
      id: 'jettison_outlet',
      name_zh: '放油口',
      name_en: 'Jettison Outlet',
      category: 'fuel',
      function_zh: '紧急放油出口',
      function_en: 'Emergency fuel jettison outlet'
    },
    {
      id: 'chocks',
      name_zh: '轮挡',
      name_en: 'Chocks',
      category: 'landing_gear',
      function_zh: '防止飞机移动',
      function_en: 'Prevents aircraft movement'
    },
    {
      id: 'main_wheels',
      name_zh: '轮毂和轮胎',
      name_en: 'Main Wheels',
      category: 'landing_gear',
      function_zh: '主起落架轮毂和轮胎',
      function_en: 'Main landing gear wheels and tires'
    },
    {
      id: 'brakes',
      name_zh: '刹车和刹车磨损指示器',
      name_en: 'Brakes and Wear Indicators',
      category: 'landing_gear',
      function_zh: '刹车系统和磨损指示器',
      function_en: 'Brake system and wear indicators'
    },
    {
      id: 'hydraulic_lines',
      name_zh: '液压管路',
      name_en: 'Hydraulic Lines',
      category: 'hydraulic',
      function_zh: '液压系统管路',
      function_en: 'Hydraulic system lines'
    },
    {
      id: 'landing_gear_structure',
      name_zh: '起落架结构',
      name_en: 'Landing Gear Structure',
      category: 'landing_gear',
      function_zh: '起落架结构组件',
      function_en: 'Landing gear structural components'
    },
    {
      id: 'downlock_springs',
      name_zh: '下锁弹簧',
      name_en: 'Downlock Springs',
      category: 'landing_gear',
      function_zh: '起落架下位锁定弹簧',
      function_en: 'Landing gear downlock springs'
    },
    {
      id: 'safety_pin',
      name_zh: '安全销',
      name_en: 'Safety Pin',
      category: 'landing_gear',
      function_zh: '起落架安全销',
      function_en: 'Landing gear safety pin'
    }
  ]
};

// 部件分类中英文映射（统一管理）
module.exports.categoryNames = {
  'sensor': '传感器',
  'light': '灯光',
  'safety': '安全',
  'landing_gear': '起落架',
  'wing': '机翼',
  'engine': '发动机',
  'fuel': '燃油',
  'hydraulic': '液压',
  'structure': '结构',
  'antenna': '天线',
  'drain': '排水',
  'air_conditioning': '空调',
  'ground_support': '地面设备',
  'pressurization': '增压',
  'emergency': '应急',
  'electrical': '电气',
  'apu': 'APU',
  'tail': '尾翼',
  'utilities': '公用设施'
};

// 预建ComponentCache，避免每个页面重复创建
// 时间复杂度：从O(n)遍历 → O(1)查找
(function buildComponentMap() {
  var map = {};
  module.exports.components.forEach(function(component) {
    map[component.id] = component;
  });
  module.exports.componentMap = map;
})();
