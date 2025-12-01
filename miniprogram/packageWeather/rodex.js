module.exports = {
  "name": "RODEX",
  "description": "Meteorological Operational Telecommunications Network - Europe (RODEX) Broadcast Information for runway conditions.",
  "format": "RDRDR/ERCRerereRBRBR",
  "components": {
    "runway_designator": {
      "code": "DRDR",
      "description": "Runway designator, preceded by 'R'.",
      "notes": [
        "Expressed as two digits corresponding to the runway designator (e.g., 09, 27, 35).",
        "Parallel runways are designated by appending L (left), C (center), or R (right).",
        "The information is for the main instrument runway or runway(s) in use.",
        "If a new report is not available, the previous report is repeated, indicated by 'R99/'."
      ],
      "special_codes": {
        "88": "All runways.",
        "99": "Previous runway state report is repeated."
      }
    },
    "runway_deposits": {
      "code": "ER",
      "description": "Type of deposits on the runway.",
      "values": {
        "0": "Dry and clear of deposits",
        "1": "Damp",
        "2": "Wet or water patches",
        "3": "Rime or frost (Depth normally less than 1mm)",
        "4": "Dry snow",
        "5": "Wet snow",
        "6": "Slush",
        "7": "Ice",
        "8": "Compacted or rolled snow",
        "9": "Frozen ruts",
        "/": "Type of deposit not reported (e.g., due to runway clearance in progress)."
      }
    },
    "extent_of_contamination": {
      "code": "CR",
      "description": "The extent of contamination through deposits on the runway.",
      "values": {
        "1": "up to 10% of runway contaminated (covered)",
        "2": "more than 10% to 25% of runway contaminated (covered)",
        "5": "more than 25% to 50% of runway contaminated (covered)",
        "9": "more than 50% to 100% of runway contaminated (covered)",
        "/": "not reported (e.g., due to runway clearance in progress)."
      }
    },
    "depth_of_deposit": {
      "code": "erereR",
      "description": "The depth of deposit on the runway.",
      "values": {
        "00": "less than 1mm",
        "01": "1mm",
        "02": "2mm",
        "03": "3mm",
        "04": "4mm",
        "05": "5mm",
        "06": "6mm",
        "07": "7mm",
        "08": "8mm",
        "09": "9mm",
        "10": "10mm",
        "11": "11mm",
        "12": "12mm",
        "13": "13mm",
        "14": "14mm",
        "15": "15mm",
        "16": "16mm",
        "17": "17mm",
        "18": "18mm",
        "19": "19mm",
        "20": "20mm",
        "21": "21mm",
        "22": "22mm",
        "23": "23mm",
        "24": "24mm",
        "25": "25mm",
        "26": "26mm",
        "27": "27mm",
        "28": "28mm",
        "29": "29mm",
        "30": "30mm",
        "31": "31mm",
        "32": "32mm",
        "33": "33mm",
        "34": "34mm",
        "35": "35mm",
        "36": "36mm",
        "37": "37mm",
        "38": "38mm",
        "39": "39mm",
        "40": "40mm",
        "41": "41mm",
        "42": "42mm",
        "43": "43mm",
        "44": "44mm",
        "45": "45mm",
        "46": "46mm",
        "47": "47mm",
        "48": "48mm",
        "49": "49mm",
        "50": "50mm",
        "51": "51mm",
        "52": "52mm",
        "53": "53mm",
        "54": "54mm",
        "55": "55mm",
        "56": "56mm",
        "57": "57mm",
        "58": "58mm",
        "59": "59mm",
        "60": "60mm",
        "61": "61mm",
        "62": "62mm",
        "63": "63mm",
        "64": "64mm",
        "65": "65mm",
        "66": "66mm",
        "67": "67mm",
        "68": "68mm",
        "69": "69mm",
        "70": "70mm",
        "71": "71mm",
        "72": "72mm",
        "73": "73mm",
        "74": "74mm",
        "75": "75mm",
        "76": "76mm",
        "77": "77mm",
        "78": "78mm",
        "79": "79mm",
        "80": "80mm",
        "81": "81mm",
        "82": "82mm",
        "83": "83mm",
        "84": "84mm",
        "85": "85mm",
        "86": "86mm",
        "87": "87mm",
        "88": "88mm",
        "89": "89mm",
        "90": "90mm",
        "92": "10cm",
        "93": "15cm",
        "94": "20cm",
        "95": "25cm",
        "96": "30cm",
        "97": "35cm",
        "98": "40cm or more",
        "99": "Runway or runways non-operational due to snow, slush, ice, large drifts or runway clearance.",
        "//": "Depth of deposit operationally not significant or not measurable."
      },
      "notes": [
        "For codes 92 to 98, the depth in cm can be derived by multiplying the last digit by 5.",
        "Code 91 is not used.",
        "If deposits are of type 3 (Rime or frost), 7 (Ice), 8 (Compacted snow), or 9 (Frozen ruts), depth is normally reported as '//'."
      ]
    },
    "braking_action": {
      "code": "BRBR",
      "description": "Friction coefficient or estimated braking action on the runway (刹车效应).",
      "friction_coefficient": {
        "range": "00-90",
        "description": "Represents the friction coefficient (e.g., 28 = 0.28, 35 = 0.35).",
        "examples": [
          { "code": "28", "value": "0.28" },
          { "code": "35", "value": "0.35" }
        ]
      },
      "estimated_braking_action": {
        "91": "Poor",
        "92": "Medium / Poor",
        "93": "Medium",
        "94": "Medium / Good",
        "95": "Good"
      },
      "special_codes": {
        "99": "Unreliable braking action report (e.g., due to wet snow, slush). Also used when a runway is non-operational.",
        "//": "Braking action not reported (e.g., runway clearance in progress, aerodrome closed)."
      },
      "braking_action_from_coefficient_table": {
        "description": "Friction coefficient for compacted snow- and/or ice-covered runways",
        "table": [
          { "measured_coefficient_min": 0.40, "measured_coefficient_max": 1.00, "estimated_braking_action": "Good", "code": "5" },
          { "measured_coefficient_min": 0.36, "measured_coefficient_max": 0.39, "estimated_braking_action": "Medium to good", "code": "4" },
          { "measured_coefficient_min": 0.30, "measured_coefficient_max": 0.35, "estimated_braking_action": "Medium", "code": "3" },
          { "measured_coefficient_min": 0.26, "measured_coefficient_max": 0.29, "estimated_braking_action": "Medium to poor", "code": "2" },
          { "measured_coefficient_min": 0.00, "measured_coefficient_max": 0.25, "estimated_braking_action": "Poor", "code": "1" }
        ]
      }
    }
  },
  "regional_variations": {
    "Russia": {
      "description": "在俄罗斯，报告的摩擦系数通常是'规范'值，而非直接的'测量'值。规范值是根据测量值通过官方表格换算得出，通常数值更高。这导致在解读报告时需要特别注意。",
      "friction_coefficient_type": "Normative",
      "operational_notes": [
        "当规范摩擦系数值低于0.3时，跑道通常会关闭。",
        "不同机场的报告标准可能不统一。例如，一些主要国际机场（如莫斯科谢列梅捷沃机场 UUEE）可能在英文ATIS中报告'测量'值，而其他多数机场和俄语信源则使用'规范'值。"
      ],
      "braking_action_table": {
        "description": "俄罗斯刹车效应对应表，包含测量值、规范值和刹车效应描述",
        "table": [
          { "code": "5", "measured_min": 0.40, "measured_max": 1.00, "normative_min": 0.42, "normative_max": 1.00, "braking_action": "Good" },
          { "code": "4", "measured_min": 0.36, "measured_max": 0.39, "normative_min": 0.40, "normative_max": 0.41, "braking_action": "Good to Medium" },
          { "code": "3", "measured_min": 0.30, "measured_max": 0.35, "normative_min": 0.37, "normative_max": 0.39, "braking_action": "Medium" },
          { "code": "2", "measured_min": 0.26, "measured_max": 0.29, "normative_min": 0.35, "normative_max": 0.36, "braking_action": "Medium to Poor" },
          { "code": "1", "measured_min": 0.17, "measured_max": 0.25, "normative_min": 0.30, "normative_max": 0.34, "braking_action": "Poor" },
          { "code": "9", "measured_min": 0.00, "measured_max": 0.16, "normative_min": 0.00, "normative_max": 0.29, "braking_action": "Unreliable" }
        ]
      }
    }
  },
  "examples": [
    {
      "code": "R99/421594",
      "explanation": "Previous report repeated: Dry snow covering 11% to 25% of the runway; depth 15mm; braking action medium to good."
    },
    {
      "code": "R14L///99//",
      "explanation": "Runway 14L non-operational due to runway clearance in progress."
    },
    {
      "code": "R14L//////",
      "explanation": "Runway 14L contaminated but reports are not available or are not updated due to aerodrome closure or curfew, etc."
    },
    {
      "code": "R88///////",
      "explanation": "All runways are contaminated but reports are not available or are not updated due to aerodrome closure or curfew, etc."
    },
    {
      "code": "R14L/CLRD60",
      "explanation": "Runway 14L contamination has ceased to exist. Friction coefficient is 0.60."
    }
  ]
}