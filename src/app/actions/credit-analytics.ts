"use server";

import { createClient } from "@/utils/supabase/server";

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

export async function getCreditAnalytics() {
  const supabase = await createClient();
  
  let allTransactions: any[] = [];
  const PAGE_SIZE = 1000;
  let page = 0;
  let hasMore = true;

  // Fetch all credit transactions with pagination
  while (hasMore) {
    const { data: transactions, error } = await supabase
      .from("credit_transactions")
      .select("transaction_type, amount, created_at, reference_id")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
        console.error("Error fetching credit analytics data:", error);
        break;
    }

    if (transactions && transactions.length > 0) {
      allTransactions = [...allTransactions, ...transactions];
      if (transactions.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  const transactions = allTransactions;

  // 1. Transaction Type Distribution
  const typeDistribution = transactions.reduce((acc, txn) => {
    const type = txn.transaction_type ? toTitleCase(txn.transaction_type) : "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. Credits Flow (Added vs Used)
  let creditsAdded = 0;
  let creditsUsed = 0;
  
  transactions.forEach(txn => {
    if (txn.amount > 0) {
      creditsAdded += txn.amount;
    } else {
      creditsUsed += Math.abs(txn.amount);
    }
  });

  // 3. Transaction Volume by Month
  const volumeByMonth = transactions.reduce((acc, txn) => {
    if (!txn.created_at) return acc;
    try {
      const date = new Date(txn.created_at);
      if (isNaN(date.getTime())) return acc;
      
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    } catch (e) {
      // Ignore
    }
    return acc;
  }, {} as Record<string, number>);

  // 4. Credits Flow by Month (Added vs Used)
  const flowByMonth = transactions.reduce((acc, txn) => {
    if (!txn.created_at) return acc;
    try {
      const date = new Date(txn.created_at);
      if (isNaN(date.getTime())) return acc;
      
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!acc[monthYear]) {
        acc[monthYear] = { date: monthYear, "Credits Added": 0, "Credits Used": 0 };
      }
      
      if (txn.amount > 0) {
        acc[monthYear]["Credits Added"] += txn.amount;
      } else {
        acc[monthYear]["Credits Used"] += Math.abs(txn.amount);
      }
    } catch (e) {
      // Ignore
    }
    return acc;
  }, {} as Record<string, any>);

  // 5. Top Usage Categories (by reference_id)
  const usageByCategory = transactions
    .filter(txn => txn.amount < 0)
    .reduce((acc, txn) => {
      const category = txn.reference_id || "Other";
      if (!acc[category]) {
        acc[category] = { count: 0, total: 0 };
      }
      acc[category].count += 1;
      acc[category].total += Math.abs(txn.amount);
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

  const topUsageCategories = Object.entries(usageByCategory)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 10)
    .map(([name, data]) => ({ name, value: data.total }));

  return {
    totalTransactions: transactions.length,
    creditsAdded,
    creditsUsed,
    netCredits: creditsAdded - creditsUsed,
    typeDistribution: Object.entries(typeDistribution).map(([name, value]) => ({ name, value })),
    volumeHistory: Object.entries(volumeByMonth).map(([date, count]) => ({ date, "Transactions": count })),
    flowHistory: Object.values(flowByMonth),
    topUsageCategories,
  };
}

