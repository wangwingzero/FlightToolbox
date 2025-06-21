// /services/event.data.ts
import { EventCategory, EventType } from './event.types';

/**
 * 根据分类ID获取分类
 */
export function getCategoryById(categoryId: string): EventCategory | null {
  for (let i = 0; i < eventCategories.length; i++) {
    if (eventCategories[i].id === categoryId) {
      return eventCategories[i];
    }
  }
  return null;
}

/**
 * 根据事件类型ID获取事件类型
 */
export function getEventTypeById(eventTypeId: string): EventType | null {
  for (const category of eventCategories) {
    for (let i = 0; i < category.eventTypes.length; i++) {
      if (category.eventTypes[i].id === eventTypeId) {
        return category.eventTypes[i];
      }
    }
  }
  return null;
}

export const eventCategories: EventCategory[] = [
  // =================================================================
  // == (一) 运输航空紧急事件样例 (共22项)
  // =================================================================
  {
    id: 'transport-urgent',
    name: '运输航空 - 紧急事件',
    eventTypes: [
      {
        id: 'urgent-1', name: '1. 航空器空中相撞、坠毁或迫降',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
            { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
            { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
            { id: 'aircraftModel', label: '机型', type: 'text', required: true },
            { id: 'location', label: '事发地点', type: 'text', required: true },
            { id: 'description', label: '事件简要经过', type: 'textarea', required: true },
            { id: 'casualties', label: '人员伤亡情况', type: 'text', required: true },
            { id: 'damage', label: '航空器损伤情况', type: 'text', required: true },
        ],
        template: '【eventTime】，【aircraftModel】飞机执行【flightInfo】时，在【location】发生【name】。经过：【事件简要经过】。人员伤亡：【casualties】。航空器损伤：【damage】。'
      },
      {
        id: 'urgent-2', name: '2. 飞行中，航空器失控、失速，出现失速警告、抖杆累计3s(含)以上',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
            { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
            { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
            { id: 'altitude', label: '事发高度/阶段', type: 'text', required: true },
            { id: 'warningDuration', label: '警告/抖杆累计时间', type: 'text', required: true, placeholder: '例如：抖杆累计5秒' },
            { id: 'crewAction', label: '机组处置情况', type: 'textarea', required: true },
            { id: 'aircraftStatus', label: '改出后飞机状态', type: 'text', required: true },
        ],
        template: '【eventTime】，执行【flightInfo】航班，在【事发高度/阶段】发生失控/失速，出现【警告/抖杆累计时间】。机组处置：【机组处置情况】。飞机状态：【改出后飞机状态】。'
      },
      {
        id: 'urgent-3', name: '3. 飞行中，挂碰障碍物（含升空物体）或起落架机轮之外的任何部位触地/水',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'location', label: '事发地点/阶段', type: 'text', required: true },
          { id: 'obstacle', label: '挂碰的障碍物/触地部位', type: 'text', required: true },
          { id: 'damage', label: '航空器损伤情况', type: 'text', required: true },
          { id: 'crewAction', label: '机组处置情况', type: 'textarea', required: true },
        ],
        template: '【eventTime】，执行【flightInfo】航班，在【事发地点/阶段】挂碰到【挂碰的障碍物/触地部位】。航空器损伤情况：【航空器损伤情况】。机组处置：【机组处置情况】。'
      },
      {
        id: 'urgent-4', name: '4. 低于安全高度需机组立即采取措施或触发拉起（Pull-Up）地形警告',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'location', label: '事发位置', type: 'text', required: true },
          { id: 'minAltitude', label: '最低安全高度', type: 'text', required: true },
          { id: 'actualAltitude', label: '实际高度', type: 'text', required: true },
          { id: 'warningType', label: '警告类型', type: 'text', required: true, placeholder:'例如：GPWS Pull-Up' },
          { id: 'crewAction', label: '机组采取的措施', type: 'textarea', required: true },
        ],
        template: '【eventTime】，执行【flightInfo】航班，在【事发位置】低于安全高度。最低安全高度【最低安全高度】，实际为【实际高度】，触发【警告类型】警告。机组措施：【机组采取的措施】。'
      },
      {
        id: 'urgent-5', name: '5. 冲/偏出跑道、滑行道或跑道外接地',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'location', label: '机场和跑道/滑行道', type: 'text', required: true },
          { id: 'description', label: '事件经过', type: 'textarea', required: true, placeholder: '描述冲/偏出过程，含中断起飞停在停止道' },
          { id: 'damage', label: '航空器及设施损伤', type: 'text', required: true },
          { id: 'weather', label: '天气情况', type: 'text', required: false },
        ],
        template: '【eventTime】，执行【flightInfo】航班，在【机场和跑道/滑行道】发生冲/偏出事件。经过：【事件经过】。损伤情况：【航空器及设施损伤】。天气：【天气情况】。'
      },
      {
        id: 'urgent-6', name: '6. 在航空器起飞或进近着陆阶段机场标高60m以下发生的跑道侵入',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'runway', label: '事发跑道', type: 'text', required: true },
          { id: 'intruder', label: '侵入物（航空器/车辆/人员）', type: 'text', required: true },
          { id: 'altitude', label: '事发时航空器高度', type: 'text', required: true },
          { id: 'crewAction', label: '机组避让措施', type: 'textarea', required: true },
        ],
        template: '【eventTime】，执行【flightInfo】航班，在【事发跑道】起飞/进近阶段，于高度【事发时航空器高度】遭遇【侵入物（航空器/车辆/人员）】跑道侵入。机组措施：【机组避让措施】。'
      },
      {
        id: 'urgent-7', name: '7. 在滑行道，或未指定、关闭、占用的跑道上，起飞、中断起飞、着陆或从机场标高300m以下复飞',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'location', label: '错误的跑道/滑行道', type: 'text', required: true },
          { id: 'intendedLocation', label: '预期的跑道/滑行道', type: 'text', required: true },
          { id: 'operation', label: '执行的操作', type: 'text', required: true, placeholder:'起飞/着陆/复飞等' },
          { id: 'reason', label: '事件原因', type: 'textarea', required: true },
        ],
        template: '【eventTime】，执行【flightInfo】航班，在【错误的跑道/滑行道】执行了【执行的操作】，而预期应在【预期的跑道/滑行道】。原因：【事件原因】。'
      },
      {
        id: 'urgent-8', name: '8. 飞行中，飞行机组成员因受伤、患病、疲劳、酒精、食物中毒或药物的影响而无法履行其职责',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'phase', label: '事发飞行阶段', type: 'text', required: true },
          { id: 'member', label: '无法履职的机组成员', type: 'text', required: true, placeholder:'机长/副驾驶' },
          { id: 'reason', label: '无法履职原因', type: 'text', required: true },
          { id: 'crewAction', label: '其他机组成员采取的措施', type: 'textarea', required: true, placeholder:'例如：宣布紧急状态、备降等' },
        ],
        template: '【eventTime】，执行【flightInfo】航班，在【事发飞行阶段】，【无法履职的机组成员】因【无法履职原因】无法履行职责。其他机组采取的措施：【其他机组成员采取的措施】。'
      },
      {
        id: 'urgent-9', name: '9. 飞行中，出现座舱高度警告、或客舱氧气面罩自动脱落的情况，以及出现烟雾或毒气等需要飞行员使用氧气的紧急情况',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'altitude', label: '事发高度', type: 'text', required: true },
          { id: 'eventType', label: '事件类型', type: 'text', required: true, placeholder:'座舱高度警告/氧气面罩脱落/烟雾/毒气' },
          { id: 'crewAction', label: '机组处置情况', type: 'textarea', required: true, placeholder:'例如：紧急下降、戴氧气面罩、通讯等' },
        ],
        template: '【eventTime】，执行【flightInfo】航班，在高度【事发高度】发生【事件类型】。机组处置情况：【机组处置情况】。'
      },
      {
        id: 'urgent-10', name: '10. 航空器起火、冒烟；发动机起火，或出现火警；飞行时间内，航空器出现火警、烟雾警告',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
            { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
            { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
            { id: 'location', label: '起火/冒烟/警告位置', type: 'text', required: true, placeholder:'例如：左发、客舱、货舱' },
            { id: 'warningType', label: '火警/烟雾警告详情', type: 'text', required: false },
            { id: 'crewAction', label: '机组处置情况', type: 'textarea', required: true, placeholder:'例如：执行灭火程序、备降等' },
        ],
        template: '【eventTime】，执行【flightInfo】航班，在【起火/冒烟/警告位置】发生起火/冒烟，触发【火警/烟雾警告详情】。机组处置：【机组处置情况】。'
      },
      {
        id: 'urgent-11', name: '11. 非包容性涡轮发动机失效；飞行时间内，出现任意一台发动机停车或需要关停的情况',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
            { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
            { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
            { id: 'phase', label: '事发飞行阶段', type: 'text', required: true },
            { id: 'engineInfo', label: '失效/关停的发动机', type: 'text', required: true, placeholder:'例如：1号发动机' },
            { id: 'reason', label: '失效/关停原因', type: 'text', required: true },
            { id: 'crewAction', label: '机组处置情况', type: 'textarea', required: true, placeholder:'例如：执行单发程序、备降等' },
        ],
        template: '【eventTime】，执行【flightInfo】航班，在【事发飞行阶段】，【失效/关停的发动机】发生非包容性失效/停车/需要关停，原因为【失效/关停原因】。机组处置：【机组处置情况】。'
      },
      {
        id: 'urgent-12', name: '12. 飞行中，导致航空器操纵困难（以飞行员判断为准）的系统故障、部件脱落、天气现象、飞行超出批准的飞行包线或其他情况；接到飞行员报告“操纵困难”',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
            { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
            { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
            { id: 'phase', label: '事发飞行阶段', type: 'text', required: true },
            { id: 'reason', label: '导致操纵困难的原因', type: 'text', required: true, placeholder:'系统故障/天气/超包线等' },
            { id: 'description', label: '操纵困难的具体表现', type: 'textarea', required: true },
            { id: 'crewAction', label: '机组处置情况', type: 'textarea', required: true },
        ],
        template: '【eventTime】，执行【flightInfo】航班，在【事发飞行阶段】因【导致操纵困难的原因】导致操纵困难。具体表现：【操纵困难的具体表现】。机组处置：【机组处置情况】。'
      },
      {
        id: 'urgent-13', name: '13. 低于运行标准（机场运行最低标准、航空器运行标准、飞行机组资格标准）起飞、开始最后进近或着陆',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
            { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
            { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
            { id: 'operation', label: '执行的操作', type: 'text', required: true, placeholder:'起飞/最后进近/着陆' },
            { id: 'standardType', label: '低于的标准类型', type: 'text', required: true },
            { id: 'actualValue', label: '实际值', type: 'text', required: true },
            { id: 'requiredValue', label: '标准要求值', type: 'text', required: true },
        ],
        template: '【eventTime】，执行【flightInfo】航班，在【执行的操作】时低于【低于的标准类型】运行。标准要求：【标准要求值】，实际为：【实际值】。'
      },
      {
        id: 'urgent-14', name: '14. 未取下操纵面夹板、起落架安全销、挂钩、空速管套、静压孔塞或尾撑杆起飞',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
            { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
            { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
            { id: 'airport', label: '起飞机场', type: 'text', required: true },
            { id: 'itemNotRemoved', label: '未取下的设备', type: 'text', required: true },
            { id: 'discoveryPhase', label: '发现阶段和方式', type: 'text', required: true },
            { id: 'consequence', label: '对飞行的影响', type: 'textarea', required: true },
        ],
        template: '【eventTime】，执行【flightInfo】航班，从【起飞机场】起飞时未取下【未取下的设备】。在【发现阶段和方式】发现该情况。对飞行的影响：【对飞行的影响】。'
      },
      {
        id: 'urgent-15', name: '15. 需要机组成员宣布遇险状态（Mayday）、宣布紧急状态（Pan Pan）、设置应答机编码7700或需要紧急撤离的情况',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
            { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
            { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
            { id: 'declarationType', label: '宣布状态/设置编码', type: 'text', required: true, placeholder:'Mayday/Pan Pan/7700/紧急撤离' },
            { id: 'reason', label: '宣布/设置的原因', type: 'textarea', required: true, placeholder:'不含天气绕飞、旅客患病' },
            { id: 'crewAction', label: '机组后续处置', type: 'textarea', required: true },
        ],
        template: '【eventTime】，执行【flightInfo】航班，机组宣布【宣布状态/设置编码】。原因：【宣布/设置的原因】。机组后续处置：【机组后续处置】。'
      },
      {
        id: 'urgent-16', name: '16. 飞行中，航空器与航空器之间小于规定间隔（不考虑容差）或平行跑道同时仪表进近时航空器进入非侵入区（NTZ）',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
            { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
            { id: 'flightInfo', label: '本航班信息', type: 'text', required: true },
            { id: 'otherFlightInfo', label: '对方航班信息', type: 'text', required: true },
            { id: 'location', label: '事发空域/位置', type: 'text', required: true },
            { id: 'minSeparation', label: '最小间隔（垂直/水平）', type: 'text', required: true },
            { id: 'requiredSeparation', label: '规定间隔', type: 'text', required: true },
        ],
        template: '【eventTime】，在【事发空域/位置】，【本航班信息】与【对方航班信息】发生间隔小于规定。规定间隔【规定间隔】，最小间隔【最小间隔（垂直/水平）】。'
      },
      {
        id: 'urgent-17', name: '17. 飞错航路、飞偏或飞错进离场航线、未正确执行复飞程序，并导致其他航空器避让',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
            { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
            { id: 'flightInfo', label: '本航班信息', type: 'text', required: true },
            { id: 'otherFlightInfo', label: '被避让的航班信息', type: 'text', required: true },
            { id: 'deviationInfo', label: '飞错/飞偏/未正确执行的详情', type: 'textarea', required: true },
            { id: 'avoidanceAction', label: '对方采取的避让措施', type: 'text', required: true, placeholder:'调整高度/航向/航路' },
        ],
        template: '【eventTime】，【本航班信息】因【飞错/飞偏/未正确执行的详情】，导致【被避让的航班信息】采取了【对方采取的避让措施】的避让措施。'
      },
      {
        id: 'urgent-18', name: '18. 迷航，误入禁区、危险区、限制区、炮射区，误入或误出国境',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'entryArea', label: '误入的区域类型和名称', type: 'text', required: true, placeholder:'禁区/危险区/国境' },
          { id: 'duration', label: '在区域内持续时间', type: 'text', required: true },
          { id: 'reason', label: '迷航/误入原因', type: 'textarea', required: true },
          { id: 'crewAction', label: '机组处置情况', type: 'textarea', required: true },
        ],
        template: '【eventTime】，执行【flightInfo】航班，发生迷航，误入【误入的区域类型和名称】，持续时间【在区域内持续时间】。原因：【迷航/误入原因】。机组处置：【机组处置情况】。'
      },
      {
        id: 'urgent-19', name: '19. 区域范围内，陆空通信双向联系中断20min(含)以上；飞行中，进近或塔台范围内，陆空通信双向联系中断3min(含)以上',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
            { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
            { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
            { id: 'controlArea', label: '事发管制区域', type: 'text', required: true, placeholder:'区域/进近/塔台' },
            { id: 'interruptionDuration', label: '中断时长', type: 'text', required: true },
            { id: 'reason', label: '中断原因', type: 'textarea', required: true },
            { id: 'recoveryMethod', label: '恢复联系方式', type: 'text', required: true },
        ],
        template: '【eventTime】，执行【flightInfo】航班，在【事发管制区域】发生陆空通信中断，时长【中断时长】。原因：【中断原因】。通过【恢复联系方式】恢复联系。'
      },
      {
        id: 'urgent-20', name: '20. 航空器与航空器碰撞；航空器与设施设备、车辆、人员或其他地面障碍物碰撞，导致航空器受损',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
            { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
            { id: 'location', label: '碰撞地点（空中/地面）', type: 'text', required: true },
            { id: 'flightInfo', label: '本航班信息', type: 'text', required: true },
            { id: 'collisionObject', label: '碰撞对象', type: 'text', required: true, placeholder:'另一架航空器/车辆/廊桥等' },
            { id: 'damage', label: '航空器受损情况', type: 'textarea', required: true },
        ],
        template: '【eventTime】，在【碰撞地点（空中/地面）】，【本航班信息】与【碰撞对象】发生碰撞，导致航空器【航空器受损情况】。'
      },
      {
        id: 'urgent-21', name: '21. 因航空器原因需机场启动紧急出动等级的应急救援响应',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
            { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
            { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
            { id: 'airport', label: '事发机场', type: 'text', required: true },
            { id: 'reason', label: '需要应急救援的航空器原因', type: 'textarea', required: true },
            { id: 'responseLevel', label: '启动的响应等级', type: 'text', required: true, placeholder:'例如：紧急出动' },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发机场】，因【需要应急救援的航空器原因】，需要机场启动【启动的响应等级】应急救援。'
      },
      {
        id: 'urgent-22', name: '22. 人员死亡、重伤，或航空器运行、维修或保障过程中，导致人员轻伤',
        urgency: '紧急', deadline: { domestic: '境内：24小时内', international: '境外：48小时内' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'location', label: '事发地点和阶段', type: 'text', required: true, placeholder:'例如：北京机坪，上客期间'},
          { id: 'personInfo', label: '受伤人员信息', type: 'text', required: true, placeholder:'旅客/机组/机务'},
          { id: 'injuryLevel', label: '损伤程度', type: 'text', required: true, placeholder:'死亡/重伤/轻伤'},
          { id: 'cause', label: '导致受伤的原因', type: 'textarea', required: true, placeholder:'不含人员患病引起的受伤' },
        ],
        template: '【eventTime】，在【事发地点和阶段】，【受伤人员信息】发生【损伤程度】。原因为：【导致受伤的原因】。'
      },
    ]
  },
  // =================================================================
  // == (二) 运输航空非紧急事件样例 - 航空器运行 (共40项)
  // =================================================================
  {
    id: 'transport-non-urgent-ops',
    name: '运输航空 - 非紧急事件(航空器运行)',
    eventTypes: [
      {
        id: 'non-urgent-ops-1', name: '1. 飞行机组成员在飞行中以外的运行阶段以及客舱乘务员和随机机务人员在运行阶段因伤病等无法履行职责',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'phase', label: '运行阶段', type: 'text', required: true, placeholder:'飞行前准备/过站/飞行后' },
          { id: 'personRole', label: '人员岗位', type: 'text', required: true, placeholder:'飞行员/客舱乘务员/随机机务' },
          { id: 'reason', label: '无法履职原因', type: 'text', required: true, placeholder:'受伤/患病/疲劳/酒精等' },
          { id: 'actionTaken', label: '采取的措施', type: 'textarea', required: true, placeholder:'更换人员/航班取消等'},
        ],
        template: '【eventTime】，在【运行阶段】阶段，【人员岗位】因【无法履职原因】无法履行职责。采取的措施为：【采取的措施】。'
      },
      {
        id: 'non-urgent-ops-2', name: '2. 航空器未按规定进行除/防冰，航空器起飞',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'airport', label: '起飞机场', type: 'text', required: true },
          { id: 'weather', label: '当时天气情况', type: 'text', required: true },
          { id: 'reason', label: '未按规定除/防冰的原因', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班于【起飞机场】起飞，当时天气【当时天气情况】，但未按规定进行除/防冰。原因：【未按规定除/防冰的原因】。'
      },
      {
        id: 'non-urgent-ops-3', name: '3. 不符合放行条件放行或未执行放行工作，航空器起飞',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'unmetCondition', label: '不符合的放行条件', type: 'textarea', required: true },
          { id: 'reason', label: '违规放行的原因', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班在不满足【不符合的放行条件】的情况下起飞。原因：【违规放行的原因】。'
      },
      {
        id: 'non-urgent-ops-4', name: '4. 未得到管制许可推出、起动、滑行、起飞或着陆',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'location', label: '事发地点', type: 'text', required: true },
          { id: 'operation', label: '未经许可的操作', type: 'text', required: true, placeholder:'推出/滑行/起飞/着陆' },
          { id: 'reason', label: '事件原因', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发地点】未经管制许可执行了【未经许可的操作】。原因：【事件原因】。'
      },
      {
        id: 'non-urgent-ops-5', name: '5. 发生跑道侵入',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'runway', label: '事发跑道', type: 'text', required: true },
          { id: 'description', label: '侵入事件描述', type: 'textarea', required: true },
          { id: 'consequence', label: '造成的后果', type: 'text', required: false, placeholder:'例如：导致其他航空器中断起飞/复飞' },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发跑道】发生跑道侵入。描述：【侵入事件描述】。后果：【造成的后果】。'
      },
      {
        id: 'non-urgent-ops-6', name: '6. 航空器滑错滑行道需要使用飞机牵引设备重新回到正确滑行路线，或直升机在指定的起降坪外接地',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
            { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
            { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
            { id: 'wrongTaxiway', label: '滑错的滑行道', type: 'text', required: true },
            { id: 'correctTaxiway', label: '正确的滑行道', type: 'text', required: true },
            { id: 'correctiveAction', label: '纠正措施', type: 'text', required: true, placeholder:'使用牵引车' },
        ],
        template: '【eventTime】，【flightInfo】航班滑行时，误入【滑错的滑行道】（正确应为【正确的滑行道】），后续通过【纠正措施】回到正确路线。'
      },
      {
        id: 'non-urgent-ops-7', name: '7. 航空器与设施设备、车辆、人员、动物或其他地面障碍物相碰撞；...导致航空器紧急制动、改变方向；航空器非正常位移',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'location', label: '事发地点', type: 'text', required: true },
          { id: 'eventType', label: '事件类型', type: 'text', required: true, placeholder:'碰撞/存在碰撞可能/非正常位移' },
          { id: 'object', label: '涉及的对象', type: 'text', required: true },
          { id: 'consequence', label: '后果', type: 'textarea', required: true, placeholder:'紧急制动/改变方向/损伤情况' },
        ],
        template: '【eventTime】，在【事发地点】发生【事件类型】，涉及【涉及的对象】，导致【后果】。'
      },
      {
        id: 'non-urgent-ops-8', name: '8. 在滑行或飞行中，燃油、滑油或液压油渗漏（按手册未超标的情况除外）',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'phase', label: '事发阶段', type: 'text', required: true, placeholder:'滑行/飞行' },
          { id: 'fluidType', label: '渗漏油液类型', type: 'text', required: true, placeholder:'燃油/滑油/液压油' },
          { id: 'location', label: '渗漏部位', type: 'text', required: true },
          { id: 'leakageRate', label: '渗漏情况描述', type: 'text', required: true, placeholder:'渗漏量或速率' },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发阶段】阶段，【渗漏部位】发生【渗漏油液类型】渗漏。情况：【渗漏情况描述】。'
      },
      {
        id: 'non-urgent-ops-9', name: '9. 航空器动力装置所产生气流导致航空器损伤、地面设施设备损伤或人员受伤',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'location', label: '事发地点', type: 'text', required: true },
          { id: 'engineSetting', label: '发动机推力设置', type: 'text', required: true },
          { id: 'damageOrInjury', label: '导致的损伤或受伤情况', type: 'textarea', required: true },
        ],
        template: '【eventTime】，在【事发地点】，因发动机【发动机推力设置】产生的气流，导致【导致的损伤或受伤情况】。'
      },
      {
        id: 'non-urgent-ops-10', name: '10. 航空器遭外来物撞击，导致航空器损伤',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'phase', label: '事发阶段', type: 'text', required: true },
          { id: 'fodType', label: '外来物类型', type: 'text', required: false },
          { id: 'damage', label: '航空器损伤情况', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发阶段】遭外来物（【外来物类型】）撞击，导致【航空器损伤情况】。'
      },
      {
        id: 'non-urgent-ops-11', name: '11. 航空器轮胎爆破、脱层或扎破处遗留外来物',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'location', label: '事发机场/跑道', type: 'text', required: true },
          { id: 'tirePosition', label: '轮胎位置', type: 'text', required: true },
          { id: 'tireDamage', label: '轮胎损伤类型', type: 'text', required: true, placeholder:'爆破/脱层/扎破' },
          { id: 'leftoverFod', label: '遗留的外来物', type: 'text', required: false },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发机场/跑道】发生轮胎事件，【轮胎位置】轮胎【轮胎损伤类型】。遗留外来物：【遗留的外来物】。'
      },
      {
        id: 'non-urgent-ops-12', name: '12. 航空器携带其他物体起飞',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'objectCarried', label: '携带的物体名称', type: 'text', required: true, placeholder:'例如：电子舱盖板、APU维修梯等' },
          { id: 'objectLocation', label: '物体原属位置', type: 'text', required: true },
          { id: 'discoveryPhase', label: '发现阶段和方式', type: 'text', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班起飞时携带了【携带的物体名称】（原属【物体原属位置】）。在【发现阶段和方式】发现。'
      },
      {
        id: 'non-urgent-ops-13', name: '13. 由于乘员、行李、邮件、货物、压舱物等的重量、装载舱位与固定等原因，导致超过最后一分钟修正限值或超出审定重心限制，航空器起飞',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'issueType', label: '问题类型', type: 'text', required: true, placeholder:'超重/超重心限制' },
          { id: 'details', label: '具体数值和原因', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班起飞时发生【问题类型】。具体情况：【具体数值和原因】。'
      },
      {
        id: 'non-urgent-ops-14', name: '14. 载重平衡舱单飞机基础数据错误或计算/输入与实际不符，航空器起飞',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'errorType', label: '错误类型', type: 'text', required: true, placeholder:'基础数据错误/计算错误/输入错误' },
          { id: 'errorDetails', label: '错误详情', type: 'textarea', required: true },
          { id: 'actualVsPlanned', label: '计划与实际对比', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班起飞时，载重平衡舱单存在【错误类型】。详情：【错误详情】。计划与实际对比：【计划与实际对比】。'
      },
      {
        id: 'non-urgent-ops-15', name: '15. 载运的物品因泄漏、位移等情况导致航空器损伤或人员受伤',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'item', label: '涉事物品', type: 'text', required: true },
          { id: 'itemIssue', label: '物品问题', type: 'text', required: true, placeholder:'泄漏/位移' },
          { id: 'consequence', label: '造成的后果', type: 'textarea', required: true, placeholder:'航空器损伤/人员受伤情况' },
        ],
        template: '【eventTime】，【flightInfo】航班上，【涉事物品】发生【物品问题】，导致【造成的后果】。'
      },
      {
        id: 'non-urgent-ops-16', name: '16. 滑梯包掉落、滑梯/救生筏放出或应急出口非正常打开',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'location', label: '事发地点/阶段', type: 'text', required: true },
          { id: 'item', label: '涉及的设备', type: 'text', required: true, placeholder:'滑梯包/滑梯/应急出口' },
          { id: 'reason', label: '事件原因', type: 'textarea', required: true },
        ],
        template: '【eventTime】，在【事发地点/阶段】，发生【涉及的设备】非正常事件。原因：【事件原因】。'
      },
      {
        id: 'non-urgent-ops-17', name: '17. 机上人员非正常触发机载应急定位发射机（ELT）',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'location', label: '事发地点', type: 'text', required: true },
          { id: 'triggerPerson', label: '触发人员', type: 'text', required: true },
          { id: 'reason', label: '触发原因', type: 'textarea', required: true },
          { id: 'actionTaken', label: '后续措施', type: 'text', required: true, placeholder:'例如：通知管制员' },
        ],
        template: '【eventTime】，在【事发地点】，【触发人员】非正常触发了ELT。原因：【触发原因】。后续措施：【后续措施】。'
      },
      {
        id: 'non-urgent-ops-18', name: '18. 航空器中断起飞',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'airport', label: '事发机场', type: 'text', required: true },
          { id: 'reason', label: '中断起飞原因', type: 'textarea', required: true },
          { id: 'speed', label: '中断速度', type: 'text', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发机场】中断起飞。中断速度【中断速度】，原因：【中断起飞原因】。'
      },
      {
        id: 'non-urgent-ops-19', name: '19. 飞行中，未完成预定的航空器构型',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'phase', label: '飞行阶段', type: 'text', required: true },
          { id: 'failedConfig', label: '未完成的构型项目', type: 'text', required: true, placeholder:'例如：起落架/襟缝翼' },
          { id: 'reason', label: '未完成原因', type: 'textarea', required: true },
          { id: 'crewAction', label: '机组处置', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班在【飞行阶段】未能完成【未完成的构型项目】构型。原因：【未完成原因】。机组处置：【机组处置】。'
      },
      {
        id: 'non-urgent-ops-20', name: '20. 飞行中，出现失速警告、抖杆或自动保护（如Alpha Floor）',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'altitude', label: '事发高度', type: 'text', required: true },
          { id: 'warningType', label: '警告/保护类型', type: 'text', required: true, placeholder:'失速警告/抖杆/Alpha Floor' },
          { id: 'reason', label: '触发原因', type: 'textarea', required: true },
          { id: 'crewAction', label: '机组处置', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班在高度【事发高度】出现【警告/保护类型】。原因：【触发原因】。机组处置：【机组处置】。'
      },
      {
        id: 'non-urgent-ops-21', name: '21. 航空器俯仰角超过+25°或-10°、坡度超过45°或触发大坡度语音警告',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'phase', label: '飞行阶段', type: 'text', required: true },
          { id: 'exceededParam', label: '超限参数和数值', type: 'text', required: true, placeholder:'例如：坡度50度' },
          { id: 'reason', label: '原因', type: 'textarea', required: true },
          { id: 'crewAction', label: '机组处置', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班在【飞行阶段】出现姿态超限，【超限参数和数值】。原因：【原因】。机组处置：【机组处置】。'
      },
      {
        id: 'non-urgent-ops-22', name: '22. 超过飞机飞行手册（AFM）/飞行机组操作手册（FCOM）/飞机维护手册（AMM）限制数据',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'exceededParam', label: '超限参数', type: 'text', required: true, placeholder:'G值/重量/EGT/速度/轮速等' },
          { id: 'limitValue', label: '限制值', type: 'text', required: true },
          { id: 'actualValue', label: '实际最大值', type: 'text', required: true },
          { id: 'duration', label: '持续时间', type: 'text', required: false },
          { id: 'reason', label: '超限原因', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班发生【超限参数】超限事件。限制值为【限制值】，实际达到【实际最大值】，持续【持续时间】。原因：【超限原因】。'
      },
      {
        id: 'non-urgent-ops-23', name: '23. 航空器系统失效/故障或零部件缺失，导致中断起飞、采取避让措施、快速下降、改变进近、复飞、备降等',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'systemFailure', label: '失效/故障/缺失的系统或部件', type: 'text', required: true },
          { id: 'consequence', label: '导致的后果', type: 'text', required: true, placeholder:'中断起飞/备降/复飞等' },
          { id: 'description', label: '事件经过', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班因【失效/故障/缺失的系统或部件】故障，导致【导致的后果】。经过：【事件经过】。'
      },
      {
        id: 'non-urgent-ops-24', name: '24. 飞行中，航空器增压异常需改变高度；运行阶段，人为原因导致氧气面罩脱落',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'issueType', label: '问题类型', type: 'text', required: true, placeholder:'增压异常/人为氧气面罩脱落' },
          { id: 'description', label: '事件描述', type: 'textarea', required: true },
          { id: 'crewAction', label: '机组处置', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班发生【问题类型】。描述：【事件描述】。机组处置：【机组处置】。'
      },
      {
        id: 'non-urgent-ops-25', name: '25. 飞行中遇有颠簸或其他原因导致航空器损伤或人员受伤',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'location', label: '事发位置/高度', type: 'text', required: true },
          { id: 'turbulenceLevel', label: '颠簸强度', type: 'text', required: false, placeholder:'轻度/中度/严重' },
          { id: 'consequence', label: '后果（损伤或受伤）', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发位置/高度】遭遇【颠簸强度】颠簸，导致【后果（损伤或受伤）】。'
      },
      {
        id: 'non-urgent-ops-26', name: '26. 飞行中，航空器遭遇风切变或触发风切变警告警戒，需机组采取措施',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'location', label: '事发位置/高度', type: 'text', required: true },
          { id: 'warningType', label: '警告类型', type: 'text', required: true, placeholder:'警告/警戒' },
          { id: 'crewAction', label: '机组采取的措施', type: 'textarea', required: true, placeholder:'例如：执行风切变改出程序' },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发位置/高度】遭遇风切变，触发【警告类型】，机组采取了【机组采取的措施】。'
      },
      {
        id: 'non-urgent-ops-27', name: '27. 50英尺（无线电高度）以下的复飞',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'airport', label: '事发机场', type: 'text', required: true },
          { id: 'goAroundAltitude', label: '复飞高度(RA)', type: 'text', required: true },
          { id: 'reason', label: '复飞原因', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发机场】进近时，于无线电高度【复飞高度(RA)】ft执行复飞。原因：【复飞原因】。'
      },
      {
        id: 'non-urgent-ops-28', name: '28. 除低能见度、大风、乱流、雷雨等天气原因，机场关闭、宵禁和旅客原因外，返航、备降',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'actionType', label: '措施类型', type: 'text', required: true, placeholder:'返航/备降' },
          { id: 'destination', label: '返航/备降机场', type: 'text', required: true },
          { id: 'reason', label: '原因', type: 'textarea', required: true, placeholder:'必须为非天气、非机场、非旅客原因' },
        ],
        template: '【eventTime】，【flightInfo】航班执行【措施类型】至【返航/备降机场】。原因：【原因】。'
      },
      {
        id: 'non-urgent-ops-29', name: '29. 航空器遭雷击、电击、冰击、雹击、其他物体（不含外来物）撞击，导致航空器损伤',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'location', label: '事发位置/高度', type: 'text', required: true },
          { id: 'strikeType', label: '撞击类型', type: 'text', required: true, placeholder:'雷击/冰击/雹击等' },
          { id: 'damage', label: '航空器损伤描述', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发位置/高度】遭遇【撞击类型】，导致航空器损伤：【航空器损伤描述】。'
      },
      {
        id: 'non-urgent-ops-30', name: '30. 由于冰、雪、霜、雨、沙尘或火山灰等在航空器表面或动力装置积累，导致操纵特性降低和性能明显下降',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'contaminant', label: '污染物类型', type: 'text', required: true, placeholder:'冰/雪/火山灰等' },
          { id: 'performanceDegradation', label: '性能下降描述', type: 'textarea', required: true },
          { id: 'crewAction', label: '机组处置', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班因【污染物类型】积累，导致【性能下降描述】。机组处置：【机组处置】。'
      },
      {
        id: 'non-urgent-ops-31', name: '31. 航空器遭鸟击（含蝙蝠），留下血迹、羽毛、皮肤、肌肉或肢体等残留物，且导致航空器损伤',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'location', label: '鸟击位置/高度', type: 'text', required: true },
          { id: 'remains', label: '残留物描述', type: 'text', required: true },
          { id: 'damage', label: '航空器损伤描述', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班在【鸟击位置/高度】发生鸟击，机身有【残留物描述】，并导致【航空器损伤描述】。'
      },
      {
        id: 'non-urgent-ops-32', name: '32. 客舱内设备、行李、其他物品滑出或其他原因（旅客原因除外）导致人员受伤',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'location', label: '事发时飞机状态', type: 'text', required: true, placeholder:'起飞/颠簸/着陆' },
          { id: 'item', label: '滑出物品', type: 'text', required: true },
          { id: 'injury', label: '人员受伤情况', type: 'textarea', required: true },
        ],
        template: '【eventTime】，在【事发时飞机状态】期间，【滑出物品】滑出导致【人员受伤情况】。'
      },
      {
        id: 'non-urgent-ops-33', name: '33. 低于安全高度或触发地形警告（地形提示警告、过早下降警告、障碍物警告）',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'location', label: '事发位置', type: 'text', required: true },
          { id: 'warningType', label: '警告类型', type: 'text', required: true },
          { id: 'minAltitude', label: '最低安全高度', type: 'text', required: false },
          { id: 'actualAltitude', label: '实际高度', type: 'text', required: true },
          { id: 'crewAction', label: '机组处置', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发位置】触发【警告类型】。实际高度【实际高度】。机组处置：【机组处置】。'
      },
      {
        id: 'non-urgent-ops-34', name: '34. 需要宣布“最低油量”或低于最低油量，或超出燃油不平衡限制',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'issueType', label: '事件类型', type: 'text', required: true, placeholder:'最低油量/低于最低油量/燃油不平衡' },
          { id: 'fuelQuantity', label: '相关油量数值', type: 'text', required: true, placeholder:'宣布时油量/油箱差值等' },
          { id: 'reason', label: '原因', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班发生【事件类型】事件。油量情况：【相关油量数值】。原因：【原因】。'
      },
      {
        id: 'non-urgent-ops-35', name: '35. ACAS(TCAS) RA 告警',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'location', label: '事发位置/高度', type: 'text', required: true },
          { id: 'raCommand', label: 'RA指令', type: 'text', required: true, placeholder:'Climb/Descend/Level off等' },
          { id: 'crewAction', label: '机组是否执行', type: 'text', required: true },
          { id: 'otherAircraft', label: '冲突航空器信息', type: 'text', required: false },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发位置/高度】收到TCAS RA告警，指令为【RA指令】。机组【机组是否执行】。冲突航空器：【冲突航空器信息】。'
      },
      {
        id: 'non-urgent-ops-36', name: '36. 遭遇无人机、风筝、空飘物等升空物体导致航空器避让',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'location', label: '事发位置/高度', type: 'text', required: true },
          { id: 'objectType', label: '升空物体类型', type: 'text', required: true },
          { id: 'avoidanceAction', label: '机组采取的避让措施', type: 'textarea', required: true, placeholder:'包括主动避让和空管指挥避让' },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发位置/高度】遭遇【升空物体类型】，机组采取了【机组采取的避让措施】。'
      },
      {
        id: 'non-urgent-ops-37', name: '37. 偏离指定航线/航路中心线超过15km或偏离指定高度60m以上；偏离指定进离场航线5km或2倍RNP值以上...',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'deviationType', label: '偏离类型', type: 'text', required: true, placeholder:'偏航/偏高/飞错航线' },
          { id: 'deviationValue', label: '最大偏离值', type: 'text', required: true },
          { id: 'reason', label: '偏离原因', type: 'textarea', required: true },
          { id: 'crewAction', label: '机组处置', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班发生【偏离类型】，最大偏离【最大偏离值】。原因：【偏离原因】。机组处置：【机组处置】。'
      },
      {
        id: 'non-urgent-ops-38', name: '38. 区域范围内，陆空通信双向联系中断5min(含)以上；飞行中，进近或塔台范围内，陆空通信双向联系中断2min(含)以上；设置应答机编码7600',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'controlArea', label: '事发管制区域', type: 'text', required: true, placeholder:'区域/进近/塔台' },
          { id: 'interruptionDuration', label: '中断时长/或设置7600', type: 'text', required: true },
          { id: 'reason', label: '中断原因', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发管制区域】发生通讯中断，【中断时长/或设置7600】。原因：【中断原因】。'
      },
      {
        id: 'non-urgent-ops-39', name: '39. 无线电干扰，影响航空器安全运行',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
        fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'location', label: '事发位置/高度', type: 'text', required: true },
          { id: 'frequency', label: '受干扰的频率', type: 'text', required: true },
          { id: 'interferenceDesc', label: '干扰现象描述', type: 'textarea', required: true },
          { id: 'impact', label: '对安全运行的影响', type: 'textarea', required: true },
        ],
        template: '【eventTime】，【flightInfo】航班在【事发位置/高度】的【受干扰的频率】上遭遇无线电干扰。现象：【干扰现象描述】。影响：【对安全运行的影响】。'
      },
      {
        id: 'non-urgent-ops-40', name: '40. 发生航空器损伤或运行阶段人员受伤（旅客原因除外）的其他情况',
        urgency: '非紧急', deadline: { domestic: '48小时内填报', international: '48小时内填报' },
         fields: [
          { id: 'eventTime', label: '事发时间', type: 'datetime', required: true },
          { id: 'flightInfo', label: '航班/航线', type: 'text', required: true },
          { id: 'phase', label: '运行阶段', type: 'text', required: true },
          { id: 'description', label: '情况描述', type: 'textarea', required: true, placeholder:'描述其他导致航空器损伤或人员受伤的具体情况' },
          { id: 'damageOrInjury', label: '损伤/受伤详情', type: 'text', required: true},
        ],
        template: '【eventTime】，【flightInfo】航班在【运行阶段】阶段，发生【情况描述】，导致【损伤/受伤详情】。'
      }
    ]
  }
];