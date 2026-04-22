export interface Transaction {
  id: number;
  amount: number;
  commerce_name: string;
  tenpista_name: string;
  transaction_date: string;
  created_at: string;
}

export interface TransactionPage {
  content: Transaction[];
  total_elements: number;
  total_pages: number;
  page: number;
  size: number;
}

export interface TransactionCreateRequest {
  amount: number;
  commerce_name: string;
  tenpista_name: string;
  transaction_date: string;
}
