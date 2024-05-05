export type Payout = {
  id: string;
  title: string;
  user1: string;
  user2: string;
  user3: string;
  user4: string;
  amount1: number;
  amount2: number;
  amount3: number;
  amount4: number;
  token:string;
  totalAmount:number;
  created_at: number;
};

export const PAYOUT_EXPIRY = 60 * 60 * 24 * 180; // Expire payouts after 3 months
