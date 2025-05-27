import React from 'react';

interface QueryPreviewProps {
  field: string;
  filters: Record<string, string[]>;
}

const QueryPreview: React.FC<QueryPreviewProps> = ({ field, filters }) => {
  const query = Object.entries(filters)
    .filter(([key]) => key !== field) // исключаем текущий фильтр
    .filter(([, value]) => value.length)
    .map(([key, value]) => `${key}=${encodeURIComponent(value.join(','))}`)
    .join('&');

  const url = '/options' + (query ? `?${query}` : '');

  return (
    <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
      <code>{url}</code>
    </div>
  );
};

export default QueryPreview;
