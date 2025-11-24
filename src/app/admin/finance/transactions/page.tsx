import { createClient } from "@/utils/supabase/server";
import TransactionsTable from "@/components/admin/finance/TransactionsTable";

export default async function TransactionsPage() {
  const supabase = await createClient();

  // Fetch transactions
  const { data: transactions, error } = await supabase
    .from("credit_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100); // Limit for performance, pagination can be added later

  if (error) {
    console.error("Error fetching transactions:", error);
    return <div>Error loading data</div>;
  }

  // Fetch user details for the transactions
  // credit_transactions has user_uid which links to all_users
  const userUids = [...new Set(transactions?.map(t => t.user_uid) || [])];
  
  let userMap: Record<string, { name: string, email: string }> = {};
  
  if (userUids.length > 0) {
    const { data: users } = await supabase
      .from("all_users")
      .select("uid, full_name, email")
      .in("uid", userUids);
      
    users?.forEach(u => {
      userMap[u.uid] = { 
        name: u.full_name || "Anonymous", 
        email: u.email || "" 
      };
    });
  }

  const enrichedData = transactions?.map(t => ({
    ...t,
    user_name: userMap[t.user_uid]?.name || "Unknown",
    user_email: userMap[t.user_uid]?.email
  })) || [];

  return (
    <div className="p-6 sm:p-10">
      <TransactionsTable data={enrichedData} />
    </div>
  );
}

