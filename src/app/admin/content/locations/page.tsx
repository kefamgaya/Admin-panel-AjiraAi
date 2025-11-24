import { createClient } from "@/utils/supabase/server";
import LocationsTable from "@/components/admin/content/LocationsTable";

// Country configuration
const COUNTRIES = [
  { code: 'kenya', name: 'Kenya', hasDistricts: false },
  { code: 'uganda', name: 'Uganda', hasDistricts: false },
  { code: 'rwanda', name: 'Rwanda', hasDistricts: false },
  { code: 'tanzania', name: 'Tanzania', hasDistricts: true },
] as const;

type CountryCode = typeof COUNTRIES[number]['code'];

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; tab?: string; country?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const query = params.q;
  const page = Number(params.page) || 1;
  const itemsPerPage = 20;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  const activeTab = params.tab === 'districts' ? 'districts' : 'regions';

  // Get selected country or default to Tanzania
  const selectedCountry = (params.country as CountryCode) || 'tanzania';
  const countryConfig = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[3]; // Default to Tanzania
  
  const regionsTable = `${selectedCountry}_regions`;
  const districtsTable = selectedCountry === 'tanzania' ? 'tanzania_districts' : null;

  // Fetch ALL regions for the dropdown regardless of pagination
  const { data: allRegions } = await supabase
    .from(regionsTable)
    .select("id, name, code")
    .order("name");

  let regions = [];
  let districts = [];
  let count = 0;

  if (activeTab === 'regions') {
    let dbQuery = supabase
      .from(regionsTable)
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
  } else if (activeTab === 'districts' && districtsTable) {
    // Only show districts for Tanzania
    let dbQuery = supabase
      .from(districtsTable)
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
        countries={COUNTRIES}
        selectedCountry={selectedCountry}
        hasDistricts={countryConfig.hasDistricts}
      />
    </div>
  );
}
