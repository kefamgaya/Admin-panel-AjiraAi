import { createClient } from "@/utils/supabase/server";
import LocationsTable from "@/components/admin/content/LocationsTable";

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; tab?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const query = params.q;
  const page = Number(params.page) || 1;
  const itemsPerPage = 20;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  const activeTab = params.tab === 'districts' ? 'districts' : 'regions';

  // We fetch ALL regions for the dropdown regardless of pagination
  // But we paginate the main view for regions if active tab is regions
  const { data: allRegions } = await supabase
    .from("tanzania_regions")
    .select("id, name, code")
    .order("name");

  let regions = [];
  let districts = [];
  let count = 0;

  if (activeTab === 'regions') {
    let dbQuery = supabase
      .from("tanzania_regions")
      .select("*", { count: "exact" });

    if (query) {
      dbQuery = dbQuery.ilike("name", `%${query}%`);
    }

    dbQuery = dbQuery
      .range(from, to)
      .order("name");

    const { data, count: totalCount } = await dbQuery;
    regions = data || [];
    count = totalCount || 0;
  } else {
    let dbQuery = supabase
      .from("tanzania_districts")
      .select("*", { count: "exact" });

    if (query) {
      dbQuery = dbQuery.ilike("name", `%${query}%`);
    }

    dbQuery = dbQuery
      .range(from, to)
      .order("name");

    const { data, count: totalCount } = await dbQuery;
    districts = data || [];
    count = totalCount || 0;
  }

  return (
    <div className="p-6 sm:p-10">
      <LocationsTable 
        regions={activeTab === 'regions' ? regions : allRegions || []} 
        districts={districts}
        searchParams={params}
        totalCount={count}
        currentPage={page}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}
