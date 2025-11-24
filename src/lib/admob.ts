export interface AdMobCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export interface AdMobReportData {
  date: string;
  impressions: number;
  clicks: number;
  earnings: number;
  currency: string;
}

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const BASE_URL = "https://admob.googleapis.com/v1";

export async function getAccessToken(credentials: AdMobCredentials): Promise<string> {
  try {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        refresh_token: credentials.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to refresh access token:", error);
      throw new Error("Failed to refresh access token");
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
}

export async function fetchAdMobEarnings(
  publisherId: string,
  accessToken: string,
  startDate: Date,
  endDate: Date,
  appId?: string
): Promise<AdMobReportData[]> {
  const formattedStartDate = {
    year: startDate.getFullYear(),
    month: startDate.getMonth() + 1,
    day: startDate.getDate(),
  };

  const formattedEndDate = {
    year: endDate.getFullYear(),
    month: endDate.getMonth() + 1,
    day: endDate.getDate(),
  };

  const url = `${BASE_URL}/accounts/${publisherId}/networkReport:generate`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportSpec: {
          dateRange: {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          },
          dimensions: appId ? ["DATE", "APP"] : ["DATE"],
          metrics: ["IMPRESSIONS", "CLICKS", "ESTIMATED_EARNINGS"],
          ...(appId && {
            dimensionFilters: [
              {
                dimension: "APP",
                matchesAny: {
                  values: [appId],
                },
              },
            ],
          }),
          localizationSettings: {
            currencyCode: "USD",
            languageCode: "en-US",
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to fetch AdMob report:", error);
      throw new Error(`AdMob API Error: ${response.statusText}`);
    }

    // AdMob API returns a streaming JSON response (NDJSON - newline-delimited JSON)
    // Each line is a separate JSON object, first line is usually header
    const text = await response.text();
    const lines = text.trim().split('\n').filter(line => line.trim());
    
    let rows: any[] = [];
    
    // Parse each line as JSON
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        
        // Skip header objects (they don't have "row" property)
        if (parsed.row) {
          rows.push(parsed);
        } else if (parsed.rows && Array.isArray(parsed.rows)) {
          // If a line contains rows array, add all rows
          rows.push(...parsed.rows);
        }
      } catch (e) {
        // Skip invalid JSON lines
        continue;
      }
    }
    
    // If no rows found, try parsing as single JSON object (fallback)
    if (rows.length === 0) {
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          rows = data;
        } else if (data.rows && Array.isArray(data.rows)) {
          rows = data.rows;
        } else if (data.row) {
          rows = [{ row: data.row }];
        }
      } catch (e) {
        console.warn("Failed to parse AdMob response:", text.substring(0, 500));
        return [];
      }
    }

    // Parse rows
    const reportData: AdMobReportData[] = [];

    for (const item of rows) {
      if (item.row) {
        const dateStr = item.row.dimensionValues?.DATE?.value; // "YYYYMMDD"
        if (!dateStr) continue; // Skip if no date
        
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1;
        const day = parseInt(dateStr.substring(6, 8));
        const date = new Date(year, month, day).toISOString();

        const impressions = parseInt(item.row.metricValues?.IMPRESSIONS?.integerValue || "0");
        const clicks = parseInt(item.row.metricValues?.CLICKS?.integerValue || "0");
        const earningsMicros = parseInt(item.row.metricValues?.ESTIMATED_EARNINGS?.microsValue || "0");
        const earnings = earningsMicros / 1000000;

        reportData.push({
          date,
          impressions,
          clicks,
          earnings,
          currency: "USD",
        });
      }
    }

    console.log(`AdMob API: Fetched ${reportData.length} rows, total earnings: $${reportData.reduce((sum, r) => sum + r.earnings, 0).toFixed(2)}`);
    return reportData;
  } catch (error) {
    console.error("Error processing AdMob report:", error);
    throw error;
  }
}

