Of course. Here is the content from the provided document, formatted into a clean Markdown file.

---

# AIRBUS

## 2. MAXIMUM STRUCTURAL WEIGHTS

- CS 25.25 Subpart B
- CS 25.473 Subpart C
- Air OPS Annex 1
- FAR 25.25 Subpart B
- FAR 25.473 Subpart C
- AC 120-27C

### 2.1. AIRCRAFT WEIGHT DEFINITIONS

* **Manufacturer's Empty Weight (MEW):** The weight of the structure, power plant, furnishings, systems and other items of equipment that are considered an integral part of the aircraft. It is a “dry” weight, and it only includes the fluids contained in closed systems (e.g. hydraulic fluid).
* **Operational Empty Weight (OEW):** The MEW plus the Operator's items, (i.e. flight and cabin crew and their baggage, unusable fuel, engine oil, emergency equipment, toilet chemicals and fluids, galley structure, catering equipment, seats, documents, etc.).
* **Dry Operating Weight (DOW):** The total weight of an aircraft ready for a specific type of operation without all usable fuel and traffic load. The OEW plus items that are specific to the type of flight (i.e. catering, newspapers, pantry equipment, etc.).
* **Zero Fuel Weight (ZFW):** The weight obtained by the addition of the total traffic load (payload, in which are included cargo loads, passengers and passenger bags), and the DOW.
* **Landing Weight (LW):** The weight at landing, at the destination airport. It is equal to the ZFW plus the fuel reserves.
* **Takeoff Weight (TOW):** The weight at takeoff at the departure airport. It is equal to the LW at landing plus the trip fuel (fuel required for the trip), or to the ZFW plus the takeoff fuel (fuel required at the brake release point that includes reserves).

```
TOW = DOW + traffic load + fuel reserves + trip fuel
LW  = DOW + traffic load + fuel reserves
ZFW = DOW + traffic load
```

Illustration A-11 illustrates the different aircraft weights, as defined in the regulations.

> **Illustration A-11: Aircraft Weights**
> This illustration is a stacked bar chart showing the build-up of aircraft weight. Starting from the bottom, the components are:
>
> - **Structure, systems, propulsion:** This constitutes the Manufacturer's Empty Weight (MEW).
> - **Cabin equipment, crews:** Adding these to MEW gives the Operational Empty Weight (OEW).
> - **Catering, newspapers:** Adding these to OEW gives the Dry Operating Weight (DOW).
> - **Total traffic load:** Adding this to DOW gives the Zero Fuel Weight (ZFW).
> - **Fuel reserves:** Adding this to ZFW gives the Landing Weight (LW).
> - **Trip fuel:** Adding this to LW gives the TakeOff Weight (TOW).
> - **Taxi fuel:** Adding this to TOW gives the Taxi Weight.

### 2.2. MAXIMUM STRUCTURAL TAKEOFF WEIGHT (MTOW)

The TOW must never exceed the MTOW. The MTOW is determined during a landing impact with a vertical speed that is equal to -1.83 m/s (-360 ft/min), in accordance with the following:

* In-flight structure resistance criteria,
* Resistance of the landing gear,
* Structure criteria.

**Note:** Depending on the context, MTOW means either:

* The maximum weight limited by performance,
* The maximum weight limited by structure,
* The minimum between both limitations above.

### 2.3. MAXIMUM STRUCTURAL LANDING WEIGHT (MLW)

The LW is limited, with the assumption of a landing impact with a vertical speed equal to -3.05 m/s (-600 ft/min). The limit is the MLW. The landing weight must comply with the following:

```
Actual LW = TOW - Trip Fuel ≤ MLW
or
Actual TOW ≤ MLW + Trip Fuel
```

**Note:** Depending on the context, MLW means either:

* The maximum weight limited by performance,
* The maximum weight limited by structure,
* The minimum between both limitations above.

### 2.4. MAXIMUM ZERO FUEL WEIGHT (MZFW)

Bending moments applied to the wing root, are at a maximum when the quantity of fuel in the wings is at a minimum (see Illustration A-12). During flight, the quantity of fuel in the wings, m_WF, decreases as fuel is burned. As a result, it is necessary to limit the weight when there is no fuel in the tanks. This limited weight is the Maximum Zero Fuel Weight (MZFW).

> **Illustration A-12: Wing Bending Relief Due to Fuel Weight**
> The illustration shows two diagrams of an aircraft's forces.
>
> 1. With fuel in the wings, the upward lift force (L/2 per wing) is counteracted by both the aircraft's weight (mg) centered at the fuselage and the fuel's weight (m_WF*g) in the wings. This fuel weight reduces the bending stress at the wing root.
> 2. Without fuel in the wings, the upward lift force is counteracted only by the aircraft's weight at the fuselage, resulting in a higher bending moment at the wing root.

