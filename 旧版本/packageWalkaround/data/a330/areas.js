module.exports = {
  schemaVersion: '1.0.0',
  areas: [
    {
      id: 1,
      code: 'LH_FWD_FUSELAGE',
      name_zh: '左前机身',
      name_en: 'LH FWD Fuselage',
      sequence: 1,
      hotspot: { cx: 0.412, cy: 0.337, r: 0.05 },
      components: ['outflow_valve', 'static_ports', 'aoa_probe', 'wing_scan_lights', 'oxygen_discharge_indicator'],
      category: 'fuselage'
    },
    {
      id: 2,
      code: 'NOSE_SECTION',
      name_zh: '机头部分',
      name_en: 'Nose Section',
      sequence: 2,
      hotspot: { cx: 0.572, cy: 0.171, r: 0.05 },
      components: ['pitot_probes', 'tat_probes', 'radome', 'avionics_compartment_door', 'ice_detector_probe', 'crew_oxygen_discharge_indicator', 'gps1_antenna', 'gps2_antenna', 'vhf1_antenna', 'atc3_antenna', 'atc4_antenna', 'tcas_antenna_top', 'satcom_aero_h_antenna', 'satcom_aero_i_antenna', 'loc_antenna', 'glideslope_antenna', 'landscape_camera'],
      category: 'fuselage'
    },
    {
      id: 3,
      code: 'NOSE_LG',
      name_zh: '前起落架',
      name_en: 'Nose Landing Gear',
      sequence: 3,
      hotspot: { cx: 0.577, cy: 0.285, r: 0.05 },
      components: ['nose_wheel_chocks', 'nose_wheels', 'nose_lg_structure', 'taxi_toff_light', 'hydraulic_lines_nose', 'wheel_well_nose', 'safety_pin_nose', 'ground_power_door', 'avionic_vent_overboard_valve', 'atc1_antenna', 'atc2_antenna', 'dme1_antenna', 'dme2_antenna', 'marker_antenna', 'tcas_antenna_bottom'],
      category: 'landing_gear'
    },
    {
      id: 4,
      code: 'RH_FWD_FUSELAGE',
      name_zh: '右前机身',
      name_en: 'RH FWD Fuselage',
      sequence: 4,
      hotspot: { cx: 0.723, cy: 0.348, r: 0.05 },
      components: ['aoa_probes_rh', 'pax_oxygen_discharge_indicator', 'cargo_loading_access_door', 'cargo_door_access', 'cargo_door', 'static_ports_rh', 'drain_mast_front', 'wing_scan_lights'],
      category: 'fuselage'
    },
    {
      id: 5,
      code: 'LOWER_CENTER_FUSELAGE',
      name_zh: '中下机身',
      name_en: 'Lower Center Fuselage',
      sequence: 5,
      hotspot: { cx: 0.575, cy: 0.412, r: 0.05 },
      components: ['ram_air_inlet', 'pack_air_intake', 'anti_collision_light', 'hp_ground_connection_door', 'lp_ground_connection_door', 'ground_hydraulic_connection_blue', 'ground_hydraulic_connection_yellow', 'lg_ground_opening_handle_access_lh', 'lg_ground_opening_handle_access_rh'],
      category: 'fuselage'
    },
    {
      id: 6,
      code: 'RH_CENTER_WING',
      name_zh: '右中机翼',
      name_en: 'RH Center Wing',
      sequence: 6,
      hotspot: { cx: 0.64, cy: 0.58, r: 0.05 },
      components: ['tank_magnetic_fuel_level_rh', 'fuel_water_drain_valve_rh', 'water_drain_valve_door_rh', 'landing_light_rh', 'slat1_rh', 'engine_scan_light_rh'],
      category: 'wing'
    },
    {
      id: 7,
      code: 'ENG2_LH_SIDE',
      name_zh: '2 号发动机左侧',
      name_en: 'ENG 2 LH Side',
      sequence: 7,
      hotspot: { cx: 0.669, cy: 0.507, r: 0.05 },
      components: ['thrust_reverser_pivot_door_eng2', 'door_position_sensor_access_eng2', 'idg_oil_fill_access_eng2', 'pressure_relief_access_eng2', 'drain_mast_eng2', 'thrust_reverser_cowl_door_eng2', 'fan_cowl_door_eng2', 'engine_inlet_eng2'],
      category: 'engine'
    },
    {
      id: 8,
      code: 'ENG2_RH_SIDE',
      name_zh: '2 号发动机右侧',
      name_en: 'ENG 2 RH Side',
      sequence: 8,
      hotspot: { cx: 0.755, cy: 0.518, r: 0.05 },
      components: ['engine_oil_filler_access_eng2', 'thrust_reverser_cowl_door_eng2', 'fan_cowl_door_eng2', 'master_chip_detector_eng2', 'drain_mast_eng2', 'turbine_exhaust_eng2'],
      category: 'engine'
    },
    {
      id: 9,
      code: 'RH_WING_LEADING_EDGE',
      name_zh: '右翼前缘',
      name_en: 'RH Wing Leading Edge',
      sequence: 9,
      hotspot: { cx: 0.786, cy: 0.587, r: 0.05 },
      components: ['refuel_coupling_door_rh', 'magnetic_fuel_levels_rh_inner_outer', 'fuel_water_drain_valve_rh', 'rat_door', 'slats_2_3_4_rh'],
      category: 'wing'
    },
    {
      id: 10,
      code: 'RH_WING_TIP',
      name_zh: '右翼翼尖',
      name_en: 'RH Wing Tip',
      sequence: 10,
      hotspot: { cx: 0.947, cy: 0.68, r: 0.05 },
      components: ['fuel_vent_overpressure_disc_rh', 'wing_fence_rh', 'magnetic_fuel_levels_tip_rh', 'fuel_water_drain_valve_tip_rh', 'surge_tank_air_inlet_rh', 'slats_5_6_7_rh', 'navigation_light_rh', 'strobe_light_rh', 'antenna_top_rh'],
      category: 'wing'
    },
    {
      id: 11,
      code: 'RH_WING_TRAILING_EDGE',
      name_zh: '右翼后缘',
      name_en: 'RH Wing Trailing Edge',
      sequence: 11,
      hotspot: { cx: 0.929, cy: 0.769, r: 0.05 },
      components: ['static_dischargers_rh', 'control_surfaces_rh', 'flaps_rh', 'jettison_outlet_rh', 'antenna_top_rh'],
      category: 'wing'
    },
    {
      id: 12,
      code: 'RH_LANDING_GEAR',
      name_zh: '右主起落架',
      name_en: 'RH Landing Gear',
      sequence: 12,
      hotspot: { cx: 0.676, cy: 0.63, r: 0.05 },
      components: ['chocks_rh', 'main_wheels_rh', 'brakes_rh', 'hydraulic_lines_rh', 'landing_gear_structure_rh', 'downlock_springs_rh', 'safety_pin_rh'],
      category: 'landing_gear'
    },
    {
      id: 13,
      code: 'CENTER_FUSELAGE',
      name_zh: '中机身',
      name_en: 'Center Fuselage',
      sequence: 13,
      hotspot: { cx: 0.575, cy: 0.67, r: 0.05 },
      components: ['refuel_electrical_control_panel', 'apu_fuel_drain', 'ground_hydraulic_connection_green', 'twlu_antenna', 'adf1_antenna', 'adf2_antenna', 'vhf3_antenna'],
      category: 'fuselage'
    },
    {
      id: 14,
      code: 'RH_AFT_FUSELAGE',
      name_zh: '右后机身',
      name_en: 'RH AFT Fuselage',
      sequence: 14,
      hotspot: { cx: 0.637, cy: 0.771, r: 0.05 },
      components: ['vhf2_antenna', 'ra1_antenna', 'ra2_antenna', 'drain_mast_aft', 'potable_water_aft_panel', 'cargo_loading_access_aft', 'cargo_door_access_aft', 'cargo_door_aft', 'bulk_door', 'potable_water_service_panel', 'waste_service_panel'],
      category: 'fuselage'
    },
    {
      id: 15,
      code: 'TAIL',
      name_zh: '尾翼',
      name_en: 'Tail',
      sequence: 15,
      hotspot: { cx: 0.746, cy: 1.024, r: 0.05 },
      components: ['stabilizer', 'elevator', 'fin', 'rudder', 'surge_tank_air_inlet_tail', 'fuel_water_drain_valves_tail', 'static_dischargers_tail', 'tail_lower_structure', 'flight_recorder_access_door', 'fuel_vent_overpressure_disc_tail', 'logo_light', 'vor_antenna', 'elt_antenna', 'hf_antenna'],
      category: 'tail'
    },
    {
      id: 16,
      code: 'APU',
      name_zh: '辅助动力装置',
      name_en: 'APU',
      sequence: 16,
      hotspot: { cx: 0.574, cy: 1.097, r: 0.05 },
      components: ['apu_access_door', 'apu_air_intake', 'apu_exhaust', 'apu_navigation_light', 'apu_fire_ext_overpressure_indicator'],
      category: 'fuselage'
    },
    {
      id: 17,
      code: 'LH_AFT_FUSELAGE',
      name_zh: '左后机身',
      name_en: 'LH AFT Fuselage',
      sequence: 17,
      hotspot: { cx: 0.471, cy: 0.898, r: 0.05 },
      components: ['stabilizer', 'elevator', 'fin', 'rudder', 'outflow_valve_aft'],
      category: 'fuselage'
    },
    {
      id: 18,
      code: 'LH_LANDING_GEAR_FUSELAGE',
      name_zh: '左主起落架及机身',
      name_en: 'LH Landing Gear and Fuselage',
      sequence: 18,
      hotspot: { cx: 0.473, cy: 0.625, r: 0.05 },
      components: ['chocks_lh', 'main_wheels_lh', 'brakes_lh', 'hydraulic_lines_lh', 'landing_gear_structure_lh', 'downlock_springs_lh', 'safety_pin_lh'],
      category: 'landing_gear'
    },
    {
      id: 19,
      code: 'LH_WING_TRAILING_EDGE',
      name_zh: '左翼后缘',
      name_en: 'LH Wing Trailing Edge',
      sequence: 19,
      hotspot: { cx: 0.328, cy: 0.739, r: 0.05 },
      components: ['jettison_outlet_lh', 'flaps_lh', 'control_surfaces_lh', 'static_dischargers_lh', 'antenna_top_lh'],
      category: 'wing'
    },
    {
      id: 20,
      code: 'LH_WING_TIP',
      name_zh: '左翼翼尖',
      name_en: 'LH Wing Tip',
      sequence: 20,
      hotspot: { cx: 0.143, cy: 0.703, r: 0.05 },
      components: ['navigation_light_lh', 'strobe_light_lh', 'slats_7_6_5_lh', 'surge_tank_air_inlet_lh', 'fuel_water_drain_valve_tip_lh', 'magnetic_fuel_levels_tip_lh', 'wing_fence_lh', 'fuel_vent_overpressure_disc_lh'],
      category: 'wing'
    },
    {
      id: 21,
      code: 'LH_WING_LEADING_EDGE',
      name_zh: '左翼前缘',
      name_en: 'LH Wing Leading Edge',
      sequence: 21,
      hotspot: { cx: 0.36, cy: 0.592, r: 0.05 },
      components: ['magnetic_fuel_levels_lh_inner_outer', 'fuel_water_drain_valve_lh', 'slats_4_3_2_lh', 'refuel_coupling_door_lh'],
      category: 'wing'
    },
    {
      id: 22,
      code: 'ENG1_LH_SIDE',
      name_zh: '1 号发动机左侧',
      name_en: 'ENG 1 LH Side',
      sequence: 22,
      hotspot: { cx: 0.398, cy: 0.517, r: 0.05 },
      components: ['thrust_reverser_pivot_door_eng1', 'door_position_sensor_access_eng1', 'idg_oil_fill_access_eng1', 'pressure_relief_access_eng1', 'drain_mast_eng1', 'thrust_reverser_cowl_door_eng1', 'fan_cowl_door_eng1', 'engine_inlet_eng1'],
      category: 'engine'
    },
    {
      id: 23,
      code: 'ENG1_RH_SIDE',
      name_zh: '1 号发动机右侧',
      name_en: 'ENG 1 RH Side',
      sequence: 23,
      hotspot: { cx: 0.479, cy: 0.514, r: 0.05 },
      components: ['engine_oil_filler_access_eng1', 'thrust_reverser_cowl_door_eng1', 'fan_cowl_door_eng1', 'master_chip_detector_eng1', 'drain_mast_eng1', 'turbine_exhaust_eng1'],
      category: 'engine'
    },
    {
      id: 24,
      code: 'LH_CENTER_WING',
      name_zh: '左中机翼',
      name_en: 'LH Center Wing',
      sequence: 24,
      hotspot: { cx: 0.539, cy: 0.5, r: 0.05 },
      components: ['tank_magnetic_fuel_level_lh', 'fuel_water_drain_valve_lh', 'water_drain_valve_panel_lh', 'landing_light_lh', 'slat1_lh', 'engine_scan_light_lh'],
      category: 'wing'
    }
  ]
};

// 区域分类中文名称映射（统一管理）
module.exports.AREA_CATEGORY_NAMES = {
  'fuselage': '机身',
  'wing': '机翼',
  'engine': '发动机',
  'landing_gear': '起落架',
  'tail': '尾翼'
};

