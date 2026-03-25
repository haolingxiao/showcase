import { useMemo, useState } from 'react'
import { scenarios, type Scenario } from './scenarios'
import { getPracticalGuide } from './practicalGuides'
import './styles.css'

function fillTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '')
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  // 兜底：旧浏览器用临时textarea复制
  const el = document.createElement('textarea')
  el.value = text
  el.style.position = 'fixed'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

function getScenarioSearchText(s: Scenario) {
  const parts: string[] = []
  parts.push(s.title, s.subtitle, s.tags.join(' '))
  for (const sec of s.sections) {
    parts.push(sec.title)
    for (const b of sec.blocks) {
      if (b.type === 'p') parts.push(b.text)
      if (b.type === 'callout') parts.push(b.title, b.text)
      if (b.type === 'ul') parts.push(b.items.join(' '))
    }
  }
  for (const p of s.prompts) parts.push(p.title, p.description ?? '', p.template, ...(p.tips ?? []))
  parts.push(s.checklist.join(' '))
  if (s.references?.length) parts.push(s.references.join(' '))
  return parts.join('\n').toLowerCase()
}

export default function App() {
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState(scenarios[0]?.id ?? '')
  const [toast, setToast] = useState<string | null>(null)

  const searchIndex = useMemo(() => {
    return Object.fromEntries(scenarios.map((s) => [s.id, getScenarioSearchText(s)]))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return scenarios
    return scenarios.filter((s) => searchIndex[s.id]?.includes(q))
  }, [query, searchIndex])

  const active = useMemo(() => {
    return filtered.find((s) => s.id === activeId) ?? filtered[0] ?? scenarios[0]
  }, [activeId, filtered])

  const [form, setForm] = useState({
    projectName: '示例项目',
    phase: '需求澄清/计划阶段',
    goalSource: '把会议要点或PRD摘要粘贴在这里（事实性内容为主）。',
    scopeKnown: '已知范围/草案（包含/不包含）。',
    stakeholders: '业务负责人/交付负责人/合规安全/依赖方等。',
    constraints: '合规、安全、性能、预算、时间等约束。',
    timeline: '关键里程碑时间/预计上线时间。',
    users: '核心用户角色与使用场景。',
    dependencies: '外部依赖/接口/审批依赖。',
    metrics: '指标与计量口径（如有）。',
    doD: 'DoD标准（可验收、证据、回归范围等）。',
  })

  const primaryPrompt = active.prompts[0]
  const practicalGuide = useMemo(() => getPracticalGuide(active.id), [active.id])
  const generatedPrompt = useMemo(() => {
    if (!primaryPrompt) return ''
    return fillTemplate(primaryPrompt.template, form)
  }, [primaryPrompt, form])

  const handleCopy = async (text: string, label = '已复制') => {
    try {
      await copyToClipboard(text)
      setToast(label)
      window.setTimeout(() => setToast(null), 1600)
    } catch {
      setToast('复制失败，请手动选择文本')
      window.setTimeout(() => setToast(null), 2000)
    }
  }

  const guideText = useMemo(() => {
    return [
      `场景：${active.title}`,
      '',
      `目标：${practicalGuide.summary}`,
      '',
      '推荐工具：',
      ...practicalGuide.tools.map((t, i) => `${i + 1}. ${t.name}（${t.category}）- ${t.usage}`),
      '',
      '建议Skill：',
      ...practicalGuide.skills.map((s, i) => `${i + 1}. ${s}`),
      '',
      '操作步骤：',
      ...practicalGuide.steps.map((s, i) => `${i + 1}. ${s}`),
      '',
      '落地产出：',
      ...practicalGuide.outputs.map((o, i) => `${i + 1}. ${o}`),
    ].join('\n')
  }, [active.title, practicalGuide])

  return (
    <div className="app">
      <header className="header">
        <div className="headerInner">
          <div className="brand" aria-label="品牌">
            <div className="brandMark" />
            <div className="brandText">
              <strong>AI 项目管理场景库</strong>
              <span>PMO 工作流 + 可复制提示词</span>
            </div>
          </div>
          <nav className="nav" aria-label="页面导航">
            <a href="#scenarios">场景库</a>
            <a href="#workbench">提示词工作台</a>
            <a href="#notes">如何使用</a>
          </nav>
        </div>
      </header>

      <main className="container">
        <section className="hero" aria-label="页面头部">
          <div className="heroCard">
            <div className="kicker">覆盖立项到复盘的项目管理全链路</div>
            <h1 className="heroTitle">把“项目管理经验”变成可执行的 AI 工作流</h1>
            <p className="heroLead">
              这是一个面向 PMO/项目经理的静态知识库：每一类场景都提供尽可能详尽的解决方案与提示词模板。你可以直接复制模板到你使用的模型，再把项目材料补进去。
            </p>
            <div className="pillRow" aria-label="快速标签">
              <span className="pill">立项与治理</span>
              <span className="pill">需求与验收</span>
              <span className="pill">排期与关键链</span>
              <span className="pill">风险与变更</span>
              <span className="pill">度量与复盘</span>
            </div>
          </div>

          <aside className="sideCard">
            <h3>快速搜索</h3>
            <p>输入关键词（如“CCB”、“EVM”、“SLA”、“DoD”、“追溯矩阵”），右侧将切换到对应场景。</p>
            <div className="searchRow">
              <input
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索场景（标题/关键词/解决方案/提示词）"
                aria-label="搜索场景"
              />
            </div>
            <div style={{ height: 10 }} />
            <p style={{ marginBottom: 0 }}>
              当前命中：<strong style={{ color: 'rgba(15,23,42,0.92)' }}>{filtered.length}</strong> 个场景
            </p>
          </aside>
        </section>

        <section id="scenarios" className="mainLayout" aria-label="场景浏览区域">
          <aside className="sidebar" aria-label="场景列表">
            <div className="sidebarHeader">
              <div className="label">场景分类</div>
              <div className="scenarioTags">
                {active?.tags.slice(0, 3).map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
                {active?.tags.length > 3 ? <span className="tag">+{active.tags.length - 3}</span> : null}
              </div>
            </div>
            <div className="scenarioList">
              {filtered.map((s) => {
                const isActive = s.id === active.id
                return (
                  <div
                    key={s.id}
                    className={`scenarioItem ${isActive ? 'scenarioItemActive' : ''}`}
                    onClick={() => setActiveId(s.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setActiveId(s.id)
                    }}
                    aria-label={`切换到场景：${s.title}`}
                  >
                    <strong>{s.title}</strong>
                    <span>{s.subtitle}</span>
                    <div className="scenarioTags" aria-label="标签">
                      {s.tags.slice(0, 4).map((t) => (
                        <span key={t} className="tag">
                          {t}
                        </span>
                      ))}
                      {s.tags.length > 4 ? <span className="tag">+{s.tags.length - 4}</span> : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </aside>

          <article className="content" aria-label="场景详情">
            <div className="contentInner">
              <div className="contentHeader">
                <div>
                  <h2>{active.title}</h2>
                  <p>{active.subtitle}</p>
                  <div style={{ height: 10 }} />
                  <div className="scenarioTags">
                    {active.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="btnRow" />
              </div>

              <div className="sectionList">
                {active.sections.map((sec, idx) => (
                  <details key={sec.title + idx} open={idx === 0}>
                    <summary>
                      <span className="detailsTitle">{sec.title}</span>
                      <span className="chev">展开/收起</span>
                    </summary>
                    <div className="detailsBody">
                      <div className="prose">
                        {sec.blocks.map((b, j) => {
                          if (b.type === 'p') return <p key={j}>{b.text}</p>
                          if (b.type === 'ul')
                            return (
                              <ul key={j}>
                                {b.items.map((it) => (
                                  <li key={it}>{it}</li>
                                ))}
                              </ul>
                            )
                          if (b.type === 'callout')
                            return (
                              <div key={j} className="callout">
                                <strong>{b.title}</strong>
                                <span>{b.text}</span>
                              </div>
                            )
                          return null
                        })}
                      </div>
                    </div>
                  </details>
                ))}

                <details open>
                  <summary>
                    <span className="detailsTitle">工具 + Skill + 操作步骤（实操方案）</span>
                    <span className="chev">可直接按步骤执行</span>
                  </summary>
                  <div className="detailsBody">
                    <div className="promptBlock">
                      <div className="promptHeader">
                        <strong>落地执行建议</strong>
                        <div className="btnRow">
                          <button className="btn btnPrimary" onClick={() => handleCopy(guideText, '实操方案已复制')}>
                            复制方案
                          </button>
                        </div>
                      </div>
                      <div className="promptBody">
                        <p style={{ margin: '0 0 10px', color: 'rgba(15,23,42,0.72)', lineHeight: 1.7 }}>{practicalGuide.summary}</p>
                        <div className="twoCol">
                          <div>
                            <div style={{ color: 'rgba(15,23,42,0.9)', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>推荐工具（可用现成产品）</div>
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                              {practicalGuide.tools.map((t) => (
                                <li key={t.name} style={{ marginTop: 6, color: 'rgba(15,23,42,0.86)' }}>
                                  <strong>{t.name}</strong>（{t.category}）：{t.usage}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div style={{ color: 'rgba(15,23,42,0.9)', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>建议 Skill</div>
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                              {practicalGuide.skills.map((s) => (
                                <li key={s} style={{ marginTop: 6, color: 'rgba(15,23,42,0.86)' }}>
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div style={{ marginTop: 12 }}>
                          <div style={{ color: 'rgba(15,23,42,0.9)', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>具体怎么用（分步骤）</div>
                          <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {practicalGuide.steps.map((s) => (
                              <li key={s} style={{ marginTop: 6, color: 'rgba(15,23,42,0.86)' }}>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div style={{ marginTop: 12 }}>
                          <div style={{ color: 'rgba(15,23,42,0.9)', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>建议交付物</div>
                          <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {practicalGuide.outputs.map((o) => (
                              <li key={o} style={{ marginTop: 6, color: 'rgba(15,23,42,0.86)' }}>
                                {o}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </details>

                <details>
                  <summary>
                    <span className="detailsTitle">PMO检查清单</span>
                    <span className="chev">确认可落地</span>
                  </summary>
                  <div className="detailsBody">
                    <div className="prose">
                      <ul>
                        {active.checklist.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                          {active.references?.length ? (
                        <>
                          <p style={{ marginTop: 12, color: 'rgba(15,23,42,0.8)' }}>参考框架（写作与审阅时可对齐）：</p>
                          <ul>
                            {active.references.map((r) => (
                              <li key={r}>{r}</li>
                            ))}
                          </ul>
                        </>
                      ) : null}
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </article>
        </section>

        <section id="workbench" className="playground" aria-label="提示词工作台">
          <div className="playgroundInner">
            <h3>提示词工作台（把你的项目材料填进模板）</h3>
            <p>
              默认使用当前场景的第一个“主提示词模板”。如果你想使用其他模板，回到右侧“提示词模板”区域复制相应内容即可。
            </p>

            <div className="formGrid">
              <input className="input" value={form.projectName} onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))} placeholder="项目名称" />
              <input className="input" value={form.phase} onChange={(e) => setForm((f) => ({ ...f, phase: e.target.value }))} placeholder="项目阶段" />
              <input className="input" value={form.timeline} onChange={(e) => setForm((f) => ({ ...f, timeline: e.target.value }))} placeholder="关键里程碑/时间约束" />
              <input className="input" value={form.constraints} onChange={(e) => setForm((f) => ({ ...f, constraints: e.target.value }))} placeholder="约束/合规/性能/安全/预算" />
              <input className="input" value={form.stakeholders} onChange={(e) => setForm((f) => ({ ...f, stakeholders: e.target.value }))} placeholder="干系人（角色+关注点）" />
              <input className="input" value={form.users} onChange={(e) => setForm((f) => ({ ...f, users: e.target.value }))} placeholder="用户/角色（如适用）" />
              <textarea className="input" value={form.goalSource} onChange={(e) => setForm((f) => ({ ...f, goalSource: e.target.value }))} placeholder="材料（会议纪要/PRD摘要/事实进展/原始描述）" />
              <textarea className="input" value={form.scopeKnown} onChange={(e) => setForm((f) => ({ ...f, scopeKnown: e.target.value }))} placeholder="已知范围/草案（包含/不包含）" />
              <textarea className="input" value={form.dependencies} onChange={(e) => setForm((f) => ({ ...f, dependencies: e.target.value }))} placeholder="依赖/接口/审批/外部交付（如适用）" />
              <textarea className="input" value={form.metrics} onChange={(e) => setForm((f) => ({ ...f, metrics: e.target.value }))} placeholder="指标/计量口径（如有）" />
              <textarea className="input" value={form.doD} onChange={(e) => setForm((f) => ({ ...f, doD: e.target.value }))} placeholder="DoD（验收标准/证据要求，如适用）" />
            </div>

            <div style={{ height: 14 }} />
            <div className="promptBlock">
              <div className="promptHeader">
                <strong>生成后的主提示词</strong>
                <div className="btnRow">
                  <button className="btn btnPrimary" onClick={() => handleCopy(generatedPrompt, '生成提示词已复制')}>
                    复制
                  </button>
                </div>
              </div>
              <div className="promptBody">
                <pre className="code">{generatedPrompt}</pre>
              </div>
            </div>
          </div>
        </section>

        <section id="notes" style={{ marginTop: 16 }}>
          <div style={{ color: 'rgba(15,23,42,0.72)', lineHeight: 1.8, fontSize: 14 }}>
            <p style={{ marginTop: 0 }}>
              使用建议：把你的“事实材料”优先贴入（会议纪要/PRD片段/数据口径/约束），再让AI输出结构化版本（表格字段、工作流、验收与证据、触发条件与升级路径）。
            </p>
            <p style={{ marginBottom: 0 }}>
              注意：AI输出需要你做一次 PMO 级别的“反向检查”（字段是否可验证、假设是否标注【待验证】、是否有证据与责任人）。
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">这是一个静态站点：可直接部署到 Vercel（Vite build 输出 dist）。</footer>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}
