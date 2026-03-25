export type ToolItem = {
  name: string
  category: '现成工具' | '自动化平台' | '数据平台' | '协作平台'
  usage: string
}

export type PracticalGuide = {
  summary: string
  tools: ToolItem[]
  skills: string[]
  steps: string[]
  outputs: string[]
}

const baseSkills = [
  '字段标准化 Skill（把口语/纪要统一成结构化字段）',
  '证据闭环 Skill（每项输出绑定验收证据与责任人）',
  '升级规则 Skill（超时/异常时自动触发通知与升级）',
]

const defaultGuide: PracticalGuide = {
  summary: '建议先用“协作平台 + 自动化平台 + AI分析工具”组合，先半自动跑通，再逐步自动化。',
  tools: [
    { name: 'Team（你们内部项目管理工具）', category: '协作平台', usage: '作为任务主系统，承接工单、SLA、状态与责任人。' },
    { name: 'OpenClaw（或同类AI Agent工具）', category: '现成工具', usage: '负责读取文本/数据并做结构化输出与建议。' },
    { name: 'n8n / Make / Zapier', category: '自动化平台', usage: '把 Team、文档、日历、通知系统串起来做自动流转。' },
  ],
  skills: baseSkills,
  steps: [
    '第1步：定义输入字段模板（最少包含时间、对象、状态、负责人、证据字段）。',
    '第2步：用 OpenClaw 将原始材料结构化，输出标准 JSON/表格。',
    '第3步：通过自动化平台把结构化结果写入 Team（创建/更新任务）。',
    '第4步：按规则触发通知与升级（例如超时、阻塞、审批拒绝）。',
    '第5步：每周复盘自动化结果，修订字段口径与规则。'
  ],
  outputs: ['结构化结果表', 'Team 任务清单', 'SLA 与升级记录'],
}

