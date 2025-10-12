module.exports = {
  "documentInfo": {
    "title": "常见机型航空器分类等级(ACR)数据表 - 其他制造商",
    "lastUpdated": "2024-05-21",
    "source": "User-provided 73-page PDF (Data extracted from pages 64, 72-73)"
  },
  "aircraftData": [
    {
      "model": "AG600",
      "variants": [
        {
          "variantName": "Standard",
          "loadPercentageMLG": 44.75, // Note: PDF shows two different load percentages for the same mass range. Using the one for the higher mass. The other is 46.27.
          "tirePressure_mpa": 1.38,
          "mass_kg": { "max": 60000, "min": 52000 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 317, "medium_B_120": 338, "low_C_80": 374, "ultraLow_D_50": 405 },
              "rigidPavement": { "high_A_200": 369, "medium_B_120": 387, "low_C_80": 402, "ultraLow_D_50": 416 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 277, "medium_B_120": 293, "low_C_80": 327, "ultraLow_D_50": 358 },
              "rigidPavement": { "high_A_200": 324, "medium_B_120": 339, "low_C_80": 354, "ultraLow_D_50": 366 }
            }
          }
        }
      ]
    },
    {
      "model": "Cessna 560XL",
      "variants": [
        {
          "variantName": "Standard",
          "mass_kg": 9253,
          "loadPercentageMLG": 46.3,
          "tirePressure_mpa": 1.5,
          "acr": {
            "flexiblePavement": { "high_A_200": 86, "medium_B_120": 86, "low_C_80": 86, "ultraLow_D_50": 86 },
            "rigidPavement": { "high_A_200": 86, "medium_B_120": 86, "low_C_80": 86, "ultraLow_D_50": 86 }
          }
        }
      ]
    },
    {
      "model": "Cessna 680",
      "variants": [
        {
          "variantName": "Standard",
          "mass_kg": 13875,
          "loadPercentageMLG": 47.34,
          "tirePressure_mpa": 1.1,
          "acr": {
            "flexiblePavement": { "high_A_200": 65, "medium_B_120": 76, "low_C_80": 91, "ultraLow_D_50": 104 },
            "rigidPavement": { "high_A_200": 89, "medium_B_120": 93, "low_C_80": 96, "ultraLow_D_50": 100 }
          }
        }
      ]
    },
    {
      "model": "Challenger CL 600, 601",
      "variants": [
        {
          "variantName": "Standard",
          "loadPercentageMLG": 45.6, // Note: PDF shows two different load percentages. Using the one for the higher mass. The other is 46.6.
          "tirePressure_mpa": 1.37,
          "mass_kg": { "max": 20298, "min": 11578 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 97, "medium_B_120": 107, "low_C_80": 124, "ultraLow_D_50": 145 },
              "rigidPavement": { "high_A_200": 131, "medium_B_120": 137, "low_C_80": 140, "ultraLow_D_50": 144 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 53, "medium_B_120": 57, "low_C_80": 61, "ultraLow_D_50": 69 },
              "rigidPavement": { "high_A_200": 68, "medium_B_120": 72, "low_C_80": 74, "ultraLow_D_50": 77 }
            }
          }
        }
      ]
    },
    {
      "model": "Challenger EL 601-3R",
      "variants": [
        {
          "variantName": "Standard",
          "loadPercentageMLG": 45.6, // Note: PDF shows two different load percentages. Using the one for the higher mass. The other is 46.6.
          "tirePressure_mpa": 1.37,
          "mass_kg": { "max": 20298, "min": 11578 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 97, "medium_B_120": 107, "low_C_80": 124, "ultraLow_D_50": 145 },
              "rigidPavement": { "high_A_200": 131, "medium_B_120": 137, "low_C_80": 140, "ultraLow_D_50": 144 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 53, "medium_B_120": 57, "low_C_80": 61, "ultraLow_D_50": 69 },
              "rigidPavement": { "high_A_200": 68, "medium_B_120": 72, "low_C_80": 74, "ultraLow_D_50": 77 }
            }
          }
        }
      ]
    },
    {
      "model": "Challenger CL 604",
      "variants": [
        {
          "variantName": "Standard",
          "loadPercentageMLG": 47,
          "tirePressure_mpa": 1.22,
          "mass_kg": { "max": 21909, "min": 11793 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 101, "medium_B_120": 112, "low_C_80": 123, "ultraLow_D_50": 146 },
              "rigidPavement": { "high_A_200": 135, "medium_B_120": 141, "low_C_80": 147, "ultraLow_D_50": 152 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 52, "medium_B_120": 55, "low_C_80": 59, "ultraLow_D_50": 64 },
              "rigidPavement": { "high_A_200": 64, "medium_B_120": 68, "low_C_80": 71, "ultraLow_D_50": 74 }
            }
          }
        }
      ]
    },
    {
      "model": "EMB-135BJ",
      "variants": [
        {
          "variantName": "Standard",
          "loadPercentageMLG": 46.1, // Note: PDF shows two different load percentages. Using the one for the higher mass. The other is 45.2.
          "tirePressure_mpa": 1.124,
          "mass_kg": { "max": 24370, "min": 13000 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 107.15, "medium_B_120": 121.11, "low_C_80": 134.61, "ultraLow_D_50": 160.26 },
              "rigidPavement": { "high_A_200": 144.53, "medium_B_120": 152.84, "low_C_80": 158.51, "ultraLow_D_50": 164.4 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 53.67, "medium_B_120": 57.6, "low_C_80": 61.32, "ultraLow_D_50": 67.66 },
              "rigidPavement": { "high_A_200": 65.24, "medium_B_120": 69.7, "low_C_80": 73.09, "ultraLow_D_50": 76.73 }
            }
          }
        }
      ]
    },
    {
      "model": "EMB-190LR",
      "variants": [
        {
          "variantName": "Standard",
          "mass_kg": 50460,
          "loadPercentageMLG": 46.2,
          "tirePressure_mpa": 1.041,
          "acr": {
            "flexiblePavement": { "high_A_200": 261, "medium_B_120": 280.36, "low_C_80": 294.36, "ultraLow_D_50": 308.31 },
            "rigidPavement": { "high_A_200": 207.57, "medium_B_120": 227.08, "low_C_80": 244.94, "ultraLow_D_50": 273.66 }
          }
        }
      ]
    },
    {
      "model": "EMB-195LR",
      "variants": [
        {
          "variantName": "Standard",
          "mass_kg": 50950,
          "loadPercentageMLG": 46.8,
          "tirePressure_mpa": 1.041,
          "acr": {
            "flexiblePavement": { "high_A_200": 268.25, "medium_B_120": 288.11, "low_C_80": 302.08, "ultraLow_D_50": 316.6 },
            "rigidPavement": { "high_A_200": 212.45, "medium_B_120": 232.74, "low_C_80": 251.58, "ultraLow_D_50": 281.29 }
          }
        }
      ]
    },
    {
      "model": "F7X",
      "variants": [
        {
          "variantName": "Standard",
          "loadPercentageMLG": 49.12, // Note: PDF shows two different load percentages. Using the one for the higher mass. The other is 48.43.
          "tirePressure_mpa": 1.52,
          "mass_kg": { "max": 31842, "min": 15880 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 163, "medium_B_120": 180, "low_C_80": 203, "ultraLow_D_50": 236 },
              "rigidPavement": { "high_A_200": 222, "medium_B_120": 230, "low_C_80": 236, "ultraLow_D_50": 244 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 81, "medium_B_120": 85, "low_C_80": 93, "ultraLow_D_50": 108 },
              "rigidPavement": { "high_A_200": 100, "medium_B_120": 105, "low_C_80": 109, "ultraLow_D_50": 111 }
            }
          }
        }
      ]
    },
    {
      "model": "G200",
      "variants": [
        {
          "variantName": "Standard",
          "loadPercentageMLG": 46.48,
          "tirePressure_mpa": 1.54,
          "mass_kg": { "max": 16148, "min": 10886 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 78.7, "medium_B_120": 84.7, "low_C_80": 94.1, "ultraLow_D_50": 111.5 },
              "rigidPavement": { "high_A_200": 105.3, "medium_B_120": 109.2, "low_C_80": 112.1, "ultraLow_D_50": 115 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 51.3, "medium_B_120": 53.8, "low_C_80": 57.1, "ultraLow_D_50": 64.4 },
              "rigidPavement": { "high_A_200": 65.5, "medium_B_120": 68.3, "low_C_80": 70.5, "ultraLow_D_50": 72.8 }
            }
          }
        }
      ]
    },
    {
      "model": "G280",
      "variants": [
        {
          "variantName": "Standard",
          "loadPercentageMLG": 45.835, // Note: PDF shows two different load percentages. Using the one for the higher mass. The other is 46.93.
          "tirePressure_mpa": 1.55,
          "mass_kg": { "max": 18030, "min": 12791 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 111.1, "medium_B_120": 133.8, "low_C_80": 143.7, "ultraLow_D_50": 150.6 },
              "rigidPavement": { "high_A_200": 137.4, "medium_B_120": 140.1, "low_C_80": 141.9, "ultraLow_D_50": 143.8 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 71, "medium_B_120": 85.1, "low_C_80": 96.7, "ultraLow_D_50": 104.7 },
              "rigidPavement": { "high_A_200": 93.7, "medium_B_120": 96.3, "low_C_80": 97.9, "ultraLow_D_50": 99.7 }
            }
          }
        }
      ]
    },
    {
      "model": "G450",
      "variants": [
        {
          "variantName": "Standard",
          "loadPercentageMLG": 45.85, // Note: PDF shows two different load percentages. Using the one for the higher mass. The other is 46.39.
          "tirePressure_mpa": 1.303,
          "mass_kg": { "max": 34019, "min": 22226 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 173.1, "medium_B_120": 214.2, "low_C_80": 245.2, "ultraLow_D_50": 266.5 },
              "rigidPavement": { "high_A_200": 237.4, "medium_B_120": 245.2, "low_C_80": 250.4, "ultraLow_D_50": 255.8 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 105.7, "medium_B_120": 117.4, "low_C_80": 136.6, "ultraLow_D_50": 159.9 },
              "rigidPavement": { "high_A_200": 143.9, "medium_B_120": 150.1, "low_C_80": 154.4, "ultraLow_D_50": 158.8 }
            }
          }
        }
      ]
    },
    {
      "model": "G550",
      "variants": [
        {
          "variantName": "Standard",
          "loadPercentageMLG": 45.51, // Note: PDF shows two different load percentages. Using the one for the higher mass. The other is 46.14.
          "tirePressure_mpa": 1.365,
          "mass_kg": { "max": 41458, "min": 24721 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 207.7, "medium_B_120": 240.4, "low_C_80": 281.5, "ultraLow_D_50": 312.1 },
              "rigidPavement": { "high_A_200": 282.5, "medium_B_120": 292.2, "low_C_80": 298.9, "ultraLow_D_50": 305.2 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 115.3, "medium_B_120": 125.6, "low_C_80": 138.2, "ultraLow_D_50": 161.6 },
              "rigidPavement": { "high_A_200": 153.9, "medium_B_120": 160.9, "low_C_80": 165.9, "ultraLow_D_50": 171 }
            }
          }
        }
      ]
    },
    {
      "model": "G650",
      "variants": [
        {
          "variantName": "Standard",
          "loadPercentageMLG": 45.55, // Note: PDF shows two different load percentages. Using the one for the higher mass. The other is 47.
          "tirePressure_mpa": 1.49,
          "mass_kg": { "max": 47174, "min": 27442 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 335, "medium_B_120": 290, "low_C_80": 255, "ultraLow_D_50": 230 },
              "rigidPavement": { "high_A_200": 340, "medium_B_120": 332, "low_C_80": 325, "ultraLow_D_50": 315 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 168, "medium_B_120": 147, "low_C_80": 138, "ultraLow_D_50": 132 },
              "rigidPavement": { "high_A_200": 190, "medium_B_120": 185, "low_C_80": 178, "ultraLow_D_50": 170 }
            }
          }
        }
      ]
    },
    {
      "model": "GL6000/GL6500",
      "variants": [
        {
          "variantName": "Standard",
          "loadPercentageMLG": 46.01, // Note: PDF shows two different load percentages. Using the one for the higher mass. The other is 47.86.
          "tirePressure_mpa": 1.275,
          "mass_kg": { "max": 45246, "min": 20412 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 210, "medium_B_120": 240, "low_C_80": 280, "ultraLow_D_50": 320 },
              "rigidPavement": { "high_A_200": 290, "medium_B_120": 300, "low_C_80": 310, "ultraLow_D_50": 320 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 90, "medium_B_120": 100, "low_C_80": 100, "ultraLow_D_50": 120 },
              "rigidPavement": { "high_A_200": 120, "medium_B_120": 120, "low_C_80": 130, "ultraLow_D_50": 130 }
            }
          }
        }
      ]
    },
    {
      "model": "MA60/600",
      "variants": [
        {
          "variantName": "Standard",
          "loadPercentageMLG": 46.5,
          "tirePressure_mpa": 0.56,
          "mass_kg": { "max": 21800, "min": 14560 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 60, "medium_B_120": 83, "low_C_80": 99, "ultraLow_D_50": 119 },
              "rigidPavement": { "high_A_200": 89, "medium_B_120": 102, "low_C_80": 111, "ultraLow_D_50": 121 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 39, "medium_B_120": 53, "low_C_80": 61, "ultraLow_D_50": 71 },
              "rigidPavement": { "high_A_200": 51, "medium_B_120": 60, "low_C_80": 67, "ultraLow_D_50": 73 }
            }
          }
        }
      ]
    },
    {
      "model": "Y12F",
      "variants": [
        {
          "variantName": "Standard",
          "loadPercentageMLG": 46.385,
          "tirePressure_mpa": 0.69,
          "mass_kg": { "max": 8450, "min": 4750 },
          "acr": {
            "max": {
              "flexiblePavement": { "high_A_200": 56, "medium_B_120": 66, "low_C_80": 70, "ultraLow_D_50": 73 },
              "rigidPavement": { "high_A_200": 54, "medium_B_120": 58, "low_C_80": 60, "ultraLow_D_50": 62 }
            },
            "min": {
              "flexiblePavement": { "high_A_200": 32, "medium_B_120": 37, "low_C_80": 39, "ultraLow_D_50": 41 },
              "rigidPavement": { "high_A_200": 30, "medium_B_120": 32, "low_C_80": 33, "ultraLow_D_50": 34 }
            }
          }
        }
      ]
    }
  ]
};