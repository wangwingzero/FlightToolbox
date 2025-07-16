Of course. Here is the content from the provided document, formatted into a clean Markdown file.

---

# AIRBUS

## APPENDIX 3: ALTIMETRY

### 1.1. PRESSURE ALTITUDE

#### 1.1.1. Definition

Pressure altitude is a barometric measurement changed into an altitude via the ISA model.

#### 1.1.2. How is it measured?

On Airbus aircraft, the static pressure measurement is achieved through dedicated probes.

> **Illustration A3-1: Example of pressure probes location on aircraft**
> A close-up photo of the nose of an Airbus A321neo. Red boxes highlight the location of the static pressure probes on the side of the fuselage.

#### 1.1.3. Where is it displayed?

The pressure altitude is displayed by the altimeter. All the indications associated with altitude are permanently displayed on the right hand side of the PFDs.

> **Illustration A3-2: Altitude scale location**
> An image of the Primary Flight Display (PFD) shows the altitude tape on the right-hand side. It displays the current altitude, the target altitude, and the vertical speed.

#### 1.1.4. Altimetry setting

The objective of altimetry is to ensure vertical margins, above ground and between aircraft. In the cockpit, the altimeter displays a vertical distance between the static pressure measured and a reference pressure.

Under the assumption of ISA temperature, the Indicated Altitude (IA) is the vertical distance between the following two pressures (Illustration A3-3):

* The ambient pressure (current location of the aircraft)
* A reference pressure, corresponding to a pressure selected by the pilot through the pressure setting knob of the altimeter.

> **Illustration A3-3: Indicated altitude (IA)**
> A graph plots Pressure Altitude (Zp) against Pressure (p). It shows that Indicated Altitude is the difference in pressure altitude between the ambient pressure (Zp_amb) and the set reference pressure (Zp_set).

The altimetry setting defines the reference pressure that will define the reference altitude (Zp = 0 ft). The use of an identical reference by all aircraft enables to ensure their vertical separation. The pressure setting and the indicated altitude move in the same direction: Any increase in the pressure setting results in an increase in the corresponding Indicated Altitude.

Several operational settings for pressure can be selected through the pressure setting knob of the altimeter (Illustration A3-4):

* **The QFE** is the pressure measured at the airport reference point. With the QFE setting, the altimeter indicates the height above the airport or Above Airport Level (AAL), provided the temperature is standard.

  * On ground, at the related airport, the Indicated Altitude is 0 ft.

  *Note: The QFE setting is only relevant next to the airport. It is less and less used in commercial aviation and is often just an option on Airbus aircraft.*
* **The QNH** is the pressure measured at the official airport elevation, set at sea level by the ISA Model. With the QNH setting, the altimeter indicates the Altitude, or height Above the Mean Sea Level (AMSL), provided the temperature is standard.

  * At the airport level in ISA conditions, the Indicated altitude is the topographic altitude of the terrain.
  * At sea level, the Indicated Altitude is 0 ft.

  *Note: The QNH setting is obtained by the correction of a measured QFE to the sea level pressure. It is the reference for low altitude, takeoff and landing operations.*
* **The Standard setting** is the pressure measured when the altimeter is set at 1013 hPa. With the standard setting, the altimeter indicates the pressure altitude of the aircraft. As a reminder, the pressure altitude is the altitude above the 1013 hPa isobaric surface (provided temperature is standard).

> **Illustration A3-4: QNH and Pressure Altitude**
> This diagram illustrates the different altimeter references. An aircraft is shown flying. Over the sea, its altimeter is on the QNH setting, showing Altitude (AMSL). Over the airport, it could use the QFE setting to show Height above the airport. High in the air, it uses the Standard setting (1013.25 hPa) to indicate a Flight Level.

*Note: The objective of the standard setting is to have the same reference for all aircraft regardless of where they come from. With the same reference, all aircraft have the same indicated altitude when they cross the same point. It provides a vertical separation between aircraft and also removes the local pressure variations throughout the flight.*

After takeoff (usually performed with QNH setting), the flight crew selects the standard setting when a specific altitude is exceeded, referred to as **Transition Altitude**.
Before landing, the flight crew selects QNH (or QFE) setting when below the **Transition Level**.
The layer between the transition altitude and the transition level is called the **transition layer** (Illustration A3-5).

> **Illustration A3-5: Transition Altitude and Transition Level**
> A diagram shows a flight path. The aircraft takes off with local QNH set. As it climbs past the Transition Altitude, the crew sets the standard pressure (1013.25 or STD). On descent, as it passes the Transition Level, the crew sets the local QNH again.

The transition altitude is usually provided on the Standard Instrument Departure (SID) charts, however, the transition level is usually given by the Air Traffic Control (ATC).

#### 1.1.5. Where is it set/checked?

The altimeter setting (also referred to as baro reference) is controlled via a knob and its outer ring. They are on the external part of the EFIS control panel.

> **Illustration A3-6: Baro reference knob and window location**
> An image of an aircraft cockpit with a yellow box highlighting the Electronic Flight Instrument System (EFIS) control panel, where the barometric reference knob is located.

The baro reference is displayed on the corresponding window and on the PFD, below the altitude scale.

> **Illustration A3-7: Baro reference location on PFD**
> An image of the PFD with a red box highlighting the barometric reference display (e.g., "QNH 1013") at the bottom of the altitude tape.

#### 1.1.6. Flight Levels

The Flight Level is the aircraft altitude when in standard setting. It corresponds to the Indicated Altitude in ft divided by 100, provided the standard setting is selected.

```
      Zp
FL = ---
     100
```

As an example, at 30 000 ft with standard setting selected, the Flight Level is FL300.

The Transition Level is the lowest flight level above the transition altitude.

