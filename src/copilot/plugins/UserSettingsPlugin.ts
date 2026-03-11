import { CopilotPlugin, WorkContext } from '../types';

export const UserSettingsPlugin: CopilotPlugin = {
  id: 'plugin_user_settings',
  name: '用户设置插件',
  match: (ctx: WorkContext) => ctx.module === 'settings',
  renderBubble: () => ({
    title: '安全提醒',
    content: '您的密码已使用 90 天，建议更换。',
    actions: []
  }),
  renderDrawer: () => ({
    title: '账户安全诊断',
    sections: [
      {
        title: '安全评分',
        content: '85分 (良好)。',
        type: 'info'
      },
      {
        title: '改进建议',
        content: '开启双因素认证 (2FA) 可进一步提升账户安全性。',
        type: 'suggestion'
      }
    ],
    actions: []
  })
};
