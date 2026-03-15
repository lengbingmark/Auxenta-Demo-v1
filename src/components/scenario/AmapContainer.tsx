import React, { useEffect, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';

interface AmapContainerProps {
  center?: [number, number];
  zoom?: number;
  onMapLoad?: (map: any, AMap: any) => void;
  children?: React.ReactNode;
}

export const AmapContainer: React.FC<AmapContainerProps> = ({ 
  center = [120.153576, 30.287459], // 杭州市中心
  zoom = 12,
  onMapLoad,
  children 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    // 高德地图安全密钥 (Web端)
    // 注意：在生产环境中，建议通过后端代理或环境变量配置
    (window as any)._AMapSecurityConfig = {
      securityJsCode: '7c6f0653351659937000305178559092', // 这是一个示例密钥，实际使用需替换
    };

    AMapLoader.load({
      key: '607412e8451f77977a2884f33168899b', // 这是一个示例Key，实际使用需替换
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.ControlBar', 'AMap.MouseTool'],
    })
      .then((AMap) => {
        if (mapRef.current) {
          const map = new AMap.Map(mapRef.current, {
            viewMode: '2D',
            zoom: zoom,
            center: center,
            mapStyle: 'amap://styles/light', // 使用浅色主题符合系统风格
          });

          map.addControl(new AMap.Scale());
          map.addControl(new AMap.ToolBar({ position: 'RT' }));

          mapInstance.current = map;
          if (onMapLoad) {
            onMapLoad(map, AMap);
          }
        }
      })
      .catch((e) => {
        console.error('Amap load failed:', e);
      });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {children}
    </div>
  );
};
