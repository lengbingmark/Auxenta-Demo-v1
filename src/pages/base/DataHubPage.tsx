import React from 'react';
import { Card } from '../../components/ui/Card';

export const DataHubPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">数据沉淀中心</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['结构化数据', '非结构化文档', 'API 接口'].map((item) => (
          <Card key={item} title={item}>
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
              数据源接入状态
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
