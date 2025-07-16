
---

# AIRBUS

## APPENDIX 4: SPEEDS

### 1.1. DEFINITIONS

To operate an aircraft, the flight crew use different types of speed. There are speeds to manage the flight while margins from critical areas are maintained, and there are other speeds that are mainly used for navigational and performance optimization purposes.

#### 1.1.1. Calibrated AirSpeed (CAS)

The Calibrated AirSpeed (CAS) is obtained from the dynamic pressure q (or ΔP) that is a difference between the impact pressure Pᵢ (measured by the pitot probes) and the static pressure Pₛ (measured by the static probes). The takeoff and landing performance calculations are performed in CAS.

```
CAS = f(Pᵢ – Pₛ) = f(q)
```

Flight at a constant CAS during a climb phase enables the aerodynamic effect to remain the same as at sea level.

#### 1.1.2. Indicated Air Speed (IAS)

The Indicated Air Speed (IAS) is the speed displayed by the airspeed indicator. The flight crew use it for low speed operations, that is why operational speeds (e.g. V₁, Vʀ, V₂, etc...), are in IAS.
If the pressure measurement were perfect, the IAS would be equal to the CAS. However, some errors need to be corrected due to various parameters that include aircraft angle of attack, slats/flaps configuration, ground effect etc.
The IAS is the CAS plus a correction called “instrument error” (Kᵢ). CAS to IAS calibration is certified and available in the AFM.

```
IAS = CAS + Kᵢ
```

#### 1.1.3. True Air Speed (TAS)

The True Air Speed (TAS) is the speed of the aircraft in the airflow (general definition of a mobile speed).

```
      Air distance
TAS = ------------
         Time
```

The TAS can be computed from the CAS, with the use of the air density (ρ) ratio and a compressibility correction (K).

```latex
      ┌── p₀
TAS = √ │── * K * CAS
      └── p
```

The TAS is used for flight mechanics (e.g. lift determination) and for the computation of the Ground Speed (GS).

#### 1.1.4. Ground Speed (GS)

The Ground Speed (GS) is the aircraft speed in a ground reference system that is fixed. It is equal to the TAS corrected for the wind component (Illustration A10). The aircraft computes the GS with the use of the inertial and GPS data.

```
Ground Speed = True Air Speed + Wind Component
```

> **Illustration A4-1: Ground Speed and Drift Angle**
> This illustration shows a vector diagram of an aircraft in flight.
>
> - The **True Air Speed (TAS)** vector points in the direction the aircraft's nose is pointing.
> - The **Wind** vector points from the tail of the TAS vector in the direction the wind is blowing.
> - The **Ground Speed (GS)** vector is the resultant vector, pointing from the tail of the TAS vector to the head of the Wind vector. It represents the aircraft's actual path over the ground.
> - The **Drift Angle (DA)** is the angle between the TAS vector and the GS vector.

The GS is used for navigation calculations because the flight routes always refer to the ground.

```
Ground Distance = GS x Time
```

#### 1.1.5. Mach Number (M)

The Mach Number (M) is a comparison between the TAS and the sound velocity. It is used as a cruise control parameter.

```
      TAS
M =   ---
       a
```

With:

- **TAS** = True Air Speed in knots
- **a** = The sound velocity at the flight altitude in knots

The sound velocity in m/s is deduced from the following:

```latex
a = √γRT
```

With:

- **γ** = 1.4
- **R** = 287 J/kg/K
- **T** = SAT = ambient temperature in Kelvin

### 1.2. TAS VARIATION

The following graph (Illustration A11) illustrates the TAS variation as a function of the pressure altitude for a typical climb of a subsonic aircraft:

* Initially constant CAS 250kt till FL100
* Acceleration
* Constant CAS 300 kt up to the crossover altitude
* Constant Mach (M0.78).

> **Illustration A4-2: Blue line: Variations of True Air Speed – Climb profile 300 kt / M0.78**
> This graph plots Altitude on the Y-axis against True Air Speed (TAS) on the X-axis.
>
> - A yellow curve shows that for a **Constant CAS**, TAS increases with altitude.
> - A light blue curve shows that for a **Constant Mach number**, TAS decreases with altitude.
> - A bold blue line shows a typical climb profile: It follows the constant CAS curve, then accelerates, then follows a higher constant CAS curve until it intersects the constant Mach curve at the **Crossover altitude**. Above this altitude, the climb continues along the constant Mach curve.
> - The **Tropopause altitude** (36,089 ft) is also marked.

The altitude at which the CAS and Mach correspond to the same TAS is called the **crossover altitude**. The curves for constant CAS and constant Mach intersect at this point. The crossover altitude value is different for each couple (CAS, Mach). Above the crossover altitude, the Mach number becomes the reference speed.

### 1.3. WHERE IS IT DISPLAYED?

The IAS is displayed on the speed scale of the PFD.
The Mach number is displayed below the speed scale of the PFD.
The GS and TAS are displayed on the top left of the Navigation Display (ND).

