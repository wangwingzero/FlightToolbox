# AIRBUS

# APPENDIX

## APPENDIX 1: INTERNATIONAL STANDARD ATMOSPHERE (ISA)

### 1.1. OBJECTIVE

It is essential to know the density, pressure and temperature at any point of the atmosphere, in order to determine other parameters that include the aircraft speed or altitude.

To provide a common reference based on a relationship between these variables, ICAO defined a standard mathematical model of the atmosphere to be as realistic as possible.

This standard atmospheric model, referred to as the International Standard Atmosphere, ISA, is used as a reference to compare real atmospheric conditions and the corresponding engine/aircraft performance.

For example, a standard computable atmosphere enables:

* The calibration of measurement instruments so that all instruments provide the same information in the same atmospheric conditions.
* Aircraft and engine performance comparison. Atmospheric inputs in performance software are based on ISA values.

ICAO publishes a Manual of the ICAO Standard Atmosphere (extended to 80 km (262 500 ft)), Doc 7488, Third Edition, 1993, ISBN 92-9194-004-6.

### 1.2. TEMPERATURE MODELING

The following diagram (Illustration A1-1) illustrates the temperature variations in the standard atmosphere:

---

*Getting to Grips with Aircraft Performance*
`<span style="float:right;">`*APPENDIX*
`<span style="display:block; text-align:center;">`219
---

# AIRBUS

[Image: Illustration A1-1: ISA Temperature. A graph showing Temperature (°C) on the x-axis and Altitude (ft and km) on the y-axis. The line starts at +15°C at Sea Level, decreases linearly to -56.5°C at the Tropopause (36,089 ft), and then remains constant at -56.5°C into the Stratosphere. A region labeled "Cruise level of subsonic jet transport" is shown in the Tropopause/Stratosphere boundary.]

The international reference is based on a sea level temperature of 15 °C at a standard pressure of 1013.25 hPa. The standard density of the air at sea level is 1.225 kg/m³.

Temperature decreases with altitude at a constant rate of -6.5 °C / 1 000 m or -1.98 °C / 1 000 ft up to the tropopause. The standard tropopause altitude is 11 000 m or 36 089 ft.
From the tropopause upward, the temperature remains at a constant value of -56.5 °C.

Therefore, the air, that is considered as a perfect gas in the ISA model, has the following characteristics:

* **At Mean Sea Level (MSL):**
  ISA temperature = T0 = +15 °C = 288.15 K
* **Above MSL and below the tropopause (36 089 ft):**
  ISA temperature (°C) = T0 - 1.98 x [Alt(ft)/1000]

For a rapid determination of the standard temperature at a specific altitude, the following approximate formula can be used:
ISA temperature (°C) = 15 - 2 x [Alt(ft)/1000]

* **Above the tropopause (36 089 ft):**
  ISA temperature = -56.5 °C = 216.65 K

The ISA model is used as a reference to compare real atmospheric conditions and the corresponding engine/aircraft performance. The atmospheric conditions will therefore be defined as ISA +/- ΔISA at a given flight level.

---

*Getting to Grips with Aircraft Performance*
`<span style="float:right;">`*APPENDIX*
`<span style="display:block; text-align:center;">`220
---

# AIRBUS

**Example:**
Let us consider an aircraft in flight in the following conditions:
Altitude = 33 000 ft
Current Temperature = -41 °C

The standard temperature at 33 000 ft is: ISA = 15 - 2 x 33 = -51 °C, and the current temperature is -41 °C, i.e. 10 °C above the standard.

Result: The atmospheric flight condition corresponds to ISA+10.

### 1.3. PRESSURE MODELING

To calculate the standard pressure P at a specific altitude, the following assumptions are used:

* Temperature is standard.
* Air is a perfect gas.

The altitude obtained from the measurement of the static pressure is referred to as pressure altitude (Zp), and a standard (ISA) table can be set up (table A1-1).

[Image: Illustration A1-2: Pressure Altitude variation with Pressure. A graph showing Pressure P (hPa) on the x-axis and Pressure Altitude Zp (ft and km) on the y-axis. The curve shows that as altitude increases, pressure decreases non-linearly, starting from 1013.25 hPa at sea level.]

---

*Getting to Grips with Aircraft Performance*
`<span style="float:right;">`*APPENDIX*
`<span style="display:block; text-align:center;">`221
---

# AIRBUS

| Pressure (hPA)                                                      | Pressure Altitude (ZP) (ft) | Pressure Altitude (ZP) (m) | FL = ZP/100 |
| :------------------------------------------------------------------ | :-------------------------- | :------------------------- | :---------- |
| 200                                                                 | 38 661                      | 11 784                     | 390         |
| 250                                                                 | 34 000                      | 10 363                     | 340         |
| 300                                                                 | 30 066                      | 9 164                      | 300         |
| 500                                                                 | 18 287                      | 5 574                      | 180         |
| 850                                                                 | 4 813                       | 1 467                      | 50          |
| 1 013                                                               | 0                           | 0                          | 0           |
| **Table A1-1: Example of Tabulated Pressure Altitude Values** |                             |                            |             |