Therefore, the limitation is defined by:

```
Current ZFW ≤ MZFW
```

The takeoff fuel is the sum of the trip fuel and the fuel reserves. As a result:

```
Current TOW ≤ MZFW + Takeoff Fuel
```

### 2.5. MAXIMUM TAXI WEIGHT (MTW)

The MTW is limited by the stress on the shock absorbers, and possible bending of the landing gear, during turns on the ground.
However, the MTW is usually not a limitation factor, and is defined based on the MTOW, so that:

```
MTW - Taxi Fuel < MTOW
```

### 3. MINIMUM STRUCTURAL WEIGHT

- **CS 25.25 Subpart B**
- **FAR 25.25 Subpart B**

> “(b) Minimum weight. The minimum weight (the lowest weight at which compliance with each applicable requirement of this CS-25 is shown) must be established so that it is not less than
> (1) The lowest weight selected by the applicant;
> (2) The design minimum weight (the lowest weight at which compliance with each structural loading condition of this CS-25 is shown); or
> (3) The lowest weight at which compliance with each applicable flight requirement is shown.”

Usually, the gusts and turbulence loads are part of the criteria considered to determine the minimum structural weight.

### 4. ENVIRONMENTAL ENVELOPE

- **CS 25.1527 Subpart G**
- **FAR 25.1527 Subpart G**

> “The extremes of the ambient air temperature and operating altitude for which operation is allowed, as limited by flight, structural, powerplant, functional, or equipment characteristics, must be established.”

The result of this determination is the environmental envelope, and it includes the pressure altitude and the temperature limits. It is inside the environmental envelope that the aircraft performance is established and the aircraft systems achieve the certification requirements.

The AFM sets minimum and maximum Pressure Altitudes (MIN Zp and MAX Zp) and Temperatures (T_MIN and T_MAX).

> **Illustration A-13: Example of an A320 Environmental Envelope**
> A graph plotting Pressure Altitude (ft) on the Y-axis against OAT (°C) on the X-axis. It shows a polygonal shape representing the certified operating envelope. Key points include a maximum altitude of 39,800 ft, a takeoff and landing envelope at lower altitudes (from -2,000 ft to 9,200 ft) and within a specific temperature range. The ISA (International Standard Atmosphere) line runs diagonally through the envelope for reference.

### 5. ENGINE LIMITATIONS

#### 5.1. THRUST SETTING AND EGT LIMITATIONS

- **CS 25.1521 Subpart G**
- **CS-E 490 and E 800**
- **FAR 25.1521 Subpart G**
- **FAR 33.87 and 33.88**

The main cause of engine thrust limitations is the Exhaust Gas Temperature (EGT) limit.

The maximum thrust available for takeoff is the Takeoff/Go-Around (TOGA) thrust. It is certified for a maximum time of:

* 10 minutes, in the case of One Engine Inoperative (OEI) at takeoff, or
* 5 minutes with All Engines Operative (AEO).

The Maximum Continuous Thrust (MCT) is the maximum thrust that can be used without limitation in flight. It must be selected in the case of engine failure, when TOGA thrust is no longer permitted due to time limitation.

The Climb (CL) thrust is the maximum thrust available during the climb phase to the initial cruise flight level and to higher flight levels.

**Note:** The Takeoff/Go-Around (TOGA) thrust is the maximum thrust available for a Go-Around. The time limits are the same as for takeoff.

### 5.2. TAKEOFF THRUST LIMITATIONS

Illustration A-14 illustrates the influence that the pressure altitude and outside air temperature have on the maximum takeoff thrust, for a specific engine type.

At a specific pressure altitude, the Takeoff/Go-Around (TOGA) thrust remains constant (equal to the flat rated thrust), until the temperature reaches the flat rated temperature or reference temperature (T_ref). Above this reference temperature, the engine thrust is limited by the Exhaust Gas Temperature (EGT). The result is that the available thrust decreases as the temperature increases.

On the other hand, at a specific temperature, any increase in the pressure altitude decreases the available takeoff thrust.

> **Illustration A-14: Engine Thrust VS. Pressure Altitude and Temperature**
> A graph plotting TOGA Thrust on the Y-axis against Temperature (°C) on the X-axis. Three lines represent different pressure altitudes (PA):
>
> - PA = 0 (Blue)
> - PA = 2,000 (Black)
> - PA = 8,000 (Red)
>   Each line shows that thrust is constant ("flat-rated") up to a certain temperature, after which it begins to decrease linearly as temperature further increases. The graph also shows that for any given temperature, thrust decreases as pressure altitude increases.
>
