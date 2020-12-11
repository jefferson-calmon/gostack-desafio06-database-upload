import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = transactions.reduce((sum, { type, value }) => {
      return type === 'income' ? sum + Number(value) : sum + 0;
    }, 0);

    const outcome = transactions.reduce((sum, { type, value }) => {
      return type === 'outcome' ? sum + Number(value) : sum + 0;
    }, 0);

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
