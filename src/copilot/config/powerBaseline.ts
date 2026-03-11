
export const power_v1_baseline = {
  scenario: "power",
  modules: {
    homepage: {
      role: "运维协作助手",
      summary_logic: "根据当前电站运行数据生成首页态势摘要",
      bubble_messages: {
        initial: "当前系统已接入电站运行数据，如需深入分析，建议进入工作台启动诊断流程。",
        suggest_workspace: "建议先上传逆变器运行报表，我可以为您进行运行状态分析。"
      },
      actions: [
        {
          label: "进入工作台",
          target: "workspace"
        }
      ]
    },
    workspace: {
      workflow: [
        {
          stage: "data_collection",
          name: "逆变器数据采集",
          bubble: "数据已就绪，我已识别出多项运行指标，建议启动智能诊断分析。",
          actions: [
            "启动智能诊断"
          ]
        },
        {
          stage: "diagnosis",
          name: "问题诊断",
          bubble: "我已完成多维度分析，PR值异常可能与组件积灰有关。",
          drawer: "展示诊断证据链与分析过程",
          actions: [
            "人工复核"
          ]
        },
        {
          stage: "manual_review",
          name: "人工复核",
          bubble: "人工结论与AI存在分歧，建议进行无人机核验确认现场情况。",
          actions: [
            "发起无人机巡检"
          ]
        },
        {
          stage: "drone_verify",
          name: "无人机核验",
          bubble: "巡检完成，确认组件积灰问题，建议执行清洗预案。",
          actions: [
            "立即执行"
          ]
        },
        {
          stage: "execution_monitor",
          name: "执行与监测",
          bubble: "任务执行中，我将持续监测进度并预警风险。"
        },
        {
          stage: "risk_alert",
          name: "风险预警",
          bubble: "检测到任务延期风险，建议生成缓解方案。",
          actions: [
            "生成缓解方案"
          ]
        },
        {
          stage: "mitigation",
          name: "二次优化",
          bubble: "新的执行方案已生成，请确认继续执行。"
        },
        {
          stage: "acceptance",
          name: "验收与报告",
          bubble: "任务完成，可发起验收并生成复盘报告。"
        },
        {
          stage: "knowledge",
          name: "知识沉淀",
          bubble: "本次运维经验已沉淀为案例知识，可供后续任务参考。"
        }
      ]
    }
  }
};
