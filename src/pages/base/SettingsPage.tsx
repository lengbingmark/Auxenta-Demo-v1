import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
      <Card title="个人资料">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input type="text" className="w-full p-2 border rounded-lg bg-gray-50" value="Admin" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input type="email" className="w-full p-2 border rounded-lg bg-gray-50" value="admin@auxenta.com" disabled />
            </div>
          </div>
        </div>
      </Card>
      <Card title="通知偏好">
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">接收每日日报推送</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded text-blue-600" />
            <span className="text-sm text-gray-700">接收重大风险告警</span>
          </label>
        </div>
      </Card>
      <div className="flex justify-end gap-3">
        <Button variant="secondary">重置</Button>
        <Button>保存更改</Button>
      </div>
    </div>
  );
};
