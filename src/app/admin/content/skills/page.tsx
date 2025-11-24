import { createClient } from "@/utils/supabase/server";
import SkillsTable from "@/components/admin/content/SkillsTable";

export default async function SkillsPage({
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

  // Fetch Categories for the dropdown
  const { data: categories } = await supabase
    .from("job_categories")
    .select("id, name")
    .order("name");

  // Fetch Skills with count
  let dbQuery = supabase
    .from("skills")
    .select("*", { count: "exact" });

  if (query) {
    dbQuery = dbQuery.ilike("name", `%${query}%`);
  }

  dbQuery = dbQuery
    .range(from, to)
    .order("name", { ascending: true });

  const { data: skills, error, count } = await dbQuery;

  if (error) {
    console.error("Error fetching skills:", error);
    return <div>Error loading data</div>;
  }

  return (
    <div className="p-6 sm:p-10">
      <SkillsTable 
        data={skills || []} 
        categories={categories || []}
        searchParams={params}
        totalCount={count || 0}
        currentPage={page}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}
