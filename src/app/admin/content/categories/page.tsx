import { createClient } from "@/utils/supabase/server";
import CategoriesTable from "@/components/admin/content/CategoriesTable";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const query = params.q;
  const page = Number(params.page) || 1;
  const itemsPerPage = 20;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  let dbQuery = supabase
    .from("job_categories")
    .select("*", { count: "exact" });

  if (query) {
    dbQuery = dbQuery.ilike("name", `%${query}%`);
  }

  dbQuery = dbQuery
    .range(from, to)
    .order("name", { ascending: true });

  const { data: categories, error, count } = await dbQuery;

  if (error) {
    console.error("Error fetching categories:", error);
    return <div>Error loading data</div>;
  }

  return (
    <div className="p-6 sm:p-10">
      <CategoriesTable 
        data={categories || []} 
        searchParams={params}
        totalCount={count || 0}
        currentPage={page}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}
