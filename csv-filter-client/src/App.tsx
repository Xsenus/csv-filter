import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import DynamicFilterPanel from './DynamicFilterPanel';
import ProductTable from './ProductTable';
import { Product } from './types';

type FilterMap = Record<string, string[]>;

function App() {
  const [filters, setFilters] = useState<FilterMap>({});
  const [options, setOptions] = useState<Record<string, string[]>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [usePowerValueAnd, setUsePowerValueAnd] = useState(false);
  const [useOnlyInside, setUseOnlyInside] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const buildQuery = (data: FilterMap, useAndFlag: boolean, onlyInsideFlag = false): string => {
    const query = new URLSearchParams();
    for (const key in data) {
      if (data[key].length) {
        query.set(key, data[key].join(','));
      }
    }
    if (useAndFlag) {
      query.set('isUseAnd', '1');
    }
    if (onlyInsideFlag) {
      query.set('onlyInside', '1');
    }
    return query.toString();
  };

  const fetchOptions = useCallback(() => {
    const query = buildQuery(filters, usePowerValueAnd, useOnlyInside);
    api.get(`/options?${query}`).then((res) => setOptions(res.data));
  }, [filters, usePowerValueAnd, useOnlyInside]);

  const fetchProducts = useCallback(() => {
    const query = buildQuery(filters, usePowerValueAnd, useOnlyInside);
    api.get(`/filters?${query}`).then((res) => setProducts(res.data));
  }, [filters, usePowerValueAnd, useOnlyInside]);

  const handleToggle = (field: string, value: string) => {
    setFilters((prev) => {
      const values = prev[field] || [];
      const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
      return { ...prev, [field]: next };
    });
  };

  const handleImport = async () => {
    try {
      await api.post('/import');
      fetchOptions();
      fetchProducts();
      setImportMessage('✅ CSV успешно импортирован!');
      setTimeout(() => setImportMessage(null), 3000); // скрыть сообщение через 3 секунды
    } catch {
      setImportMessage('❌ Ошибка при импорте CSV.');
      setTimeout(() => setImportMessage(null), 5000);
    }
  };

  const resetFilters = () => {
    setFilters({});
    setUsePowerValueAnd(false);
  };

  useEffect(() => {
    fetchOptions();
    fetchProducts();
  }, [fetchOptions, fetchProducts]);

  const filterQuery = buildQuery(filters, usePowerValueAnd, useOnlyInside);

  const sortFilters = (entries: [string, string[]][]): [string, string[]][] => {
    const priority = ['category', 'power', 'powerValue', 'powerOut', 'firm', 'model'];
    return entries.sort(([a], [b]) => {
      const aIndex = priority.findIndex((key) => a.toLowerCase().startsWith(key));
      const bIndex = priority.findIndex((key) => b.toLowerCase().startsWith(key));
      const getIndex = (i: number) => (i === -1 ? 999 : i);
      return getIndex(aIndex) - getIndex(bIndex);
    });
  };

  return (
    <div style={{ padding: 20 }}>
      {importMessage && (
        <div
          style={{
            marginBottom: 10,
            padding: '8px 12px',
            background: '#d1ecf1',
            color: '#0c5460',
            border: '1px solid #bee5eb',
            borderRadius: 4,
          }}>
          {importMessage}
        </div>
      )}

      <h2>Фильтр товаров из CSV</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: 16 }}>
        <button
          onClick={handleImport}
          style={{ background: '#28a745', color: '#fff', padding: '8px 12px' }}>
          📥 Импортировать
        </button>
        <button
          onClick={resetFilters}
          style={{ background: '#ffc107', color: '#000', padding: '8px 12px' }}>
          🧹 Сбросить фильтры
        </button>
      </div>

      <div style={{ background: '#f8f9fa', padding: 10, marginBottom: 16 }}>
        <strong>🔎 Запрос:</strong>
        <div style={{ fontSize: 13, color: '#007bff' }}>/filters?{filterQuery}</div>
        <pre style={{ marginTop: 4, fontSize: 13 }}>{JSON.stringify(filters, null, 2)}</pre>
      </div>

      {sortFilters(Object.entries(options)).map(([field, values]) => (
        <DynamicFilterPanel
          key={field}
          field={field}
          label={field[0].toUpperCase() + field.slice(1)}
          options={values}
          selected={filters[field] || []}
          onSelect={(v) => handleToggle(field, v)}
          requestUrl={`/options?${buildQuery(
            { ...filters, [field]: filters[field] || [] },
            usePowerValueAnd,
            useOnlyInside,
          )}`}
          extraLabelElement={
            <>
              {field === 'powerValue' && (
                <label style={{ fontSize: 13, marginRight: 10 }}>
                  <input
                    type="checkbox"
                    checked={usePowerValueAnd}
                    onChange={(e) => setUsePowerValueAnd(e.target.checked)}
                    style={{ marginRight: 4 }}
                  />
                  USE AND
                </label>
              )}
              {field === 'powerOut' && (
                <label style={{ fontSize: 13, marginRight: 10 }}>
                  <input
                    type="checkbox"
                    checked={useOnlyInside}
                    onChange={(e) => setUseOnlyInside(e.target.checked)}
                    style={{ marginRight: 4 }}
                  />
                  ONLY INSIDE
                </label>
              )}
            </>
          }
        />
      ))}

      <hr />
      <ProductTable data={products} />
    </div>
  );
}

export default App;