With the assumption of a volume of air in static equilibrium, the aerostatic equation relates a change in height to a change in pressure as follows:

`dP = -ρgdh`

**With**

- ρ = air density at an altitude h
- g = gravity acceleration (9.80665 m/s²)
- dh = height of the volume unit
- dP = pressure variation on dh

The temperature, pressure and density are related by the equation for a perfect gas:

`P/ρ = RT`

**With** R = universal gas constant (287.053 J/kg/K)

**Therefore:**

* **At Mean Sea Level (MSL):**
  P₀ = 1013.25 hPa
* **Above MSL and below the tropopause (36 089 ft):**

  `P = P₀ * (1 - (α/T₀) * h)^(g₀/αR)`

**With**

- P₀ = 1 013.25 hPa (standard pressure at sea level)
- T₀ = 288.15 K (standard temperature at sea level)
- α = 0.0065 °C/m
- g₀ = 9.80665 m/s²
- R = 287.053 J/kg/K
- h = Altitude (m)

---

*Getting to Grips with Aircraft Performance*
`<span style="float:right;">`*APPENDIX*
`<span style="display:block; text-align:center;">`222
---

# AIRBUS

**Note:** For low altitudes, a reduction of 1 hPa in the pressure approximately corresponds to a pressure altitude increase of 28 ft.

* **Above the tropopause (36 089 ft):**

  `P = P₁ * e^((-g₀(h-h₁))/RT₁)`

**With**

- P₁ = 226.32 hPa (standard pressure at 11 000 m)
- T₁ = 216.65 K (standard temperature at 11 000 m)
- h₁ = 11 000 m
- g₀ = 9.80665 m/s²
- R = 287.053 J/kg/K
- h = Altitude (m)

### 1.4. DENSITY MODELING

To calculate the standard density ρ at a specific altitude, the air is considered to be a perfect gas. Therefore, at a specific altitude, the standard density ρ (kg/m³) can be obtained as follows:

`ρ = P / (RT)`

**with**

- R = Universal gas constant (287.053 J/kg/K)
- P in Pascal
- T in Kelvin

**At Mean Sea Level (MSL):**
ρ₀ = 1.225 kg/m³

---

*Getting to Grips with Aircraft Performance*
`<span style="float:right;">`*APPENDIX*
`<span style="display:block; text-align:center;">`223
---

# AIRBUS

### 1.5. ISA TABLE

The ISA parameters (temperature, pressure, density) can be provided as a function of the altitude in a table, as shown in Table A1-2:

