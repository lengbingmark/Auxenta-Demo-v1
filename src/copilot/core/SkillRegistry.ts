import { WorkContext } from '../types';
import { PersonaEngine } from './PersonaEngine';
import { KnowledgeEngineSkills } from '../skills/KnowledgeEngineSkills';

export interface SkillResult {
  success: boolean;
  message: string; // Text response
  thinking?: string; // AI's thinking process
  receipt?: {
    status: 'success' | 'warning' | 'error' | 'info';
    title: string;
    details: string;
    nextStep?: string;
  };
  suggestions?: string[];
  actions?: { label: string; event: string; primary?: boolean }[];
}

export interface Skill {
  name: string;
  description: string;
  trigger: (input: string, context: WorkContext) => boolean;
  execute: (context: WorkContext, input: string, dispatch: any, globalState?: any) => Promise<SkillResult>;
}

export const SkillRegistry: Skill[] = [
  ...KnowledgeEngineSkills,
  // PowerOps Script Skill
  {
    name: 'PowerOpsScript',
    description: '电力运维场景脚本引擎',
    trigger: (input, context) => context.scenario === 'powerops',
    execute: async (ctx, ctxInput, dispatch, globalState) => {
      const isWorkbench = globalState?.powerOpsSubModule === 'WORKBENCH';
      const workbenchStep = globalState?.powerOpsWorkbenchStep;
      const state = isWorkbench ? workbenchStep : (globalState?.powerOpsState || 'S0_OVERVIEW');
      const role = globalState?.currentUserRole || 'OPERATOR';
      const script = PersonaEngine.getPowerOpsScript(state, role);
      
      if (!script) {
        return {
          success: false,
          message: '未找到当前状态的脚本。'
        };
      }

      return {
        success: true,
        message: script.message,
        actions: script.actions
      };
    }
  },
  {
    name: 'PowerOpsConfirmAction',
    description: '确认并执行电力运维操作',
    trigger: (input) => input === '确认' || input.includes('立即执行') || input === 'E_RE_VERIFY',
    execute: async (ctx, input, dispatch, globalState) => {
      if (input === 'E_RE_VERIFY' || input === '确认') {
        // Trigger drone verification
        const event = new CustomEvent('powerops-event', { 
          detail: { event: 'E_RE_VERIFY', label: '发起二次核验' } 
        });
        window.dispatchEvent(event);

        return {
          success: true,
          message: '收到！已为您下发二次核验指令，巡检无人机正在起飞。',
          receipt: {
            status: 'info',
            title: '指令已下发',
            details: '巡检无人机：UAV-08 | 任务类型：二次高清核验',
            nextStep: '等待巡检影像回传'
          }
        };
      }

      if (input.includes('立即执行')) {
        // Trigger plan execution (Stage C)
        const event = new CustomEvent('powerops-event', { 
          detail: { event: 'E_CONFIRM_PLAN', label: '确认执行预案' } 
        });
        window.dispatchEvent(event);

        return {
          success: true,
          message: '好的，已为您启动“全站自动化清洗”任务。',
          receipt: {
            status: 'success',
            title: '任务已启动',
            details: '执行终端：清洗机器人集群 | 预计耗时：2.5小时',
            nextStep: '在执行监控页查看进度'
          }
        };
      }

      return { success: false, message: '未识别的操作' };
    }
  },
  // PowerOps Workbench Specific Skills
  {
    name: 'PowerOpsExplainRisk',
    description: '解释电力运维当前风险',
    trigger: (input) => input.includes('解释当前风险') || input === 'E_EXPLAIN_RISK',
    execute: async (ctx, input, dispatch, globalState) => {
      const step = globalState?.powerOpsWorkbenchStep || 'COLLECTION';
      let message = '';
      let details = '';
      let thinking = '';
      
      switch(step) {
        case 'COLLECTION':
          thinking = '我正在扫描已上传的巡检报告。通过对比历史解析速度，我发现当前的 OCR 引擎负载较高，可能会导致 1-2 分钟的延迟。';
          message = '报告！当前风险点在于【数据滞后】。如果巡检报告未能及时解析，将导致后续诊断延迟。';
          details = '建议：立即点击“一键填充”或上传最新报告。';
          break;
        case 'ANALYSIS':
          thinking = '我实时监控了区域 B 的组串电流。数据显示电流波动与云层遮挡不匹配，更符合表面积灰的特征。PR 值已跌破 85% 警戒线。';
          message = '报告！当前风险点在于【性能下滑】。PR 值已跌破 85% 警戒线。';
          details = '建议：关注区域 B 的污染指数，这可能是主因。';
          break;
        case 'DIAGNOSIS':
          thinking = '我对比了逆变器 #03 的历史故障模式。虽然当前的电气参数与积灰相似，但通讯日志中存在偶发性丢包，不能完全排除控制板故障。';
          message = '报告！当前风险点在于【根因误判】。虽然 AI 给出 98% 置信度，但仍需排除硬件故障可能。';
          details = '建议：核对逆变器 #03 的实时通讯状态。';
          break;
        default:
          thinking = '我已完成全场站的健康度扫描。所有核心指标均在基准线以上，暂未发现显著偏差。';
          message = '报告！目前流程运行平稳，暂无显著风险。';
          details = '建议：继续按照指引完成闭环。';
      }
      
      return {
        success: true,
        thinking,
        message: PersonaEngine.formatAnalysis(
          message,
          ['历史数据对比：类似污染会导致 1.5% 发电损失', '实时监测：区域 B PR 值持续走低'],
          '若不处理，预计本月收益损失将达 ¥12,000。',
          [{ label: '快速清洗', desc: '启动机器人清洗，见效快。' }],
          details
        )
      };
    }
  },
  {
    name: 'PowerOpsGeneratePlanComp',
    description: '生成电力运维预案对比',
    trigger: (input) => input.includes('生成预案对比') || input === 'E_GENERATE_PLAN_COMP',
    execute: async (ctx, input, dispatch, globalState) => {
      return {
        success: true,
        thinking: '我检索了知识库中过去 12 个月的运维记录，并结合了当前的电价政策。方案 B 在长期 PR 保持率上具有显著优势。',
        message: PersonaEngine.formatComparison(
          { name: '方案 A (机器人清洗)', successRate: '92%', risk: '中' },
          { name: '方案 B (无人机+定点清洗)', successRate: '96%', risk: '低' },
          '量仔推荐方案 B。虽然单次成本略高，但其对组件的保护更好，且恢复收益更持久。'
        ),
        receipt: {
          status: 'info',
          title: '预案对比已生成',
          details: '已基于成本、收益、风险三个维度完成综合评估。',
          nextStep: '请在工作台中选择方案'
        }
      };
    }
  },
  {
    name: 'PowerOpsWriteLedger',
    description: '将当前步骤写入台账',
    trigger: (input) => input.includes('把这一步写进台账') || input === 'E_WRITE_LEDGER',
    execute: async (ctx, input, dispatch, globalState) => {
      const step = globalState?.powerOpsWorkbenchStep || 'COLLECTION';
      const action = `记录步骤: ${step}`;
      
      dispatch({
        type: 'ADD_POWEROPS_LEDGER_ENTRY',
        payload: {
          id: `ledger-copilot-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          step: step,
          action: '量仔辅助记录',
          details: `通过 Copilot 指令将 ${step} 阶段状态同步至闭环台账。`,
          executor: globalState?.currentUserRole || 'OPERATOR'
        }
      });
      
      return {
        success: true,
        message: '已为您将当前步骤的操作细节同步至【运维闭环台账】。',
        receipt: {
          status: 'success',
          title: '同步成功',
          details: `步骤: ${step} | 记录ID: KB-PO-${Date.now().toString().slice(-4)}`,
          nextStep: '继续下一步流程'
        }
      };
    }
  },
  // v4: Advanced Analysis Skill
  {
    name: 'AnalyzeRisk',
    description: '风险分析与方案对比',
    trigger: (input) => input.includes('风险') || input.includes('分析') || input.includes('建议'),
    execute: async (ctx, input, dispatch, globalState) => {
      dispatch({ type: 'INCREMENT_SESSION_STAT', payload: 'suggestions' });
      
      return {
        success: true,
        thinking: '我正在扫描全系统的任务链。通过关键路径分析，我发现“企业资质审核”的延期已经开始挤压后续的“合同签署”环节。',
        message: PersonaEngine.formatAnalysis(
          '报告！当前项目存在进度滞后风险，且关键资源投入不足。',
          [
            '任务“企业资质审核”已逾期 3 天。',
            '过往数据显示，类似延期会导致整体交付推迟 1 周。'
          ],
          '若不及时干预，可能影响本季度招商指标达成率。',
          [
            { label: '激进策略', desc: '立即启动一键催办，并调配临时资源支持。' },
            { label: '稳健策略', desc: '先与负责人沟通延期原因，再调整后续计划。' }
          ],
          '量仔建议优先采用【方案 A (激进策略)】以快速纠偏。',
          { 
            ignoredCount: globalState?.adviceIgnoredCount || 0,
            acceptedCount: globalState?.adviceAcceptedCount || 0
          }
        ),
        suggestions: ['NudgeTaskAll', 'GenerateAdjustPlan']
      };
    }
  },
  // v4: Conflict Handling Skill (Simulated trigger)
  {
    name: 'HandleConflict',
    description: '处理决策冲突',
    trigger: (input) => input.includes('不') || input.includes('拒绝') || input.includes('这就行'),
    execute: async (ctx, input, dispatch) => {
      dispatch({ type: 'RECORD_DECISION', payload: 'conflict' });
      
      return {
        success: true,
        message: PersonaEngine.formatConflict(
          '维持现状',
          '启动干预措施',
          '您可能认为当前延期在可控范围内，但系统模型预测后续并发任务将导致资源挤兑。',
          '建议至少开启“重点关注”标记，以便系统持续追踪偏差值。'
        ),
        suggestions: ['GenerateAdjustPlan'] // Suggest alternative
      };
    }
  },
  // v4: Stage Summary Skill
  {
    name: 'GenerateStageSummary',
    description: '生成阶段总结',
    trigger: (input) => input.includes('总结') || input.includes('复盘') || input.includes('完成'),
    execute: async (ctx, input, dispatch, globalState) => {
      const stats = globalState?.sessionStats || { suggestionsCount: 5, adviceAcceptedCount: 3, tasksExecuted: 2, riskLevelChange: 'decreased' };
      
      return {
        success: true,
        message: PersonaEngine.formatSummary({
          suggestions: stats.suggestionsCount || 5,
          accepted: globalState?.adviceAcceptedCount || 3,
          tasks: stats.tasksExecuted || 2,
          risk: stats.riskLevelChange || 'decreased'
        }),
        suggestions: ['DownloadReport', 'ShareLinkCopy']
      };
    }
  },
  // Existing Skills
  {
    name: 'NudgeTaskSingle',
    description: '催办单个任务',
    trigger: (input) => input.includes('催办') && !input.includes('所有') && !input.includes('全部'),
    execute: async (ctx, input, dispatch) => {
      // Mock extraction of task ID or use context
      const taskId = 't1'; // In real app, extract from input or context
      dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId, status: 'nudged' } });
      dispatch({ type: 'RECORD_DECISION', payload: 'accept' });
      
      return {
        success: true,
        message: PersonaEngine.formatReply(
          '已为您发送催办通知。',
          '检测到该任务已接近截止日期，且负责人尚未提交进度。',
          '系统已通过邮件和短信双通道通知负责人张三。',
          '建议您明天上午关注一下他的反馈。'
        ),
        receipt: {
          status: 'success',
          title: '催办成功',
          details: `任务ID: ${taskId} | 负责人: 张三 | 方式: 邮件+短信`,
          nextStep: '等待负责人反馈'
        }
      };
    }
  },
  {
    name: 'NudgeTaskAll',
    description: '一键催办所有逾期任务',
    trigger: (input) => input.includes('催办') && (input.includes('所有') || input.includes('全部')),
    execute: async (ctx, input, dispatch) => {
      dispatch({ type: 'NUDGE_ALL_TASKS' });
      dispatch({ type: 'RECORD_DECISION', payload: 'accept' });
      
      return {
        success: true,
        message: PersonaEngine.formatReply(
          '已完成批量催办。',
          '当前系统中有 2 个任务处于逾期状态，已全部发送高优先级提醒。',
          '这可能会引起相关负责人的注意，请留意后续沟通。',
          '您可以去“政务督办”模块查看详细的整改计划。'
        ),
        receipt: {
          status: 'success',
          title: '批量催办完成',
          details: '涉及任务数: 2 | 触达人数: 2',
          nextStep: '查看督办报表'
        }
      };
    }
  },
  {
    name: 'DownloadReport',
    description: '下载报告',
    trigger: (input) => input.includes('下载') || input.includes('报告'),
    execute: async (ctx, input, dispatch) => {
      dispatch({ type: 'ADD_ACTION_LOG', payload: { type: 'download', desc: '下载了当前模块报告' } });
      dispatch({ type: 'RECORD_DECISION', payload: 'accept' });
      
      return {
        success: true,
        message: PersonaEngine.formatReply(
          '好的，报告下载任务已提交。',
          '我为您生成了基于当前筛选条件的 PDF 版本。',
          '文件生成后会自动下载到您的本地。',
          '您可以直接将这份报告分享给团队成员。'
        ),
        receipt: {
          status: 'success',
          title: '下载已开始',
          details: '文件: 2023_Q3_运营报告.pdf | 大小: 2.4MB',
          nextStep: '打开文件预览'
        },
        suggestions: ['COPY_SHARE_LINK']
      };
    }
  },
  {
    name: 'ExplainModule',
    description: '解释当前模块',
    trigger: (input) => input.includes('这是什么') || input.includes('介绍') || input.includes('能做什么'),
    execute: async (ctx, input, dispatch) => {
      const persona = PersonaEngine.getPersona(ctx.module, ctx.scenario);
      return {
        success: true,
        message: PersonaEngine.formatReply(
          `这里是${ctx.scenario ? '场景应用' : '核心模块'}：${ctx.scenario || ctx.module}。`,
          `我是您的${persona.name}。本模块主要用于${ctx.module === 'overview' ? '全局监控' : '专业分析与管理'}。`,
          '您可以随时查阅数据、管理任务或生成报告。',
          '有什么具体任务需要我协助吗？'
        ),
        suggestions: ['AnalyzeRisk', 'DownloadReport']
      };
    }
  }
];