> **Illustration A4-3: Speeds displayed on the PFD**
> The image displays an aircraft's Primary Flight Display (PFD) on the left and Navigation Display (ND) on the right.
>
> - On the PFD, callouts point to the **IAS** on the vertical speed tape and the **MACH** number displayed numerically below it.
> - On the ND, callouts point to the **GROUND SPEED (GS)** and **TRUE AIR SPEED (TAS)** displayed numerically at the top left corner.

### 1.4. SUMMARY

- The **TAS** is the speed used for flight mechanics (L = ½ S . ρ . TAS² . Cₗ).
- The **GS** is the speed used for navigation.
- The **CAS (or IAS)** is the speed used for low speed flight phases and for certification (e.g. Stall speeds).
- The **MACH** is the speed for high speed flight phases; it enables cruise speed optimization.

---

## APPENDIX 5: FLIGHT MECHANICS

For a flight at constant speed in level flight, the engine thrust must balance the drag force.

As a general rule, when engine thrust is higher than drag, the aircraft can use this extra thrust to accelerate and/or climb. Contrary to this, when the thrust is not sufficient enough to compensate for drag, the aircraft must decelerate and/or descend.

In flight, four forces are applied to an aircraft: thrust, drag, lift and weight. If the aircraft is in steady level flight, as a first approximation, the following balance is obtained (Illustration A12):

* The thrust for steady level flight (T) is equal to drag (D = ½ ρ S V² Cᴅ).
* Weight (mg) is equal to lift (L = ½ ρ S V² Cₗ).

> **Illustration A5-1: Balance of Forces for Steady Level Flight**
> This illustration shows a side view of an A320 aircraft. Four arrows represent the primary forces in steady, level flight:
>
> - **Lift** points upward.
> - **Weight** points downward.
> - **Thrust** points forward.
> - **Drag** points backward.
>   In this state, Lift = Weight and Thrust = Drag.

### 1.1. STANDARD LIFT EQUATION

```
Weight = mg = ½ ρ S (TAS)² Cₗ    (1)
```

With:

- **m** = Aircraft mass
- **g** = Gravitational acceleration
- **ρ** = Air density
- **S** = Wing area
- **Cₗ** = Lift coefficient

The lift coefficient, Cₗ, is a function of the angle of attack (α), the Mach number (M), and the aircraft configuration.

### 1.2. STANDARD DRAG EQUATION

```
Thrust = ½ ρ S (TAS)² Cᴅ
```

With Cᴅ = Drag coefficient. The drag coefficient, Cᴅ, is a function of the angle of attack (α), the Mach number (M) and the aircraft configuration.

### 1.3. EQUATIONS AS A FUNCTION OF THE MACH NUMBER

Lift and drag equations may be expressed as a function of the Mach number M. As a result, the equations are:

```
Weight = 0.7 Pₛ S M² Cₗ
Thrust = 0.7 Pₛ S M² Cᴅ
```

With Pₛ = Static Pressure.

### 1.4. EQUATIONS IN CLIMB AND DESCENT

> **Illustration A5-2 & A5-3: Balance of Forces in Climb and Descent**
> These diagrams show the forces on an aircraft during a climb and descent, respectively.
>
> - **Forces:** Lift (perpendicular to flight path), Drag (parallel to flight path, opposing motion), Thrust (along aircraft axis), Weight (vertically down).
> - **Axes:** Horizontal axis, Aerodynamic axis (flight path), Aircraft axis.
> - **Angles:**
>   - **α (Angle of Attack, AoA):** Angle between Aircraft axis and Aerodynamic axis.
>   - **γ (Climb/Descent Gradient):** Angle between Horizontal axis and Aerodynamic axis.
>   - **θ (Aircraft attitude/pitch angle):** Angle between Horizontal axis and Aircraft axis.
>   - **θ = α + γ**

* **The angle of attack (α)** is the angle between the aircraft axis and the aerodynamic axis (speed vector axis tangent to the flight path).
* **The climb/descent gradient (γ)** is the angle between the horizontal axis and the aerodynamic axis.
* **The aircraft attitude (θ)** is the angle between the aircraft axis and the horizontal axis (in a ground reference system).
* **The rate of climb (RC)/rate of descent (RD)** is the vertical component of the speed of the aircraft. RC and RD are defined in ft per minute. RC is positive and RD is negative.

During climb or descent at constant speed, the balance of forces is reached. Along the aerodynamic axis, this balance can be defined as:

```
(1)  Thrust cosα = Drag + Weight sinγ
```

The balance along the vertical axis, becomes:

```
(2)  Lift = Weight cosγ
```

#### 1.4.1. Climb/Descent Gradient (γ)

The climb/descent gradient (γ) and the angle of attack (α) are usually small and can be neglected so that:
`sinγ ≈ tanγ ≈ γ (in radian)`
`cosγ ≈ 1 and cosα ≈ 1`

As a result:

```
(3)  Thrust = Drag + Weight γ
(4)  Lift = Weight
```

From equation (3), `Thrust - Drag = Weight γ`. Then:

