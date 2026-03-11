export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  type?: 'text' | 'receipt' | 'analysis';
  thinking?: string;
  receipt?: {
    status: 'success' | 'warning' | 'error' | 'info';
    title: string;
    details: string;
    nextStep?: string;
  };
  suggestions?: string[]; // Action IDs
  actions?: { label: string; event: string; primary?: boolean }[];
}

export interface BubbleModel {
  stageTitle: string;
  shortSummary: string;
  keyHighlight: string;
  actions: { label: string; event: string; primary?: boolean }[];
}

export interface DrawerSection {
  title: string;
  content: string;
  type?: 'info' | 'warning' | 'success' | 'analysis';
  action?: { label: string; event: string };
}

export interface DrawerModel {
  sections: DrawerSection[];
}

import { powerOpsScripts, powerOpsStateMachine } from '../config/powerOpsConfig';
import { StateMachineConfig, CopilotScript, WorkContext } from '../types';
import { RunState } from '../../types';

export const PersonaEngine = {
  // v5: Overview Engine for Homepage
  getOverviewEngineOutput: (globalState: any, context?: any): { bubble: BubbleModel; drawer: DrawerModel } => {
    const { tasks = [], currentUserRole, run } = globalState;
    const userIntent = context?.userIntent;
    const overdueTasks = tasks.filter((t: any) => t.status === 'overdue');
    
    const roleName = currentUserRole === 'MANAGER' ? '主管' : currentUserRole === 'ADMIN' ? '管理员' : '老师';
    const isWorkbenchActive = run?.stage !== 'collect' || run?.evidenceChain?.metricsCards?.length > 0;
    
    const stats = {
      genChange: '+2.3%',
      revChange: '+1.5%',
      risks: 3
    };

    if (userIntent === 'USER_ACTION_E_CLICK_GEN') {
      return {
        bubble: {
          stageTitle: "发电量深度分析",
          shortSummary: "量仔正在为您穿透发电量数据。今日增幅主要得益于区域A的逆变器效率优化，但区域B仍有小幅波动。",
          keyHighlight: "区域A表现优异",
          actions: [{ label: '查看详情', event: 'E_VIEW_DATA', primary: true }]
        },
        drawer: {
          sections: [
            { title: "分析思考过程", content: "我首先对比了各区域的 PR 值，发现区域 A 在清洗后效率提升了 4.5%。随后我调取了逆变器实时效率，确认区域 B 的波动并非设备故障，而是由于局部遮挡导致的。作为您的助理，我建议继续保持当前的运维节奏。", type: 'analysis' },
            { title: "发电量溯源", content: "通过对组串级数据的对比，我发现区域A的清洗工作显著提升了光电转换效率。建议将此经验推广至全站。", type: 'info' }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_CLICK_REV') {
      return {
        bubble: {
          stageTitle: "收益波动分析",
          shortSummary: "量仔已为您对比了电价波动曲线，目前的调度策略已实现收益最大化。今日收益保持稳健。",
          keyHighlight: "收益率：1.5% ↑",
          actions: [{ label: '收益预测', event: 'E_REV_FORECAST', primary: true }]
        },
        drawer: {
          sections: [
            { title: "分析思考过程", content: "我分析了今日峰谷电价的时段分布，并结合了储能系统的充放电状态。目前的策略在峰值电价时段实现了满额输出。我预测下周电价将有小幅上调，建议提前储备电量。", type: 'analysis' },
            { title: "收益构成分析", content: "当前收益主要由基础电费和峰谷差价补贴构成。我预测下周电价将有小幅上调，建议提前储备电量。", type: 'info' }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_GENERATE_BRIEF') {
      return {
        bubble: {
          stageTitle: "今日待办简报",
          shortSummary: "量仔已经为您梳理好了今日的重点工作。目前有 2 项逾期任务需优先处理，另外建议关注区域 B 的风险趋势。",
          keyHighlight: "待办：3 项",
          actions: [{ label: '查看待办', event: 'E_VIEW_TASKS', primary: true }]
        },
        drawer: {
          sections: [
            { title: "分析思考过程", content: "我从任务系统和风险监测模块提取了所有未闭环项，并根据“影响收益”和“时间紧急度”进行了加权排序。逾期任务直接关联到本周的 PR 达标率，因此被我列为最高优先级。", type: 'analysis' },
            { title: "今日待办工作", content: "1. 审核电力运维工作台中的“积灰诊断”冲突。\n2. 处理 2 项逾期任务：逆变器-05 离线排查、区域 C 杂草清理。\n3. 导出上周的招商运营复盘报告。", type: 'info' }
          ]
        }
      };
    }

    return {
      bubble: {
        stageTitle: isWorkbenchActive ? "工作台进度提醒" : "今日助理简报",
        shortSummary: isWorkbenchActive 
          ? `您好${roleName}！电力运维工作台正处于【${run.stage}】阶段。我已为您准备好了最新的诊断建议，请点击查看。`
          : `您好${roleName}！我是您的助理量仔。今日发电量较昨日提升 ${stats.genChange}，收益同比增加 ${stats.revChange}。目前有 ${stats.risks} 个风险点需关注。`,
        keyHighlight: isWorkbenchActive ? `当前阶段：${run.stage}` : (overdueTasks.length > 0 ? `紧急：${overdueTasks[0].title}` : "今日暂无紧急风险"),
        actions: isWorkbenchActive 
          ? [
              { label: '进入工作台', event: 'NAV_WORKBENCH', primary: true },
              { label: '查看简报', event: 'GENERATE_BRIEF' }
            ]
          : [
              { label: '查看待办', event: 'GENERATE_BRIEF', primary: true },
              { label: '风险趋势', event: 'E_CLICK_RISK' }
            ]
      },
      drawer: {
        sections: [
          {
            title: "👋 欢迎回来，我是您的 AI 助理",
            content: `我是您的“数字管培生”量仔。我将实时协助您处理电力运维及招商运营中的各项事务。`,
            type: 'info' as const
          },
          {
            title: "📊 今日核心数据洞察",
            content: `• **发电量变化**：${stats.genChange} (较昨日)\n• **发电收益同比**：${stats.revChange}\n• **风险预警**：检测到 ${stats.risks} 个异常波动点，主要集中在区域B。`,
            type: 'analysis' as const
          },
          {
            title: "🚨 待办工作清单",
            content: overdueTasks.length > 0 
              ? overdueTasks.map((t: any) => `• [逾期] ${t.title} (负责人: ${t.assignee})`).join('\n')
              : "1. 审核电力运维工作台中的“积灰诊断”冲突。\n2. 处理 2 项待办任务。\n3. 导出上周的招商运营复盘报告。",
            type: overdueTasks.length > 0 ? 'warning' as const : 'success' as const
          }
        ]
      }
    };
  },

  // v5: Welcome Engine for PowerOps
  getPowerOpsWelcomeOutput: (globalState: any): { bubble: BubbleModel; drawer: DrawerModel } => {
    const { run } = globalState;
    const stats = { genChange: '+2.3%', revChange: '+1.5%', risks: 3 };
    
    return {
      bubble: {
        stageTitle: "运维工作台状态",
        shortSummary: `您好！目前工作台正处于【${run.stage}】阶段。我已经为您准备好了最新的诊断建议，请点击查看。`,
        keyHighlight: `当前阶段：${run.stage}`,
        actions: [{ label: '进入工作台', event: 'NAV_WORKBENCH', primary: true }]
      },
      drawer: {
        sections: [
          {
            title: "👋 欢迎回来，我是您的 AI 助理",
            content: `我是您的“数字管培生”量仔。我将实时协助您处理电力运维中的各项事务。`,
            type: 'info'
          },
          {
            title: "📊 今日核心数据洞察",
            content: `• **发电量变化**：${stats.genChange} (较昨日)\n• **发电收益同比**：${stats.revChange}\n• **风险预警**：检测到 ${stats.risks} 个异常波动点。`,
            type: 'analysis'
          }
        ]
      }
    };
  },

  // Copilot Engine: Reactive logic layer
  getPowerOpsEngineOutput: (run: RunState, context?: WorkContext): { bubble: BubbleModel; drawer: DrawerModel } | null => {
    const { evidenceChain, auditLog } = run;
    const latestEvent = auditLog[0];
    const userIntent = context?.userIntent;
    const uavStatus = evidenceChain.verification.uav.status;
    const diagnosisStatus = evidenceChain.diagnosis.status;

    const uavProgress = evidenceChain.verification.uav.progress || 0;
    const isUavFinished = uavStatus === 'completed' || uavProgress >= 100;
    const isDiagnosisResolved = diagnosisStatus === 'RESOLVED_CONFIRMED';
    const { stage, execution, acceptance, outputs } = run;

    // --- User Intent Handlers (Highest Priority) ---
    if (userIntent === 'USER_ACTION_E_START_DIAGNOSIS' && stage === 'collect') {
      return {
        bubble: {
          stageTitle: "智能诊断引擎已启动",
          shortSummary: "量仔正在为您穿透多维数据。我正在交叉比对历史气象、IV 曲线特征以及逆变器实时效率，以锁定 PR 值下降的根因。",
          keyHighlight: "深度诊断中...",
          actions: []
        },
        drawer: {
          sections: [
            { 
              title: "诊断思考过程", 
              content: "我首先会排除设备硬件故障（如逆变器离线），随后通过对组串级电流的离散度分析，判定是否存在局部遮挡或积灰。最后，我会结合近 3 日的气象数据，给出最终的诊断结论。", 
              type: 'analysis' 
            }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_MANUAL_REVIEW') {
      return {
        bubble: {
          stageTitle: "正在跟进人工复核",
          shortSummary: "我正在实时监测您的人工复核操作。请根据现场经验给出结论，我将结合您的反馈进行多源数据二次校验。",
          keyHighlight: "人工复核跟进中",
          actions: []
        },
        drawer: {
          sections: [
            { 
              title: "复核关注点", 
              content: "建议重点关注区域 B 的 IV 曲线阶梯状特征，这通常是局部遮挡的典型表现。请确认现场是否存在物理遮挡或严重积灰。", 
              type: 'analysis' 
            }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_UPLOAD_DATA' && evidenceChain.metricsCards.length === 0) {
      return {
        bubble: {
          stageTitle: "正在解析报表数据",
          shortSummary: "我正在分析您上传的逆变器运行数据，提取关键性能指标并进行多维诊断。",
          keyHighlight: "数据解析中",
          actions: []
        },
        drawer: {
          sections: [
            { 
              title: "解析进度", 
              content: "已完成 12 台逆变器数据清洗，正在进行 IV 曲线特征匹配...", 
              type: 'analysis' 
            }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_CLICK_RISK' || userIntent === 'USER_ACTION_E_VIEW_RISKS') {
      return {
        bubble: {
          stageTitle: "风险趋势预测",
          shortSummary: "量仔监测到区域 B 的积灰风险正在上升。如果不及时处理，预计未来 48 小时内 PR 值将下降 1.5%。",
          keyHighlight: "风险等级：中",
          actions: [{ label: '生成预案', event: 'E_GENERATE_PLAN', primary: true }]
        },
        drawer: {
          sections: [
            { title: "分析思考过程", content: "我结合了气象局的沙尘预警 and 现场传感器的积灰厚度监测，通过回归模型推演了效率衰减曲线。目前区域 B 的遮挡率已接近临界点，建议在降雨前完成清洗。", type: 'analysis' },
            { title: "风险预测详情", content: "• **受影响区域**：区域 B (组串 12-45)\n• **预计损失**：约 1200 kWh/日\n• **建议动作**：启动自动化清洗机器人-02。", type: 'warning' }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_GENERATE_PLAN' || userIntent === 'USER_ACTION_E_CLICK_PLAN') {
      return {
        bubble: {
          stageTitle: "应对方案生成",
          shortSummary: "量仔为您生成了最优处置预案。我对比了历史 50 组类似案例，当前方案的预期收益恢复率最高。",
          keyHighlight: "方案置信度: 98%",
          actions: [{ label: '发起审批', event: 'E_APPROVE_PLAN', primary: true }]
        },
        drawer: {
          sections: [
            { title: "分析思考过程", content: "我权衡了“人工清洗”和“机器人清洗”的成本与响应速度。考虑到当前光照强度较高，人工进入场站会产生额外的安全风险 and 更高的成本，因此我优先推荐了机器人自动化作业方案。", type: 'analysis' },
            { title: "应对方案详情", content: "1. 调动清洗机器人-02 执行全覆盖清洗。\n2. 调整逆变器最大功率跟踪参数。\n3. 任务预计耗时 2.5 小时，成本约 200 元。", type: 'info' }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_APPROVE_PLAN') {
      return {
        bubble: {
          stageTitle: "预案已批准",
          shortSummary: "收到！预案已通过审批。我正在准备任务包，并实时调配相关资源，请确认下发细节。",
          keyHighlight: "资源调配中...",
          actions: [{ label: '确认下发', event: 'E_CONFIRM_DISPATCH', primary: true }]
        },
        drawer: {
          sections: [
            { title: "执行准备清单", content: "1. 清洗机器人-02 状态自检完成；2. 路径规划已下发；3. 实时监控链路已建立。", type: 'info' }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_CONFIRM_DISPATCH') {
      return {
        bubble: {
          stageTitle: "任务已下发",
          shortSummary: "指令已送达执行终端！我将全程为您盯着进度，一旦有异常我会立即提醒您。作为您的助理，我会实时学习任务执行中的偏差并自动优化路径。",
          keyHighlight: "实时监控与学习中",
          actions: [{ label: '查看进度', event: 'E_VIEW_TASKS', primary: true }]
        },
        drawer: {
          sections: [
            { title: "助理监控日志", content: "正在实时同步执行终端的运行数据。当前通讯链路延迟 < 50ms，执行精度符合预期。我已记录下当前环境参数，用于后续算法调优。", type: 'info' },
            { title: "协作学习笔记", content: "我发现当前风向对无人机航线有微小影响，已自动修正补偿参数。这些经验已存入我的“执行知识库”。", type: 'analysis' }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_CONFIRM_TASKS') {
      return {
        bubble: {
          stageTitle: "任务已派发",
          shortSummary: "所有任务已成功派发至责任人。我将实时监控他们的在线状态 and 反馈频率，确保执行无死角。",
          keyHighlight: "执行链条已激活",
          actions: [{ label: '查看进度', event: 'E_VIEW_TASKS', primary: true }]
        },
        drawer: {
          sections: [
            { title: "助理监控计划", content: "我将每隔 15 分钟轮询一次执行终端状态。若发现进度停滞超过 30 分钟，我将自动触发风险预警并为您准备缓解方案。", type: 'info' }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_SUBMIT_FEEDBACK') {
      const riskCount = run.execution.risks.filter(r => r.status === 'open').length;
      return {
        bubble: {
          stageTitle: riskCount > 0 ? "风险预警提示" : "反馈已接收",
          shortSummary: riskCount > 0 
            ? `注意！我从反馈中识别到了 ${riskCount} 项潜在风险。我已经为您准备好了应对方案。`
            : "收到最新的进度反馈。我正在分析反馈内容中的潜在风险，并实时更新整体进度曲线。",
          keyHighlight: riskCount > 0 ? "⚠️ 发现执行风险" : "进度实时同步中",
          actions: [{ label: riskCount > 0 ? '处理风险' : '查看详情', event: riskCount > 0 ? 'E_VIEW_RISKS' : 'E_VIEW_TASKS', primary: true }]
        },
        drawer: {
          sections: [
            { 
              title: riskCount > 0 ? "🚨 风险根因分析" : "AI 反馈分析", 
              content: riskCount > 0 
                ? `通过对反馈文本的语义分析，我识别到：${run.execution.risks.find(r => r.status === 'open')?.triggerReason}。建议立即启动缓解预案。`
                : "通过对反馈文本的语义分析，我未发现异常关键词。当前作业速率符合预期，预计可按时完工。", 
              type: riskCount > 0 ? 'warning' : 'success' 
            }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_ADJUST_CRITERIA') {
      return {
        bubble: {
          stageTitle: "验收标准建议",
          shortSummary: "量仔已为您拟定了多维验收红线：建议将 PR 恢复阈值设定在 82% 以上，组件表面清洁度需达到 A 级（无肉眼可见积灰），且逆变器转换效率需稳定在 98.1% 以上。",
          keyHighlight: "建议 PR 阈值：>82%",
          actions: [{ label: '采用建议', event: 'E_ADOPT_CRITERIA', primary: true }]
        },
        drawer: {
          sections: [
            { title: "分析的思考过程", content: "我回溯了该区域过去 3 个月在类似积灰程度下的清洗效果，PR 值的平均回升幅度为 4.2%±0.5%。结合当前 75.8% 的基准值，设定 82% 为验收红线既能确保收益恢复，又符合设备性能现状。此外，我交叉比对了清洗机器人的作业精度参数，确认 A 级清洁度是可达成的最优标准。", type: 'analysis' },
            { title: "验收标准设定建议", content: "• **PR 恢复率**：建议 > 82% (核心收益指标)\n• **组件表面**：无肉眼可见积灰 (物理质量指标)\n• **逆变器效率**：维持在 98.1% 以上 (设备健康指标)", type: 'info' }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_CONFIRM_ASSIGNEES') {
      return {
        bubble: {
          stageTitle: "任务责任人建议",
          shortSummary: "量仔已为您匹配了最优执行资源：建议【组件清洗】指派给“智洗机器人-01”，【效能复测】指派给“巡检无人机-Alpha”，【现场抽检】指派给“运维组-李工”。",
          keyHighlight: "资源匹配度：100%",
          actions: [{ label: '确认指派', event: 'E_CONFIRM_TASKS', primary: true }]
        },
        drawer: {
          sections: [
            { title: "分析的思考过程", content: "我实时评估了当前所有在线资源的负载与技能画像。机器人作业可规避午间高温时段的人工安全风险，且清洗一致性显著优于人工。无人机 Alpha 具备高频复测链路，可实现分钟级反馈。李工在区域 B 有丰富的现场经验，负责最后的人工抽检可确保万无一失。这种“人机协同”模式预计可缩短 20% 的执行周期。", type: 'analysis' },
            { title: "建议责任人详情", content: "• **组件清洗**：智洗机器人-01 (自动化作业，擅长大规模清洗)\n• **效能复测**：巡检无人机-Alpha (高频监测，擅长 PR 实时计算)\n• **现场抽检**：运维组-李工 (资深工程师，负责最后质量把关)", type: 'info' }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_ADOPT_CRITERIA') {
      return {
        bubble: {
          stageTitle: "标准已采用",
          shortSummary: "收到！验收标准已更新。我将以此为基准，在执行过程中为您实时计算收益恢复趋势。",
          keyHighlight: "标准确认完成",
          actions: [{ label: '确认标准', event: 'E_CRITERIA_CONFIRMED', primary: true }]
        },
        drawer: {
          sections: [
            { title: "监控计划", content: "我已将 PR 82% 设为预警红线。执行过程中，若实时 PR 曲线偏离预期路径，我将自动触发风险预警并提示您调整策略。", type: 'info' }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_CONFIRM_MITIGATION') {
      return {
        bubble: {
          stageTitle: "缓解方案已确认",
          shortSummary: "收到！二次优化方案已下发。我将重点监控受影响区域的指标恢复情况，确保风险尽快闭环。",
          keyHighlight: "风险对冲中",
          actions: [{ label: '查看进度', event: 'E_VIEW_TASKS', primary: true }]
        },
        drawer: {
          sections: [
            { title: "优化效果预测", content: "根据我的模拟，该方案执行后，PR 值将在 1 小时内开始回升，预计今日可恢复至 84% 以上。", type: 'analysis' }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_ARCHIVE_CASE') {
      return {
        bubble: {
          stageTitle: "流程圆满闭环",
          shortSummary: "案例已成功归档至企业知识库。感谢您的协作，这次的处置经验将成为我进化的重要养料。",
          keyHighlight: "知识沉淀完成",
          actions: [{ label: '查看知识库', event: 'E_VIEW_KNOWLEDGE', primary: true }]
        },
        drawer: {
          sections: [
            { title: "助理学习总结", content: "本次流程中，我学习到了：在沙尘天气后，区域B的积灰速度比区域A快 15%。我已经更新了我的预测模型，下次将为您提供更精准的清洗建议。", type: 'analysis' }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_VIEW_DATA') {
      return {
        bubble: {
          stageTitle: "数据透视",
          shortSummary: "正在为您展示数据详情。我已经对这些指标进行了初步校验，各项参数均在合理范围内。",
          keyHighlight: "数据校验：合格",
          actions: [{ label: '开始诊断', event: 'E_START_DIAGNOSIS', primary: true }]
        },
        drawer: {
          sections: [
            { title: "数据深度分析", content: "通过对逆变器电压与电流的关联分析，我发现 PR 值下降与光照强度不成正比，这进一步印证了积灰或遮挡的可能性。", type: 'analysis' }
          ]
        }
      };
    }

    if (userIntent === 'USER_ACTION_E_VIEW_EVIDENCE') {
      return {
        bubble: {
          stageTitle: "证据链分析",
          shortSummary: "正在为您展示诊断证据链。我结合了历史数据、实时气象以及无人机回传图像，确保结论的严谨性。",
          keyHighlight: "多维证据对齐中",
          actions: [{ label: '确认预案', event: 'E_CONFIRM_PLAN', primary: true }]
        },
        drawer: {
          sections: [
            { title: "AI 思考过程", content: "我首先排除了设备故障（逆变器效率正常），随后通过对比相邻组串的发电差异，锁定了局部遮挡风险。无人机回传的图像显示组件表面有明显积灰，这与我的判断高度吻合。", type: 'analysis' }
          ]
        }
      };
    }

    // --- High-Priority State Handlers (Overrides) ---

    // 1. Priority: Diagnosis Resolved or Verification Completed (Closed Loop) - ONLY in diagnose stage
    if (stage === 'diagnose' && (isDiagnosisResolved || isUavFinished || latestEvent?.eventType === 'DIAGNOSIS_UPDATED' || latestEvent?.eventType === 'VERIFICATION_COMPLETED')) {
      return {
        bubble: {
          stageTitle: "诊断分析已闭环",
          shortSummary: isDiagnosisResolved 
            ? "诊断冲突已根据核验结果完成闭环。最终结论（积灰遮挡）已同步至执行预案，建议立即启动后续治理动作。"
            : "核验通过：积灰事实确认。现场影像证实了积灰遮挡严重性，人工诊断结论与现场情况高度吻合，诊断分歧已闭环，推荐立即执行清洗预案。",
          keyHighlight: isDiagnosisResolved ? "冲突已解决" : "核验通过：分歧已闭环",
          actions: isDiagnosisResolved 
            ? [{ label: '生成预案', event: 'E_CONFIRM_PLAN', primary: true }]
            : [{ label: '立即执行', event: 'E_CONFIRM_PLAN', primary: true }]
        },
        drawer: {
          sections: [
            { 
              title: "解决路径", 
              content: "经人机协同与无人机二次核验确认，最终采纳了当前置信度最高的诊断结论。该决策过程已存入专家系统，作为未来类似场景的推理参考。", 
              type: 'success' 
            },
            {
              title: "知识沉淀",
              content: "本次案例已自动转化为知识草稿。事实证明，厚积灰的电流特征与物理遮挡高度相似，已更新 AI 识别规则库。",
              type: 'info'
            }
          ]
        }
      };
    }

    // 2. Priority: Verification in Progress (Analysis)
    if (uavStatus === 'requested' || 
        userIntent === 'USER_ACTION_E_RE_VERIFY' || 
        latestEvent?.eventType === 'VERIFICATION_REQUESTED' || 
        latestEvent?.eventType === 'VERIFICATION_PROGRESS_UPDATED') {
      
      // Ensure we show at least 1% if it's requested to avoid "0%" confusion
      const displayProgress = Math.max(uavProgress, 1);
      const isFinalizing = displayProgress >= 95 && displayProgress < 100;
      
      return {
        bubble: {
          stageTitle: isFinalizing ? "正在生成核验报告" : "多元证据链分析",
          shortSummary: isFinalizing 
            ? "影像采集已完成，我正在利用多光谱分析算法对组件表面进行特征提取，即将给出最终裁决..."
            : `正在执行多元证据链深度分析，当前进度 ${displayProgress}%。我正在交叉比对高清热感影像、历史气象数据与 IV 曲线特征，以排除环境干扰。`,
          keyHighlight: isFinalizing ? "报告生成中" : `分析进度 ${displayProgress}%`,
          actions: [] // Remove actions to emphasize automatic progress
        },
        drawer: {
          sections: [
            { 
              title: "实时分析状态", 
              content: `当前进度: ${displayProgress}%\n分析目标: 判定遮挡物物理属性（积灰 vs 树荫）\n核验设备: 无人机高清热感相机 (UAV-02)`, 
              type: 'analysis' 
            },
            {
              title: "分析路径",
              content: "1. 实时提取组件表面热斑分布特征\n2. 比对区域 B 历史清洗周期与积灰速率模型\n3. 结合当前太阳方位角计算树木投影位置\n4. 综合多光谱特征给出最终诊断裁决",
              type: 'info'
            }
          ]
        }
      };
    }

    // 3. Priority: Diagnosis Conflict (Conflict Detected)
    if (diagnosisStatus === 'HUMAN_REVIEWED_CONFLICT' || 
        latestEvent?.eventType === 'DIAGNOSIS_CONFLICT_RAISED' || 
        latestEvent?.eventType === 'HUMAN_REVIEW_SUBMITTED') {
      return {
        bubble: {
          stageTitle: "检测到诊断分歧",
          shortSummary: "检测到诊断分歧。这种情况在实际运维中并不少见。我建议立即发起无人机现场核验，以形成更可靠的证据链。",
          keyHighlight: "建议二次核验",
          actions: [{ label: '发起二次核验', event: 'E_RE_VERIFY', primary: true }]
        },
        drawer: {
          sections: [
            { 
              title: "分歧点分析", 
              content: "AI 识别为树荫遮挡，人工识别为积灰遮挡。分歧核心在于遮挡物的物理属性。无人机核验将提供决定性证据。", 
              type: 'warning' 
            }
          ]
        }
      };
    }

    // Stage-based fallback logic
    switch (stage) {
      case 'collect': {
        const hasData = evidenceChain.metricsCards.length > 0;
        return {
          bubble: {
            stageTitle: "数据采集",
            shortSummary: hasData 
              ? "数据已就绪！我已识别出 6 项运行指标。建议立即启动智能诊断，看看 PR 值波动的原因。" 
              : "今天电站整体运行稳定，但PR值较昨日出现轻微波动。我建议先上传本月逆变器运行报表，我可以帮您快速定位原因。",
            keyHighlight: hasData ? "数据已上传" : "等待数据输入",
            actions: hasData 
              ? [
                  { label: '查看数据详情', event: 'E_VIEW_DATA', primary: true },
                  { label: '启动智能诊断', event: 'E_START_DIAGNOSIS' }
                ]
              : [{ label: '上传报表', event: 'E_UPLOAD_DATA', primary: true }]
          },
          drawer: {
            sections: [
              { 
                title: "数据状态深度分析", 
                content: hasData 
                  ? `我已识别出 ${evidenceChain.metricsCards.length} 项关键运行指标。初步观察发现 PR 值存在 5.2% 的异常波动，这通常与环境遮挡或设备老化有关。` 
                  : "目前系统尚未接收到任何运行数据。作为您的管培生，我建议您上传包含电压、电流、PR值等维度的 Excel 报表。",
                type: 'info' as const
              },
              {
                title: "证据链列举",
                content: hasData 
                  ? `• **PR值**：81.2% (低于基准值 85%)\n• **逆变器效率**：98.2% (正常)\n• **日均发电小时**：4.2h (正常)\n\n数据完整度：100%。`
                  : "暂无证据链数据。",
                type: 'analysis' as const
              },
              {
                title: "操作建议",
                content: hasData 
                  ? "建议立即执行“智能诊断”流程。我将结合历史气象数据 and 设备模型，为您锁定故障根因。"
                  : "请点击气泡中的“上传报表”按钮，或直接在工作台点击“上传逆变器运行数据”。",
                type: 'analysis' as const
              }
            ]
          }
        };
      }
      case 'diagnose': {
        const { diagnosis, verification } = evidenceChain;
        const isConflict = diagnosis.status === 'HUMAN_REVIEWED_CONFLICT';
        
        return {
          bubble: {
            stageTitle: "智能诊断",
            shortSummary: isConflict 
              ? "报告！发现诊断分歧。我已经把 AI 判定 and 人工判定的差异点整理好了，请您定夺。" 
              : `诊断完成。我认为当前 PR 下降主要是由于“${diagnosis.aiConclusion}”引起的，置信度很高。`,
            keyHighlight: isConflict ? "检测到人机决策分歧" : `诊断置信度: ${diagnosis.confidence}`,
            actions: [
              { label: isConflict ? '复核分歧' : '查看证据链', event: 'E_VIEW_EVIDENCE', primary: true },
              { label: isConflict ? '发起二次核验' : '确认处置预案', event: isConflict ? 'E_RE_VERIFY' : 'E_CONFIRM_PLAN' },
              { label: '人工修正', event: 'E_MANUAL_REVIEW' }
            ]
          },
          drawer: {
            sections: [
              {
                title: "助理诊断报告",
                content: `基于多维证据链分析，我的结论是：${diagnosis.aiConclusion}。主要依据包括：${diagnosis.reasonBullets.join('；')}。`,
                type: 'analysis' as const
              },
              {
                title: "证据链列举",
                content: `• **历史对比**：PR值较上周下降 5.2%\n• **环境因子**：近3日区域存在微沙尘天气\n• **设备状态**：逆变器转换效率稳定在 98% 以上`,
                type: 'info' as const
              },
              {
                title: "核验进度",
                content: `无人机巡检：${verification.uav.status === 'completed' ? '✅ 已完成' : '⏳ 待执行'}；人工核实：${verification.manual.status === 'completed' ? '✅ 已完成' : '⏳ 待执行'}。`,
                type: 'info' as const
              },
              ...(isConflict ? [{
                title: "分歧深度分析",
                content: `AI 侧重于历史数据模式，而人工判定可能基于现场经验。这种分歧是系统学习的好机会，建议通过二次核验来最终确认。`,
                type: 'warning' as const
              }] : []),
              {
                title: "操作建议",
                content: isConflict 
                  ? "建议通过无人机进行二次核验，获取更高清的现场影像以消除分歧。"
                  : "诊断结论置信度较高，建议立即确认处置预案以规避进一步收益损失。",
                type: 'analysis' as const
              }
            ]
          }
        };
      }
      case 'execute': {
        const hasPendingTasks = execution.tasks.some(t => t.status === 'pending_confirm');
        const isCriteriaConfirmed = acceptance.criteriaConfirmed;
        const isPreparationPhase = hasPendingTasks || !isCriteriaConfirmed;

        if (isPreparationPhase) {
          return {
            bubble: {
              stageTitle: "执行准备阶段",
              shortSummary: "方案已选定。量仔已为您自动拆解了运维任务并拟定了验收标准建议。请您查看任务责任人指派及验收红线建议，确保执行链条闭环。",
              keyHighlight: "待确认准备事项",
              actions: [
                { label: '任务责任人建议', event: 'E_CONFIRM_ASSIGNEES', primary: hasPendingTasks },
                { label: '验收标准建议', event: 'E_ADJUST_CRITERIA', primary: !hasPendingTasks && !isCriteriaConfirmed }
              ]
            },
            drawer: {
              sections: [
                { 
                  title: "准备阶段分析", 
                  content: "我已根据选定方案自动匹配了最优执行资源建议（机器人+无人机组合），并基于历史数据推算了本次运维的 PR 恢复目标建议。请您完成最后的确认，以便我启动实时监测。", 
                  type: 'analysis' 
                },
                {
                  title: "待办准备清单",
                  content: `• **任务指派**：${hasPendingTasks ? '⏳ 待确认' : '✅ 已完成'}\n• **验收标准**：${isCriteriaConfirmed ? '✅ 已确认' : '⏳ 待设置'}`,
                  type: 'info'
                }
              ]
            }
          };
        }

        const activeTask = execution.tasks.find(t => t.status === 'in_progress') || execution.tasks[0];
        const riskCount = execution.risks.filter(r => r.status === 'open').length;
        const activeMitigation = execution.mitigations.find(m => m.status === 'executing');
        const resolvedRisk = execution.risks.find(r => r.status === 'closed' && r.resolvedAt && (Date.now() - r.resolvedAt < 30000));
  
        let summary = `正在为您盯着进度呢！当前总进度 ${activeTask?.progress || 0}%，一切都在按计划进行。我会持续跟踪任务执行情况，一旦发现进度异常或潜在风险，我会第一时间提醒您。`;
        if (riskCount > 0) summary = `注意！我从反馈中识别到了2项潜在风险，当前任务进度明显低于预期，同时现场反馈出现设备故障。根据历史经验，这类情况通常会导致任务延期。我已经为您准备了三种优化方案。`;
        if (activeMitigation) summary = "缓解方案正在执行中。我会持续跟踪，确保进度尽快恢复。我会持续跟踪任务执行情况，一旦发现进度异常或潜在风险，我会第一时间提醒您。";
        if (resolvedRisk) summary = "太棒了！之前的进度风险已经成功化解，我已经把这次处置经验记在小本本上了。我会持续跟踪任务执行情况，一旦发现进度异常或潜在风险，我会第一时间提醒您。";
  
        return {
          bubble: {
            stageTitle: "执行监测",
            shortSummary: summary,
            keyHighlight: resolvedRisk ? "风险已闭环" : (riskCount > 0 ? "⚠️ 发现延期风险" : "执行过程平稳"),
            actions: [
              { label: '查看任务详情', event: 'E_VIEW_TASKS', primary: !riskCount },
              { label: '处理风险', event: 'E_VIEW_RISKS', primary: !!riskCount },
              { label: '生成缓解方案', event: 'E_GENERATE_MITIGATION' }
            ]
          },
          drawer: {
            sections: [
              {
                title: "实时执行监控",
                content: `当前正在执行：${activeTask?.title}。负责人：${activeTask?.ownerName}。我会实时同步最新的进度反馈。`,
                type: 'info' as const
              },
              {
                title: "执行证据链",
                content: `• **任务进度**：${activeTask?.progress || 0}%\n• **资源状态**：${activeTask?.ownerName} 在线\n• **环境参数**：风速 2.1m/s (适宜作业)`,
                type: 'analysis' as const
              },
              {
                title: "风险预警分析",
                content: riskCount > 0 
                  ? `检测到 ${riskCount} 个风险点：\n${execution.risks.filter(r => r.status === 'open').map(r => `• [${r.level}] ${r.title}: ${r.triggerReason}`).join('\n')}`
                  : "目前没有发现会影响交付的风险，请放心。",
                type: riskCount > 0 ? 'warning' as const : 'success' as const
              },
              {
                title: "操作建议",
                content: riskCount > 0 
                  ? "建议立即生成并执行缓解方案，以确保任务在预定窗口内完成。"
                  : "建议保持当前监控频率，我将持续为您守候。",
                type: 'analysis' as const
              }
            ]
          }
        };
      }
      case 'accept': {
        const isAccepted = acceptance.status === 'accepted';
        const isArchived = outputs.caseRecord.status === 'saved';
        const isSaved = outputs.knowledgeRecord.status === 'saved';
        
        let summary = "验收条件已经达成，您可以开始最终评估了。";
        if (isAccepted) summary = "验收通过！我已经为您准备好了复盘报告，随时可以下载。";
        if (isArchived) summary = "案例已成功归档。我把这次的分歧处理过程也记录进去了，非常有参考价值。";
        if (isSaved) summary = "经验已入库。这次的风险处置策略已经变成了系统的“肌肉记忆”，下次会自动推荐。";
        if (isArchived && isSaved) summary = "流程圆满闭环！本次运维效率提升明显，PR 值恢复符合预期。本次事件已自动沉淀为可复用案例，未来当系统检测到类似情况时，将优先推荐对应的处置方案。";

        return {
          bubble: {
            stageTitle: "验收与沉淀",
            shortSummary: summary,
            keyHighlight: isAccepted ? "任务已闭环" : "等待验收评估",
            actions: [
              { label: '预览复盘报告', event: 'E_PREVIEW_REPORT', primary: true },
              { label: '下载报告', event: 'E_DOWNLOAD_REPORT' },
              { label: '查看案例库', event: 'E_VIEW_CASES' },
              { label: '查看知识库', event: 'E_VIEW_KNOWLEDGE' }
            ]
          },
          drawer: {
            sections: [
              {
                title: "验收评估总结",
                content: isAccepted 
                  ? `PR 值已恢复至 ${acceptance.metrics?.pr || '82.1%'}。本次运维闭环耗时 4.5 小时，比平均水平快了 15%。`
                  : "我正在实时监控清洗后的效率恢复曲线，目前趋势向好，建议稍后进行最终验收。",
                type: isAccepted ? 'success' as const : 'info' as const
              },
              {
                title: "沉淀证据链",
                content: `• **PR恢复率**：+4.2%\n• **知识草稿**：1 份已生成\n• **案例归档**：待确认`,
                type: 'analysis' as const
              },
              {
                title: "助理学习笔记",
                content: '通过本次协作，我学到了：在积灰诊断中，结合无人机巡检能有效降低误报率。这些经验已沉淀。',
                type: 'analysis' as const
              },
              {
                title: "操作建议",
                content: isAccepted 
                  ? "建议下载复盘报告 and 完成案例归档，这将有助于我下次为您提供更精准的建议。"
                  : "建议在 PR 值稳定在 82% 以上后再进行最终验收。",
                type: 'analysis' as const
              }
            ]
          }
        };
      }
      default:
        return null;
    }
  },

  // Get PowerOps workflow script based on run state (Legacy, but kept for compatibility)
  getPowerOpsWorkflowScript: (run: RunState, role: string): CopilotScript | null => {
    const { stage, evidenceChain, execution, acceptance, outputs } = run;

    switch (stage) {
      case 'collect': {
        const hasData = evidenceChain.metricsCards.length > 0;
        return {
          message: hasData 
            ? `已采集到逆变器运行数据（${run.dataSource.fileName || 'station_data_oct.xlsx'}），包含电压、电流等${evidenceChain.metricsCards.length}项核心指标。`
            : "当前处于信息采集阶段。请上传逆变器运行数据报表，我将为您进行智能诊断。",
          actions: hasData 
            ? [
                { label: '查看数据', event: 'E_VIEW_DATA', primary: true },
                { label: '开始诊断', event: 'E_START_DIAGNOSIS' }
              ]
            : [{ label: '上传数据', event: 'E_UPLOAD_DATA', primary: true }]
        };
      }
      case 'diagnose': {
        const { diagnosis } = evidenceChain;
        const isConflict = diagnosis.status === 'HUMAN_REVIEWED_CONFLICT';
        return {
          message: isConflict
            ? `检测到诊断分歧，本次案例已记录为“诊断冲突案例”，可用于优化后续证据链判断。`
            : `AI诊断完成：${diagnosis.aiConclusion} 置信度 ${diagnosis.confidence}。根据当前运行情况，我建议优先查看证据链，再决定是否确认预案。`,
          actions: [
            { label: '查看证据链', event: 'E_VIEW_EVIDENCE', primary: true },
            { label: isConflict ? '发起二次核验' : '确认预案', event: isConflict ? 'E_RE_VERIFY' : 'E_CONFIRM_PLAN' },
            { label: '人工复核', event: 'E_MANUAL_REVIEW' }
          ]
        };
      }
      case 'execute': {
        const activeTask = execution.tasks.find(t => t.status === 'in_progress') || execution.tasks[0];
        const riskCount = execution.risks.filter(r => r.status === 'open').length;
        const resolvedRisk = execution.risks.find(r => r.status === 'closed' && r.resolvedAt && (Date.now() - r.resolvedAt < 10000));
        
        if (resolvedRisk) {
          return {
            message: `本次任务延期风险通过任务优先级调整得到缓解，该策略已记录为风险处置经验。`,
            actions: [
              { label: '查看经验详情', event: 'E_VIEW_TASKS', primary: true },
              { label: '继续执行', event: 'E_CONTINUE_EXEC' }
            ]
          };
        }

        return {
          message: `正在执行：${activeTask?.title || '运维任务'}。当前进度：${activeTask?.progress || 0}%。${riskCount > 0 ? `检测到 ${riskCount} 项潜在风险，建议优先查看缓解方案，再决定是否调整任务顺序。` : '执行过程平稳。'}`,
          actions: [
            { label: '查看风险', event: 'E_VIEW_RISKS', primary: riskCount > 0 },
            { label: '生成缓解方案', event: 'E_GENERATE_MITIGATION' },
            { label: '查看任务', event: 'E_VIEW_TASKS' }
          ]
        };
      }
      case 'accept': {
        const isAccepted = acceptance.status === 'accepted';
        
        if (outputs.caseRecord.status === 'saved') {
          return {
            message: `案例已归档至企业案例库，可用于后续类似电站问题参考。`,
            actions: [{ label: '查看案例库', event: 'E_VIEW_CASES', primary: true }]
          };
        }
        if (outputs.knowledgeRecord.status === 'saved') {
          return {
            message: `本次运维经验已生成知识条目，已加入知识库。`,
            actions: [{ label: '查看知识库', event: 'E_VIEW_KNOWLEDGE', primary: true }]
          };
        }

        return {
          message: isAccepted 
            ? `本次运维任务已通过验收，PR 从 76.5% 提升至 ${acceptance.metrics?.pr || '82.1%'}，经验已沉淀为可复用案例。`
            : "正在进行验收评估。系统正在对比清洗前后的PR值变化，我建议您关注PR恢复曲线。",
          actions: [
            { label: '预览报告', event: 'E_PREVIEW_REPORT', primary: true },
            { label: '下载报告', event: 'E_DOWNLOAD_REPORT' },
            { label: '查看案例归档', event: 'E_VIEW_CASES' },
            { label: '查看知识入库', event: 'E_VIEW_KNOWLEDGE' }
          ]
        };
      }
      default:
        return null;
    }
  },

  // Get PowerOps script based on state and role
  getPowerOpsScript: (state: string, role: string): CopilotScript | null => {
    const stateScripts = powerOpsScripts[state];
    if (!stateScripts) return null;
    return stateScripts[role] || stateScripts['OPERATOR'] || null;
  },

  // Get PowerOps state machine config
  getPowerOpsStateMachine: (): StateMachineConfig => {
    return powerOpsStateMachine;
  },
  formatAnalysis: (
    judgment: string,
    basis: string[],
    impact: string,
    paths: { label: string; desc: string }[],
    suggestion: string,
    toneContext?: { ignoredCount: number; acceptedCount: number }
  ): string => {
    let prefix = '';
    if (toneContext) {
      if (toneContext.ignoredCount >= 2) {
        prefix = '⚠️ 提醒：这是近期第三次出现类似风险情形，请务必重视。\n\n';
      } else if (toneContext.acceptedCount > 5) {
        prefix = '基于您过往的偏好，我为您优先筛选了以下优化路径。\n\n';
      }
    }

    const basisText = basis.map(b => `• ${b}`).join('\n');
    const pathsText = paths.map((p, i) => `**方案 ${String.fromCharCode(65 + i)} (${p.label})**：\n  ${p.desc}`).join('\n\n');

    return `${prefix}【当前判断】\n${judgment}\n\n【判断依据】\n${basisText}\n\n【潜在影响】\n${impact}\n\n【建议路径】\n${pathsText}\n\n【建议动作】\n${suggestion}`;
  },

  // v4: Comparison Format
  formatComparison: (
    scenarioA: { name: string; successRate: string; risk: string },
    scenarioB: { name: string; successRate: string; risk: string },
    recommendation: string
  ): string => {
    const nameA = scenarioA?.name || '方案 A';
    const nameB = scenarioB?.name || '方案 B';
    return `为了辅助您的决策，我对比了以下两种方案：\n\n**方案 A：${nameA}**\n- 成功率：${scenarioA?.successRate || '未知'}\n- 风险等级：${scenarioA?.risk || '未知'}\n\n**方案 B：${nameB}**\n- 成功率：${scenarioB?.successRate || '未知'}\n- 风险等级：${scenarioB?.risk || '未知'}\n\n💡 **我的建议**：${recommendation}`;
  },

  // v4: Conflict Resolution Format
  formatConflict: (
    userAction: string,
    aiSuggestion: string,
    reason: string,
    mitigation: string
  ): string => {
    return `【决策冲突提示】\n您选择了“${userAction}”，而建议方案为“${aiSuggestion}”。\n\n**差异原因**：\n${reason}\n\n**风险缓释建议**：\n${mitigation}\n\n系统已记录此次决策差异，将持续监测后续影响。`;
  },

  // v4: Stage Summary Format
  formatSummary: (
    stats: { suggestions: number; accepted: number; tasks: number; risk: string }
  ): string => {
    return `【阶段工作总结】\n本阶段协作已完成。\n\n- 提出建议：${stats.suggestions} 条\n- 采纳情况：${stats.accepted} 条\n- 执行任务：${stats.tasks} 项\n- 风险变化：${stats.risk === 'decreased' ? '📉 已降低' : stats.risk === 'increased' ? '📈 有所上升' : '➡️ 保持稳定'}\n\n是否需要生成详细复盘报告？`;
  },

  // v5: Natural Language Helper
  getNaturalLanguageReply: (input: string, context: WorkContext, globalState?: any): string => {
    const { module, scenario } = context;
    const persona = PersonaEngine.getPersona(module, scenario);
    
    // Simple intent matching
    if (input.includes('你好') || input.includes('在吗')) {
      return `您好！我是您的 AI 助理【${persona.name}】。作为您的“数字管培生”，我正实时关注着系统状态。请问有什么我可以帮您的？`;
    }
    
    if (input.includes('你是谁')) {
      return `我是您的 AI 副驾驶【${persona.name}】。我的核心能力是实时协作、数据分析、风险预警以及知识沉淀。您可以把我当成您的“管培生”助理，我会陪您一起处理业务。`;
    }
    
    if (input.includes('风险') || input.includes('问题')) {
      if (scenario === 'powerops' && globalState?.run) {
        const riskCount = globalState.run.execution.risks.filter((r: any) => r.status === 'open').length;
        return riskCount > 0 
          ? `报告！我监测到当前有 ${riskCount} 项开放风险。我已经在工作台中为您准备好了缓解方案，建议您去看看。`
          : `目前系统运行平稳，没有发现显著风险。我会继续为您盯着的。`;
      }
      return `我正在分析当前模块的潜在风险。目前看来，一切都在可控范围内。`;
    }

    return `收到您的指令：“${input}”。作为您的助理，我正努力理解并学习如何更好地为您服务。您可以尝试问我“当前有什么风险？”或“生成一份分析报告”。`;
  },

  // v5: Conversational Summary for Drawer Insights
  getConversationalSummary: (drawerModel: DrawerModel | null, userIntent?: string): string => {
    if (!drawerModel || drawerModel.sections.length === 0) return '我正在为您实时监测场景动态...';
    
    if (userIntent?.includes('CLICK_GEN')) {
      return '我刚才穿透分析了发电量数据，发现区域 A 的效率提升非常明显，这主要归功于之前的逆变器优化。您可以去详情里看看具体的 PR 曲线。';
    }
    if (userIntent?.includes('CLICK_REV')) {
      return '关于收益波动，我对比了电价曲线，目前的调度策略已经帮您锁定了最大化收益。我预测下周电价还有上涨空间，建议咱们提前做好储能准备。';
    }
    if (userIntent?.includes('CLICK_RISK')) {
      return '报告！我监测到区域 B 的积灰风险正在抬头，如果不处理的话，未来两天 PR 值可能会掉 1.5%。我已经为您准备好了预案，您看要不要现在就启动机器人清洗？';
    }
    if (userIntent?.includes('GENERATE_PLAN')) {
      return '我已经为您权衡了多种处置方案。考虑到现在的光照 and 成本，我最推荐“机器人自动化清洗”，这样既安全又高效。方案细节已经列在上面了，您过目。';
    }
    if (userIntent?.includes('GENERATE_BRIEF')) {
      return '我已经为您梳理好了今日的重点。目前有几项逾期任务需要您优先关注，另外区域 B 的风险趋势也得盯着点。具体的待办清单我已经整理在洞察区了。';
    }
    if (userIntent?.includes('ADJUST_CRITERIA')) {
      return '我正在为您提供验收标准的参数建议。基于历史数据，我为您设定了合理的 PR 恢复阈值，您可以根据实际情况进行微调。';
    }

    // Default fallback: take the first non-analysis section or the first section
    const mainSection = drawerModel.sections.find(s => s.type !== 'analysis') || drawerModel.sections[0];
    return `我已经为您更新了实时洞察。${mainSection.content.slice(0, 100)}... 更多细节您可以查看上方的洞察区域。`;
  },

  // Legacy format (kept for simple replies)
  formatReply: (conclusion: string, basis: string, suggestion: string, nextStep?: string): string => {
    return `${conclusion}\n\n${basis}\n\n${suggestion}${nextStep ? `\n\n💡 ${nextStep}` : ''}`;
  },

  // Get persona for current module
  getPersona: (module: string, scenario: string | null) => {
    if (scenario === 'powerops') return { name: '量仔', role: '电力运维专家' };
    if (module === 'knowledge-graph') return { name: '知识教练', role: '知识引擎专家' };
    if (module === 'data-hub') return { name: '数据分析助理', role: '数据专家' };
    if (module === 'reasoning-engine') return { name: '决策调参助手', role: '算法专家' };
    if (module === 'resource') return { name: '档案管理助理', role: '资源管理员' };
    return { name: '系统助理', role: '智能助手' };
  },

  // Get welcome message
  getWelcomeMessage: (module: string, scenario: string | null, role?: string | null, subModule?: string, stage?: string): { content: string; suggestions?: string[] } => {
    const persona = PersonaEngine.getPersona(module, scenario);
    const roleName = role === 'MANAGER' ? '主管' : '管理员';

    if (scenario === 'powerops') {
      switch (stage) {
        case 'collect':
          return {
            content: `您好${roleName}！我是您的数字管培生量仔。我已经同步了电站的实时运行总览。目前系统正处于【数据采集】阶段，您可以上传最新的逆变器报表，我将为您进行深度诊断。`,
            suggestions: ['E_UPLOAD_DATA', 'E_VIEW_DATA']
          };
        case 'diagnose':
          return {
            content: `报告${roleName}！智能诊断已完成。我发现 PR 值波动的主要原因是积灰遮挡。我为您准备了多维证据链 and 应对预案，请您审阅并确认执行路径。`,
            suggestions: ['E_VIEW_EVIDENCE', 'E_CONFIRM_PLAN']
          };
        case 'execute':
          return {
            content: `执行流程已激活！我正实时盯着现场的每一个动作。我会根据反馈自动识别进度风险，并为您提供缓解建议。您可以随时问我“当前进度如何？”`,
            suggestions: ['E_VIEW_TASKS', 'E_VIEW_RISKS']
          };
        case 'accept':
          return {
            content: `任务已接近尾声！我正在实时监测效率恢复曲线。目前各项指标正趋于达标，您可以开始制定验收标准并进行最终评估了。`,
            suggestions: ['E_PREVIEW_REPORT', 'E_VIEW_KNOWLEDGE']
          };
        default:
          return {
            content: `您好${roleName}！我是您的 AI 助理量仔。我将全程协助您处理电力运维事务。请问有什么我可以帮您的？`,
            suggestions: ['GENERATE_BRIEF']
          };
      }
    }
    
    if (module === 'knowledge-graph') {
      // Specific sub-module guidance
      if (subModule === 'framework') {
        return {
          content: `【知识框架】视图展示了 Auxenta 的核心方法论。你可以点击左侧卡片，查看实体、关系、证据等维度如何协同工作。这是构建行业大脑的“地基”。`,
          suggestions: ['EXPLAIN_FRAMEWORK']
        };
      }
      if (subModule === 'mapping') {
        return {
          content: `【行业映射】视图将抽象的知识框架具象化为动态图谱。你可以通过勾选右侧知识库，查看不同维度的知识如何交织。点击节点可查看详细溯源。`,
          suggestions: ['DEMO_INVEST_GRAPH']
        };
      }
      if (subModule === 'rules') {
        return {
          content: `【规则与权重】是引擎的“逻辑中枢”。你可以调整各项指标的权重，并点击“路径测试”实时模拟决策结果。右侧的“影响模拟预览”将告诉你这些调整对全局的影响。`,
          suggestions: ['VIEW_RULES', 'DEMO_RULE_LINKAGE']
        };
      }
      if (subModule === 'learning') {
        return {
          content: `【标签与学习】是知识进化的源泉。你可以输入企业描述文本进行“智能打标”测试，查看 AI 如何识别关键特征。识别结果可一键沉淀到图谱中。`,
          suggestions: ['DEMO_INVEST_GRAPH']
        };
      }
      if (subModule === 'conflicts') {
        return {
          content: `【决策冲突】记录了人机协作中的“火花”。通过复盘这些偏离点，我们可以不断修正规则权重，使系统越来越懂你的业务直觉。`,
          suggestions: ['GENERATE_BRIEF']
        };
      }
      if (subModule === 'collaboration') {
        return {
          content: `【协同指数分析】为你提供团队协作的量化视角。关注“AI 采纳率”与“一致性指数”，它们是衡量人机协同效率的关键指标。`,
          suggestions: ['DOWNLOAD_REPORT']
        };
      }
      if (subModule === 'learning_analysis') {
        return {
          content: `【学习趋势分析】展示了知识资产的增长轨迹。通过“标签准确率趋势”，你可以发现哪些知识维度需要进一步强化。`,
          suggestions: ['GENERATE_BRIEF']
        };
      }
      if (subModule === 'growth_analysis') {
        return {
          content: `【个人成长分析】记录了你在知识工程领域的进阶之路。查看你的“能力雷达图”，看看在哪个维度还有提升空间。`,
          suggestions: ['EXPLAIN_FRAMEWORK']
        };
      }

      // Default role-based welcome messages if no subModule matches
      if (role === 'OPERATOR') {
        return {
          content: `你好！我是你的【${persona.name}】。欢迎来到行业能力学院！在这里，我将作为你的教练，带你通过智能打标与图谱可视化快速掌握行业核心方法论。建议从【智能打标】开始你的今日学习。`,
          suggestions: ['EXPLAIN_FRAMEWORK', 'DEMO_INVEST_GRAPH', 'DEMO_RULE_LINKAGE']
        };
      }
      if (role === 'MANAGER') {
        return {
          content: `你好！我是你的【${persona.name}】。组织智能诊断系统已就绪。我已为你汇总了团队近期的决策冲突与协同指数，帮助你精准识别组织知识缺口并进行策略优化。`,
          suggestions: ['GENERATE_BRIEF', 'DEMO_MAPPING']
        };
      }
      if (role === 'ADMIN') {
        return {
          content: `你好！我是你的【${persona.name}】。行业战略大脑已连接。你可以通过规则体系结构图与动态调参面板，对全底座的推理逻辑进行顶层设计与压力测试。`,
          suggestions: ['DOWNLOAD_REPORT', 'VIEW_RULES']
        };
      }
      return {
        content: `你好！我是你的【${persona.name}】。知识引擎是 Auxenta 的智慧大脑，它能将零散的行业经验解构为标准化的知识模型，并基于此进行可解释的逻辑推理。`,
        suggestions: ['EXPLAIN_FRAMEWORK', 'DEMO_INVEST_GRAPH']
      };
    }
    
    if (module === 'overview') {
      return {
        content: `您好！我是您的 AI 助理【${persona.name}】。作为您的“数字管培生”，我已经为您准备好了今日的业务洞察。目前系统运行平稳，但有几项待办 and 风险趋势需要您定夺：\n\n- **查看今日待办**：快速梳理今日重点工作。\n- **分析风险趋势**：识别潜在的业务波动。\n- **生成应对预案**：针对异常点提供处置建议。`,
        suggestions: ['GENERATE_BRIEF', 'E_CLICK_RISK']
      };
    }

    if (module === 'scenario' && scenario === 'powerops') {
      if (subModule === 'HOME') {
        return {
          content: `您好！欢迎回到电力能源智能决策中枢。我是您的助理【${persona.name}】。今日场站运行数据已更新，我发现区域 B 有一些值得关注的趋势。您可以试着对我说：\n\n- “今日待办有哪些？”\n- “分析一下风险趋势”\n- “帮我生成一份日报”`,
          suggestions: ['GENERATE_BRIEF', 'E_CLICK_RISK']
        };
      }
      if (subModule === 'WORKBENCH') {
        return {
          content: `欢迎来到【电力运维工作台】。我是您的助手【${persona.name}】。在这里，我将协助您完成从数据采集到知识入库的全流程闭环。当前处于第一步：信息采集。`,
          suggestions: ['E_EXPLAIN_RISK', 'E_WRITE_LEDGER']
        };
      }
      if (subModule === 'ASSETS') {
        return {
          content: `【资产台账】模块展示了全电站的设备明细。您可以查看逆变器、组件、支架等资产的实时状态与历史维保记录。`,
          suggestions: ['E_EXPLAIN_RISK']
        };
      }
      if (subModule === 'TICKETS') {
        return {
          content: `【工单中心】是任务执行的枢纽。您可以在此查看所有待办、进行中及已完成的运维工单，并进行人员指派。`,
          suggestions: ['E_EXPLAIN_RISK']
        };
      }
      if (subModule === 'LEDGER') {
        return {
          content: `【运维闭环台账】记录了每一次异常处置的完整链路。这是确保业务可追溯、可审计的核心数据资产。`,
          suggestions: ['E_WRITE_LEDGER']
        };
      }
      if (subModule === 'REPORTS') {
        return {
          content: `【报告中心】为您汇总了所有的复盘报告与日报。您可以进行预览、下载或一键分享给管理层。`,
          suggestions: ['E_EXPORT_REPORT']
        };
      }
      return {
        content: `您好！我是您的【${persona.name}】。电力资产运维实时监测系统已就绪。当前我正持续监控全场站的发电效率与资产健康度。检测到近期收益波动主要受环境因素影响，建议您优先关注“风险洞察”并审核我为您准备的自动化清洗预案。`,
        suggestions: ['view-risks', 'go-s2', 'DOWNLOAD_REPORT']
      };
    }

    return {
      content: `您好！我是您的 AI 助理。我将为您提供全方位的智能支持。`,
      suggestions: []
    };
  }
};
