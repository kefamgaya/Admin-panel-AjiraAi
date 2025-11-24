import { createClient } from "@/utils/supabase/server";
import { differenceInYears, parseISO } from "date-fns";

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

export async function getUserAnalytics() {
  const supabase = await createClient();
  
  let allUsers: any[] = [];
  const PAGE_SIZE = 1000;
  let page = 0;
  let hasMore = true;

  // Fetch all users data with pagination loop to overcome 1000 row limit
  while (hasMore) {
    const { data: users, error } = await supabase
      .from("all_users")
      .select("role, gender, accounttype, registration_date, skills, location, birth_date, is_blocked, uid")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
        console.error("Error fetching analytics data:", error);
        break;
    }

    if (users && users.length > 0) {
      allUsers = [...allUsers, ...users];
      if (users.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  const users = allUsers;

  // Process data for charts
  
  // 1. Role Distribution
  const roleDistribution = users.reduce((acc, user) => {
    const role = user.role ? toTitleCase(user.role) : "Unknown";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. Gender Distribution
  const genderDistribution = users.reduce((acc, user) => {
    const gender = user.gender ? toTitleCase(user.gender) : "Not Specified";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 3. Account Type Status
  const accountTypeDistribution = users.reduce((acc, user) => {
    const type = user.accounttype ? toTitleCase(user.accounttype) : "Regular";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 4. User Growth (based on registration_date)
  const growthByMonth = users.reduce((acc, user) => {
    if (!user.registration_date) return acc;
    try {
      const date = new Date(user.registration_date);
      if (isNaN(date.getTime())) return acc; 
      
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
    } catch (e) {
      // Ignore parsing errors
    }
    return acc;
  }, {} as Record<string, number>);

  // 5. Top Skills Analysis
  const skillCounts: Record<string, number> = {};
  users.forEach(user => {
    if (user.skills && typeof user.skills === 'object') {
      Object.values(user.skills).forEach((skill: any) => {
        if (typeof skill === 'string') {
          const normalizedSkill = toTitleCase(skill.trim());
          skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
        }
      });
    }
  });
  
  const topSkills = Object.entries(skillCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  // 6. Location Distribution (normalized)
  const locationDistribution = users.reduce((acc, user) => {
    if (user.location) {
      const normalizedLocation = toTitleCase(user.location.trim());
      acc[normalizedLocation] = (acc[normalizedLocation] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // 7. Age Distribution
  const ageDistribution = users.reduce((acc, user) => {
    let ageRange = "Unknown";
    
    if (user.birth_date) {
      try {
        const birthDate = new Date(user.birth_date);
        if (!isNaN(birthDate.getTime())) {
          const age = differenceInYears(new Date(), birthDate);
          
          if (age < 18) ageRange = "Under 18";
          else if (age >= 18 && age <= 24) ageRange = "18-24";
          else if (age >= 25 && age <= 34) ageRange = "25-34";
          else if (age >= 35 && age <= 44) ageRange = "35-44";
          else if (age >= 45 && age <= 54) ageRange = "45-54";
          else if (age >= 55) ageRange = "55+";
        }
      } catch (e) {
        // invalid date
      }
    }
    
    acc[ageRange] = (acc[ageRange] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort age ranges logically
  const ageOrder = ["Under 18", "18-24", "25-34", "35-44", "45-54", "55+", "Unknown"];
  const sortedAgeDistribution = Object.entries(ageDistribution)
    .sort(([a], [b]) => ageOrder.indexOf(a) - ageOrder.indexOf(b))
    .map(([name, value]) => ({ name, value }));

  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => !u.is_blocked).length,
    blockedUsers: users.filter(u => u.is_blocked).length,
    verifiedUsers: users.filter(u => u.accounttype === 'verified').length,
    roleDistribution: Object.entries(roleDistribution).map(([name, value]) => ({ name, value })),
    genderDistribution: Object.entries(genderDistribution).map(([name, value]) => ({ name, value })),
    accountTypeDistribution: Object.entries(accountTypeDistribution).map(([name, value]) => ({ name, value })),
    growthHistory: Object.entries(growthByMonth).map(([date, count]) => ({ date, "New Users": count })),
    topSkills,
    locationDistribution: Object.entries(locationDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, value]) => ({ name, value })),
    ageDistribution: sortedAgeDistribution
  };
}