```latex
(5)  γ_rad = (Thrust - Drag) / Weight
```

With the use of L/D (the Lift-to-Drag ratio), the climb angle becomes:

```latex
(6)  γ_rad = (Thrust / Weight) - (1 / (L/D))
```

That gives, in percent:

```latex
(7)  γ(%) = 100 * [ (Thrust / Weight) - (1 / (L/D)) ]
```

Descent is performed at the Flight Idle thrust (i.e. at a thrust near zero). As a result, in descent:

```latex
(6 for descent)  γ_rad = -1 / (L/D)
```

That gives, in percent:

```latex
(7 for descent)  γ(%) = -100 / (L/D)
```

#### 1.4.2. Rate of Climb (RC)/ Rate of Descent (RD)

The Rate of Climb (RC)/Rate of Descent (RD) corresponds to the vertical speed of the aircraft. As a result:

```
(8)  RC = TAS sinγ ≈ TAS γ
     RD = TAS sinγ ≈ TAS γ
```

Therefore:

```latex
(9)  RC = TAS * (Thrust - Drag) / Weight
     RD = -TAS * (Drag / Weight)   or   RD = -TAS / (L/D)
```

**Summary:**

- At a fixed aircraft weight, the **rate of climb is maximum** when **TAS x (Thrust - Drag)** is maximum. In terms of power, the rate of climb is maximum when (P_thrust - P_drag) is maximum.
- At a fixed aircraft weight, the **rate of descent is minimum** when **TAS x Drag** is minimum.

### 1.5. SPEED POLAR

#### 1.5.1. Required Thrust

To fly at a constant level and constant speed, the thrust must balance the drag. As a result, drag can be considered as the thrust required to maintain a constant flight level and a constant speed. The Speed Polar Curve enables to identify the variation of the required thrust, as a function of the cruise speed and angle of attack.

> **Illustration A5-4: Required Thrust**
> This graph plots Thrust vs. Speed (V). It shows the characteristic U-shaped "thrust required" curve (or drag curve). Key points are marked along the curve corresponding to different angles of attack (α), including α_stall (high thrust, low speed), α_CL MAX, and α_L/D MAX (the bottom of the curve, minimum thrust required).

#### 1.5.2. Required Thrust and Available Thrust

At a fixed altitude, temperature, weight and thrust setting, the engines produce a specific amount of Thrust available (Ta).

> **Illustration A5-5: Required Thrust and Available Thrust**
> This graph plots Thrust vs. Speed (V). It overlays the U-shaped **T_r (Thrust required)** curve with a nearly horizontal line representing **T_a (Thrust available)**. The two curves intersect at two points, creating two possible speeds for steady level flight.

To maintain level flight, the thrust available must be equal to the thrust required at a specific cruise speed. As displayed in the Illustration A5-5, two possible speeds can be used to maintain level flight: a “stable” point and an “unstable” point.

Climb is only possible when the available thrust is higher than the required thrust (excess of thrust).

* The **climb angle (γ)** is proportional to the difference between the available thrust and the required thrust.
* The **rate of climb (RC)** is proportional to the difference between the available thrust and the required thrust. In addition, as RC = TAS γ, the maximum rate of climb is obtained for a TAS higher than Green Dot (when dRC/dTAS = 0).

> **Illustration A5-6: Thrust Curves and Speed Polar for Climb**
> A three-part graph showing variations against TAS for a specific Weight, Temp, and FL.
>
> 1. **Thrust vs TAS:** Shows the T_Required (drag) curve and the T_Available curve. The maximum difference (T_a - T_r)_max is highlighted.
> 2. **Climb Gradient (γ) vs TAS:** Shows a curve peaking at γ_max. This peak corresponds to the speed for L/D_max (minimum drag/thrust required), also known as Green Dot speed.
> 3. **Rate of Climb (RC) vs TAS:** Shows a curve peaking at RC_max. This peak occurs at a higher speed than the peak for γ_max.

> **Illustration A5-7: Drag Curve and Speed Polar for Descent**
> A three-part graph showing variations against TAS for a specific Weight, Temp, and FL during descent.
>
> 1. **Drag vs TAS:** Shows the U-shaped drag curve, with the minimum point labeled Drag_min. The point for (TAS * Drag)_min is also noted at a lower speed.
> 2. **Descent Gradient (γ) vs TAS:** Shows an inverted U-shaped curve, where the minimum descent gradient (γ_min) occurs at the speed for L/D_max (or Drag_min).
> 3. **Rate of Descent (RD) vs TAS:** Shows a curve where the minimum rate of descent (RD_min) occurs at a speed lower than the speed for minimum descent gradient. This corresponds to the speed for (TAS * Drag)_min.

The following illustration indicates that, for a given weight:

* The **descent angle (γ)** is proportional to the drag force, and is at its minimum at Green Dot speed.
* The **rate of descent (RD)** is proportional to the drag force. As RD = TAS.γ, the minimum rate of descent is obtained for a TAS lower than Green Dot (when dRD/dTAS = 0).
