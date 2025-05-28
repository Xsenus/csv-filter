import fs from 'fs';
import path from 'path';
// @ts-ignore
import csv from 'csv-parser';
import db from './db';
import { Product } from './types';
import { sanitize } from './sanitize';

export async function importCsvFromFolder(folderPath: string): Promise<void> {
  const files = fs.readdirSync(folderPath).filter((f) => f.endsWith('.csv'));
  let total = 0;
  let unique = 0;

  const insert = db.prepare(`
    INSERT INTO products
    (category, invertor, firm, series, type, power, powerName, powerValue, powerOut, model, expenses, cost, profit, status, note, blockPlacement)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const selectDuplicate = db.prepare(`
    SELECT 1 FROM products WHERE
      category = ? AND invertor = ? AND firm = ? AND series = ? AND type = ? AND power = ? AND powerName = ? AND
      powerValue = ? AND powerOut = ? AND model = ? AND expenses = ? AND cost = ? AND profit = ? AND status = ? AND note = ? AND blockPlacement = ?
  `);

  const transaction = db.transaction((items: Product[]) => {
    for (const item of items) {
      const exists = selectDuplicate.get([
        item.category,
        item.invertor,
        item.firm,
        item.series,
        item.type,
        item.power,
        item.powerName,
        item.powerValue,
        item.powerOut,
        item.model,
        item.expenses,
        item.cost,
        item.profit,
        item.status,
        item.note,
        item.blockPlacement,
      ]);

      if (!exists) {
        insert.run([
          item.category,
          item.invertor,
          item.firm,
          item.series,
          item.type,
          item.power,
          item.powerName,
          item.powerValue,
          item.powerOut,
          item.model,
          item.expenses,
          item.cost,
          item.profit,
          item.status,
          item.note,
          item.blockPlacement,
        ]);
        unique++;
      }
    }
  });

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const rows = await readCsv(filePath);
    transaction(rows);
    total += rows.length;
    console.log(`✅ Импортировано из файла ${file}: ${rows.length}`);
  }

  console.log(`🎯 Всего обработано файлов: ${files.length}, строк: ${total}`);
  console.log(`🆕 Уникально добавлено: ${unique}`);
}

function readCsv(filePath: string): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const rows: Product[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: any) => {
        const isEmpty = Object.values(data).every(
          (val: any) => !val || val.trim() === '' || val.trim() === '===',
        );
        if (isEmpty) return;

        const rawPower = sanitize(data.power || '');
        const { PowerValue, PowerOut } = parsePower(rawPower);
        const type = getType(sanitize(data.series || ''));

        const product: Product = {
          category: sanitize(data.category || ''),
          invertor: data.Invertor?.trim() === '+' ? 1 : 0,
          firm: sanitize(data.firm || ''),
          series: sanitize(data.series || ''),
          type,
          power: rawPower,
          powerName: parsePowerName(rawPower),
          powerValue: PowerValue,
          powerOut: PowerOut,
          model: sanitize(data.model || ''),
          expenses: parseFloat(data.Expenses) || 0,
          cost: parseFloat(data.Cost) || 0,
          profit: parseFloat(data.Profit) || 0,
          status: sanitize(data.Status || ''),
          note: sanitize(data.Note || ''),
          blockPlacement: parseBlockPlacement(sanitize(data.Note || '')),
        };

        const allEmpty = [product.power, product.powerName, product.model, product.status].every(
          (v) => v === '',
        );

        if (allEmpty) return;
        // const isGarbageFirm = product.firm === '' || /^-+$/.test(product.firm);
        // if (allEmpty && isGarbageFirm) return;

        rows.push(product);
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

function parseBlockPlacement(note: string): 'inside' | 'outside' | '' {
  const text = note.toLowerCase();
  if (text.includes('inside_block')) return 'inside';
  if (text.includes('outside_block')) return 'outside';
  return '';
}

function parsePowerName(power: string): string {
  if (!power) return '';
  const index = power.indexOf('_');
  return index >= 0 ? power.slice(0, index) : power;
}

function getType(series: string): string {
  const normalized = series.trim().toLowerCase();
  if (normalized.includes('cassette_type')) return 'cassette';
  if (normalized.includes('canal_type')) return 'canal';
  return '';
}

function parsePower(power: string): { PowerValue: number; PowerOut: number } {
  if (power.toLowerCase().includes('wifi')) {
    return { PowerValue: 0, PowerOut: 0 };
  }

  const match = power.match(/_(\d+)(?:\/(\d+))?$/);
  if (match) {
    const PowerValue = parseInt(match[1], 10);
    const PowerOut = match[2] ? parseInt(match[2], 10) : 0;
    return { PowerValue, PowerOut };
  }

  return { PowerValue: 0, PowerOut: 0 };
}