export const guidesByScenarioId: Record<string, PracticalGuide> = {
  'meeting-room-booking': {
    summary: '目标是“会议信息->选房间->审批->预定->通知”形成闭环。',
    tools: [
      { name: 'Microsoft 365 / Google Calendar 会议室资源', category: '现成工具', usage: '读取会议室容量、设备、空闲时间。' },
      { name: 'OpenClaw', category: '现成工具', usage: '解析会议信息并生成房间推荐与预定请求。' },
      { name: 'n8n / Make', category: '自动化平台', usage: '自动调用日历API创建会议、发送通知。' },
    ],
    skills: ['会议字段抽取 Skill', '房间匹配规则 Skill（容量/设备/距离）', '审批与回滚 Skill'],
    steps: [
      '第1步：维护会议室主数据（roomId、容量、设备、审批规则）。',
      '第2步：把会议主题/参会人/时间输入 OpenClaw，生成 Top3 房间推荐。',
      '第3步：若满足规则直接预定；不满足则自动提交审批。',
      '第4步：自动创建日历邀请并发送群消息短版。',
      '第5步：预定失败时自动改期并重发通知。'
    ],
    outputs: ['房间推荐表', '预定与审批记录', '会议通知与回滚记录'],
  },
  'doc-ai-diagrams': {
    summary: '目标是“文档描述->标准图->可维护版本”而不是一次性作图。',
    tools: [
      { name: 'OpenClaw', category: '现成工具', usage: '把文档描述转成流程节点和关系。' },
      { name: 'Mermaid + 飞书/Confluence', category: '协作平台', usage: '渲染并沉淀可版本化图表。' },
      { name: 'Excalidraw / Lucidchart', category: '现成工具', usage: '补充复杂视觉布局。' },
    ],
    skills: ['图类型选择 Skill（流程/时序/泳道）', '术语一致性 Skill', '版本维护 Skill'],
    steps: ['第1步：输入流程文本与受众。', '第2步：生成节点关系草稿并校验边界。', '第3步：产出 Mermaid 源码与图注。', '第4步：在知识库渲染并评审。', '第5步：按版本号更新。'],
    outputs: ['图设计稿', 'Mermaid源码', '版本变更记录'],
  },
  'weekly-report-auto': {
    summary: '目标是“数据源->多版本周报->行动项SLA”自动出稿。',
    tools: [
      { name: 'Team + Git + 测试平台', category: '协作平台', usage: '提供周报事实数据。' },
      { name: 'OpenClaw', category: '现成工具', usage: '生成高管版/团队版/依赖方版周报。' },
      { name: '飞书机器人 / 企业微信机器人', category: '自动化平台', usage: '定时发送与催办。' },
    ],
    skills: ['周报叙事 Skill', '健康度判定 Skill', '行动项SLA Skill'],
    steps: ['第1步：配置每周数据拉取清单。', '第2步：OpenClaw 统一口径并生成周报。', '第3步：自动分发到不同对象。', '第4步：同步生成 Team 行动项。', '第5步：下周按结果校正规则。'],
    outputs: ['多版本周报', '健康度结论', '行动项SLA表'],
  },
  'iteration-mlops-data': {
    summary: '目标是“每次迭代交付需求数据分析->下一迭代范围调整”。',
    tools: [
      { name: 'Team 导出报表', category: '协作平台', usage: '提供需求状态、周期、DoD、返工、阻塞等字段。' },
      { name: 'OpenClaw', category: '现成工具', usage: '生成迭代健康度、原因分类与范围调整建议。' },
      { name: 'Metabase / Power BI', category: '数据平台', usage: '沉淀可视化趋势与对比看板。' },
    ],
    skills: ['迭代指标口径 Skill', '异常归因 Skill', '范围重排 Skill'],
    steps: ['第1步：固定迭代数据字段模板。', '第2步：每次迭代结束导出 Team 数据。', '第3步：OpenClaw 生成红黄绿与原因映射。', '第4步：输出下次迭代保留/降级/拆分建议。', '第5步：把建议转成 Team 任务并设SLA。'],
    outputs: ['迭代健康度报告', '范围调整建议', '下迭代行动包'],
  },
  'prd-to-team-tickets': {
    summary: '目标是“PRD文本->Team可导入工单+验收标准”。',
    tools: [
      { name: 'OpenClaw', category: '现成工具', usage: '把 PRD 转成工单字段与验收标准。' },
      { name: 'Team 导入器', category: '协作平台', usage: '批量创建故事/任务。' },
      { name: 'n8n', category: '自动化平台', usage: '自动补标签、负责人、里程碑。' },
    ],
    skills: ['用户故事拆分 Skill', 'Given/When/Then Skill', '追溯矩阵 Skill'],
    steps: ['第1步：输入 PRD 与边界。', '第2步：生成工单草稿+验收标准。', '第3步：人工校验阻断项。', '第4步：导入 Team。', '第5步：生成追溯矩阵并绑定证据。'],
    outputs: ['Team工单草稿', '验收标准表', '追溯矩阵'],
  },
  'minutes-to-team-actions': {
    summary: '目标是“会议纪要->可追踪行动项->自动提醒”。',
    tools: [
      { name: '飞书妙记/转写工具', category: '现成工具', usage: '得到会议文本。' },
      { name: 'OpenClaw', category: '现成工具', usage: '抽取行动项、SLA、证据字段。' },
      { name: 'Team + 机器人通知', category: '协作平台', usage: '任务跟踪与超时提醒。' },
    ],
    skills: ['纪要结构化 Skill', 'SLA规则 Skill', '通知分层 Skill'],
    steps: ['第1步：上传纪要文本。', '第2步：抽取行动项与未决事项。', '第3步：生成 Team 任务。', '第4步：发送群通知与正式跟进版。', '第5步：每周追踪超期并升级。'],
    outputs: ['行动项清单', 'SLA跟踪表', '通知文案'],
  },
  'risk-to-team-board': {
    summary: '目标是“风险条目->触发条件->Team任务化预警”。',
    tools: [
      { name: 'OpenClaw', category: '现成工具', usage: '风险登记标准化与任务拆分。' },
      { name: 'Team 看板', category: '协作平台', usage: '承接缓解动作、状态与升级。' },
      { name: '告警平台（飞书/邮件）', category: '自动化平台', usage: '触发条件满足时自动通知。' },
    ],
    skills: ['触发条件定义 Skill', '风险任务化 Skill', '升级链设计 Skill'],
    steps: ['第1步：维护风险字段模板。', '第2步：按概率影响排序Top风险。', '第3步：拆分缓解任务写入Team。', '第4步：绑定触发条件与告警。', '第5步：周会更新风险热力图。'],
    outputs: ['风险注册表', '缓解任务包', '预警升级记录'],
  },
  'change-to-ccb-team': {
    summary: '目标是“变更请求->CCB决策->回归任务”。',
    tools: [
      { name: 'OpenClaw', category: '现成工具', usage: '自动生成影响分析与决策选项。' },
      { name: 'Team', category: '协作平台', usage: '承接批准后的回归任务。' },
      { name: 'Confluence/飞书文档', category: '协作平台', usage: '沉淀 CCB 材料包。' },
    ],
    skills: ['影响分析 Skill', 'CCB材料编排 Skill', '回归范围定义 Skill'],
    steps: ['第1步：录入变更请求。', '第2步：生成影响评估与选项。', '第3步：CCB评审并记录决策。', '第4步：批准后生成Team回归任务。', '第5步：对账预测影响与实际影响。'],
    outputs: ['CCB材料包', '决策记录', '回归任务清单'],
  },
  'acceptance-failure-to-team-quality-plan': {
    summary: '目标是“验收失败->补强计划->发布门控制”。',
    tools: [
      { name: '测试管理平台', category: '协作平台', usage: '提供失败用例和证据。' },
      { name: 'OpenClaw', category: '现成工具', usage: '生成补强计划与回滚门槛。' },
      { name: 'Team', category: '协作平台', usage: '创建修复/补测/验证任务。' },
    ],
    skills: ['失败归因 Skill', '发布门定义 Skill', '质量任务拆分 Skill'],
    steps: ['第1步：汇总失败证据。', '第2步：分类失败类型。', '第3步：生成补测与回归范围。', '第4步：设灰度/回滚触发条件。', '第5步：Team任务执行与复盘。'],
    outputs: ['补强计划', '发布门槛清单', 'Team质量任务包'],
  },
  'vendor-sow-to-team-followups': {
    summary: '目标是“SOW条款->缺口清单->对外跟进任务”。',
    tools: [
      { name: 'OpenClaw', category: '现成工具', usage: '解析 SOW 与验收条款缺口。' },
      { name: 'Team', category: '协作平台', usage: '对内跟进任务与证据回收。' },
      { name: '邮件/飞书群', category: '协作平台', usage: '向供应商发证据请求。' },
    ],
    skills: ['SOW抽取 Skill', '证据缺口识别 Skill', '对外沟通 Skill'],
    steps: ['第1步：导入SOW条款。', '第2步：生成交付与验收字段表。', '第3步：识别缺口并分配责任。', '第4步：发送供应商请求并跟踪回执。', '第5步：Team闭环并沉淀复用模板。'],
    outputs: ['条款结构化表', '缺口清单', '跟进任务包'],
  },
  'traceability-gap-detection': {
    summary: '目标是“追溯矩阵自动生成+断链自动补齐”。',
    tools: [
      { name: 'OpenClaw', category: '现成工具', usage: '自动生成需求-验收-证据链路。' },
      { name: 'Team', category: '协作平台', usage: '创建补证任务。' },
      { name: '文档系统', category: '协作平台', usage: '沉淀审计可追溯记录。' },
    ],
    skills: ['追溯矩阵 Skill', '断链检测 Skill', '补证任务 Skill'],
    steps: ['第1步：输入需求与证据线索。', '第2步：生成追溯矩阵v1。', '第3步：扫描断链项。', '第4步：生成Team补证任务。', '第5步：定期更新矩阵版本。'],
    outputs: ['追溯矩阵', '断链清单', '补证任务包'],
  },
  'milestone-health-to-team-actions': {
    summary: '目标是“里程碑偏差->高管摘要->可执行纠偏”。',
    tools: [
      { name: 'Team + 看板', category: '协作平台', usage: '里程碑与交付状态来源。' },
      { name: 'OpenClaw', category: '现成工具', usage: '生成偏差解释与纠偏行动包。' },
      { name: 'Power BI / Metabase', category: '数据平台', usage: '展示里程碑趋势与风险。' },
    ],
    skills: ['偏差解释 Skill', '高管摘要 Skill', '纠偏行动 Skill'],
    steps: ['第1步：拉取里程碑状态。', '第2步：生成红黄绿与原因。', '第3步：输出高管1页摘要。', '第4步：创建Team纠偏任务。', '第5步：下次更新对账效果。'],
    outputs: ['健康度报告', '高管摘要', '纠偏任务包'],
  },
}

export function getPracticalGuide(scenarioId: string): PracticalGuide {
  return guidesByScenarioId[scenarioId] ?? defaultGuide
}

