import { getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(file: Express.Multer.File): Promise<Transaction[]> {
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);
    const createTransaction = new CreateTransactionService();

    const csvFilePath = path.resolve(
      __dirname,
      '..',
      '..',
      'tmp',
      file.filename,
    );

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value || !category) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existCategoriesTitle = existCategories.map(({ title }) => title);

    const addCategoriesTitles = categories
      .filter(category => !existCategoriesTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoriesTitles.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(file.path);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
