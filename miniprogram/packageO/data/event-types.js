/**
 * 事件类型数据定义
 * 基于《事件信息填报和处理规范》(AC-396-03R2) 和附件六示例
 *
 * 数据结构说明：
 * - category: 分类名称（按AC-396-03R2分类）
 * - title: 事件类型标题
 * - commonFields: 通用字段（所有事件都有）
 * - specificFields: 特定字段数组（该事件类型特有的字段）
 */

/**
 * 解析specificFieldsTemplate字符串，转换为字段数组
 * @param {string} template - 包含【】占位符的模板字符串
 * @returns {Array} 字段对象数组
 */
function parseSpecificFields(template) {
  try {
    // 输入验证
    if (!template) {
      console.log('⚠️ parseSpecificFields: 模板为空，返回空数组');
      return [];
    }

    if (typeof template !== 'string') {
      console.error('❌ parseSpecificFields: 模板必须是字符串，实际类型:', typeof template);
      return [];
    }

    // 使用正则提取所有【】内的内容
    var matches = template.match(/【([^】]+)】/g);
    if (!matches) {
      console.log('⚠️ parseSpecificFields: 未找到【】占位符');
      return [];
    }

    console.log('✅ parseSpecificFields: 找到', matches.length, '个字段占位符');

    var fields = matches.map(function(match, index) {
      // 去掉【】符号
      var label = match.replace(/【|】/g, '');

      // 验证标签不为空
      if (!label || !label.trim()) {
        console.warn('⚠️ parseSpecificFields: 字段', index, '标签为空，跳过');
        return null;
      }

      // 生成唯一的key（使用index确保唯一性）
      var key = 'field_' + index;

      return {
        key: key,
        label: label,
        placeholder: '请填写' + label,
        required: false
      };
    });

    // 过滤掉null值（空标签的字段）
    var validFields = fields.filter(function(field) {
      return field !== null;
    });

    console.log('✅ parseSpecificFields: 成功解析', validFields.length, '个有效字段');
    return validFields;

  } catch (error) {
    console.error('❌ parseSpecificFields发生异常:', error);
    console.error('❌ 异常模板内容:', template);
    return [];
  }
}