#### 1.1.7. True altitude

The True Altitude is the geometric height above the Mean Sea Level (MSL). The true altitude of an aircraft is not usually the same as the Indicated Altitude. This is mainly because the temperature is different from ISA.

#### 1.1.8. Temperature Correction

Temperature has a significant influence on separation between isobaric surfaces: altimetric ISA indications can be affected. In addition, the ISA law considers that T = 15 °C at sea level, but this is not usually the case. As a result, a correction of the ISA table is necessary, to fit with the conditions of the day.

> **Illustration A3-8: Example of variation of separation between Isobaric surfaces with temperature**
> This diagram shows that the vertical distance between two isobaric surfaces is smaller in cold air (132 ft at 0°C) and larger in warm air (147 ft at 30°C) compared to standard conditions (140 ft at 15°C).

The correction between True Altitude and Indicated Altitude can be defined as follows:

```
ΔTA = ΔIA * (T_ISA+ΔT / T_ISA)
```

With:

* **ΔTA** = True altitude correction
* **IA** = Indicated altitude
* **T_ISA+ΔT** = Current temperature (in Kelvin)
* **T_ISA** = Standard temperature (in Kelvin)
* **ΔT** = Temperature correction (OAT - ISA)

---

* When it is hot (OAT > ISA), True Altitude is higher than Indicated Altitude.
* When it is cold (OAT < ISA), True Altitude is lower than Indicated Altitude.
* The effect of temperature on Indicated Altitude increases with altitude.

> **Illustration A3-10: Temperature effect on True Altitude, for a constant Indicated Altitude**
> This illustrates the saying "From high to low, look out below". In three scenarios, the altimeter shows the same constant Indicated Altitude.
>
> 1. **ISA + ΔISA (Hot air):** True Altitude is greater than Indicated Altitude (TA > IA). The aircraft is higher than it indicates.
> 2. **ISA (Standard):** True Altitude equals Indicated Altitude (TA = IA).
> 3. **ISA - ΔISA (Cold air):** True Altitude is less than Indicated Altitude (TA < IA). The aircraft is lower than it indicates, posing a risk of collision with terrain.

#### Study case: Sion airport in Switzerland.

During an ILS approach on Runway 26, it is required to overfly specific waypoints at defined geometrical altitudes, regardless of the temperature conditions. For example, at 17 Nm from the glide antenna, the aircraft must be at a true altitude of 10 500 ft above mean sea level. The glide slope intersection is at 16,000 ft.

The following provides the indicated altitude values to maintain the required true altitude for different temperature conditions:

**When temperature is ISA - 10:**

* True altitude: 16 000 ft | 10 500 ft
* Indicated altitude: 16 600 ft | 10 900 ft
* Δ altitude: 600 ft | 400 ft

**When temperature is ISA - 20:**

* True altitude: 16 000 ft | 10 500 ft
* Indicated altitude: 17 300 ft | 11 350 ft
* Δ altitude: 1 300 ft | 850 ft

**Result:**

* When the temperature moves away from the standard, altimetric error increases.
* The altimetric error induced by temperature is proportional to altitude.

> **Illustration A3-11: Sion Airport Chart**
> An IFR approach chart for Sion (LSGS/SIR) ILS RWY 25. It is a complex navigational chart showing waypoints, altitudes, frequencies, and the flight path for the instrument approach.

> **Illustration A3-12: Temperature Effect on Indicated Altitude (Table for temperature below ISA)**
> The altimeter error may be significant under conditions of extremely cold temperatures. For temperature deviation from ISA use the correction table to read the corrected altitude at the DME fixes.
>
> | ALT    |  ISA  | ISA +20° Altimeter Reading | ISA +10° Altimeter Reading | ISA -10° Altimeter Reading | ISA -20° Altimeter Reading |
> | :----- | :---: | :-------------------------- | :-------------------------- | :-------------------------- | :-------------------------- |
> | 16000' | -17° | OAT +3° 14920'             | OAT -7° 15450'             | OAT -27° 16600'            | OAT -37° 17300'            |
> | 13100' | -12° | OAT +8° 12200'             | OAT -2° 12650'             | OAT -22° 13600'            | OAT -32° 14170'            |
> | 10500' | -6° | OAT +14° 9800'             | OAT +4° 10150'             | OAT -16° 10900'            | OAT -26° 11350'            |
> | 7400'  |  0°  | OAT +20° 6920'             | OAT +10° 7180'             | OAT -10° 7670'             | OAT -20° 7950'             |
> | 6000'  | +3° | OAT +23° 5650'             | OAT +13° 5820'             | OAT -7° 6210'              | OAT -17° 6450'             |

### 1.2. RADIO HEIGHT

#### 1.2.1. Definition

The source of Radio Height is the radio altimeter, an antenna installed on the underside of the aircraft rear fuselage. The radio altimeter transmits radio signals to the ground and the time to receive the return signal provides the means to determine the height.

> **Illustration A3-13: Radio height principle**
> A diagram shows an aircraft with a transmitter sending a signal to the ground and a receiver picking up the bounced signal. The time difference is used to calculate the Radio Height, which is the direct geometric height between the aircraft and the ground.

The RH indicates the geometric height between the aircraft and the ground.

#### 1.2.2. The Use of Radio Height

The radio altitude is more accurate than the pressure altitude, but it cannot be used for vertical separation because there is no common reference. It is used for landing, particularly for precision approaches.

#### 1.2.3. Where is it displayed?

The RH is displayed on the PFD (below the attitude scale) when the aircraft is at or below 2 500 ft above the ground.

> **Illustration A3-14: Radio Height location on PFD**
> A picture of the PFD with a box highlighting the area below the artificial horizon where the radio height is digitally displayed.
>
