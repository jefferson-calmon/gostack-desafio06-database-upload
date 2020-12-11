import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category: categoryName,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);
    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value)
      throw new AppError('You do not have enough balance');

    const categoryExist = await categoriesRepository.findOne({
      where: { title: categoryName },
    });

    const category = !categoryExist
      ? categoriesRepository.create({ title: categoryName })
      : categoryExist;

    await categoriesRepository.save(category);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category,
    });
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
