/**
 * =================================================================
 *               Takeoff Performance Definitions
 * =================================================================
 *
 * Sourced and optimized from the Airbus document:
 * "Getting to Grips with Aircraft Performance", December 2024.
 *
 * This file contains structured data for key takeoff performance concepts.
 */

const takeoffPerformance = [
    {
      "nameEn": "Takeoff (TO)",
      "nameZh": "起飞",
      "definition": "起飞是从松开刹车开始，到爬升至1500英尺高度结束的飞行阶段。在此阶段，飞行员必须使飞机达到足够的速度和迎角条件，以平衡飞机的升力和重力。在地面加速阶段的末尾，飞行员向后拉侧杆以开始抬轮。在此阶段，保持加速并增大迎角，以增加升力。地面反作用力逐渐减小，直到离地。",
      "relatedFormulas": null,
      "regulatoryRequirement": null
    },
    {
      "nameEn": "Critical Engine",
      "nameZh": "临界发动机",
      "definition": "指其失效会对飞机性能或操纵品质产生最不利影响的发动机。对于四发喷气飞机，临界发动机是外侧发动机。对于双发空客喷气飞机，没有临界发动机。",
      "relatedFormulas": null,
      "regulatoryRequirement": `CS Definitions: “'临界发动机'指其失效将对飞机性能或操纵品质产生最不利影响的发动机。”`
    },
    {
      "nameEn": "Decision Speed (V1)",
      "nameZh": "决断速度 (V1)",
      "definition": `机组可以决断中断起飞，并仍能在跑道限制内停止飞机的最大速度。如果在V1之前意识到故障，机组将安全地中断起飞。如果在V1之后意识到故障，机组必须继续起飞。V1是在考虑了飞行员反应时间后的速度。`,
      "relatedFormulas": [
        "VMCG ≤ VEF < V1 ≤ VMBE"
      ],
      "regulatoryRequirement": `CS/FAR 25.107(a)(2): “V1，以校准空速表示，由申请人选择；然而，V1不得小于VEF加上在临界发动机失效瞬间到飞行员识别并对发动机失效做出反应瞬间（如此次加速停止测试中飞行员采取的首次措施，如施加刹车、减小推力、展开减速板所示）之间，临界发动机失效时获得的速度增量。”`
    },
    {
      "nameEn": "Rotation Speed (VR)",
      "nameZh": "抬轮速度 (VR)",
      "definition": "飞行员以大约每秒3度的适当速率开始抬轮的速度。",
      "relatedFormulas": [
        "VR ≥ 1.05 VMCA"
      ],
      "regulatoryRequirement": `CS/FAR 25.107(e)(1): “VR不得小于：● V1，● 105%的VMCA，● 能在到达起飞表面以上35英尺高度之前达到V2的速度，或者● 如果飞机以最大实际速率抬轮，将导致一个[满意的]VLOF的速度。”`
    },
    {
      "nameEn": "Lift Off Speed (VLOF)",
      "nameZh": "离地速度 (VLOF)",
      "definition": "飞机首次离地的校准空速。即升力超过飞机重量的瞬间速度。",
      "relatedFormulas": null,
      "regulatoryRequirement": `CS/FAR 25.107(f): “VLOF是飞机首次离地时的校准空速。”`
    },
    {
      "nameEn": "Takeoff Climb Speed (V2)",
      "nameZh": "起飞爬升速度 (V2)",
      "definition": "在发生发动机失效时，飞机必须在到达跑道表面以上35英尺高度之前达到的最小爬升速度。",
      "relatedFormulas": [
        "V2 ≥ 1.13 VSR (或1.13 VS1g)",
        "V2 ≥ 1.10 VMCA"
      ],
      "regulatoryRequirement": `CS/FAR 25.107(b): “V2min，以校准空速表示，不得小于：(1) 对于涡轮喷气飞机为1.13 VSR [...] (3) 1.10倍的VMC”\nCS/FAR 25.107(c): “V2，以校准空速表示，必须由申请人选择，以提供至少由CS/FAR 25.121(b)要求的爬升梯度，但不得小于V2min；以及VR加上在到达起飞表面以上35英尺高度之前获得的速度增量。”`
    },
    {
      "nameEn": "Takeoff Run Available (TORA)",
      "nameZh": "可用起飞滑跑距离",
      "definition": "由相应当局宣布可用并适合飞机起飞地面滑跑的跑道长度。TORA等于跑道长度，或等于从跑道入口点（滑行道交叉口）到跑道末端的距离。",
      "relatedFormulas": null,
      "regulatoryRequirement": `Air OPS Annex 1 / FAR 121.189: “可用起飞滑跑距离（TORA）：由相应当局宣布可用并适合飞机起飞地面滑跑的跑道长度。”`
    },
    {
      "nameEn": "Takeoff Distance (TOD)",
      "nameZh": "起飞距离",
      "definition": "在特定运行条件下，飞机从松开刹车到到达起飞表面以上35英尺（湿跑道为15英尺）高度点所需的总距离。其计算需比较单发失效和全发工作两种情况，并取限制性更大的值。",
      "relatedFormulas": [
        "TOD_dry = max {TOD_N-1_dry, 1.15 * TOD_N_dry}"
      ],
      "regulatoryRequirement": `Air OPS CAT.POL.A.205(b)(2): “起飞距离不得超过可用起飞距离（TODA），且净空道距离不得超过可用起飞滑跑距离（TORA）的一半。”`
    },
    {
      "nameEn": "Takeoff Run (TOR)",
      "nameZh": "起飞滑跑距离",
      "definition": "飞机从松开刹车到离地后某一点所需的地面滑跑距离。该点在单发失效情况下是离地点和35英尺高点之间的中点。计算时需比较单发和全发情况，并取限制性更大的值。",
      "relatedFormulas": [
        "TOR_dry = max {TOR_N-1_dry, 1.15 * TOR_N_dry}"
      ],
      "regulatoryRequirement": `Air OPS CAT.POL.A.205(b)(3): “起飞滑跑距离不得超过可用起飞滑跑距离（TORA）。”`
    },
    {
      "nameEn": "Accelerate-Stop Distance (ASD)",
      "nameZh": "加速停止距离",
      "definition": "飞机从静止开始加速，在V1时决断中断起飞，并最终完全停止所需的总距离。计算时包含飞行员反应时间，并额外增加2秒的安全裕度距离。",
      "relatedFormulas": [
        "ASD_dry = max {ASD_N-1_dry, ASD_N_dry}"
      ],
      "regulatoryRequirement": `Air OPS 1.490(b)(1): “加速停止距离不得超过可用加速停止距离。”`
    },
    {
      "nameEn": "Net Takeoff Flight Path",
      "nameZh": "净起飞航迹",
      "definition": `用于障碍物评估的计算航迹，等于飞机实际能飞出的“总起飞航迹”（Gross Takeoff Flight Path）在每个点减去一个规章强制的梯度罚值。对于双发飞机，该罚值为0.8%；对于四发飞机，为1.0%。该净航迹必须以至少35英尺的垂直距离越过所有障碍物。`,
      "relatedFormulas": [
        "净梯度 = 总梯度 - 梯度罚值 (0.8% for twin-engine, 1.0% for four-engine)"
      ],
      "regulatoryRequirement": `CS/FAR 25.115(b): “必须确定净起飞航迹数据，使其代表在每个点都扣除了一个梯度后的实际[总]起飞航迹，该梯度对于双发飞机为0.8%；对于四发飞机为1.0%。”\nAir OPS CAT.POL.A.210(a): “净起飞航迹的确定方式应确保飞机以至少35英尺的垂直距离越过所有障碍物。”`
    },
    {
      "nameEn": "Reduced Takeoff Thrust",
      "nameZh": "减推力起飞",
      "definition": "在实际起飞重量低于最大起飞重量时，采用低于最大可用推力进行起飞的操作，以延长发动机寿命并降低成本。分为灵活起飞(FLEX)和减额起飞(Derated)两种。",
      "relatedFormulas": null,
      "regulatoryRequirement": `CS 25 AMC 25.13(4)(c): “减推力起飞，对于一架飞机而言，是小于起飞（或减额起飞）推力的起飞推力。飞机起飞性能和推力设置是通过经批准的简单方法建立的，例如调整，或对起飞或减额起飞推力设置和性能进行修正。”`
    },
    {
      "nameEn": "Flexible Takeoff (FLEX)",
      "nameZh": "灵活起飞",
      "definition": `一种减推力方法，通过在FMS中输入一个高于实际外界大气温度（OAT）的“灵活温度”（TFlex），让发动机全权限数字电子控制器（FADEC）自动将推力调整至适应当前较低起飞重量的水平。此方法基于最大起飞推力（TOGA）的性能数据，因此VMCG和VMCA等最小操纵速度保持不变。推力减小量通常不超过最大起飞推力的40%。`,
      "relatedFormulas": [
        "T_Flex > OAT",
        "T_Flex > T_ref (参考温度)",
        "T_Flex ≤ T_Flex_Max (最大灵活温度)"
      ],
      "regulatoryRequirement": `CS 25 AMC 25.13(5)(f): “AFM中声明[减推力起飞]在被积水、雪、雪泥或冰污染的跑道上未经授权，并且在湿跑道（包括光滑湿跑道）上也未经授权，除非对湿跑道上增加的停止距离进行了适当的性能核算。”`
    },
    {
      "nameEn": "Derated Takeoff",
      "nameZh": "减额起飞",
      "definition": `一种减推力方法，使用一个低于最大起飞推力的、经审定的固定推力等级（如TOGA-4%）。这被视为一个独立的、正常的起飞推力限制，在飞机飞行手册（AFM）中有其专属的一整套独立的性能数据和起飞限制。由于最大可用推力降低，其对应的VMCG和VMCA也相应降低，这在短跑道或污染跑道上可能带来性能优势。`,
      "relatedFormulas": null,
      "regulatoryRequirement": `CS 25 AMC 25.13(4)(b): “减额起飞推力，对于一架飞机而言，是小于最大起飞推力的起飞推力，在AFM中为其存在一套独立或清晰可辨的、符合所有CS-25起飞要求的起飞限制和性能数据。”`
    }
];

module.exports = {
  takeoffPerformance
};