/**
 * 民用航空I级体检合格证（飞行员）医学标准数据库 (完整版)
 * Complete Medical Standards Database for Civil Aviation Class I Medical Certificate (Pilots)
 *
 * 数据来源：《民用航空体检鉴定医学标准实施细则》(AC-67FS-001R2)
 * Data Source: "Detailed Rules for the Implementation of Medical Standards for Civil Aviation Medical Examination and Appraisal" (AC-67FS-001R2)
 *
 * 更新说明：此版本已根据原文对仅针对I级体检合格证的标准进行了全面补充和修正。
 * Update Note: This version has been fully supplemented and corrected according to the original text, specifically for Class I medical certificate standards.
 */

var medicalStandards = [

  // --- 2. 一般条件 (General Conditions) ---
  {
    "id": "2.1",
    "category": "一般条件",
    "name_zh": "恶性肿瘤",
    "name_en": "Malignant Tumor",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "I级体检合格证申请人患有恶性肿瘤"
      ]
    }
  },
  {
    "id": "2.2",
    "category": "一般条件",
    "name_zh": "良性占位性病变",
    "name_en": "Benign Space-Occupying Lesion",
    "standard": [
      {
        "assessment": "不合格",
        "conditions": [
          "患有影响安全履行职责的良性占位性病变"
        ]
      },
      {
        "assessment": "合格",
        "conditions": [
          "治愈后",
          "无复发",
          "无并发症及后遗症"
        ]
      }
    ]
  },
  {
    "id": "2.3",
    "category": "一般条件",
    "name_zh": "器官移植",
    "name_en": "Organ Transplant",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "行心脏、肝脏、肾脏、肺脏、角膜等器官移植"
      ]
    }
  },

  // --- 3. 精神科 (Psychiatry) ---
  {
    "id": "3.1",
    "category": "精神科",
    "name_zh": "精神障碍",
    "name_en": "Mental Disorders",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "器质性精神障碍",
        "精神活性物质使用所致障碍",
        "精神分裂症或其他原发性精神病性障碍",
        "双相障碍",
        "抑郁障碍",
        "焦虑障碍",
        "强迫及相关障碍",
        "创伤及应激相关障碍",
        "分离障碍",
        "躯体症状及相关障碍",
        "进食与喂养障碍",
        "睡眠障碍",
        "成人人格和行为障碍",
        "神经发育障碍",
        "通常起病于儿童少年的行为和情绪障碍",
        "成瘾行为所致障碍"
      ],
      "notes": "指影响安全履行职责的上述精神障碍或临床诊断。"
    }
  },
  {
    "id": "3.1.1",
    "category": "精神科",
    "name_zh": "短期失眠障碍、焦虑障碍或焦虑状态",
    "name_en": "Short-term Insomnia or Anxiety Disorder",
    "standard": {
      "assessment": "合格",
      "conditions": [
        "治疗后，症状消失",
        "体质良好",
        "停药观察至少90日，无复发",
        "精神检查和心理学评定正常"
      ]
    }
  },
  {
    "id": "3.1.2",
    "category": "精神科",
    "name_zh": "轻度抑郁障碍或抑郁状态",
    "name_en": "Mild Depression",
    "standard": [
      {
        "assessment": "合格",
        "conditions": [
          "首次出现且不伴精神病性症状的轻度抑郁障碍或抑郁状态",
          "临床治愈后，停药观察至少6个月",
          "无复发",
          "精神检查和心理学评定正常"
        ]
      },
      {
        "assessment": "合格",
        "conditions": [
            "患有产后抑郁",
            "临床治愈后，停药观察至少6个月",
            "无复发",
            "精神检查和心理学评定正常"
        ]
      },
      {
        "assessment": "不合格",
        "conditions": [
          "反复发作"
        ]
      }
    ]
  },
  {
    "id": "3.1.3",
    "category": "精神科",
    "name_zh": "继发性精神障碍",
    "name_en": "Secondary Mental Disorder",
    "standard": {
      "assessment": "合格",
      "conditions": [
        "因急性感染、中毒性疾病或代谢性疾病引起",
        "原发病临床治愈后，症状消失",
        "观察至少90日，无复发、无后遗症",
        "精神检查和心理学评定正常"
      ]
    }
  },
  {
    "id": "3.1.4",
    "category": "精神科",
    "name_zh": "适应障碍",
    "name_en": "Adjustment Disorder",
    "standard": {
      "assessment": "合格",
      "conditions": [
        "症状持续时间不超过6个月",
        "如应激源消除",
        "精神检查和心理学评定正常"
      ]
    }
  },
  {
    "id": "3.1.5",
    "category": "精神科",
    "name_zh": "自杀或自伤行为",
    "name_en": "Suicide or Self-harm Behavior",
    "standard": [
      {
        "assessment": "不合格",
        "conditions": [
          "有自杀或反复自伤行为"
        ]
      },
      {
        "assessment": "合格",
        "conditions": [
          "如为首次非自杀性自伤行为",
          "精神检查和心理学评定正常"
        ]
      }
    ]
  },

  // --- 4. 内科 (Internal Medicine) ---
  {
    "id": "4.1.1",
    "category": "内科",
    "subCategory": "神经系统疾病",
    "name_zh": "癫痫",
    "name_en": "Epilepsy",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "患有痫样发作、癫痫及其病史",
        "脑电图痫样放电",
        "局灶性异常或中度及以上异常"
      ]
    }
  },
  {
    "id": "4.1.2",
    "category": "内科",
    "subCategory": "神经系统疾病",
    "name_zh": "晕厥、意识障碍",
    "name_en": "Syncope, Impaired Consciousness",
    "standard": [
      {
        "assessment": "不合格",
        "conditions": [
          "患有病理性晕厥",
          "原因不明或反复发作的意识障碍"
        ]
      },
      {
        "assessment": "合格",
        "conditions": [
          "如为原因明确且可预防的晕厥"
        ]
      }
    ]
  },
  {
    "id": "4.1.3",
    "category": "内科",
    "subCategory": "神经系统疾病",
    "name_zh": "偏头痛、丛集性头痛等",
    "name_en": "Migraine and other headaches",
    "standard": [
      {
        "assessment": "不合格",
        "conditions": [
          "患有偏头痛、丛集性头痛、三叉神经痛或反复发作的其他头痛"
        ]
      },
      {
        "assessment": "合格",
        "conditions": [
            "如每年发作频率少于2次",
            "仅使用非类固醇抗炎药可有效控制症状",
            "观察至少90日，无复发"
        ]
      }
    ]
  },
  {
    "id": "4.1.4",
    "category": "内科",
    "subCategory": "神经系统疾病",
    "name_zh": "帕金森病、脱髓鞘性疾病等",
    "name_en": "Parkinson's, Demyelinating Diseases",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "患有帕金森病、脱髓鞘性疾病或神经系统的自身免疫性疾病"
      ]
    }
  },
  {
    "id": "4.1.5",
    "category": "内科",
    "subCategory": "神经系统疾病",
    "name_zh": "脑血管意外",
    "name_en": "Cerebrovascular Accident",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "患有脑梗塞、短暂性脑缺血发作或脑出血"
      ]
    }
  },
  {
    "id": "4.1.6",
    "category": "内科",
    "subCategory": "神经系统疾病",
    "name_zh": "腔隙性脑梗塞或脑动脉硬化",
    "name_en": "Lacunar Infarction or Cerebral Arteriosclerosis",
    "standard": {
      "assessment": "合格",
      "conditions": [
        "无症状",
        "无并发症及后遗症"
      ]
    }
  },
  {
    "id": "4.1.7",
    "category": "内科",
    "subCategory": "神经系统疾病",
    "name_zh": "脑炎、脑膜炎",
    "name_en": "Encephalitis, Meningitis",
    "standard": {
      "assessment": "合格",
      "conditions": [
        "临床治愈后，观察至少12个月",
        "无症状",
        "24小时动态脑电图和颅脑核磁共振检查结果无明显异常",
        "无并发症及后遗症"
      ]
    }
  },
  {
    "id": "4.2.1.1",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "高血压病",
    "name_en": "Hypertension",
    "standard": [
      {
        "assessment": "不合格",
        "conditions": [
          "患有高血压病，收缩压(SBP)持续 > 155mmHg 或 舒张压(DBP)持续 > 95mmHg"
        ]
      },
      {
        "assessment": "合格",
        "conditions": [
          "确诊为白大衣高血压"
        ]
      },
      {
        "assessment": "合格",
        "conditions": [
          "使用药物控制的高血压病",
          "血压控制达标 (≤155/95mmHg)",
          "所使用药物为：噻嗪类利尿剂、血管紧张素转换酶抑制剂、血管紧张素II受体拮抗剂、钙通道阻滞剂、β受体阻滞剂或血管紧张素受体一脑啡肽酶抑制剂",
          "首次使用或更换降压药，观察至少14日，无症状，无药物不良反应",
          "无影响安全履行职责的心、脑、肾等重要器官并发症或功能损害"
        ]
      }
    ],
    "notes": "招飞体检鉴定申请人如当日收缩压持续≥140mmHg 或舒张压持续≥90mmHg、使用降压药物或继发性高血压，应鉴定为不合格。"
  },
  {
    "id": "4.2.1.2",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "低血压",
    "name_en": "Hypotension",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "收缩压 < 90mmHg 或 (和) 舒张压 < 60mmHg",
            "无自觉症状"
        ]
    }
  },
  {
    "id": "4.2.2.1",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "可疑心绞痛与非阻塞性冠脉病",
    "name_en": "Suspected Angina and Non-obstructive CAD",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "存在可疑心绞痛相关症状",
            "临床诊断为冠状动脉微血管障碍或冠状动脉痉挛等非阻塞性冠状动脉疾病",
            "或，超声心动图、核素心肌显像任一检查结果提示存在心肌缺血相关改变"
        ]
    }
  },
  {
    "id": "4.2.2.2",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "冠状动脉狭窄",
    "name_en": "Coronary Artery Stenosis",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "冠状动脉左主干(LM)或左前降支(LAD)近段狭窄30%~49%，且符合特定影像学或危险因素条件",
            "LAD中远段、左回旋支(LCX)或右冠状动脉(RCA)狭窄30%~49%，且有心肌缺血证据或≥3项未控制危险因素",
            "任一主支血管(LM、LAD、RCA或LCX)狭窄≥50%"
        ]
    }
  },
  {
    "id": "4.2.2.3",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "冠心病",
    "name_en": "Coronary Heart Disease",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "患有冠心病"
      ]
    }
  },
  {
    "id": "4.2.2.4",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "冠状动脉心肌桥",
    "name_en": "Coronary Myocardial Bridge",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "伴有心肌缺血相关症状的冠状动脉心肌桥"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "冠状动脉CTA或冠状动脉造影显示心肌桥致冠状动脉狭窄≥50%",
                "无心肌缺血相关症状",
                "超声心动图和核素心肌显像检查结果提示无心肌缺血相关改变"
            ]
        }
    ]
  },
  {
    "id": "4.2.3.1",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "心律失常",
    "name_en": "Arrhythmia",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有严重心律失常",
                "伴有器质性病变导致的心律失常"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "为偶然出现1阵非持续性室性心动过速",
                "频率 < 100次/分",
                "连发的异常室性节律QRS波不超过5个",
                "无症状",
                "经排除器质性病变（心肌病变、心脏瓣膜病变、缺血性心脏病等）",
                "复查24小时动态心电图无明显异常"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "为偶然出现1阵非持续性室性心动过速",
                "频率 ≥100次/分但 <130次/分",
                "连发的异常室性节律QRS波不超过3个",
                "无症状",
                "排除器质性病变（心肌病变、心脏瓣膜病变、缺血性心脏病等）",
                "观察至少90日，每月复查24小时动态心电图无明显异常"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "心脏无器质性病变",
                "非持续性室性心动过速继发于其他疾病或其他原因诱发（如甲亢、腹泻、电解质紊乱等）",
                "原发疾病治愈或病因消除后",
                "观察至少90日，每月复查24小时动态心电图无明显异常"
            ]
        },
        {
            "assessment": "不合格",
            "conditions": [
                "除上述情况以外的室性心动过速"
            ]
        }
    ],
    "notes": "对于特定的非持续性室性心动过速，满足严格条件后可鉴定为合格。"
  },
  {
    "id": "4.2.3.2",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "预激综合征",
    "name_en": "Pre-excitation Syndrome",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有伴阵发性室上性心动过速史的预激综合征"
        ]
    }
  },
  {
    "id": "4.2.3.3",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "偶发早搏等良性心律失常",
    "name_en": "Occasional Premature Beats and other benign arrhythmias",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有偶发早搏、左前分支阻滞、右束支阻滞、并行心律、游走心律、窦房阻滞、RR间期小于2.5秒的窦性停搏、一度房室阻滞、二度I型房室阻滞等心律失常",
            "无症状",
            "排除器质性病变"
        ]
    }
  },
  {
    "id": "4.2.3.4",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "频发室性或室上性早搏",
    "name_en": "Frequent PVCs or PACs",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "出现伴临床症状和（或）器质性病变的频发室性或室上性早搏"
            ]
        },
        {
            "assessment": "不合格",
            "conditions": [
                "出现频发室性早搏，如早搏负荷 >5%"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "出现频发室上性早搏，如早搏负荷（早搏总数/总心搏）<5%",
                "无症状，排除器质性病变",
                "无需使用抗心律失常药物治疗"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "出现频发室性早搏，如早搏负荷 <3%",
                "无症状，排除器质性病变"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "出现频发室性早搏，如3% ≤ 早搏负荷 ≤5%",
                "排除器质性病变",
                "消除诱因后，复查24小时动态心电图早搏负荷 <3%",
                "无需使用抗心律失常药物进行维持治疗"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "出现频发室性早搏，如早搏负荷 >5%",
                "服用抗心律失常药物治疗后已停药",
                "观察至少90日，相关症状消失",
                "每月复查24小时动态心电图，早搏负荷下降至3%以下"
            ]
        }
    ]
  },
  {
    "id": "4.2.3.5",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "阵发性室上性心动过速",
    "name_en": "Paroxysmal Supraventricular Tachycardia",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有偶发、短阵（24小时不超过3阵且不出现7个以上QRS连发）的阵发性室上性心动过速",
            "无症状",
            "排除器质性病变"
        ]
    }
  },
  {
    "id": "4.2.3.6",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "窦性心动过速或过缓",
    "name_en": "Sinus Tachycardia or Bradycardia",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有窦性心动过速或窦性心动过缓",
            "心率非持续性高于110次/分或非持续性低于50次/分",
            "无症状",
            "排除器质性病变"
        ]
    }
  },
  {
    "id": "4.2.3.7",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "心律失常导管消融术后",
    "name_en": "Post-catheter Ablation for Arrhythmia",
    "standard": {
      "assessment": "合格",
      "conditions": [
          "因早搏、预激综合征、房颤、房扑、阵发性室上速等接受导管消融术治疗后",
          "病情稳定",
          "停服抗凝和抗心律失常药物后，观察至少90日",
          "无症状，无并发症及后遗症，心功能正常",
          "每月复查24小时动态心电图无明显异常"
      ]
    }
  },
  {
    "id": "4.2.4",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "心肌病",
    "name_en": "Cardiomyopathy",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "患有心肌病"
      ]
    }
  },
  {
    "id": "4.2.5",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "先天性心脏病或心脏瓣膜疾病",
    "name_en": "Congenital Heart or Valvular Disease",
    "standard": [
      {
        "assessment": "不合格",
        "conditions": [
          "存在相关症状、心脏结构异常或功能异常的心脏瓣膜疾病",
          "主动脉瓣中度及以上关闭不全（狭窄）",
          "2个或2个以上瓣膜存在中度及以上关闭不全（狭窄）",
          "接受心脏瓣膜手术治疗",
          "二叶式主动脉瓣、动脉导管未闭、房间隔缺损、室间隔缺损等先天性心脏病"
        ]
      },
      {
        "assessment": "合格",
        "conditions": [
          "简单型卵圆孔未闭封堵术治疗后",
          "观察至少6个月",
          "无症状，无并发症及后遗症",
          "超声心动图无异常"
        ]
      }
    ]
  },
  {
    "id": "4.2.6",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "病毒性心肌炎",
    "name_en": "Viral Myocarditis",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "临床治愈后，观察至少90日",
            "无症状，无并发症及后遗症",
            "超声心动图或心脏核磁共振、24小时动态心电图、运动负荷试验等无明显异常",
            "心功能正常"
        ]
    }
  },
  {
    "id": "4.2.7",
    "category": "内科",
    "subCategory": "循环系统疾病",
    "name_zh": "心脏起搏器或除颤器植入术",
    "name_en": "Pacemaker or Defibrillator Implantation",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "接受心脏起搏器植入术或心脏除颤器植入术"
        ]
    }
  },
  {
    "id": "4.3.1",
    "category": "内科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "支气管哮喘",
    "name_en": "Bronchial Asthma",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "患有支气管哮喘或支气管哮喘病史"
      ]
    }
  },
  {
    "id": "4.3.2",
    "category": "内科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "慢性阻塞性肺疾病或慢性呼吸道感染",
    "name_en": "COPD or Chronic Respiratory Infection",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "症状明显或肺功能中度及以上异常"
        ]
    }
  },
  {
    "id": "4.3.3",
    "category": "内科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "活动性肺部疾病",
    "name_en": "Active Pulmonary Disease",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有胸部纵隔、胸膜、肺实质的活动性疾病",
            "临床治愈后",
            "无并发症及后遗症"
        ]
    }
  },
  {
    "id": "4.3.4",
    "category": "内科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "肺栓塞症",
    "name_en": "Pulmonary Embolism",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "患有肺栓塞症"
      ]
    }
  },
  {
    "id": "4.4.1",
    "category": "内科",
    "subCategory": "消化系统疾病",
    "name_zh": "肝硬化",
    "name_en": "Cirrhosis",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "患有肝硬化"
      ]
    }
  },
  {
    "id": "4.4.2",
    "category": "内科",
    "subCategory": "消化系统疾病",
    "name_zh": "消化性溃疡",
    "name_en": "Peptic Ulcer",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "临床治愈后",
            "内镜检查痊愈或符合瘢痕期表现",
            "无症状，无并发症及后遗症"
        ]
    }
  },
  {
    "id": "4.4.3",
    "category": "内科",
    "subCategory": "消化系统疾病",
    "name_zh": "消化道出血",
    "name_en": "Gastrointestinal Bleeding",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "消化道出血临床治愈，且原发病临床治愈后",
            "观察至少90日",
            "无后遗症，无复发"
        ]
    }
  },
  {
    "id": "4.4.4",
    "category": "内科",
    "subCategory": "消化系统疾病",
    "name_zh": "慢性胆囊炎、胃食管反流病、慢性胃炎",
    "name_en": "Chronic Cholecystitis, GERD, Chronic Gastritis",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "无明显症状"
        ]
    }
  },
  {
    "id": "4.4.5",
    "category": "内科",
    "subCategory": "消化系统疾病",
    "name_zh": "胰腺炎",
    "name_en": "Pancreatitis",
    "standard": [
      {
        "assessment": "合格",
        "conditions": [
          "患有急性胰腺炎，临床治愈后",
          "轻症观察至少90日、中度重症观察至少6个月、重症观察至少12个月",
          "无症状，无并发症及后遗症"
        ]
      },
      {
        "assessment": "不合格",
        "conditions": [
          "患有慢性胰腺炎"
        ]
      }
    ]
  },
  {
    "id": "4.4.6",
    "category": "内科",
    "subCategory": "消化系统疾病",
    "name_zh": "炎症性肠病",
    "name_en": "Inflammatory Bowel Disease",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "需用药物治疗或有症状的炎症性肠病"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "服用维持量水杨酸制剂，病情稳定",
                "观察至少90日",
                "无症状，无并发症及后遗症"
            ]
        }
    ]
  },
  {
    "id": "4.5.1.1",
    "category": "内科",
    "subCategory": "传染病",
    "name_zh": "活动性结核病",
    "name_en": "Active Tuberculosis",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有活动性结核病"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "肺结核经规范化治疗，临床治愈后",
                "无症状，无并发症及后遗症",
                "肺功能正常"
            ]
        }
    ]
  },
  {
    "id": "4.5.1.2",
    "category": "内科",
    "subCategory": "传染病",
    "name_zh": "淋巴系统结核",
    "name_en": "Lymphatic Tuberculosis",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "临床治愈后",
            "无症状，无并发症及后遗症"
        ]
    }
  },
  {
    "id": "4.5.2.1",
    "category": "内科",
    "subCategory": "传染病",
    "name_zh": "急性病毒性肝炎",
    "name_en": "Acute Viral Hepatitis",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "临床治愈后",
            "观察至少90日",
            "近三个月内每月1次肝功能检查结果正常"
        ]
    }
  },
  {
    "id": "4.5.2.2",
    "category": "内科",
    "subCategory": "传染病",
    "name_zh": "慢性病毒性肝炎",
    "name_en": "Chronic Viral Hepatitis",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "治疗后，病情稳定",
            "观察至少6个月",
            "无症状，无并发症及后遗症",
            "近三个月内每月1次肝功能检查结果正常",
            "肝炎病毒RNA或DNA定量低于参考值"
        ],
        "notes": "招飞体检鉴定申请人患有病毒性肝炎或乙型肝炎表面抗原阳性，应鉴定为不合格。"
    }
  },
  {
    "id": "4.6.1",
    "category": "内科",
    "subCategory": "代谢、免疫和内分泌系统疾病",
    "name_zh": "需用胰岛素控制的糖尿病",
    "name_en": "Insulin-dependent Diabetes",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "患有需用胰岛素控制的糖尿病"
      ]
    }
  },
  {
    "id": "4.6.2",
    "category": "内科",
    "subCategory": "代谢、免疫和内分泌系统疾病",
    "name_zh": "糖尿病",
    "name_en": "Diabetes Mellitus",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "空腹血糖在3.9~7.5mmol/L范围",
            "餐后2小时血糖在4.4~10.0mmol/L范围",
            "糖化血红蛋白(HbA1c) < 7.0%",
            "无并发症"
        ],
        "notes": "如需使用特定类型的降糖药物，需满足额外观察期和检查要求。"
    }
  },
  {
    "id": "4.6.3",
    "category": "内科",
    "subCategory": "代谢、免疫和内分泌系统疾病",
    "name_zh": "巨人症、肢端肥大症等",
    "name_en": "Gigantism, Acromegaly, etc.",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有巨人症、肢端肥大症、慢性肾上腺皮质功能减退症、皮质醇增多症、胰岛内分泌肿瘤或嗜铬细胞瘤"
        ]
    }
  },
  {
    "id": "4.6.4",
    "category": "内科",
    "subCategory": "代谢、免疫和内分泌系统疾病",
    "name_zh": "痛风",
    "name_en": "Gout",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "药物治疗后",
            "血清尿酸正常",
            "无症状，无并发症，无药物不良反应"
        ]
    }
  },
  {
    "id": "4.6.5",
    "category": "内科",
    "subCategory": "代谢、免疫和内分泌系统疾病",
    "name_zh": "甲状腺功能亢进症",
    "name_en": "Hyperthyroidism",
    "standard": [
        {
            "assessment": "合格",
            "conditions": [
                "临床治愈"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "需用药物控制的甲状腺功能亢进症",
                "治疗后，无症状、无并发症、无药物不良反应",
                "血清促甲状腺激素(TSH)、游离T3(FT3)和游离T4(FT4)恢复正常",
                "至少连续2次（每次间隔至少21日）复查在正常范围"
            ]
        }
    ]
  },
  {
    "id": "4.6.6",
    "category": "内科",
    "subCategory": "代谢、免疫和内分泌系统疾病",
    "name_zh": "甲状腺功能减退症",
    "name_en": "Hypothyroidism",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "无症状，无并发症，无药物不良反应",
            "TSH和FT4在正常范围"
        ]
    }
  },
  {
    "id": "4.6.7",
    "category": "内科",
    "subCategory": "代谢、免疫和内分泌系统疾病",
    "name_zh": "系统性红斑狼疮等",
    "name_en": "Systemic Lupus Erythematosus, etc.",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有系统性红斑狼疮、系统性硬化病、原发性血管炎、干燥综合征、雷诺病"
        ]
    }
  },
  {
    "id": "4.7.1",
    "category": "内科",
    "subCategory": "血液系统疾病",
    "name_zh": "可治愈的贫血",
    "name_en": "Curable Anemia",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "治疗后，血红蛋白浓度正常"
        ]
    }
  },
  {
    "id": "4.7.2",
    "category": "内科",
    "subCategory": "血液系统疾病",
    "name_zh": "地中海贫血",
    "name_en": "Thalassemia",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "无症状、轻度贫血的静止型或轻型地中海贫血"
        ]
    }
  },
  {
    "id": "4.7.3",
    "category": "内科",
    "subCategory": "血液系统疾病",
    "name_zh": "难以治愈的贫血",
    "name_en": "Intractable Anemia",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有再生障碍性贫血、自身免疫性溶血性贫血、遗传性球型红细胞贫血、阵发性睡眠性血红蛋白尿等难以治愈的贫血"
        ]
    }
  },
  {
    "id": "4.7.4",
    "category": "内科",
    "subCategory": "血液系统疾病",
    "name_zh": "白细胞减少症",
    "name_en": "Leukopenia",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有特发性白细胞减少或轻度中性粒细胞减少者",
            "无症状"
        ]
    }
  },
  {
    "id": "4.7.5",
    "category": "内科",
    "subCategory": "血液系统疾病",
    "name_zh": "过敏性紫癜",
    "name_en": "Henoch-Schonlein Purpura",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有肾型过敏性紫癜"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "其他类型的过敏性紫癜，临床治愈后",
                "观察至少6个月，无复发"
            ]
        }
    ]
  },
  {
    "id": "4.7.6",
    "category": "内科",
    "subCategory": "血液系统疾病",
    "name_zh": "白血病、淋巴瘤等",
    "name_en": "Leukemia, Lymphoma, etc.",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有白血病、淋巴瘤、浆细胞病、原发性血小板增多症、血小板减少性紫癜、真性红细胞增多症"
        ]
    }
  },
  {
    "id": "4.7.7",
    "category": "内科",
    "subCategory": "血液系统疾病",
    "name_zh": "凝血障碍性疾病或血栓性疾病",
    "name_en": "Coagulation or Thrombotic Disorders",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有凝血障碍性疾病或血栓性疾病"
        ]
    }
  },
  {
    "id": "4.8.1",
    "category": "内科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "急性肾小球肾炎",
    "name_en": "Acute Glomerulonephritis",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "临床治愈后",
            "观察至少90日",
            "尿常规和肾功能正常"
        ]
    }
  },
  {
    "id": "4.8.2",
    "category": "内科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "急进性肾小球肾炎",
    "name_en": "Rapidly Progressive Glomerulonephritis",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有急进性肾小球肾炎"
        ]
    }
  },
  {
    "id": "4.8.3",
    "category": "内科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "慢性肾脏疾病",
    "name_en": "Chronic Kidney Disease",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有慢性肾小球肾炎、肾病综合征、IgA肾病、慢性肾脏病3期及以上"
        ]
    }
  },
  {
    "id": "4.8.4",
    "category": "内科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "无症状性蛋白尿或血尿",
    "name_en": "Asymptomatic Proteinuria or Hematuria",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "排除病理性原因或诊断为胡桃夹综合征",
            "肾功能正常"
        ]
    }
  },
  {
    "id": "4.8.5",
    "category": "内科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "急性尿路感染",
    "name_en": "Acute Urinary Tract Infection",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "临床治愈后"
        ]
    }
  },
  {
    "id": "4.8.6",
    "category": "内科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "慢性肾盂肾炎",
    "name_en": "Chronic Pyelonephritis",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "治疗后，病情稳定",
            "观察至少90日",
            "无症状，无并发症及后遗症",
            "肾功能正常"
        ]
    }
  },

  // --- 5. 外科 (Surgery) ---
  {
    "id": "5.1.1.1",
    "category": "外科",
    "subCategory": "神经系统疾病",
    "name_zh": "重度颅脑损伤",
    "name_en": "Severe Traumatic Brain Injury",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "患有重度颅脑损伤"
      ]
    }
  },
  {
    "id": "5.1.1.2",
    "category": "外科",
    "subCategory": "神经系统疾病",
    "name_zh": "中度颅脑损伤",
    "name_en": "Moderate Traumatic Brain Injury",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "患有中度颅脑损伤"
      ]
    }
  },
  {
    "id": "5.1.1.3",
    "category": "外科",
    "subCategory": "神经系统疾病",
    "name_zh": "轻度颅脑损伤",
    "name_en": "Mild Traumatic Brain Injury",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有轻度颅脑损伤"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "治疗后，观察至少6个月",
                "无并发症及后遗症，无癫痫发作史",
                "动态脑电图无明显异常"
            ]
        }
    ]
  },
  {
    "id": "5.1.2",
    "category": "外科",
    "subCategory": "神经系统疾病",
    "name_zh": "颅内动脉瘤",
    "name_en": "Intracranial Aneurysm",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "有蛛网膜下腔出血病史",
        "颅内动脉瘤术后",
        "有中枢神经系统症状",
        "多发、形态不规则或有子囊",
        "最大径大于或等于3mm",
        "其他影响安全履行职责的因素"
      ]
    }
  },
  {
    "id": "5.1.3",
    "category": "外科",
    "subCategory": "神经系统疾病",
    "name_zh": "颅内动静脉畸形或海绵状血管瘤",
    "name_en": "Intracranial AVM or Cavernous Angioma",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "患有颅内动静脉畸形或海绵状血管瘤"
      ]
    }
  },
  {
    "id": "5.1.4",
    "category": "外科",
    "subCategory": "神经系统疾病",
    "name_zh": "颅内血管先天变异",
    "name_en": "Congenital Variation of Intracranial Vessels",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "有中枢神经系统症状",
            "或，有颅内出血病史",
            "或，伴发颅内动脉瘤",
            "或，其他影响安全履行职责的因素"
        ]
    }
  },
  {
    "id": "5.1.5",
    "category": "外科",
    "subCategory": "神经系统疾病",
    "name_zh": "颅内蛛网膜囊肿",
    "name_en": "Intracranial Arachnoid Cyst",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "有中枢神经系统症状或病史",
            "或，动态脑电图检查明显异常",
            "或，多发",
            "或，颞叶囊肿最大径大于或等于5厘米",
            "或，其他影响安全履行职责的因素"
        ]
    }
  },
  {
    "id": "5.1.6.1",
    "category": "外科",
    "subCategory": "神经系统疾病",
    "name_zh": "垂体瘤",
    "name_en": "Pituitary Tumor",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有垂体瘤"
        ]
    }
  },
  {
    "id": "5.1.6.2",
    "category": "外科",
    "subCategory": "神经系统疾病",
    "name_zh": "垂体囊肿或空蝶鞍",
    "name_en": "Pituitary Cyst or Empty Sella",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "无症状",
            "无局部压迫导致的神经系统症状和视野异常",
            "垂体内分泌检查正常"
        ]
    }
  },
  {
    "id": "5.1.7",
    "category": "外科",
    "subCategory": "神经系统疾病",
    "name_zh": "松果体囊肿或脉络膜裂囊肿",
    "name_en": "Pineal Cyst or Choroid Fissure Cyst",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "无症状",
            "无局部压迫导致的神经系统症状",
            "动态脑电图无明显异常",
            "无其他影响安全履行职责的因素"
        ]
    }
  },
  {
    "id": "5.1.8",
    "category": "外科",
    "subCategory": "神经系统疾病",
    "name_zh": "透明隔囊肿",
    "name_en": "Cavum Septum Pellucidum Cyst",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有透明隔囊肿"
        ]
    }
  },
  {
    "id": "5.1.9",
    "category": "外科",
    "subCategory": "神经系统疾病",
    "name_zh": "中枢神经系统肿瘤",
    "name_en": "Central Nervous System Tumor",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有中枢神经系统肿瘤"
        ]
    }
  },
  {
    "id": "5.1.10",
    "category": "外科",
    "subCategory": "神经系统疾病",
    "name_zh": "颅脑手术",
    "name_en": "Cranial Surgery",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "有颅脑手术史"
      ]
    }
  },
  {
    "id": "5.2.1",
    "category": "外科",
    "subCategory": "循环系统疾病",
    "name_zh": "下肢静脉曲张",
    "name_en": "Varicose Veins of Lower Limbs",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "无并发症"
        ]
    }
  },
  {
    "id": "5.2.2",
    "category": "外科",
    "subCategory": "循环系统疾病",
    "name_zh": "静脉血栓",
    "name_en": "Venous Thrombosis",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有静脉血栓"
        ]
    }
  },
  {
    "id": "5.2.3",
    "category": "外科",
    "subCategory": "循环系统疾病",
    "name_zh": "主动脉瘤",
    "name_en": "Aortic Aneurysm",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有主动脉瘤"
        ]
    }
  },
  {
    "id": "5.3.1",
    "category": "外科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "胸廓发育不良或畸形",
    "name_en": "Thoracic Dysplasia or Deformity",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有影响安全履行职责的胸廓发育不良或畸形"
        ]
    }
  },
  {
    "id": "5.3.2",
    "category": "外科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "肋骨骨折",
    "name_en": "Rib Fracture",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "临床愈合后",
            "局部无压痛，胸廓活动度正常",
            "无并发症及后遗症"
        ]
    }
  },
  {
    "id": "5.3.3.1",
    "category": "外科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "气胸",
    "name_en": "Pneumothorax",
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "患有气胸"
      ]
    }
  },
  {
    "id": "5.3.3.2",
    "category": "外科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "气胸治疗后",
    "name_en": "Post-Pneumothorax Treatment",
    "standard": {
      "assessment": "合格",
      "conditions": [
        "治疗后，观察至少90日",
        "症状消失，肺组织扩张良好",
        "肺功能正常或轻度异常",
        "计算机断层扫描(CT)检查无胸膜区肺大疱"
      ]
    }
  },
  {
    "id": "5.3.3.3",
    "category": "外科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "反复发作的自发性气胸",
    "name_en": "Recurrent Spontaneous Pneumothorax",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有反复发作的自发性气胸"
        ]
    }
  },
  {
    "id": "5.3.4.1",
    "category": "外科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "肺大疱",
    "name_en": "Pulmonary Bullae",
    "standard": [
      {
        "assessment": "合格",
        "conditions": [
          "胸膜区单个肺大疱最大径不大于2厘米",
          "无症状",
          "无自发性气胸史",
          "满足肺大疱的随访要求"
        ]
      },
      {
        "assessment": "在运行观察前提下，可鉴定为合格",
        "conditions": [
          "胸膜区单个肺大疱最大径大于2厘米，但不大于5厘米",
          "无症状",
          "无自发性气胸史",
          "肺功能正常或轻度异常",
          "满足肺大疱的随访要求"
        ],
        "notes": "限制条件：至少一年内不能作为唯一机长在航空器上行使职责。"
      },
      {
        "assessment": "不合格",
        "conditions": [
          "如胸膜区单个肺大疱最大径大于2厘米"
        ],
        "notes": "这是默认不合格条件，除非满足上一条“运行观察前提下合格”的特定要求。"
      }
    ]
  },
  {
    "id": "5.3.4.2",
    "category": "外科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "肺大疱手术后",
    "name_en": "Post-Pulmonary Bullae Surgery",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "行胸腔镜或开胸手术治疗后",
            "观察至少90日",
            "无症状，无并发症及后遗症",
            "肺功能正常或轻度异常"
        ]
    }
  },
  {
    "id": "5.3.5",
    "category": "外科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "肺结节",
    "name_en": "Pulmonary Nodule",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有无症状的肺结节"
        ]
    }
  },
  {
    "id": "5.3.6.1",
    "category": "外科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "胸壁损伤",
    "name_en": "Chest Wall Injury",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "不伴有胸腔脏器损伤的胸壁损伤",
            "治愈后，无并发症及后遗症"
        ]
    }
  },
  {
    "id": "5.3.6.2",
    "category": "外科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "胸腔脏器损伤",
    "name_en": "Thoracic Organ Injury",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "治疗后，观察至少90日",
            "无并发症及后遗症"
        ]
    }
  },
  {
    "id": "5.3.7",
    "category": "外科",
    "subCategory": "呼吸系统疾病",
    "name_zh": "胸腔脏器手术",
    "name_en": "Thoracic Organ Surgery",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "行胸腔脏器手术后，观察至少90日",
            "无并发症及后遗症",
            "肺功能正常或轻度异常"
        ]
    }
  },
  {
    "id": "5.4.1",
    "category": "外科",
    "subCategory": "消化系统疾病",
    "name_zh": "肝囊肿",
    "name_en": "Hepatic Cyst",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有无症状的肝囊肿"
        ]
    }
  },
  {
    "id": "5.4.2",
    "category": "外科",
    "subCategory": "消化系统疾病",
    "name_zh": "肝血管瘤",
    "name_en": "Hepatic Hemangioma",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有无症状的肝血管瘤"
        ]
    }
  },
  {
    "id": "5.4.3",
    "category": "外科",
    "subCategory": "消化系统疾病",
    "name_zh": "肝局灶性结节性增生",
    "name_en": "Focal Nodular Hyperplasia of the Liver",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有无症状的肝局灶性结节性增生"
        ]
    }
  },
  {
    "id": "5.4.4",
    "category": "外科",
    "subCategory": "消化系统疾病",
    "name_zh": "胆道系统结石",
    "name_en": "Biliary System Stones",
    "standard": [
      {
        "assessment": "不合格",
        "conditions": [
          "患有胆道系统结石"
        ]
      },
      {
        "assessment": "合格",
        "conditions": [
          "治疗后，无结石残留",
          "观察至少30日，无结石复发",
          "无并发症及后遗症"
        ]
      },
      {
        "assessment": "合格",
        "conditions": [
          "无症状的肝实质内结石"
        ]
      }
    ]
  },
  {
    "id": "5.4.5",
    "category": "外科",
    "subCategory": "消化系统疾病",
    "name_zh": "胆囊息肉",
    "name_en": "Gallbladder Polyp",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有无症状的胆囊息肉"
        ]
    }
  },
  {
    "id": "5.4.6",
    "category": "外科",
    "subCategory": "消化系统疾病",
    "name_zh": "疝",
    "name_en": "Hernia",
    "standard": [
      {
        "assessment": "不合格",
        "conditions": [
          "患有影响安全履行职责的疝"
        ]
      },
      {
        "assessment": "合格",
        "conditions": [
          "手术治疗后，观察至少30日",
          "无复发，无并发症及后遗症"
        ]
      }
    ]
  },
  {
    "id": "5.4.7",
    "category": "外科",
    "subCategory": "消化系统疾病",
    "name_zh": "阑尾炎",
    "name_en": "Appendicitis",
    "standard": [
        {
            "assessment": "合格",
            "conditions": [
                "治疗后，观察至少30日",
                "无并发症及后遗症"
            ]
        },
        {
            "assessment": "不合格",
            "conditions": [
                "阑尾炎反复发作"
            ]
        }
    ]
  },
  {
    "id": "5.4.8",
    "category": "外科",
    "subCategory": "消化系统疾病",
    "name_zh": "直肠肛管疾病",
    "name_en": "Anorectal Diseases",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "手术治疗后，观察至少30日",
            "无并发症及后遗症"
        ]
    }
  },
  {
    "id": "5.4.9.1",
    "category": "外科",
    "subCategory": "消化系统疾病",
    "name_zh": "腹壁损伤",
    "name_en": "Abdominal Wall Injury",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "不伴有腹腔脏器损伤的腹壁损伤",
            "治愈后，无并发症及后遗症"
        ]
    }
  },
  {
    "id": "5.4.9.2",
    "category": "外科",
    "subCategory": "消化系统疾病",
    "name_zh": "腹腔脏器损伤",
    "name_en": "Abdominal Organ Injury",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "非手术治疗后，观察至少90日",
            "无并发症及后遗症"
        ]
    }
  },
  {
    "id": "5.4.10",
    "category": "外科",
    "subCategory": "消化系统疾病",
    "name_zh": "腹部手术",
    "name_en": "Abdominal Surgery",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "行腹腔脏器手术后，观察至少30日",
            "无并发症及后遗症"
        ]
    }
  },
  {
    "id": "5.5.1",
    "category": "外科",
    "subCategory": "传染病",
    "name_zh": "梅毒",
    "name_en": "Syphilis",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有梅毒"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "一期梅毒或二期梅毒治疗后",
                "临床症状和体征消失",
                "非特异性梅毒螺旋体血清学试验转阴",
                "观察至少90日，期间至少每30日复查1次非特异性梅毒螺旋体血清学试验，结果均为阴性"
            ]
        }
    ]
  },
  {
    "id": "5.5.2",
    "category": "外科",
    "subCategory": "传染病",
    "name_zh": "梅毒血清固定",
    "name_en": "Serofast State of Syphilis",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "诊断为梅毒血清固定"
        ]
    }
  },
  {
    "id": "5.5.3",
    "category": "外科",
    "subCategory": "传染病",
    "name_zh": "获得性免疫缺陷综合征或HIV阳性",
    "name_en": "AIDS or HIV Positive",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有获得性免疫缺陷综合征或HIV血清学检查结果为阳性"
        ]
    }
  },
  {
    "id": "5.5.4",
    "category": "外科",
    "subCategory": "传染病",
    "name_zh": "尖锐湿疣",
    "name_en": "Condyloma Acuminatum",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有尖锐湿疣"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "治疗后，临床症状和体征消失",
                "观察至少6个月，期间每月复查，无复发"
            ]
        }
    ]
  },
  {
    "id": "5.5.5",
    "category": "外科",
    "subCategory": "传染病",
    "name_zh": "淋病",
    "name_en": "Gonorrhea",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有淋病"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "治疗后，临床症状和体征消失",
                "观察至少30日",
                "至少每14日行淋球菌检查，结果均正常"
            ]
        }
    ]
  },
  {
    "id": "5.6.1",
    "category": "外科",
    "subCategory": "甲状腺及乳腺疾病",
    "name_zh": "甲状腺结节",
    "name_en": "Thyroid Nodule",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "甲状腺功能无明显异常",
            "不影响安全履行职责"
        ]
    }
  },
  {
    "id": "5.6.2",
    "category": "外科",
    "subCategory": "甲状腺及乳腺疾病",
    "name_zh": "良性甲状腺结节手术",
    "name_en": "Benign Thyroid Nodule Surgery",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "手术治疗后，观察至少30日",
            "无并发症及后遗症",
            "甲状腺功能无明显异常"
        ]
    }
  },
  {
    "id": "5.6.3",
    "category": "外科",
    "subCategory": "甲状腺及乳腺疾病",
    "name_zh": "乳腺疾病",
    "name_en": "Breast Diseases",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有无症状的乳腺纤维腺瘤、乳腺囊性增生症"
        ]
    }
  },
  {
    "id": "5.7.1",
    "category": "外科",
    "subCategory": "脾脏疾病",
    "name_zh": "脾血管瘤",
    "name_en": "Splenic Hemangioma",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有无症状的脾血管瘤"
        ]
    }
  },
  {
    "id": "5.7.2",
    "category": "外科",
    "subCategory": "脾脏疾病",
    "name_zh": "脾脏切除术后",
    "name_en": "Post-Splenectomy",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "行脾脏切除手术后，观察至少90日",
            "无并发症及后遗症"
        ]
    }
  },
  {
    "id": "5.8.1",
    "category": "外科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "泌尿生殖系统畸形",
    "name_en": "Urogenital Malformation",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有影响安全履行职责的泌尿生殖系统畸形"
        ]
    }
  },
  {
    "id": "5.8.1.1",
    "category": "外科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "肾囊肿",
    "name_en": "Renal Cyst",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有无症状的肾囊肿"
        ]
    }
  },
  {
    "id": "5.8.1.2",
    "category": "外科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "成人型多囊肾",
    "name_en": "Autosomal Dominant Polycystic Kidney Disease",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有成人型多囊肾"
        ]
    }
  },
  {
    "id": "5.8.2.1",
    "category": "外科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "肾结石",
    "name_en": "Kidney Stone",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有影响安全履行职责的肾结石"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "治疗后，结石排出，观察至少30日",
                "无结石残留，无镜下血尿，无并发症及后遗症"
            ]
        },
        {
            "assessment": "在运行观察前提下，可鉴定为合格",
            "conditions": [
                "无症状",
                "肾结石为单发，且最大径不大于4mm",
                "不伴有尿路梗阻",
                "不伴有甲状旁腺功能亢进",
                "不得同时患有高甘油三酯血症、高尿酸血症和肥胖三项",
                "满足肾结石的随访要求"
            ],
            "notes": "限制条件：不能作为唯一机长在航空器上行使职责。"
        }
    ]
  },
  {
    "id": "5.8.2.2",
    "category": "外科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "肾盏憩室内结石",
    "name_en": "Calyceal Diverticulum Stone",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有无症状的肾盏憩室内结石"
        ]
    }
  },
  {
    "id": "5.8.2.3",
    "category": "外科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "输尿管结石",
    "name_en": "Ureteral Stone",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有输尿管结石"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "结石排出后，泌尿系无结石残留",
                "观察至少30日",
                "无镜下血尿"
            ]
        }
    ]
  },
  {
    "id": "5.8.2.4",
    "category": "外科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "膀胱结石或尿道结石",
    "name_en": "Bladder or Urethral Stone",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有膀胱结石或尿道结石"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "结石排出后，泌尿系无结石残留",
                "观察至少30日",
                "无镜下血尿"
            ]
        }
    ]
  },
  {
    "id": "5.8.3",
    "category": "外科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "精索静脉曲张",
    "name_en": "Varicocele",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有无症状的精索静脉曲张"
        ]
    }
  },
  {
    "id": "5.8.4",
    "category": "外科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "鞘膜积液",
    "name_en": "Hydrocele",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有无症状的鞘膜积液"
        ]
    }
  },
  {
    "id": "5.8.5",
    "category": "外科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "肾上腺良性占位性病变",
    "name_en": "Benign Adrenal Mass",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有无症状的肾上腺囊肿、肾上腺腺瘤或肾上腺增生",
            "肾上腺功能正常"
        ]
    }
  },
  {
    "id": "5.8.6",
    "category": "外科",
    "subCategory": "泌尿生殖系统疾病",
    "name_zh": "泌尿系统手术",
    "name_en": "Urological Surgery",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "行泌尿系统手术后，观察至少30日",
            "无并发症及后遗症"
        ]
    }
  },
  {
    "id": "5.9.1",
    "category": "外科",
    "subCategory": "妇产科",
    "name_zh": "妊娠",
    "name_en": "Pregnancy",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "妊娠"
        ]
    }
  },
  {
    "id": "5.9.2",
    "category": "外科",
    "subCategory": "妇产科",
    "name_zh": "终止妊娠后",
    "name_en": "Post-Termination of Pregnancy",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "分娩或因流产、死产等终止妊娠后",
            "国家法定的产假或流产假期期满",
            "无并发症及后遗症"
        ]
    }
  },
  {
    "id": "5.9.3",
    "category": "外科",
    "subCategory": "妇产科",
    "name_zh": "月经异常",
    "name_en": "Menstrual Abnormality",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有严重的月经异常或痛经"
        ]
    }
  },
  {
    "id": "5.10.1",
    "category": "外科",
    "subCategory": "运动系统疾病",
    "name_zh": "一般条件（运动系统）",
    "name_en": "General Conditions (Musculoskeletal)",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "身高、体重、臂长、腿长和肌力能够满足安全履行职责的需要"
        ]
    }
  },
  {
    "id": "5.10.2",
    "category": "外科",
    "subCategory": "运动系统疾病",
    "name_zh": "运动系统畸形",
    "name_en": "Musculoskeletal Deformity",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有影响安全履行职责的运动系统畸形"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "畸形矫治后",
                "无功能障碍，无并发症及后遗症"
            ]
        }
    ]
  },
  {
    "id": "5.10.3",
    "category": "外科",
    "subCategory": "运动系统疾病",
    "name_zh": "四肢关节损伤",
    "name_en": "Limb Joint Injury",
    "standard": [
        {
            "assessment": "合格",
            "conditions": [
                "非手术治疗后",
                "无明显症状，活动功能正常，肌力正常"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "手术治疗后，观察至少30日",
                "无并发症及后遗症，活动功能正常，肌力正常"
            ]
        }
    ]
  },
  {
    "id": "5.10.4",
    "category": "外科",
    "subCategory": "运动系统疾病",
    "name_zh": "颈椎病及腰椎间盘突出症",
    "name_en": "Cervical Spondylosis and Lumbar Disc Herniation",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有颈椎病或腰椎间盘突出症"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "非手术治疗后，病情稳定",
                "无明显症状，脊柱四肢活动功能正常，肌力正常"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "手术治疗后，观察至少30日",
                "无并发症及后遗症，脊柱四肢活动功能正常，肌力正常"
            ]
        }
    ]
  },
  {
    "id": "5.10.5",
    "category": "外科",
    "subCategory": "运动系统疾病",
    "name_zh": "腰椎滑脱",
    "name_en": "Spondylolisthesis",
    "standard": [
        {
            "assessment": "合格",
            "conditions": [
                "非手术治疗后",
                "无并发症及后遗症，脊柱四肢活动功能正常，肌力正常"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "手术治疗后，观察至少90日",
                "无并发症及后遗症，脊柱四肢活动功能正常，肌力正常"
            ]
        }
    ]
  },
  {
    "id": "5.10.6",
    "category": "外科",
    "subCategory": "运动系统疾病",
    "name_zh": "脊髓损伤",
    "name_en": "Spinal Cord Injury",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有脊髓损伤"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "治疗后，观察至少6个月",
                "无并发症及后遗症，脊柱四肢活动功能正常，肌力正常"
            ]
        }
    ]
  },
  {
    "id": "5.10.7",
    "category": "外科",
    "subCategory": "运动系统疾病",
    "name_zh": "脊柱骨折",
    "name_en": "Spinal Fracture",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "不伴有脊髓损伤的脊柱骨折",
            "治疗后，无并发症及后遗症，脊柱四肢活动功能正常，肌力正常"
        ]
    }
  },
  {
    "id": "5.10.8",
    "category": "外科",
    "subCategory": "运动系统疾病",
    "name_zh": "周围神经损伤",
    "name_en": "Peripheral Nerve Injury",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "治疗后，神经功能恢复良好，肌力正常"
        ]
    }
  },
  {
    "id": "5.10.9",
    "category": "外科",
    "subCategory": "运动系统疾病",
    "name_zh": "习惯性关节脱位",
    "name_en": "Habitual Joint Dislocation",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有习惯性关节脱位"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "手术治疗后，观察至少90日",
                "无并发症及后遗症，活动功能正常，肌力正常"
            ]
        }
    ]
  },
  {
    "id": "5.10.10",
    "category": "外科",
    "subCategory": "运动系统疾病",
    "name_zh": "关节置换",
    "name_en": "Joint Replacement",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "行关节置换手术"
        ]
    }
  },
  {
    "id": "5.10.11",
    "category": "外科",
    "subCategory": "运动系统疾病",
    "name_zh": "骨或关节结核",
    "name_en": "Bone or Joint Tuberculosis",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有骨或关节结核"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "临床治愈后",
                "无并发症及后遗症，活动功能正常，肌力正常"
            ]
        }
    ]
  },
  {
    "id": "5.10.12",
    "category": "外科",
    "subCategory": "运动系统疾病",
    "name_zh": "强直性脊柱炎",
    "name_en": "Ankylosing Spondylitis",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有强直性脊柱炎"
        ]
    }
  },
  {
    "id": "5.10.13",
    "category": "外科",
    "subCategory": "运动系统疾病",
    "name_zh": "进行性肌萎缩或肌力异常",
    "name_en": "Progressive Muscular Atrophy or Myasthenia",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有进行性肌萎缩或肌力异常"
        ]
    }
  },
  {
    "id": "5.11",
    "category": "外科",
    "subCategory": "皮肤及其附属器",
    "name_zh": "皮肤及其附属器疾病",
    "name_en": "Diseases of the Skin and Appendages",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有银屑病、湿疹、荨麻疹、神经性皮炎、重度腋臭等皮肤及其附属器疾病",
            "症状明显，影响安全履行职责"
        ]
    }
  },
  
  // --- 6. 耳鼻咽喉及口腔科 (ENT & Stomatology) ---
  {
    "id": "6.1.1",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "耳气压功能不良",
    "name_en": "Poor Eustachian Tube Function",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有耳气压功能不良"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "临床治愈后，观察至少30日",
                "耳气压功能恢复正常，听力符合标准"
            ]
        }
    ]
  },
  {
    "id": "6.2.1",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "前庭功能",
    "name_en": "Vestibular Function",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "旋转重试验II度及以上或出现延迟反应"
        ]
    }
  },
  {
    "id": "6.2.2",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "梅尼埃病",
    "name_en": "Meniere's Disease",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有梅尼埃病等导致前庭功能障碍的耳源性疾病"
        ]
    }
  },
  {
    "id": "6.2.3",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "良性阵发性位置性眩晕",
    "name_en": "Benign Paroxysmal Positional Vertigo (BPPV)",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有良性阵发性位置性眩晕"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "首次发作的特发性良性阵发性位置性眩晕临床治愈后",
                "观察至少6个月，眩晕无复发",
                "前庭功能正常，听力符合标准"
            ]
        }
    ]
  },
  {
    "id": "6.2.4",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "前庭神经炎",
    "name_en": "Vestibular Neuronitis",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有前庭神经炎"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "单次发作型前庭神经炎，临床治愈后",
                "观察至少6个月，眩晕无复发",
                "前庭功能正常，听力符合标准"
            ]
        }
    ]
  },
  {
    "id": "6.2.5",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "晕动病",
    "name_en": "Motion Sickness",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有影响安全履行职责的晕动病"
        ]
    }
  },
  {
    "id": "6.3.1",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "言语功能障碍",
    "name_en": "Speech Dysfunction",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有影响安全履行职责的言语功能障碍"
        ]
    }
  },
  {
    "id": "6.4.1",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "重度阻塞性睡眠呼吸暂停低通气综合征",
    "name_en": "Severe OSAS",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有重度阻塞性睡眠呼吸暂停低通气综合征",
            "或，阻塞性睡眠呼吸暂停低通气综合征合并重度低氧血症"
        ]
    }
  },
  {
    "id": "6.4.2",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "中度阻塞性睡眠呼吸暂停低通气综合征",
    "name_en": "Moderate OSAS",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有中度阻塞性睡眠呼吸暂停低通气综合征",
            "且合并以下三项及以上：(1) BMI≥28.0kg/m²; (2) 空腹血糖≥6.1mmol/L或餐后2小时血糖≥7.8mmol/L，和(或)确诊为糖尿病并治疗者; (3) 血压≥130/85mmHg和(或)确诊为高血压并治疗者; (4) 空腹甘油三酯≥1.7mmol/L和(或)空腹高密度脂蛋白<1.04mmol/L"
        ]
    }
  },
  {
    "id": "6.4.3",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "阻塞性睡眠呼吸暂停低通气综合征治疗后",
    "name_en": "Treated OSAS",
    "standard": [
      {
        "assessment": "合格",
        "conditions": [
          "经非手术治疗（如呼吸机、口腔矫治器等），症状改善",
          "复查多导睡眠监测，呼吸暂停低通气指数和动脉血氧饱和度减轻至轻度或中度"
        ]
      },
      {
        "assessment": "合格",
        "conditions": [
          "经纠正气道平面阻塞的手术，临床治愈后",
          "观察至少30日",
          "症状改善，复查多导睡眠监测指标减轻至轻度或中度",
          "无并发症及后遗症"
        ]
      },
      {
        "assessment": "合格",
        "conditions": [
          "经正颌外科手术，临床治愈后",
          "观察至少60日",
          "症状改善，复查多导睡眠监测指标减轻至轻度或中度",
          "无并发症及后遗症"
        ]
      }
    ]
  },
  {
    "id": "6.5.1.1",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "外耳疾病",
    "name_en": "External Ear Diseases",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有明显症状或体征的耳廓软骨膜炎、耳前瘘管或鳃裂瘘管感染、外耳道湿疹、外耳道炎、外耳道真菌感染等外耳疾病"
        ]
    }
  },
  {
    "id": "6.5.1.2",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "外耳道疾病",
    "name_en": "External Auditory Canal Diseases",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有外耳道胆脂瘤、耵聍腺瘤、有明显症状或体征的外耳道乳头状瘤、血管瘤、纤维瘤、外生骨瘤等外耳道疾病"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "临床治愈后，观察至少30日",
                "无外耳道狭窄，无并发症及后遗症",
                "听力符合标准"
            ]
        }
    ]
  },
  {
    "id": "6.5.1.3",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "中耳疾病",
    "name_en": "Middle Ear Diseases",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有航空性中耳炎、分泌性中耳炎、急性化脓性中耳炎等中耳疾病"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "经非手术治疗，临床治愈后",
                "耳气压功能正常，听力符合标准"
            ]
        }
    ]
  },
  {
    "id": "6.5.1.4",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "鼓膜置管术后",
    "name_en": "Post-Tympanostomy Tube Insertion",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "因航空性中耳炎、分泌性中耳炎经非手术治疗无效，行鼓膜切开置管术后",
            "观察至少30日",
            "无眩晕及耳鸣等症状，听力符合标准"
        ]
    }
  },
  {
    "id": "6.5.1.5",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "慢性化脓性中耳炎",
    "name_en": "Chronic Suppurative Otitis Media",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有慢性化脓性中耳炎"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "经非手术治疗，临床治愈后，观察至少30日",
                "无眩晕及耳鸣等症状，耳气压和前庭功能正常，听力符合标准"
            ]
        }
    ]
  },
  {
    "id": "6.5.1.6",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "中耳胆脂瘤",
    "name_en": "Middle Ear Cholesteatoma",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有中耳胆脂瘤"
        ]
    }
  },
  {
    "id": "6.5.1.7",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "中耳手术（涉及内耳）",
    "name_en": "Middle Ear Surgery (Involving Inner Ear)",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "行中耳手术，范围涉及镫骨、圆窗及外半规管或出现眩晕"
        ]
    }
  },
  {
    "id": "6.5.1.8",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "中耳手术（不涉及内耳）",
    "name_en": "Middle Ear Surgery (Not Involving Inner Ear)",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "行中耳手术，范围未涉及镫骨、圆窗及外半规管",
            "临床治愈后，观察至少90日",
            "无眩晕及耳鸣等症状，无并发症及后遗症",
            "耳气压和前庭功能正常，听力符合标准"
        ]
    }
  },
  {
    "id": "6.5.1.9",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "鼓膜穿孔",
    "name_en": "Tympanic Membrane Perforation",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "鼓膜穿孔，自然愈合后",
            "观察至少30日",
            "耳气压功能正常，听力符合标准"
        ]
    }
  },
  {
    "id": "6.5.1.10",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "干性鼓膜穿孔",
    "name_en": "Dry Tympanic Membrane Perforation",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "不伴有中耳病理改变的鼓膜干性穿孔",
            "听力符合标准"
        ]
    }
  },
  {
    "id": "6.5.1.11",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "耳硬化症",
    "name_en": "Otosclerosis",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有耳硬化症"
        ]
    }
  },
  {
    "id": "6.5.2.1",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "外鼻及鼻前庭疾病",
    "name_en": "External Nose and Nasal Vestibule Diseases",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有明显症状或体征的鼻外伤、鼻前庭炎、鼻疖等外鼻及鼻前庭疾病"
        ]
    }
  },
  {
    "id": "6.5.2.2",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "鼻腔或鼻窦疾病",
    "name_en": "Nasal Cavity or Sinus Diseases",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有明显影响鼻通畅、鼻窦窦口通气引流、耳气压功能或伴全身症状的鼻腔或鼻窦疾病"
        ]
    }
  },
  {
    "id": "6.5.2.3",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "中-重度变应性鼻炎",
    "name_en": "Moderate-Severe Allergic Rhinitis",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有明显症状且严重影响生活质量的中-重度变应性鼻炎"
        ]
    }
  },
  {
    "id": "6.5.2.4",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "需口服抗组胺药的变应性鼻炎",
    "name_en": "Allergic Rhinitis Requiring Oral Antihistamines",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有需用口服抗组胺药物控制的变应性鼻炎"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "口服左旋西替利嗪、地氯雷他定等无中枢镇静作用的第三代抗组胺药物",
                "无副作用，耐受性好"
            ]
        }
    ]
  },
  {
    "id": "6.5.2.5",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "鼻腔鼻窦疾病功能性手术后",
    "name_en": "Post-FESS for Nasal/Sinus Diseases",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "经功能性鼻内镜手术，临床治愈后，观察至少30日",
            "鼻腔鼻窦通气良好，术腔粘膜上皮化良好",
            "无并发症及后遗症"
        ]
    }
  },
  {
    "id": "6.5.2.6",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "嗅觉丧失",
    "name_en": "Anosmia",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "嗅觉丧失"
        ]
    }
  },
  {
    "id": "6.5.3.1",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "咽喉部疾病",
    "name_en": "Pharyngeal and Laryngeal Diseases",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有明显影响呼吸、吞咽、发声功能的咽喉部疾病、畸形或功能障碍"
        ]
    }
  },
  {
    "id": "6.5.3.2",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "喉显微手术后",
    "name_en": "Post-Laryngeal Microsurgery",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "经喉显微手术后，观察至少30日",
            "无影响呼吸、吞咽、发声功能",
            "无复发，无并发症及后遗症"
        ]
    }
  },
  {
    "id": "6.5.4.1",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "口腔及颞下颌关节疾病",
    "name_en": "Oral and TMJ Diseases",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有明显影响张口、咀嚼、吞咽、呼吸、发声功能的口腔及颞下颌关节疾病、畸形或功能障碍"
        ]
    }
  },
  {
    "id": "6.5.4.2",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "口腔良性肿瘤",
    "name_en": "Benign Oral Tumor",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "经手术治疗，临床治愈后，观察至少30日",
            "无影响呼吸、吞咽、发声功能",
            "无并发症及后遗症"
        ]
    }
  },
  {
    "id": "6.5.4.3",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "腮腺良性肿瘤",
    "name_en": "Benign Parotid Gland Tumor",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "经手术治疗，临床治愈后，观察至少30日",
            "无复发，无并发症及后遗症"
        ]
    }
  },
  {
    "id": "6.5.4.4",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "颞下颌关节紊乱病",
    "name_en": "Temporomandibular Disorders (TMD)",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "经手术治疗，临床治愈后，观察至少60日",
            "无影响张口、咀嚼功能",
            "无并发症及后遗症"
        ]
    }
  },
  {
    "id": "6.6.1",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "听觉功能障碍",
    "name_en": "Hearing Impairment",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有影响安全履行职责的听觉功能障碍"
        ]
    }
  },
  {
    "id": "6.6.2",
    "category": "耳鼻咽喉及口腔科",
    "name_zh": "纯音听阈测试",
    "name_en": "Pure Tone Audiometry",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "每耳在500Hz、1000Hz和2000Hz的任一频率的听力损失超过35dB(HL)",
                "或，在3000Hz频率的听力损失超过50dB(HL)"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "每耳在500Hz、1000Hz和2000Hz的任一频率的听力损失超过35dB(HL)，或在3000Hz频率的听力损失超过50dB(HL)",
                "但同时满足：(1)背离试验正常；(2)听力实际能力测试正常"
            ]
        }
    ]
  },
  
  // --- 7. 眼科 (Ophthalmology) ---
  {
    "id": "7.1",
    "category": "眼科",
    "name_zh": "视野",
    "name_en": "Visual Field",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "周边视野在鼻下象限任一径线缩小超过15度或在其他象限任一径线缩小超过25度",
            "或，中心视野出现具有临床意义的生理盲点扩大、非生理性暗点或缺损"
        ]
    }
  },
  {
    "id": "7.2",
    "category": "眼科",
    "name_zh": "色觉",
    "name_en": "Color Vision",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有色盲"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "患有色弱",
                "能够迅速识别其工作环境中各种颜色的仪表、灯光信号、有色地标、航行灯、边界灯、障碍物或雷达图等",
                "色觉实际能力测试结果正常"
            ]
        }
    ]
  },
  {
    "id": "7.3",
    "category": "眼科",
    "name_zh": "光觉",
    "name_en": "Light Sense",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有夜盲或暗适应异常"
        ]
    }
  },
  {
    "id": "7.4",
    "category": "眼科",
    "name_zh": "双眼视功能",
    "name_en": "Binocular Vision Function",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有双眼视功能异常"
        ]
    }
  },
  {
    "id": "7.5.1",
    "category": "眼科",
    "name_zh": "眼睑疾病",
    "name_en": "Eyelid Diseases",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有影响视功能的睑内外翻或上睑下垂等眼睑疾病"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "治疗后，观察至少30日",
                "病情稳定，周边视野符合标准"
            ]
        }
    ]
  },
  {
    "id": "7.5.2",
    "category": "眼科",
    "name_zh": "泪器疾病",
    "name_en": "Lacrimal Apparatus Diseases",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有影响视功能的泪器畸形、阻塞或炎症等泪器疾病"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "治疗后，观察至少30日",
                "病情稳定，中心视野符合标准"
            ]
        }
    ]
  },
  {
    "id": "7.5.3.1",
    "category": "眼科",
    "name_zh": "眼眶炎症或外伤",
    "name_en": "Orbital Inflammation or Trauma",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有影响视功能的眼眶炎症或外伤等眼眶疾病"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "治疗后，观察至少90日",
                "病情稳定，中心视野符合标准，双眼视功能正常"
            ]
        }
    ]
  },
  {
    "id": "7.5.3.2",
    "category": "眼科",
    "name_zh": "甲状腺相关性眼病",
    "name_en": "Thyroid-Associated Ophthalmopathy",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有影响视功能的甲状腺相关性眼病"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "治疗后，观察至少90日",
                "病情稳定，无并发症，中心视野符合标准，眼球运动和双眼视功能正常"
            ]
        }
    ]
  },
  {
    "id": "7.6",
    "category": "眼科",
    "name_zh": "眼外肌疾病",
    "name_en": "Extraocular Muscle Diseases",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有影响视功能的显斜视、隐斜视、眼球运动障碍等眼外肌疾病"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "手术治疗后观察至少90日，或经双眼视觉训练",
                "病情稳定，双眼视功能无异常"
            ]
        }
    ]
  },
  {
    "id": "7.7.1",
    "category": "眼科",
    "name_zh": "角巩膜炎症或溃疡",
    "name_en": "Corneoscleral Inflammation or Ulcer",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有角膜炎症或溃疡"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "临床治愈后",
                "中心视野符合标准，对比敏感度正常"
            ]
        }
    ]
  },
  {
    "id": "7.7.2",
    "category": "眼科",
    "name_zh": "圆锥角膜",
    "name_en": "Keratoconus",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有圆锥角膜"
        ]
    }
  },
  {
    "id": "7.7.3",
    "category": "眼科",
    "name_zh": "角膜内皮病变或角膜营养不良",
    "name_en": "Corneal Endotheliopathy or Dystrophy",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "中心视野符合标准",
            "对比敏感度正常",
            "角膜生理功能无异常"
        ]
    }
  },
  {
    "id": "7.7.4",
    "category": "眼科",
    "name_zh": "其他角巩膜疾病",
    "name_en": "Other Corneoscleral Diseases",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有影响视功能的或角膜生理功能异常的其他角巩膜疾病"
        ]
    }
  },
  {
    "id": "7.8",
    "category": "眼科",
    "name_zh": "瞳孔异常",
    "name_en": "Pupil Abnormality",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有影响视功能的瞳孔形态异常和对光反应异常"
        ]
    }
  },
  {
    "id": "7.9",
    "category": "眼科",
    "name_zh": "晶状体疾病",
    "name_en": "Lens Diseases",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有影响视功能的晶状体疾病"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "年龄相关性白内障经白内障摘除联合单焦点人工晶状体植入手术治疗后",
                "观察至少90日",
                "病情稳定，无并发症及后遗症",
                "中心视野符合标准，对比敏感度正常"
            ]
        }
    ]
  },
  {
    "id": "7.10.1",
    "category": "眼科",
    "name_zh": "青光眼",
    "name_en": "Glaucoma",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有青光眼"
        ]
    }
  },
  {
    "id": "7.10.2",
    "category": "眼科",
    "name_zh": "高眼压症、可疑青光眼或青睫综合征",
    "name_en": "Ocular Hypertension, Suspected Glaucoma, or Glaucomatocyclitic Crisis",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "无明显症状",
            "眼压控制良好",
            "视野符合标准"
        ]
    }
  },
  {
    "id": "7.11",
    "category": "眼科",
    "name_zh": "葡萄膜疾病",
    "name_en": "Uveal Diseases",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有活动性葡萄膜炎或其他影响视功能的葡萄膜疾病"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "活动性葡萄膜炎临床治愈后",
                "无明显症状，眼压正常，中心视野符合标准"
            ]
        }
    ]
  },
  {
    "id": "7.12",
    "category": "眼科",
    "name_zh": "玻璃体疾病",
    "name_en": "Vitreous Diseases",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有影响视功能的玻璃体疾病"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "非手术治疗后，观察至少30日",
                "病情稳定，无并发症及后遗症，中心视野符合标准"
            ]
        }
    ]
  },
  {
    "id": "7.13.1.1",
    "category": "眼科",
    "name_zh": "中心性浆液性脉络膜视网膜病变",
    "name_en": "Central Serous Chorioretinopathy (CSCR)",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有中心性浆液性脉络膜视网膜病变"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "病情稳定，无症状，无并发症及后遗症，OCT及OCTA检查结果未见明显异常，中心视野符合标准",
                "或，观察至少90日，病情稳定，无症状，视力和中心视野符合标准，无并发症及后遗症"
            ]
        }
    ]
  },
  {
    "id": "7.13.1.2",
    "category": "眼科",
    "name_zh": "渗出性黄斑病变",
    "name_en": "Exudative Maculopathy",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有中心性渗出性脉络膜视网膜病变、渗出性年龄相关性黄斑变性、黄斑裂孔等黄斑病变"
        ]
    }
  },
  {
    "id": "7.13.1.3",
    "category": "眼科",
    "name_zh": "黄斑囊样水肿",
    "name_en": "Cystoid Macular Edema",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有黄斑囊样水肿"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "治疗后，囊样水肿消失，观察至少30日",
                "病情稳定，无症状，无并发症及后遗症",
                "OCT、OCTA和眼底血管荧光造影(FFA)检查结果未见明显异常",
                "视力、中心视野符合标准"
            ]
        }
    ]
  },
  {
    "id": "7.13.1.4",
    "category": "眼科",
    "name_zh": "黄斑前膜",
    "name_en": "Epiretinal Membrane",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有影响视功能的黄斑前膜"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "观察至少30日",
                "病情稳定，无症状，无并发症及后遗症，中心视野符合标准"
            ]
        }
    ]
  },
  {
    "id": "7.13.1.5",
    "category": "眼科",
    "name_zh": "萎缩性或陈旧性黄斑病变",
    "name_en": "Atrophic or Old Maculopathy",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "患有萎缩性年龄相关性黄斑变性或陈旧性黄斑病变",
            "无症状，无并发症及后遗症，中心视野符合标准"
        ]
    }
  },
  {
    "id": "7.13.1.6",
    "category": "眼科",
    "name_zh": "视网膜色素上皮脱离",
    "name_en": "Retinal Pigment Epithelium Detachment",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "病情稳定，无症状，无并发症及后遗症，视野符合标准"
        ]
    }
  },
  {
    "id": "7.13.2.1",
    "category": "眼科",
    "name_zh": "糖尿病视网膜病变",
    "name_en": "Diabetic Retinopathy",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有增生期或重度非增生期糖尿病视网膜病变"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "轻度或中度非增生期糖尿病视网膜病变",
                "观察至少30日",
                "病情稳定，无并发症及后遗症，中心视野和周边视野符合标准"
            ]
        }
    ]
  },
  {
    "id": "7.13.2.2",
    "category": "眼科",
    "name_zh": "视网膜静脉阻塞",
    "name_en": "Retinal Vein Occlusion",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有视网膜中央静脉阻塞或影响视功能的分支静脉阻塞"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "经药物治疗或激光光凝术治疗后，观察至少30日",
                "病情稳定，无并发症及后遗症，中心视野和周边视野符合标准"
            ]
        }
    ]
  },
  {
    "id": "7.13.3",
    "category": "眼科",
    "name_zh": "视网膜裂孔和格子样变性",
    "name_en": "Retinal Tear and Lattice Degeneration",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有影响视功能的视网膜裂孔或格子样变性"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "经激光光凝术治疗，观察至少30日",
                "病情稳定，无并发症及后遗症，中心视野和周边视野符合标准"
            ]
        }
    ]
  },
  {
    "id": "7.13.4",
    "category": "眼科",
    "name_zh": "视网膜脱离",
    "name_en": "Retinal Detachment",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有视网膜脱离"
        ]
    }
  },
  {
    "id": "7.13.5",
    "category": "眼科",
    "name_zh": "遗传性视网膜营养不良",
    "name_en": "Hereditary Retinal Dystrophy",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有视网膜色素变性等遗传性视网膜营养不良"
        ]
    }
  },
  {
    "id": "7.13.6",
    "category": "眼科",
    "name_zh": "视神经病变",
    "name_en": "Optic Neuropathy",
    "standard": [
        {
            "assessment": "不合格",
            "conditions": [
                "患有影响视功能的视神经病变"
            ]
        },
        {
            "assessment": "合格",
            "conditions": [
                "临床治愈后，观察至少30日",
                "病情稳定，无症状，无并发症及后遗症",
                "中心视野符合标准，视觉电生理正常，色觉功能无影响"
            ]
        }
    ]
  },
  {
    "id": "7.13.7",
    "category": "眼科",
    "name_zh": "其他眼底病变",
    "name_en": "Other Fundus Diseases",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有影响视功能的其他眼底病变"
        ]
    }
  },
  {
    "id": "7.14.1",
    "category": "眼科",
    "name_zh": "视力",
    "name_en": "Visual Acuity",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "任一眼矫正或未矫正远视力低于0.7",
            "或，双眼矫正或未矫正远视力低于1.0",
            "或，任一眼矫正或未矫正近视力低于0.5",
            "或，矫正或未矫正中间视力低于0.25"
        ],
        "notes": "招飞体检鉴定申请人屈光度超过-4.50D~+3.00D范围(等效球镜)，散光两轴相差超过2.00D，或屈光参差超过2.50D(等效球镜)，应鉴定为不合格。"
    }
  },
  {
    "id": "7.15.1",
    "category": "眼科",
    "name_zh": "角膜屈光手术",
    "name_en": "Corneal Refractive Surgery",
    "standard": {
        "assessment": "合格",
        "conditions": [
            "接受角膜屈光手术后，观察至少90日",
            "满足相应的视力标准",
            "中心视野符合标准，对比敏感度和眩光对比敏感度正常",
            "无重度干眼、角膜扩张等手术并发症及后遗症",
            "手术前屈光度不超过5D（等效球镜）"
        ],
        "notes": "招飞体检鉴定申请人手术前屈光度要求不超过-4.50D~+3.00D范围（等效球镜）。"
    }
  },
  {
    "id": "7.16.1",
    "category": "眼科",
    "name_zh": "有晶体眼人工晶体植入术",
    "name_en": "Phakic IOL Implantation",
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "接受有晶体眼人工晶状体植入术"
        ]
    }
  }
];

// 导出数据模块
module.exports = {
  medicalStandards: medicalStandards
};