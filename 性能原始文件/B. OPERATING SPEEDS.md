好的，這就為您將提供的文件內容轉換為 Markdown 格式。

---

# AIRBUS

## B. OPERATING SPEEDS

### 1. COMMON SPEEDS

#### 1.1. LOWEST SELECTABLE SPEED: VLS

**CS 25.125 Subpart B / FAR 25.125 Subpart B**

As a general rule, during in-flight phases, pilots should not select a speed below VLS (Lowest Selectable Speed). The VLS definition depends on the flight phase. VLS is at least 1.23 VS1g in clean and landing configurations.

```
V_LS ≥ 1.23 V_S1g
```

For A300/A310, the VLS is defined as

```
V_LS = 1.3 V_S
```

Refer to the chapter **Stall Speed**.

The VLS rule also applies for the landing phase. During landing, pilots must maintain a stabilized approach with a calibrated airspeed of no less than VLS down to a height of 50 ft above the destination airport.

#### 1.2. MINIMUM FLAPS SPEED: F

F speed is indicated by an “F” on the PFD speed scale (Illustration B-1).

![Illustration B-1: A screenshot of a Primary Flight Display (PFD) with the 'F' speed marked on the speed tape at 140 knots.](https://i.imgur.com/vHqB3F9.png)
*Illustration B-1: F Speed on PFD*

F speed is not the same for takeoff and approach.

**At takeoff:** F speed is the minimum speed at which the flaps may be safely retracted to flaps lever position 1 during initial climb. F speed is designed to provide some margin compared to the VLS of the configuration that corresponds to flaps lever position 1.

**During approach:** F speed is the recommended speed to select CONF 3 when the aircraft is in CONF 2, or the recommended speed to select CONF FULL when the aircraft is in CONF 3.

#### 1.3. MINIMUM SLATS SPEED: S

S Speed is indicated by an “S” on the PFD speed scale (Illustration B-2).

![Illustration B-2: A screenshot of a Primary Flight Display (PFD) with the 'S' speed marked on the speed tape at 180 knots.](https://i.imgur.com/G4Yx4zQ.png)
*Illustration B-2: S Speed on the PFD*

S speed is not the same for takeoff and approach.

**At takeoff:** S speed is the minimum speed at which the slats and flaps may be retracted to CONF clean. S speed is designed to provide some margin compared to the VLS of the CONF clean.

**During approach:** S speed is the recommended speed to select CONF 2 when the aircraft is in CONF 1.

#### 1.4. GREEN DOT SPEED: GDS

The green dot speed is indicated by a green dot on the PFD scale (Illustration B-3).

![Illustration B-3: A screenshot of a Primary Flight Display (PFD) with the Green Dot Speed (GDS) marked on the speed tape at approximately 215 knots.](https://i.imgur.com/712W1X2.png)
*Illustration B-3: GDS on the PFD*

The value of GDS displayed on the PFD can be different between AEO and OEI.

The GDS is a good compromise in order to enable the pilots to follow a speed very near to the best lift to drag ratio speed.
It is also used with OEI:

* To perform drift down since it results in the highest ceiling.
* As a target speed at the end of the segment at final takeoff, since it provides the best climb gradient at low speed.

#### 1.5. SPEED REFERENCE SYSTEM : SRS

The Speed Reference System (SRS) mode is a managed vertical mode. This mode is used during takeoff and during go-around.

SRS mode controls the speed via the elevators in order to control the aircraft along a vertical path.

For example, when the aircraft is on ground at takeoff, V₂ is the speed target. When the aircraft is airborne, V₂ + 10 kt becomes the speed target.
In case of engine failure, the SRS mode obtains and maintains the existing speed at the time of the engine failure or V₂, depending on which is higher. However, the speed target is limited by V₂ +15 kt.

The SRS guidance law includes:

* A limit for pitch attitude guidance, in order to not exceed a maximum pitch attitude.
* A vertical speed protection to ensure a minimum climb rate.

In any case, SRS will provide guidance to a speed equal or above VLS.

---

### 2. TAKEOFF SPEEDS

#### 2.1. ENGINE FAILURE SPEED: VEF

**CS 25.107 Subpart B / FAR 25.107 Subpart B**

> “(a) V1 must be established in relation to VEF as follows:
> (1) VEF is the calibrated airspeed at which the critical engine is assumed to fail. VEF must be selected by the applicant, but may not be less than VMCG.”

#### 2.2. DECISION SPEED: V1

**CS 25.107 Subpart B / FAR 25.107 Subpart B**

V1 is the maximum speed at which the crew can decide to reject the takeoff, and still be able to stop the aircraft within the limits of the runway.

If the crew is aware of a failure before V1, the crew will safely abort the takeoff.
If the crew is aware of a failure after V1, the crew must complete the takeoff. From the point where the aircraft reaches V1, the aircraft is sure to reach the takeoff limited height: and the aircraft may be too fast to brake safely before the end of the stopway.

> "CS/FAR 25.107
> (a)(2) V₁, in terms of calibrated airspeed, is selected by the applicant; however, V₁ may not be less than VEF plus the speed gained with the critical engine inoperative during the time interval between the instant at which the critical engine is failed, and the instant at which the pilot recognises and reacts to the engine failure, as indicated by the pilot's initiation of the first action (e.g. applying brakes, reducing thrust, deploying speed brakes) to stop the aeroplane during accelerate-stop tests."

The time that is considered between the critical engine failure at VEF, and the pilot detection of the failure at V₁, is at least 1 second. Therefore:

```
V_MCG ≤ V_EF < V₁ ≤ V_MBE
```

*Illustration B-4: Decision Speed*

This speed is entered by the crew in the FMS cockpit interface, e.g. Multipurpose Control and Display Unit (MCDU) for A320, during flight preparation. The speed is indicated by a “1” on the speed scale of the Primary Flight Display (PFD) during takeoff acceleration (see Illustration B-5). The V₂ Speed (see chapter **Takeoff Climb Speed: V₂**) is indicated by a triangle in purple.

*Illustration B-5: Information Provided by the PFD*

#### 2.3. ROTATION SPEED: VR

**CS 25.107 Subpart B / FAR 25.107 Subpart B**

VR is the speed at which the pilot initiates the rotation, at the appropriate rate of approximately 3 ° per second.

> “(e)(1) VR may not be less than:
>
> * V₁,
> * 105% of VMCA
> * The speed that allows reaching V₂ before reaching a height of 35 ft above the take-off surface, or
> * A speed that, if the aeroplane is rotated at its maximum practicable rate, will result in a [satisfactory] VLOF”.

VR is entered in the FMS cockpit interface by the crew during the flight preparation.

```
V_R ≥ 1.05 V_MCA
```

#### 2.4. LIFT OFF SPEED: VLOF

**CS 25.107 Subpart B / FAR 25.107 Subpart B / FAR AC 25 7D**

> “(f) VLOF is the calibrated airspeed at which the aeroplane first becomes airborne.”

The lift off speed is the speed at which the aircraft lifts off the ground, i.e. when the lift force exceeds the aircraft weight.

> “(e)(i) VR may not be less than -
> (iv) A speed, that if the aeroplane is rotated at its maximum practical rate will result in a VLOF of not less than:
>
> * 110% of VMU in the all-engines-operating condition, and 105% of VMU determined at the thrust-to-weight ratio corresponding to the one-engine-inoperative condition; or
> * If the VMU attitude is limited by the geometry of the aeroplane (ie. tail contact with the runway), 108% of VMU in the all-engines-operating condition and 104% of VMU determined at the thrust-to-weight ratio corresponding to the one-engine-operating condition.”

An aircraft is said to be geometry limited, when at its maximum pitch angle (the tail of the aircraft touches the ground while the main landing gear is still on ground). Therefore, the maximum lift coefficient (CLmax) is not reached, and the VMU speeds are limited by the aircraft's maximum pitch angle on the ground.
The regulations consider the specific case of aircraft for which the minimum possible VMU speeds are limited by the elevator efficiency at a high angle of attack, or that are limited by tail contact with the runway (referred to as geometry limited aircraft).

In these conditions, the margins can be reduced as follows:

**EASA AMC 25.107 / FAR AC 25-7D**

> “For aeroplanes that are geometry limited (ie. the minimum possible VMU speeds are limited by tail contact with the runway), CS 25.107 (e)(i)(iv) allows the VMU to VLOF speed margins to be reduced to 108% and 104 % for the all-engines operating and one-engine-inoperative conditions, respectively.”

Airbus aircraft, as most commercial airplanes, are usually geometry limited.

For aircraft certified before the A380, certification rules are different between JAR or EASA CS and FAR, as summarized in Table B-1:

**Table B-1: VLOF Limitation**

|                                  | JAR, EASA CS or FAR from A380                      | FAR before A380                                    |
| :------------------------------- | :------------------------------------------------- | :------------------------------------------------- |
| **Geometric Limitation**   | VLOF ≥ 1.04 VMU (N-1)`<br>`VLOF ≥ 1.08 VMU (N) | VLOF ≥ 1.05 VMU (N-1)`<br>`VLOF ≥ 1.08 VMU (N) |
| **Aerodynamic Limitation** | VLOF ≥ 1.05 VMU (N-1)`<br>`VLOF ≥ 1.10 VMU (N) |                                                    |

And the upper limit is:

```
V_LOF ≤ V_TIRE
```

VLOF depends on the aircraft configuration, the angle of attack and the takeoff weight.

#### 2.5. TAKEOFF CLIMB SPEED: V₂

**CS 25.107 Subpart B / FAR 25.107 Subpart B**

V₂ is the minimum climb speed that must be reached before a height of 35 ft above the runway surface, in case of an engine failure.

> “(b) V2min, in terms of calibrated airspeed, may not be less than:
> (1) 1.13 VSR [...] for turbo-jet powered aeroplanes
> [...]
> (3) 1.10 times VMC”

*Illustration B-6: Definition of V2min*

> “(c) V₂, in terms of calibrated airspeed, must be selected by the applicant to provide at least the gradient of climb required by CS/FAR 25.121(b) but may not be less than:
>
> * V2min; and
> * VR plus the speed increment attained before reaching a height of 35 ft above the take-off surface.
>   [...]"

This speed must be entered by the crew during flight preparation, and is indicated by a magenta triangle on the speed scale (see Illustration B-5).

```
V₂ ≥ 1.1 V_MCA
```

```
V₂ ≥ 1.13 V_S1g (Airbus aircraft except A300/A310)
```

```
V₂ ≥ 1.2 V_S (For A300/A310)
```

#### 2.6. TAKEOFF SPEED SUMMARY

Illustration B-7 illustrates the relationships and the regulatory margins between the certified speeds (VS1G, VMCG, VMCA, VMU, VMBE, VTIRE), and the takeoff operating speeds (V₁, VR, VLOF, V₂) for Airbus aircraft.

![Illustration B-7: A comprehensive diagram illustrating the sequence of takeoff speeds (VMCG, VEF, V1, VR, VLOF, V2) along a runway and initial climb path, showing their relationships and regulatory margins like 1.05 VMCA, 1.1 VMCA, and factors of VMU. The aircraft reaches 35 ft at V2.](https://i.imgur.com/0iK8eF3.png)
*Illustration B-7: Takeoff Speed Summary and Limitations Related to V₁, VR, VLOF and V₂*

---

### 3. LANDING SPEEDS

#### 3.1. FINAL APPROACH SPEED: VAPP

VAPP is the aircraft speed during landing, 50 ft above the runway surface. The flaps/slats are in landing configuration, and the landing gears are extended.

VAPP is limited by VLS:

```
V_APP ≥ V_LS
```

It is normal to keep a margin on VLS to define VAPP. For Airbus aircraft, in normal operations, the VAPP is defined by:¹

```
V_APP = V_LS + Wind correction
```

Wind correction is limited to a minimum of 5¹ kt, and a maximum of 15 kt. VAPP is displayed on the Approach page of the FMS cockpit interface.

The FMGS and managed speed is used to define the `VAPP TARGET`. It provides better speed guidance in approach with windy conditions, since it uses:

```
V_APP TARGET = GS mini + current headwind
GS mini = V_APP - tower wind
```

Current headwind is measured by ADIRS, and the tower wind is entered on the FMS cockpit interface.

¹ *When the auto-thrust is used or to compensate for ice accretion on the wings*

#### 3.2. REFERENCE SPEED: VREF

In case of failure in flight, emergency or abnormal configuration, performance computations are based on a reference configuration and on a reference speed, VREF. VREF means the landing approach speed is steady at the 50 ft point for a defined landing configuration. For Airbus aircraft, this configuration is CONF FULL.

That results in:

```
V_REF = V_LS in CONF FULL
```

In case of a system failure that affects landing performance, Airbus operational documentation (FCOM) indicates the correction to be applied to VREF to take into account the failure:

```
V_APP = V_REF + ΔV_INOP
```

Another speed increment can be added to VAPP to account for wind when required.

#### 3.3. GO-AROUND SPEED: VAC AND VGA

For A220 aircraft, the VAC is displayed on the PFD scale, VGA is indicated by a magenta arrow.

*Illustration B-8: VAC on the A220 PFD*

The VAC is the approach climb speed of the aircraft also referred to as V2GA or V2 GO-AROUND. That is the target climb speed to be achieved during a go-around with one engine inoperative.
For A220 aircraft, the VGA is the aircraft climb speed for all engines go-around.

For other Airbus aircraft, VGA is the climb speed for go-around, regardless of the number of engines that are operative.

---

### 4. CRUISE SPEEDS

There are two ways to operate the aircraft in cruise:

* By the direct selection of the speed by the crew: Selected speed.
* By the use of optimum speed computed by the FMS, based on the Cost Index (CI): Managed speed (refer to the chapter **Cruise at Minimum Cost**).

#### 4.1. MANAGED SPEED

A Flight Guidance (FG) mode is MANAGED when the FG manages the aircraft along the FMS F-PLN (e.g. NAV mode). A speed target is MANAGED when the speed value is computed by the FMS (e.g. ECON).

*Illustration B-9: Managed Speed*

#### 4.2. SELECTED SPEED

A Flight Guidance (FG) mode and its associated target are SELECTED when the FG manages the aircraft to a target selected by the pilot on the AFS CP (e.g. HDG). A speed target is SELECTED when directly selected by the pilot on the AFS CP. The speed target is used by the AP/FD and by the A/THR as a target.

*Illustration B-10: Selected Speed*