| ALTITUDE (ft)                                                 | TEMPERATURE (°C) | PRESSURE (hPa) | PRESSURE (PSI) | PRESSURE (In.Hg) | PRESSURE RATIO δ = Ρ/Ρο | DENSITY RATIO σ = ρ/ρο | Speed of sound (kt) | ALTITUDE (meters) |
| :------------------------------------------------------------ | :---------------- | :------------- | :------------- | :--------------- | :-------------------------- | :------------------------- | :------------------ | :---------------- |
| 40 000                                                        | -56.5             | 188            | 2.72           | 5.54             | 0.1851                      | 0.2462                     | 573                 | 12 192            |
| 39 000                                                        | -56.5             | 197            | 2.86           | 5.81             | 0.1942                      | 0.2583                     | 573                 | 11 887            |
| 38 000                                                        | -56.5             | 206            | 2.99           | 6.10             | 0.2038                      | 0.2710                     | 573                 | 11 582            |
| 37 000                                                        | -56.5             | 217            | 3.14           | 6.40             | 0.2138                      | 0.2844                     | 573                 | 11 278            |
| 36 000                                                        | -56.3             | 227            | 3.30           | 6.71             | 0.2243                      | 0.2981                     | 573                 | 10 973            |
| 35 000                                                        | -54.3             | 238            | 3.46           | 7.04             | 0.2353                      | 0.3099                     | 576                 | 10 668            |
| 34 000                                                        | -52.4             | 250            | 3.63           | 7.38             | 0.2467                      | 0.3220                     | 579                 | 10 363            |
| 33 000                                                        | -50.4             | 262            | 3.80           | 7.74             | 0.2586                      | 0.3345                     | 581                 | 10 058            |
| 32 000                                                        | -48.4             | 274            | 3.98           | 8.11             | 0.2709                      | 0.3473                     | 584                 | 9 754             |
| 31 000                                                        | -46.4             | 287            | 4.17           | 8.49             | 0.2837                      | 0.3605                     | 586                 | 9 449             |
| 30 000                                                        | -44.4             | 301            | 4.36           | 8.89             | 0.2970                      | 0.3741                     | 589                 | 9 144             |
| 29 000                                                        | -42.5             | 315            | 4.57           | 9.30             | 0.3107                      | 0.3881                     | 591                 | 8 839             |
| 28 000                                                        | -40.5             | 329            | 4.78           | 9.73             | 0.3250                      | 0.4025                     | 594                 | 8 534             |
| 27 000                                                        | -38.5             | 344            | 4.99           | 10.17            | 0.3398                      | 0.4173                     | 597                 | 8 230             |
| 26 000                                                        | -36.5             | 360            | 5.22           | 10.63            | 0.3552                      | 0.4325                     | 599                 | 7 925             |
| 25 000                                                        | -34.5             | 376            | 5.45           | 11.10            | 0.3711                      | 0.4481                     | 602                 | 7 620             |
| 24 000                                                        | -32.5             | 393            | 5.70           | 11.60            | 0.3876                      | 0.4642                     | 604                 | 7 315             |
| 23 000                                                        | -30.6             | 410            | 5.95           | 12.11            | 0.4046                      | 0.4806                     | 607                 | 7 010             |
| 22 000                                                        | -28.6             | 428            | 6.21           | 12.64            | 0.4223                      | 0.4976                     | 609                 | 6 706             |
| 21 000                                                        | -26.6             | 446            | 6.47           | 13.18            | 0.4406                      | 0.5150                     | 611                 | 6 401             |
| 20 000                                                        | -24.6             | 466            | 6.75           | 13.75            | 0.4595                      | 0.5328                     | 614                 | 6 096             |
| 19 000                                                        | -22.6             | 485            | 7.04           | 14.34            | 0.4791                      | 0.5511                     | 616                 | 5 791             |
| 18 000                                                        | -20.7             | 506            | 7.34           | 14.94            | 0.4994                      | 0.5699                     | 619                 | 5 406             |
| 17 000                                                        | -18.7             | 527            | 7.65           | 15.57            | 0.5203                      | 0.5892                     | 621                 | 5 182             |
| 16 000                                                        | -16.7             | 549            | 7.97           | 16.22            | 0.5420                      | 0.6090                     | 624                 | 4 877             |
| 15 000                                                        | -14.7             | 572            | 8.29           | 16.89            | 0.5643                      | 0.6292                     | 626                 | 4 572             |
| 14 000                                                        | -12.7             | 595            | 8.63           | 17.58            | 0.5875                      | 0.6500                     | 628                 | 4 267             |
| 13 000                                                        | -10.8             | 619            | 8.99           | 18.29            | 0.6113                      | 0.6713                     | 631                 | 3 962             |
| 12 000                                                        | -8.8              | 644            | 9.35           | 19.03            | 0.6360                      | 0.6932                     | 633                 | 3 658             |
| 11 000                                                        | -6.8              | 670            | 9.72           | 19.79            | 0.6614                      | 0.7156                     | 636                 | 3 353             |
| 10 000                                                        | -4.8              | 697            | 10.10          | 20.58            | 0.6877                      | 0.7385                     | 638                 | 3 048             |
| 9 000                                                         | -2.8              | 724            | 10.51          | 21.39            | 0.7148                      | 0.7620                     | 640                 | 2 743             |
| 8 000                                                         | -0.8              | 753            | 10.92          | 22.22            | 0.7428                      | 0.7860                     | 643                 | 2 438             |
| 7 000                                                         | +1.1              | 782            | 11.34          | 23.09            | 0.7716                      | 0.8106                     | 645                 | 2 134             |
| 6 000                                                         | +3.1              | 812            | 11.78          | 23.98            | 0.8014                      | 0.8359                     | 647                 | 1 829             |
| 5 000                                                         | +5.1              | 843            | 12.23          | 24.90            | 0.8320                      | 0.8617                     | 650                 | 1 524             |
| 4 000                                                         | +7.1              | 875            | 12.69          | 25.84            | 0.8637                      | 0.8881                     | 652                 | 1 219             |
| 3 000                                                         | +9.1              | 908            | 13.17          | 26.82            | 0.8962                      | 0.9151                     | 654                 | 914               |
| 2 000                                                         | +11.0             | 942            | 13.67          | 27.82            | 0.9298                      | 0.9428                     | 656                 | 610               |
| 1 000                                                         | +13.0             | 977            | 14.17          | 28.86            | 0.9644                      | 0.9711                     | 659                 | 305               |
| 0                                                             | +15.0             | 1013           | 14.70          | 29.92            | 1.0000                      | 1.0000                     | 661                 | 0                 |
| -1 000                                                        | +17.0             | 1050           | 15.23          | 31.02            | 1.0366                      | 1.0295                     | 664                 | -305              |
| **Table A1-2: International Standard Atmosphere (ISA)** |                   |                |                |                  |                             |                            |                     |                   |

---

*Getting to Grips with Aircraft Performance*
`<span style="float:right;">`*APPENDIX*
`<span style="display:block; text-align:center;">`224
---
