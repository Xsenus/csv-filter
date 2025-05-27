import React from 'react';
import { Product } from './types';

interface Props {
  data: Product[];
}

const ProductTable: React.FC<Props> = ({ data }) => {
  if (data.length === 0) return <p>Нет данных для отображения</p>;

  // получаем все ключи первой строки — заголовки
  const columns = Object.keys(data[0]) as (keyof Product)[];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                style={{ borderBottom: '1px solid #ccc', padding: '6px', textAlign: 'left' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => (
                <td key={col} style={{ padding: '6px', borderBottom: '1px solid #eee' }}>
                  {String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