module.exports = {
  // 通用字段定义（所有事件类型都需要填写）
  commonFields: [
    { key: 'location', label: '所在区域/机场/跑道', required: false, placeholder: '如：北京区域管制中心、首都机场36L跑道' },
    { key: 'phase', label: '飞行阶段', required: true, placeholder: '如：巡航阶段、进近阶段' },
    { key: 'weather', label: '天气情况', required: false, placeholder: '如：VMC、IMC、晴朗' },
    { key: 'crewAction', label: '机组处置情况', required: true, placeholder: '描述机组采取的处置措施' },
    { key: 'followUp', label: '后续运行情况', required: true, placeholder: '如：后续运行正常' }
  ],

  // 事件类型列表（按AC-396-03R2分类）
  eventTypes: [
    // ========== 空中运行 ==========
    {
      category: '空中运行',
      title: 'ACAS（TCAS）RA告警',
      specificFieldsTemplate: '【告警触发前/期间/之后飞机的飞行状态】，【告警类型和持续时间】，【告警前管制员指令】，【与管制员沟通情况】，【飞行最高/最低高度】，【两机间隔情况】'
    },
    {
      category: '空中运行',
      title: '可控飞行撞地/障碍物',
      specificFieldsTemplate: '【周围环境】，【飞行高度】，【自动驾驶仪和自动油门工作情况】，【告警情况】，【飞行轨迹】，【与管制员沟通情况】，【飞机及地面障碍物间隔情况】'
    },
    {
      category: '空中运行',
      title: '低于最低油量',
      specificFieldsTemplate: '【低于最低油量的现象/燃油参数/FOB/EFOB】，【可选备降场情况】，【是否申请优先着陆】，【是否宣布最低油量/紧急状态】，【宣布最低油量/燃油紧急状况的原因】，【宣布最低油量/燃油紧急状况时的油量】，【与管制员沟通情况】，【实际着陆机场】，【落地剩余油量和机型最后储备油量】，【飞行计划燃油与加油情况】'
    },
    {
      category: '空中运行',
      title: '燃油不平衡',
      specificFieldsTemplate: '【燃油不平衡现象】，【燃油不平衡出现时的高度】，【左右油箱油量差值】，【左右油箱油量】，【现象持续时间】，【故障情况】，【与管制员沟通情况】，【落地剩余油量和机型最后储备油量】'
    },
    {
      category: '空中运行',
      title: '失控/失速',
      specificFieldsTemplate: '【发生时的飞行阶段】，【发生时的高度】，【发生时的现象/告警】，【期间飞机状态/姿态/坡度/速度/高度及变化情况】，【非正常状态持续时间】，【与管制员沟通情况】'
    },
    {
      category: '空中运行',
      title: '超速',
      specificFieldsTemplate: '【超速现象/告警】，【期间飞机状态/姿态/坡度/速度/高度及变化情况】，【超速状态持续时间】，【速度限制】，【最大速度】，【超过速度限制的数值】'
    },
    {
      category: '空中运行',
      title: '迷航/偏航',
      specificFieldsTemplate: '【发生的时间】，【计划/指令航线】，【飞行高度】，【迷航/偏航现象】，【实际飞行的航路/轨迹/航向】，【偏离应飞航路的最大距离】，【与管制员沟通情况】，【是否造成冲突】，【是否进入限制区】，【落地剩余油量和机型最后储备油量】'
    },
    {
      category: '空中运行',
      title: '低于/未保持规定高度',
      specificFieldsTemplate: '【低于/未保持规定高度的现象】，【规定高度】，【实际高度】，【偏离规定高度的数值】，【是否造成冲突】，【是否触发告警】，【与管制员沟通情况】'
    },
    {
      category: '空中运行',
      title: '鸟击',
      specificFieldsTemplate: '【使用的跑道】，【鸟击高度或根据目视鸟（群）、听到异响、观察到飞机参数异常/其他状态异常等情况判断的疑似鸟击高度】，【航空器速度】，【观察到的鸟情】，【鸟击现象/声音/方位及观察到的情况】，【对飞行的影响、飞机参数、遭鸟击后的状态】，【是否通报管制】，【是否通报机务】，【记录本填写情况】，【机务检查情况/鸟击部位/损伤情况/残留物情况】'
    },
    {
      category: '空中运行',
      title: '机组失能/发病',
      specificFieldsTemplate: '【失能/发病时的运行阶段】，【失能或者发病的具体人员信息】，【失能或者发病的现象】，【机组病史】，【是否造成运行不正常】，【是否宣布紧急情况】'
    },
    {
      category: '空中运行',
      title: '释压/紧急下降',
      specificFieldsTemplate: '【飞行高度】，【释压现象/告警情况】，【座舱高度】，【释压/紧急下降后的飞行高度】，【是否宣布紧急情况】，【旅客氧气面罩释放情况】，【飞机故障情况】，【与管制员沟通情况】，【机组和旅客是否使用氧气】，【机上人员状况】'
    },
    {
      category: '空中运行',
      title: '外来物击伤',
      specificFieldsTemplate: '【运行阶段】，【外来物撞击现象/声音/方位及观察到的情况】，【对飞行的影响】，【与管制员沟通情况】，【是否通报机务】，【记录本填写情况】，【机务检查情况/航空器损伤情况】'
    },
    {
      category: '空中运行',
      title: '通信中断',
      specificFieldsTemplate: '【所在管制区域】，【所在通信频道】，【通信中断的现象】，【飞机故障情况】，【通信中断起、止时间及中断时长】，【与管制员沟通情况】，【是否造成其他航空器避让或其他飞行不正常情况】'
    },

    // ========== 起飞/着陆 ==========
    {
      category: '起飞/着陆',
      title: '中断起飞',
      specificFieldsTemplate: '【所在机场/跑道】，【中断起飞前的不正常现象】，【中断起飞的原因/故障情况】，【机组决策处置情况】，【执行中断起飞操作时的速度】，【V1】，【中断起飞后的情况】，【与管制员沟通情况】'
    },
    {
      category: '起飞/着陆',
      title: '着陆载荷大',
      specificFieldsTemplate: '【所在机场】，【执行的进近程序】，【运行跑道】，【稳定进近的时机】，【跑道入口飞行状态】，【拉平着陆过程状态】，【着陆姿态】，【飞机接地前的下降率】，【着陆载荷】，【向机务通报的情况】'
    },
    {
      category: '起飞/着陆',
      title: '超重着陆',
      specificFieldsTemplate: '【所在机场/跑道】，【超重着陆的原因】，【机组处置决策情况】，【超重着陆程序执行情况】，【着陆情况】，【实际着陆重量】，【着陆重量限制】，【着陆载荷】，【是否通报机务】，【记录本填写情况】，【落地剩余油量和机型最后储备油量】'
    },
    {
      category: '起飞/着陆',
      title: '擦尾/擦发动机/擦翼尖/擦机腹',
      specificFieldsTemplate: '【所在机场】，【使用跑道】，【执行的程序】，【事件发生的影响因素】，【航空器擦地部位】，【航空器擦地前后姿态】，【是否触发告警】，【机组是否有感知】，【机组决策情况/中断/复飞/返航/备降】，【航前飞机故障保留情况】，【航前放行情况】，【航空器损伤情况】，【后续维修处理情况】'
    },
    {
      category: '起飞/着陆',
      title: '跑道侵入/占用',
      specificFieldsTemplate: '【计划、实际跑道/滑行道/线路】，【事件发生的影响因素】，【侵入/占用使用跑道】，【跑道占用和/或侵入情况】，【能见度和跑道视程】，【航空器和/或车辆的避让情况】，【涉及的航空器、车辆、人员信息】，【管制员工作情况】'
    },
    {
      category: '起飞/着陆',
      title: '中止进近/复飞',
      specificFieldsTemplate: '【所在机场】，【使用跑道】，【执行程序】，【中止进近和复飞时的高度（需包括气压高度和观察到的无线电高度表高度）】，【中止进近/复飞原因】，【飞行程序或飞行轨迹/公布程序/雷达引导】，【中止进近/复飞过程中的飞机状态/最低高度（需包括气压高度和观察到的无线电高度表高度）】，【中止进近/复飞后的决策】，【落地剩余油量和机型最后储备油量】'
    },
    {
      category: '起飞/着陆',
      title: '返航/备降',
      specificFieldsTemplate: '【返航/备降的原因/是否等待】，【实际着陆机场】，【落地剩余油量和机型最后储备油量】，【后续航班执行计划】'
    },
    {
      category: '起飞/着陆',
      title: '飞偏/飞错进离场程序',
      specificFieldsTemplate: '【所在机场】，【使用跑道】，【指令的进离场程序/轨迹】，【实际的进离场程序/轨迹】，【飞偏/飞错的现象和具体情况】，【机组对偏差的处置/修正情况】，【与管制员的沟通情况】，【是否涉及平行跑道运行】，【是否涉及限制区】，【是否造成冲突】'
    },

    // ========== 航空器相关 ==========
    {
      category: '航空器相关',
      title: '爆胎/轮胎脱层/扎破',
      specificFieldsTemplate: '【所在机场】，【发生或发现阶段】，【使用跑道/滑行道/滑行线路】，【察觉到的现象/告警/飞机状态偏差】，【爆胎后机组处置情况】，【与地面维护人员沟通情况】'
    },
    {
      category: '航空器相关',
      title: '系统失效/故障/卡阻',
      specificFieldsTemplate: '【发生或发现的运行阶段】，【系统失效/故障/卡阻现象及告警】，【失效功能/部件及程度】，【对飞行的影响/是否造成高度、速度或飞行轨迹改变/是否造成中止进近、复飞、返航、备降、占用跑道、需机场启动应急救援响应程序等运行不正常情况】，【运行前故障保留情况】，【放行情况】'
    },
    {
      category: '航空器相关',
      title: '发动机停车',
      specificFieldsTemplate: '【发生或发现的运行阶段】，【飞行高度/飞行速度/发动机参数】，【告警信息及故障现象/熄火/需关车】，【关车或需要关车的发动机】，【与管制员沟通情况】，【灭火瓶使用/释放情况】，【对飞行的影响/是否造成高度、速度或飞行轨迹改变/是否造成中断起飞、中止进近、复飞、返航、备降、占用跑道、需机场启动应急救援响应程序等运行不正常情况】，【是否涉及积冰、鸟击、尾流、雷击、火山灰】，【运行前故障保留情况】，【放行情况】'
    },
    {
      category: '航空器相关',
      title: '其他发动机相关事件',
      specificFieldsTemplate: '【发生或发现的运行阶段】，【飞行高度/飞行速度/发动机参数】，【告警信息及故障现象】，【与管制员沟通情况】，【对飞行的影响/是否造成高度、速度或飞行轨迹改变/是否造成中断起飞、中止进近、复飞、返航、备降、占用跑道、需机场启动应急救援响应程序等运行不正常情况】，【是否涉及积冰、鸟击、尾流、雷击、火山灰】'
    },
    {
      category: '航空器相关',
      title: '航空器（内）起火/冒烟/火警',
      specificFieldsTemplate: '【发生或发现的运行阶段】，【起火/冒烟位置/系统】，【起火/冒烟原因/现象/告警】，【是否有明火】，【机组/客舱机组处置情况】，【灭火瓶使用/释放情况】，【机组/客舱机组处置结果】，【起火/冒烟现象/告警持续时间】，【如旅客吸烟造成的烟雾告警需明确电子烟或烟草】，【对飞行的影响/是否造成高度、速度或飞行轨迹改变/是否造成中断起飞、中止进近、复飞、返航、备降、占用跑道、需机场启动应急救援响应程序等运行不正常情况】，【航空器损伤及人员受伤情况】'
    },
    {
      category: '航空器相关',
      title: '油（燃油/滑油/液压油）泄漏/溢出',
      specificFieldsTemplate: '【发生或发现的运行阶段】，【告警信息及现象】，【与管制员或地面人员的沟通情况】，【是否宣布紧急状态或申请优先着陆】，【泄漏油量/面积】，【对飞行的影响/是否造成高度、速度或飞行轨迹改变/是否造成中断起飞、中止进近、复飞、返航、备降、占用跑道、需机场启动应急救援响应程序等运行不正常情况】'
    },

    // ========== 地面运行 ==========
    {
      category: '地面运行',
      title: '停机超过/偏离停机线/中心线',
      specificFieldsTemplate: '【所在机场/机位】，【进位电子引导/人工引导】，【进位停机操作过程和观察到的现象】，【停机超过/偏离停机线/中心线距离】，【是否造成地面冲突或其他影响】，【是否使用拖车】，【与地面人员的沟通情况】'
    },
    {
      category: '地面运行',
      title: '冲/偏出跑道',
      specificFieldsTemplate: '【所在机场/跑道】，【执行的进近/离场程序】，【天气/道面情况】，【事件的影响因素】，【冲/偏出跑道的过程和现象】，【冲/偏出跑道的位置】，【冲/偏出跑道后飞机所处位置和状态】，【人员和飞机情况】，【与管制员沟通情况】，【是否宣布紧急状态】，【其他影响情况】'
    },
    {
      category: '地面运行',
      title: '偏出滑行道/联络道',
      specificFieldsTemplate: '【所在机场/滑行道/联络道】，【实际滑行路线】，【事件的影响因素】，【偏出滑行道/联络道过程和现象】，【偏出滑行道/联络道的位置】，【偏出滑行道/联络道后飞机所处位置和状态】，【是否偏出边线/轧边灯/偏出道肩】，【人员和飞机情况】，【与管制员沟通情况】，【是否宣布紧急状态】，【其他影响情况】'
    },
    {
      category: '地面运行',
      title: '滑错滑行道',
      specificFieldsTemplate: '【所在机场/滑行道/联络道】，【管制员指令滑行路线】，【机组对指令的复述情况】，【机组实际滑行路线】，【实际滑行路线与指令滑行路线的偏离情况】，【与管制员沟通情况】，【是否使用拖车】，【是否造成其他影响】'
    },
    {
      category: '地面运行',
      title: '滑梯放出/滑梯包脱落/应急出口打开',
      specificFieldsTemplate: '【所在机场/跑道/滑行道/机位】，【放出/打开的时间、地点、运行阶段】，【放出/打开过程和现象】，【放出/打开的人员】，【飞行机组与客舱机组沟通情况】，【处置情况或采取的措施】，【与管制员的沟通情况】，【对运行造成的影响】'
    },
    {
      category: '地面运行',
      title: 'ELT触发',
      specificFieldsTemplate: '【所在区域/机场】，【运行阶段】，【触发过程、现象和其他情况】，【触发ELT的人员或可知原因】，【ELT发射情况】，【机组处置措施】，【与管制员沟通情况】，【对运行造成的影响】'
    },

    // ========== 天气 ==========
    {
      category: '天气',
      title: '航空器结冰造成非正常情况',
      specificFieldsTemplate: '【所在区域/机场】，【运行阶段】，【积冰现象/告警】，【积冰对系统或参数造成的影响】，【对航空器结构、性能、机组操纵等的影响】，【对飞行的影响/是否造成高度、速度或飞行轨迹改变/是否造成中断起飞、中止进近、复飞、返航、备降、占用跑道、需机场启动应急救援响应程序等运行不正常情况】'
    },
    {
      category: '天气',
      title: '空中颠簸',
      specificFieldsTemplate: '【所在区域/机场】，【运行阶段】，【气象雷达工作情况】，【飞行高度】，【飞行速度】，【颠簸程度】，【遭遇颠簸后机组处置情况】，【飞行高度/速度偏离情况】，【飞机姿态/坡度变化情况】，【期间AP是否保持接通】，【安全带灯状态】，【人员受伤情况】，【航空器损伤情况】'
    },
    {
      category: '天气',
      title: '风切变',
      specificFieldsTemplate: '【所在区域/机场】，【运行阶段和触发风切变的高度】，【飞行高度/速度】，【风切告警类型/现象/姿态、速度、升降率、高度变化情况】，【风向风速变化情况】，【机组处置情况/过程/结果】，【风切告警/现象持续时间】，【风切变改出后与管制员沟通情况】，【风切变改出后的飞行情况】'
    },
    {
      category: '天气',
      title: '雷击/电击',
      specificFieldsTemplate: '【所在区域/机场】，【运行阶段】，【气象雷达工作情况（包括雷达开关设置情况、雷达增益设置情况、雷达天线角度设置情况、雷达天气显影显示情况等）】，【发生雷击时飞机实际位置】，【雷击/电击现象】，【遭雷击或电击部位】，【航空器系统或参数受影响情况】，【客舱是否出现异常情况】，【与管制员沟通情况】，【与地面维护人员沟通情况】'
    }
  ],

  /**
   * 根据事件类型获取字段模板
   * @param {string} eventType 事件类型标题
   * @returns {object} 包含通用字段和特定字段的对象
   */
  getEventTypeFields: function(eventType) {
    var event = this.eventTypes.find(function(item) {
      return item.title === eventType;
    });

    if (!event) {
      return null;
    }

    return {
      commonFields: this.commonFields,
      specificFields: parseSpecificFields(event.specificFieldsTemplate),
      specificFieldsTemplate: event.specificFieldsTemplate  // 保留原模板以兼容
    };
  },

  /**
   * 获取所有分类
   * @returns {Array} 分类列表
   */
  getCategories: function() {
    var categories = [];
    var seen = {};

    this.eventTypes.forEach(function(event) {
      if (!seen[event.category]) {
        categories.push(event.category);
        seen[event.category] = true;
      }
    });

    return categories;
  },

  /**
   * 根据分类获取事件类型
   * @param {string} category 分类名称
   * @returns {Array} 该分类下的事件类型列表
   */
  getEventTypesByCategory: function(category) {
    return this.eventTypes.filter(function(event) {
      return event.category === category;
    });
  }
};
