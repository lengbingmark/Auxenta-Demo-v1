import { StateMachineConfig, CopilotScript } from '../types';

export const lowAltitudeStateMachine: StateMachineConfig = {
  id: 'low-altitude-aop',
  scene: 'lowaltitudeops',
  copilotName: '量仔 · 低空调度官',
  roles: ['DISPATCHER', 'OPERATOR', 'ADMIN'],
  initial: 'standby',
  states: {
    standby: {
      label: '待命态',
      entry: ['S_WELCOME'],
      ui: {
        bubble: { priority: 'high', maxWidth: 400, avoidSelectors: [] },
        drawer: { enabled: true, width: 450 }
      },
      transitions: [
        { event: 'E_START_DISPATCH', target: 'dispatching' },
        { event: 'E_ALERT_TRIGGERED', target: 'alert' },
        { event: 'E_START_ANALYSIS', target: 'analyzing' }
      ]
    },
    dispatching: {
      label: '调度态',
      entry: ['S_DISPATCHING'],
      transitions: [
        { event: 'E_DISPATCH_SUCCESS', target: 'standby' },
        { event: 'E_CANCEL', target: 'standby' }
      ]
    },
    alert: {
      label: '预警态',
      entry: ['S_ALERT'],
      transitions: [
        { event: 'E_RESOLVE', target: 'standby' }
      ]
    },
    analyzing: {
      label: '分析态',
      entry: ['S_ANALYZING'],
      transitions: [
        { event: 'E_FINISH', target: 'standby' }
      ]
    }
  },
  guards: {},
  actions: {
    S_WELCOME: { type: 'script', effect: 'welcome' },
    S_DISPATCHING: { type: 'script', effect: 'dispatching' },
    S_ALERT: { type: 'script', effect: 'alert' },
    S_ANALYZING: { type: 'script', effect: 'analyzing' }
  }
};

export const lowAltitudeScripts: Record<string, CopilotScript> = {
  welcome: {
    message: "您好！我是您的低空调度官量仔（AOP Copilot）。我已接入城市低空智航网络，正实时监测 5 座机巢与 9 架无人机的运行状态。您可以直接通过语音向我下发调度指令，我会为您规划最安全、合规的飞行航线。",
    actions: [
      { label: '查看态势', event: 'E_VIEW_SITUATION', primary: true },
      { label: '发起巡检', event: 'E_START_DISPATCH' }
    ]
  },
  dispatching: {
    message: "正在为您进行 AI 合规航线规划。我已检索当前空域管制信息与气象条件，正在避开禁飞区并计算最优路径。请稍后，调度指令即将下发至执行终端。",
    actions: [
      { label: '确认下发', event: 'E_DISPATCH_SUCCESS', primary: true },
      { label: '取消调度', event: 'E_CANCEL' }
    ]
  },
  alert: {
    message: "警告！检测到滨江区域出现临时空域管制，当前执行中的巡检任务存在合规风险。我已自动下达原地悬停指令，并为您重新规划了绕行路径，是否立即切换？",
    actions: [
      { label: '立即切换', event: 'E_RESOLVE', primary: true },
      { label: '返航降落', event: 'E_RESOLVE' }
    ]
  },
  analyzing: {
    message: "正在为您生成低空运营分析报告。我正在复盘今日 32 项任务的执行效率与合规达成率，并结合能耗数据为您提供后续的机巢部署优化建议。",
    actions: [
      { label: '查看报告', event: 'E_FINISH', primary: true }
    ]
  }
};
