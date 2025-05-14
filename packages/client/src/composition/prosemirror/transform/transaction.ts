import { EditorState, Transaction } from "prosemirror-state";

export class ChainableTransaction {
  chainedTransaction: Transaction | null = null;
  constructor(private state: EditorState) {}

  get chain() {
    if (!this.chainedTransaction) {
      this.chainedTransaction = this.state.tr;
    }

    return this.chainedTransaction;
  }
}

type TransactionMetaKey = "preventHistory";

export const isChangeTransaction = (
  transaction: Transaction,
  excludeKeys: TransactionMetaKey[] = []
) => {
  return transaction.docChanged && excludeKeys.every(key => !transaction.getMeta(key));
};
