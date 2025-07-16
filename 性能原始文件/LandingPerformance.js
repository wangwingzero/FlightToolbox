
// =================================================================
// 3. Landing Performance
// =================================================================

export const landingPerformance = [
  {
    "nameEn": "Landing",
    "nameZh": "着陆",
    "definition": "飞机运行的一个关键阶段，运营商必须根据飞机审定（CS 25 / FAR 25）和运行限制（Air OPS / FAR 121）检查着陆要求。这包括评估干、湿和污染跑道上的着陆距离，以及考虑复飞限制，以确保安全运行。",
    "relatedFormulas": null,
    "regulatoryRequirement": null
  },
  {
    "nameEn": "Landing Distance Available (LDA)",
    "nameZh": "可用着陆距离",
    "definition": "由机场当局宣布可用于飞机着陆地面滑跑的跑道长度。如果着陆航径下有障碍物，LDA可能会因入口内移而缩短。停止道（Stopway）不能用于着陆距离计算。",
    "relatedFormulas": null,
    "regulatoryRequirement": null
  },
  {
    "nameEn": "Actual Landing Distance (ALD)",
    "nameZh": "实际着陆距离",
    "definition": "从飞机在着陆表面上方50英尺高度点开始，到着陆后完全停止所需的水平距离。其计算假设飞机处于着陆构型，并以不低于VLS的稳定速度进近至50英尺高度点。",
    "relatedFormulas": null,
    "regulatoryRequirement": `CS 25.125(a) / FAR 25.125(a): “必须确定从着陆面上方50英尺的点开始着陆并完全停止所需的水平距离（在标准温度下，以及在申请人为飞机设立的操作限制内的每个重量、高度和风速下）...”`
  },
  {
    "nameEn": "Required Landing Distance (RLD)",
    "nameZh": "所需着陆距离",
    "definition": "为签派目的而计算的着陆距离。它是基于实际着陆距离（ALD）并应用了运行安全系数。飞行前，运营商必须检查在预计着陆重量和预报条件下，目的地的RLD不大于LDA。",
    "relatedFormulas": [
      "RLD_dry = ALD / 0.6 ≤ LDA",
      "RLD_wet = 1.15 * RLD_dry ≤ LDA"
    ],
    "regulatoryRequirement": `Air OPS CAT.POL.A.230 / FAR 121.195(b): （对于干跑道）飞机的着陆重量必须允许其在目的地和任何备用机场的可用着陆距离的60%以内完成全停着陆。\nAir OPS CAT.POL.A.235 / FAR 121.195(d): （对于湿跑道）所需着陆距离必须是干跑道所需距离的115%。`
  },
  {
    "nameEn": "Landing Distance at the Time of Arrival (LDTA)",
    "nameZh": "到达时刻着陆距离",
    "definition": "一种更贴近实际运行的着陆距离计算，用于在进近准备阶段评估着陆性能。它考虑了实际的进近速度、风、温度、跑道状况、刹车技术和反推使用等因素。空客文档中也称为IFLD, LD, 或 OLD。",
    "relatedFormulas": null,
    "regulatoryRequirement": `CS/FAR 25.1592(b): “必须提供用于评估在干、湿、光滑湿跑道以及被积水、雪、雪水混合物或冰污染的跑道上到达时刻着陆性能的着陆距离信息。”`
  },
  {
    "nameEn": "Safety Margins (Landing)",
    "nameZh": "安全裕度（着陆）",
    "definition": "为应对运行中的不确定性，在计算的着陆距离（LDTA）上增加的一个强制性安全系数。EASA要求在LDTA上应用至少15%的安全裕度，得到的距离被称为“系数化着陆距离”（Factored Landing Distance, FLD）。",
    "relatedFormulas": [
      "LDA ≥ 1.15 * LDTA"
    ],
    "regulatoryRequirement": `Air OPS CAT.OP.MPA.303(a): “除非预定跑道上的可用着陆距离（LDA）至少是预计到达时刻着陆距离的115%，否则不得继续进近着陆[...]。”`
  },
  {
    "nameEn": "Go-Around",
    "nameZh": "复飞",
    "definition": "中断进近并重新爬升的机动。审定和运行规章都对复飞时的最小爬升梯度有明确要求，以确保飞机即使在单发失效的情况下也能安全越障并重新建立飞行。",
    "relatedFormulas": null,
    "regulatoryRequirement": null
  },
  {
    "nameEn": "Approach Climb Gradient",
    "nameZh": "进近爬升梯度",
    "definition": "一项单发失效下的复飞性能要求。它要求飞机在最大着陆重量、起落架收上、襟翼处于进近构型（通常比着陆构型小一档）和复飞推力下，必须能够达到一个最小的稳定爬升梯度（如双发飞机为2.1%）。",
    "relatedFormulas": null,
    "regulatoryRequirement": `CS/FAR 25.121(d): “进近。在一种构型下...稳定爬升梯度不得小于：双发飞机为2.1%，三发飞机为2.4%，四发飞机为2.7%。”`
  },
  {
    "nameEn": "Landing Climb Gradient",
    "nameZh": "着陆爬升梯度",
    "definition": "一项全发工作状态下的复飞性能要求。它要求飞机在着陆构型、起落架放下、达到复飞推力的情况下，必须能够达到至少3.2%的稳定爬升梯度。此要求的目的是确保在正常的全发复飞中具有足够的爬升能力。",
    "relatedFormulas": null,
    "regulatoryRequirement": `CS/FAR 25.119: “着陆爬升：全发工作。在着陆构型下，稳定爬升梯度不得小于3.2%[...]”`
  },
  {
    "nameEn": "Missed Approach Procedure",
    "nameZh": "复飞程序",
    "definition": `在仪表进近图上公布的，用于在无法完成着陆时引导飞机从复飞点安全爬升至指定高度或等待点的程序。该程序设计时已考虑了越障要求。PANS-OPS设计标准默认基于一个标准的2.5%爬升梯度保护面。如果2.5%的梯度不足以越过所有障碍物，则航图上会公布一个更高的最低复飞梯度要求。`,
    "relatedFormulas": null,
    "regulatoryRequirement": `AMC2 CAT.POL.A.225 (MISSED APPROACH): “(a) 对于复飞爬升梯度大于2.5%的仪表进近，运营商应验证飞机的预计着陆重量允许在单发失效的复飞构型和相关速度下，以等于或大于适用的复飞梯度进行复飞。”`
  }
];