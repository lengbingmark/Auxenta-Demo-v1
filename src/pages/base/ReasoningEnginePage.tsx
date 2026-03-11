import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const ReasoningEnginePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">推理决策引擎</h1>
        <Button variant="primary">新建推理任务</Button>
      </div>
      <Card title="模型运行状态">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">招商引资评分模型 v2.1</h4>
              <p className="text-sm text-gray-500">运行中 • 准确率 94.5%</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">舆情风险预警模型 v1.0</h4>
              <p className="text-sm text-gray-500">离线 • 等待更新</p>
            </div>
            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">Offline</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
