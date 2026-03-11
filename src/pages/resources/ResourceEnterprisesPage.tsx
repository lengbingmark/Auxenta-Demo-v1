import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Building2, MapPin, Tag } from 'lucide-react';

export const ResourceEnterprisesPage: React.FC = () => {
  const [selectedEnterprise, setSelectedEnterprise] = useState<any>(null);

  const enterprises = [
    { id: 1, name: '未来科技有限公司', industry: '人工智能', location: '科技园区 A 座', tags: ['高新技术', 'A轮'] },
    { id: 2, name: '绿野生态农业', industry: '现代农业', location: '生态示范区', tags: ['绿色环保'] },
    { id: 3, name: '智造动力股份', industry: '高端制造', location: '工业园区 C 区', tags: ['专精特新', '上市辅导'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">企业资源库</h1>
        <Button>导入企业</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {enterprises.map((ent) => (
          <Card key={ent.id} className="hover:border-blue-200 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{ent.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Tag size={14} /> {ent.industry}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {ent.location}</span>
                  </div>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setSelectedEnterprise(ent)}>
                查看详情
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!selectedEnterprise}
        onClose={() => setSelectedEnterprise(null)}
        title={selectedEnterprise?.name || '企业详情'}
        footer={
          <Button onClick={() => setSelectedEnterprise(null)}>关闭</Button>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-900 mb-2">AI 智能画像</h4>
            <p className="text-sm text-blue-800">
              该企业近期研发投入增长显著，专利申请活跃，建议重点关注。潜在风险：现金流略显紧张。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">注册资本</span>
              <p className="font-medium">5000 万人民币</p>
            </div>
            <div>
              <span className="text-gray-500">成立日期</span>
              <p className="font-medium">2021-05-12</p>
            </div>
          </div>
          <div>
            <span className="text-gray-500 text-sm">企业标签</span>
            <div className="flex gap-2 mt-2">
              {selectedEnterprise?.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
