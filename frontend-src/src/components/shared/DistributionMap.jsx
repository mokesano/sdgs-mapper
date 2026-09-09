import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import worldMap from './worldmap.svg';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const projectToMap = (lat, lng, width, height) => ({
  x: ((lng + 180) / 360) * width,
  y: ((90 - lat) / 180) * height,
});

const DistributionMap = ({
  title = 'Distribution Map',
  subtitle,
  points = [],
  valueKey = 'value',
  height = 360,
  showLegend = true,
}) => {
  const { t } = useTranslation('common_ui');
  const values = points.map((p) => Number(p[valueKey]) || 0);
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;

  const normalizedPoints = useMemo(() => {
    if (!points.length) return [];
    const range = Math.max(1, maxValue - minValue);
    return points.map((point) => {
      const value = Number(point[valueKey]) || 0;
      const ratio = clamp((value - minValue) / range, 0, 1);
      const radius = 4 + ratio * 10;
      const opacity = 0.3 + ratio * 0.7;
      const color = `hsl(${220 - ratio * 70} 80% ${62 - ratio * 18}%)`;
      return { ...point, ratio, radius, opacity, color };
    });
  }, [points, valueKey, minValue, maxValue]);

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="mt-1 text-[15px] text-gray-500">{subtitle}</p>}
      </div>

      <div className="p-4">
        <div
          className="relative w-full rounded-lg overflow-hidden border border-gray-100 bg-slate-50"
          style={{ height }}
        >
          <img src={worldMap} alt={t('map.alt')} className="absolute inset-0 w-full h-full object-cover" />

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="none">
            {normalizedPoints.map((point) => {
              if (typeof point.lat !== 'number' || typeof point.lng !== 'number') return null;
              const pos = projectToMap(point.lat, point.lng, 1000, 500);
              return (
                <g key={point.id ?? `${point.name}-${point.lat}-${point.lng}`}>
                  <circle cx={pos.x} cy={pos.y} r={point.radius + 3} fill={point.color} opacity={0.15} />
                  <circle cx={pos.x} cy={pos.y} r={point.radius} fill={point.color} opacity={point.opacity}>
                    <title>{`${point.name || 'Unknown'} • ${(point[valueKey] ?? 0).toLocaleString()}`}</title>
                  </circle>
                </g>
              );
            })}
          </svg>
        </div>

        {showLegend && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
              <span>{t('map.less')}</span>
              <span>{t('map.more')}</span>
            </div>
            <div className="h-2 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-700" />
            <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
              <span>{minValue.toLocaleString()}</span>
              <span>{maxValue.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DistributionMap;