module.exports = {
  "documentInfo": {
    "title": "常见机型航空器分类等级(ACR)数据表 - 中国商飞(COMAC)",
    "lastUpdated": "2024-05-21",
    "source": "User-provided 73-page PDF (Data extracted from pages 64 and 70)"
  },
  "aircraftData": [
    {
      "model": "ARJ21-700",
      "variants": [
        {
          "variantName": "STD",
          "loadPercentageMLG": 47.69,
          "tirePressure_mpa": 0.99,
          "mass_kg": { "max": 40580, "min": 25000 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 170, "medium_B_120": 190, "low_C_80": 206, "ultraLow_D_50": 236 },
              "rigidPavement": { "high_A_200": 221, "medium_B_120": 237, "low_C_80": 249, "ultraLow_D_50": 261 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 104, "medium_B_120": 112, "low_C_80": 119, "ultraLow_D_50": 128 },
              "rigidPavement": { "high_A_200": 122, "medium_B_120": 132, "low_C_80": 140, "ultraLow_D_50": 147 }
            }
          }
        },
        {
          "variantName": "ER",
          "loadPercentageMLG": 47.33,
          "tirePressure_mpa": 0.99,
          "mass_kg": { "max": 43580, "min": 25000 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 182, "medium_B_120": 204, "low_C_80": 223, "ultraLow_D_50": 257 },
              "rigidPavement": { "high_A_200": 239, "medium_B_120": 256, "low_C_80": 269, "ultraLow_D_50": 281 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 103, "medium_B_120": 111, "low_C_80": 118, "ultraLow_D_50": 127 },
              "rigidPavement": { "high_A_200": 121, "medium_B_120": 131, "low_C_80": 138, "ultraLow_D_50": 146 }
            }
          }
        }
      ]
    },
    {
      "model": "C919",
      "variants": [
        {
          "variantName": "STD",
          "loadPercentageMLG": 46.14,
          "tirePressure_mpa": 1.29,
          "mass_kg": { "max": 75500, "min": 45000 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 340, "medium_B_120": 366, "low_C_80": 399, "ultraLow_D_50": 445 },
              "rigidPavement": { "high_A_200": 442, "medium_B_120": 466, "low_C_80": 482, "ultraLow_D_50": 500 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 199, "medium_B_120": 207, "low_C_80": 217, "ultraLow_D_50": 235 },
              "rigidPavement": { "high_A_200": 238, "medium_B_120": 252, "low_C_80": 262, "ultraLow_D_50": 274 }
            }
          }
        },
        {
          "variantName": "ER",
          "loadPercentageMLG": 45.82,
          "tirePressure_mpa": 1.35,
          "mass_kg": { "max": 79300, "min": 45000 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 361, "medium_B_120": 387, "low_C_80": 423, "ultraLow_D_50": 472 },
              "rigidPavement": { "high_A_200": 471, "medium_B_120": 495, "low_C_80": 511, "ultraLow_D_50": 528 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 200, "medium_B_120": 207, "low_C_80": 216, "ultraLow_D_50": 234 },
              "rigidPavement": { "high_A_200": 240, "medium_B_120": 253, "low_C_80": 263, "ultraLow_D_50": 274 }
            }
          }
        }
      ]
    }
  ]
};