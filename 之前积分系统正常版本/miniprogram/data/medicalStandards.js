/**
 * 民用航空I级体检合格证（飞行员）医学标准数据库 (完整版)
 * Complete Medical Standards Database for Civil Aviation Class I Medical Certificate (Pilots)
 *
 * 数据来源：《民用航空体检鉴定医学标准实施细则》(AC-67FS-001R2)
 * Data Source: "Detailed Rules for the Implementation of Medical Standards for Civil Aviation Medical Examination and Appraisal" (AC-67FS-001R2)
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
    "standard": {
      "assessment": "不合格",
      "conditions": [
        "患有偏头痛、丛集性头痛、三叉神经痛或反复发作的其他头痛"
      ]
    }
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
          "患有高血压病，收缩压(SBP)持续 ≥ 155mmHg 或 舒张压(DBP)持续 > 95mmHg"
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
    "standard": {
        "assessment": "不合格",
        "conditions": [
            "患有严重心律失常",
            "伴有器质性病变导致的心律失常"
        ],
        "notes": "对于特定的非持续性室性心动过速，满足严格条件后可鉴定为合格。"
    }
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
          "接受心脏瓣膜手术治疗",
          "二叶式主动脉瓣、卵圆孔未闭、动脉导管未闭、房间隔缺损、室间隔缺损等先天性心脏病"
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
                "不伴有尿路梗阻、甲状旁腺功能亢进",
                "不得同时患有高甘油三酯血症、高尿酸血症和肥胖三项",
                "满足肾结石的随访要求"
            ],
            "notes": "限制条件：不能作为唯一机长在航空器上行使职责。"
        }
    ]
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
  
  // --- 6. 耳鼻咽喉及口腔科 (ENT & Stomatology) ---
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
  
  // --- 7. 眼科 (Ophthalmology) ---
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
            "手术前屈光度不超过-5.0D（等效球镜）"
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

module.exports = {
  medicalStandards: medicalStandards
};
