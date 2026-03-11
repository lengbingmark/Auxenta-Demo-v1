import { StateMachineConfig, CopilotScript } from '../types';

export const powerOpsStateMachine: StateMachineConfig = {
  id: "pv_om_copilot_sm_v2_freeze",
  scene: "电力能源-光伏电站运维",
  copilotName: "量仔",
  roles: ["ADMIN", "MANAGER", "OPERATOR"],
  initial: "S0_OVERVIEW",
  states: {
    "S0_OVERVIEW": {
      "label": "资产总览",
      "entry": ["ACT_SYNC_CONTEXT", "ACT_PUSH_GREETING"],
      "ui": {
        "bubble": { "priority": "normal", "maxWidth": 360, "avoidSelectors": ["[data-copilot-avoid]"] },
        "drawer": { "enabled": true, "width": 420 }
      },
      "transitions": [
        { "event": "E_CLICK_RISK", "target": "data_collection" },
        { "event": "E_KPI_DROP", "target": "data_collection" },
        { "event": "E_OPEN_WORKBENCH", "target": "data_collection" }
      ]
    },
    "data_collection": {
      "label": "数据采集",
      "entry": ["ACT_SYNC_CONTEXT", "ACT_PUSH_GREETING"],
      "transitions": [
        { "event": "NEXT", "target": "diagnosis" },
        { "event": "E_BACK", "target": "S0_OVERVIEW" }
      ]
    },
    "diagnosis": {
      "label": "智能诊断",
      "entry": ["ACT_RISK_SUMMARY", "ACT_SUGGEST_NEXT"],
      "transitions": [
        { "event": "NEXT", "target": "manual_review" },
        { "event": "E_BACK", "target": "data_collection" }
      ]
    },
    "manual_review": {
      "label": "人工复核",
      "entry": ["ACT_SYNC_CONTEXT"],
      "transitions": [
        { "event": "NEXT", "target": "drone_verify" },
        { "event": "E_BACK", "target": "diagnosis" }
      ]
    },
    "drone_verify": {
      "label": "无人机核验",
      "entry": ["ACT_SUBSCRIBE_FEEDBACK"],
      "transitions": [
        { "event": "NEXT", "target": "execution_monitor" },
        { "event": "E_BACK", "target": "manual_review" }
      ]
    },
    "execution_monitor": {
      "label": "执行监测",
      "entry": ["ACT_PROGRESS_BRIEF"],
      "transitions": [
        { "event": "NEXT", "target": "risk_alert" },
        { "event": "E_BACK", "target": "drone_verify" }
      ]
    },
    "risk_alert": {
      "label": "风险预警",
      "entry": ["ACT_RISK_SUMMARY"],
      "transitions": [
        { "event": "NEXT", "target": "mitigation" },
        { "event": "E_BACK", "target": "execution_monitor" }
      ]
    },
    "mitigation": {
      "label": "缓解处置",
      "entry": ["ACT_DRAFT_LEDGER"],
      "transitions": [
        { "event": "NEXT", "target": "acceptance" },
        { "event": "E_BACK", "target": "risk_alert" }
      ]
    },
    "acceptance": {
      "label": "验收评估",
      "entry": ["ACT_GENERATE_REPORT"],
      "transitions": [
        { "event": "NEXT", "target": "knowledge" },
        { "event": "E_BACK", "target": "mitigation" }
      ]
    },
    "knowledge": {
      "label": "知识沉淀",
      "entry": ["ACT_SUGGEST_KNOWLEDGE_SAVE"],
      "transitions": [
        { "event": "E_BACK", "target": "acceptance" },
        { "event": "E_FINISH", "target": "S0_OVERVIEW" }
      ]
    }
  },
  "guards": {
    "G_CAN_APPROVE": "role === 'ADMIN' || role === 'MANAGER'",
    "G_CAN_DISPATCH": "role === 'ADMIN' || role === 'MANAGER'"
  },
  "actions": {
    "ACT_SYNC_CONTEXT": { "type": "store", "effect": "SYNC_CONTEXT" },
    "ACT_PUSH_GREETING": { "type": "chat", "effect": "PUSH_SCRIPTED_MESSAGE" },
    "ACT_RISK_SUMMARY": { "type": "chat", "effect": "PUSH_RISK_SUMMARY" },
    "ACT_SUGGEST_NEXT": { "type": "chat", "effect": "PUSH_NEXT_STEPS" },
    "ACT_GENERATE_PLANS": { "type": "store+chat", "effect": "CREATE_ARTIFACT_PLANS" },
    "ACT_REQUIRE_APPROVAL_HINT": { "type": "chat", "effect": "PUSH_APPROVAL_HINT" },
    "ACT_BUILD_TASKPACK": { "type": "store+chat", "effect": "CREATE_TASKPACK" },
    "ACT_ASSIGN_SUGGESTION": { "type": "chat", "effect": "PUSH_ASSIGN_GUIDE" },
    "ACT_SUBSCRIBE_FEEDBACK": { "type": "store", "effect": "SUBSCRIBE_FEEDBACK_STREAM" },
    "ACT_PROGRESS_BRIEF": { "type": "chat", "effect": "PUSH_PROGRESS_BRIEF" },
    "ACT_DRAFT_LEDGER": { "type": "store+chat", "effect": "DRAFT_LEDGER_RECORD" },
    "ACT_SUGGEST_REPORT": { "type": "chat", "effect": "PUSH_REPORT_SUGGESTION" },
    "ACT_GENERATE_REPORT": { "type": "store+chat", "effect": "GENERATE_REVIEW_REPORT" },
    "ACT_SUGGEST_KNOWLEDGE_SAVE": { "type": "chat", "effect": "PUSH_KNOWLEDGE_SAVE" }
  }
};

