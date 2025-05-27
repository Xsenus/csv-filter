import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { importCsvFromFolder } from './importCsv';
import db from './db';
import { Product } from './types';
import { logDebug } from './logger'; // предполагается, что logDebug лежит в logger.ts

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/import', async (req: Request, res: Response) => {
  try {
    await importCsvFromFolder(path.resolve(__dirname, '../data'));
    res.json({ success: true, message: 'CSV импортирован' });
  } catch (error) {
    console.error('Ошибка при импорте:', error);
    res.status(500).json({ success: false, error: 'Ошибка при импорте CSV' });
  }
});

app.get('/options', (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    const andPowerValues = filters.powerValue || [];
    const isUseAnd = ['true', '1', 1, true].includes(req.query.isUseAnd as any);

    logDebug('OPTIONS / powerValue', andPowerValues);
    logDebug('OPTIONS / isUseAnd', isUseAnd);

    // Применяем AND-фильтрацию по powerValue (как и в /filters)
    if (isUseAnd && andPowerValues.length > 1) {
      const placeholders = andPowerValues.map(() => '?').join(', ');
      const count = andPowerValues.length;

      const firmQuery = `
        SELECT firm FROM products
        WHERE powerValue IN (${placeholders})
        GROUP BY firm
        HAVING COUNT(DISTINCT powerValue) = ?
      `;

      logDebug('OPTIONS / firmQuery', firmQuery);
      logDebug('OPTIONS / firmQuery params', [...andPowerValues, count]);

      const firmsWithAllPowerValues = db
        .prepare(firmQuery)
        .all(...andPowerValues, count)
        .map((r: any) => r.firm);

      logDebug('OPTIONS / firmsWithAllPowerValues', firmsWithAllPowerValues);

      if (firmsWithAllPowerValues.length === 0) {
        res.json({});
        return;
      }

      filters.firm = firmsWithAllPowerValues;
      filters.powerValue = andPowerValues;
    }

    const columns = getColumns();
    const result: Record<string, string[]> = {};

    for (const col of columns) {
      const colFilters = { ...filters };

      if (isUseAnd && andPowerValues.length > 1) {
        const placeholders = andPowerValues.map(() => '?').join(', ');
        const count = andPowerValues.length;

        if (col === 'firm') {
          const firmQuery = `
            SELECT firm FROM products
            WHERE powerValue IN (${placeholders})
            GROUP BY firm
            HAVING COUNT(DISTINCT powerValue) = ?
          `;
          logDebug('OPTIONS / firmQuery:', firmQuery);
          logDebug('OPTIONS / firmQuery params:', [...andPowerValues, count]);

          const firms = db
            .prepare(firmQuery)
            .all(...andPowerValues, count)
            .map((r: any) => r.firm);
          logDebug('OPTIONS / firmsWithAllPowerValues:', firms);
          result[col] = firms;
          continue;
        }

        // Ограничим firm списком допустимых для всех остальных колонок
        const firmQuery = `
          SELECT firm FROM products
          WHERE powerValue IN (${placeholders})
          GROUP BY firm
          HAVING COUNT(DISTINCT powerValue) = ?
        `;
        const validFirms = db
          .prepare(firmQuery)
          .all(...andPowerValues, count)
          .map((r: any) => r.firm);
        colFilters.firm = validFirms;
      }

      const whereClause = buildWhereClause(colFilters, exclude(col));
      const query = `SELECT DISTINCT ${col} FROM products ${whereClause.clause} ORDER BY ${col}`;
      const values = db.prepare(query).all(...whereClause.params);
      result[col] = values.map((r: any) => String(r[col]));
    }

    res.json(result);
  } catch (error) {
    console.error('❌ Ошибка /options:', error);
    res.status(500).json({ error: 'Ошибка при получении фильтров' });
  }
});

app.get('/filters', (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    const andPowerValues = filters.powerValue || [];
    const isUseAnd = ['true', '1', 1, true].includes(req.query.isUseAnd as any);

    logDebug('powerValue', andPowerValues);
    logDebug('isUseAnd', isUseAnd);

    if (andPowerValues.length > 0) {
      delete filters.powerValue;
    }

    if (isUseAnd && andPowerValues.length > 1) {
      const placeholders = andPowerValues.map(() => '?').join(', ');
      const count = andPowerValues.length;

      const firmQuery = `
        SELECT firm FROM products
        WHERE powerValue IN (${placeholders})
        GROUP BY firm
        HAVING COUNT(DISTINCT powerValue) = ?
      `;

      logDebug('firmQuery', firmQuery);
      logDebug('firmQuery params', [...andPowerValues, count]);

      const firmsWithAllPowerValues = db
        .prepare(firmQuery)
        .all(...andPowerValues, count)
        .map((r: any) => r.firm);

      logDebug('firmsWithAllPowerValues', firmsWithAllPowerValues);

      if (firmsWithAllPowerValues.length === 0) {
        res.json([]);
        return;
      }

      filters.firm = firmsWithAllPowerValues;
      filters.powerValue = andPowerValues;

      const { clause: finalClause, params: finalParams } = buildWhereClause(filters);
      const query = `SELECT * FROM products ${finalClause} ORDER BY firm, series, power`;

      logDebug('Final SELECT query', query);
      logDebug('Final params', finalParams);

      const rows = db.prepare(query).all(...finalParams);
      res.json(rows);
      return;
    }

    if (andPowerValues.length > 0) {
      filters.powerValue = andPowerValues;
    }

    const { clause: regularClause, params: regularParams } = buildWhereClause(filters);
    const query = `SELECT * FROM products ${regularClause} ORDER BY firm, series, power`;

    logDebug('Regular SELECT query', query);
    logDebug('Regular params', regularParams);

    const rows = db.prepare(query).all(...regularParams);
    res.json(rows);
  } catch (error) {
    console.error('❌ Ошибка /filters:', error);
    res.status(500).json({ error: 'Ошибка при фильтрации' });
  }
});

// 🚀 Старт сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});

// ========================
// 🔧 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ========================
function parseFilters(query: any): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  for (const key in query) {
    if (key === 'isUseAnd') continue;
    if (typeof query[key] === 'string') {
      const values = query[key].split(',').map((v) => v.trim());
      result[key] = key === 'powerValue' ? values.map(Number) : values;
    }
  }
  return result;
}

function buildWhereClause(filters: Record<string, string[]>, excludeKeys: string[] = []) {
  const conditions: string[] = [];
  const params: any[] = [];

  for (const key in filters) {
    if (excludeKeys.includes(key)) continue;

    const values = filters[key];
    if (values.length > 0) {
      const placeholders = values.map(() => '?').join(', ');
      conditions.push(`${key} IN (${placeholders})`);
      params.push(...values);
    }
  }

  const clause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return { clause, params };
}

function getColumns(): string[] {
  const pragma = db.prepare(`PRAGMA table_info(products)`).all();
  return pragma.map((c: any) => c.name).filter((name: string) => name !== 'id');
}

function exclude(field: string): string[] {
  return [field];
}
