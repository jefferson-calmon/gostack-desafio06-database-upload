import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactionDeleted = await transactionsRepository.delete(id);

    if (!transactionDeleted)
      throw new AppError('There is a error in delete transaction');
  }
}

export default DeleteTransactionService;