export const powerOpsScripts: Record<string, Record<string, CopilotScript>> = {
  S0_OVERVIEW: {
    ADMIN: {
      message: "你好，管理员。我已同步电站总览：今日收益率 3.92%，资产健康 87/100。\n⚠️ 我发现 1 项收益下滑风险（区域B污染指数偏高）。建议优先进入溯源。",
      cards: [
        { title: "关键结论", items: ["收益率 3.92%", "健康指数 87", "风险损失预测 ¥32,000/7天"] },
        { title: "建议动作", items: ["进入异常溯源", "生成处置预案", "查看执行进度"] }
      ],
      actions: [
        { label: "查看风险洞察", event: "E_CLICK_RISK", primary: true },
        { label: "生成预案", event: "E_CLICK_PLAN" }
      ]
    },
    MANAGER: {
      message: "你好，主管。我已为你整理“今日风险+待办优先级”。\n⚠️ 区域B疑似污染累积，建议先溯源再决定是否下发清洗任务。",
      cards: [
        { title: "团队关注点", items: ["高优先级风险 1", "待办任务 3", "临近逾期 1"] }
      ],
      actions: [
        { label: "进入溯源", event: "E_CLICK_RISK", primary: true },
        { label: "查看待办", event: "E_OPEN_WORKBENCH" }
      ]
    },
    OPERATOR: {
      message: "你好，我在。你今天先做这两件事最省力：\n① 先看区域B异常（影响收益约 -1.1%） ② 再按我给的顺序执行巡检/清洗。",
      cards: [
        { title: "你当前待办", items: ["无人机巡检", "机器人清洗", "热斑复检"] }
      ],
      actions: [
        { label: "查看异常", event: "E_CLICK_RISK", primary: true },
        { label: "进入工作台", event: "E_OPEN_WORKBENCH" }
      ]
    }
  },
  data_collection: {
    ADMIN: {
      message: "正在进行【信息采集】。建议上传最新的巡检报告或使用“一键填充”来同步实时监测数据。系统将自动解析关键指标并识别异常。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    MANAGER: {
      message: "信息采集阶段。请确保数据来源可靠。系统已准备好解析巡检文档，解析后将自动进入分析环节。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    OPERATOR: {
      message: "你好，请上传巡检报告或点击“一键填充”。我会帮你自动提取电站运行的关键数据。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    }
  },
  diagnosis: {
    ADMIN: {
      message: "【智能诊断】已就绪。当前 PR 值 82.4%，发电量环比上升 2.3%。系统检测到区域 B 存在性能偏差，建议启动深度诊断。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    MANAGER: {
      message: "分析结果显示运行平稳，但区域 B 污染指数触发预警。建议关注发电量趋势图，确认是否需要下发清洗任务。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    OPERATOR: {
      message: "分析完成。你可以看到发电量和 PR 值的变化。如果发现数据异常，请点击“下一步”进行诊断。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    }
  },
  manual_review: {
    ADMIN: {
      message: "【人工复核】阶段。检测到人机诊断结论分歧。请根据现场经验给出结论，我将结合您的反馈进行多源数据二次校验。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    MANAGER: {
      message: "正在跟进人工复核。建议重点关注区域 B 的 IV 曲线阶梯状特征，这通常是局部遮挡的典型表现。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    OPERATOR: {
      message: "请进行人工复核。确认现场是否存在物理遮挡或严重积灰，您的结论对后续核验至关重要。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    }
  },
  drone_verify: {
    ADMIN: {
      message: "【无人机核验】中。正在执行多元证据链深度分析。我正在交叉比对高清热感影像、历史气象数据与 IV 曲线特征。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    MANAGER: {
      message: "无人机核验进度更新。影像采集已完成，我正在利用多光谱分析算法对组件表面进行特征提取。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    OPERATOR: {
      message: "无人机正在核验现场情况。你可以看到实时的无人机画面，我将根据核验结果给出最终裁决。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    }
  },
  execution_monitor: {
    ADMIN: {
      message: "【执行监测】中。当前进度 65%。无人机回传画面显示区域 B 清洗作业正在按计划进行。暂无异常。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    MANAGER: {
      message: "正在盯着呢。巡检进度 60%，清洗进度 30%。目前一切正常，预计 1 小时内完成闭环。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    OPERATOR: {
      message: "执行中。你可以看到实时的无人机画面和执行日志。如果有任何问题我会第一时间告诉你。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    }
  },
  risk_alert: {
    ADMIN: {
      message: "【风险预警】提示：检测到区域 B 污染指数仍处于高位。建议持续关注清洗后的收益恢复数据。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    MANAGER: {
      message: "预警中心：当前存在 2 项活跃风险。主要是环境因素导致的污染累积。建议优化未来的清洗周期。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    OPERATOR: {
      message: "注意！有新的预警触发。看起来环境影响比预想的要大。点击“下一步”看看建议怎么做。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    }
  },
  mitigation: {
    ADMIN: {
      message: "【缓解处置】结论：本次干预挽回收益 1.1%，ROI 达 15.4%。建议将该区域的清洗频率调整为每周一次。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    MANAGER: {
      message: "处置建议已生成：基于本次处置效果，建议优化运维策略。这将有助于降低未来的运维成本。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    OPERATOR: {
      message: "缓解方案正在执行中。收益已经开始恢复。点击“下一步”生成复盘报告，把这次经验记下来。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    }
  },
  acceptance: {
    ADMIN: {
      message: "【验收评估】已生成。包含了从异常发现到入库沉淀的全流程记录。您可以预览、下载或分享给相关部门。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    MANAGER: {
      message: "评估报告已就绪。建议仔细核对收益恢复数据。确认无误后即可进行最后的入库沉淀。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    OPERATOR: {
      message: "评估完成。你可以下载报告作为工作成果。最后一步别忘了把经验存进知识库。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    }
  },
  knowledge: {
    ADMIN: {
      message: "【知识沉淀】完成。本次案例已成功转化为结构化知识。这将进一步提升系统在同类场景下的决策效率。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    MANAGER: {
      message: "知识已入库。感谢您的配合。闭环流程已圆满结束，您可以返回总览查看最新状态。",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    },
    OPERATOR: {
      message: "入库成功！这次的经验已经存好了。下次遇到类似问题，我会更快地帮你处理。辛苦了！",
      actions: [
        { label: "解释当前风险", event: "E_EXPLAIN_RISK" },
        { label: "把这一步写进台账", event: "E_WRITE_LEDGER" }
      ]
    }
  }
};
