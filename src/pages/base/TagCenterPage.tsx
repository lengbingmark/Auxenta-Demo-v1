import React from 'react';
import { Card } from '../../components/ui/Card';

export const TagCenterPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">标签库中心</h1>
      <Card>
        <div className="flex flex-wrap gap-2">
          {['高新技术', '专精特新', '独角兽', '瞪羚企业', '纳税大户', '环保先锋'].map((tag) => (
            <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
              {tag}
            </span>
          ))}
          <button className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 rounded-full text-sm hover:border-blue-500 hover:text-blue-500">
            + 新增标签
          </button>
        </div>
      </Card>
    </div>
  );
};
