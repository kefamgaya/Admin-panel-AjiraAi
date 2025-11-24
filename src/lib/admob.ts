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

    // AdMob API returns a streaming JSON response
    // The response can be:
    // 1. A JSON object with a "rows" array: { rows: [{ row: {...} }] }
    // 2. A JSON array directly: [{ row: {...} }]
    // 3. A stream of JSON objects (newline-delimited)
    
    const text = await response.text();
    let data: any;
    
    try {
      // Try parsing as JSON first
      data = JSON.parse(text);
    } catch (e) {
      // If not valid JSON, it might be a stream of JSON objects (NDJSON)
      // Parse line by line
      const lines = text.trim().split('\n').filter(line => line.trim());
      const parsedLines = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(Boolean);
      
      if (parsedLines.length > 0) {
        data = parsedLines;
      } else {
        console.error("Failed to parse AdMob response:", text.substring(0, 500));
        return [];
      }
    }
    
    // Handle different response structures
    let rows: any[] = [];
    
    if (Array.isArray(data)) {
      // Direct array of row objects
      rows = data;
    } else if (data.rows && Array.isArray(data.rows)) {
      // Object with rows property
      rows = data.rows;
    } else if (data.row) {
      // Single row object
      rows = [{ row: data.row }];
    } else {
      console.warn("Unexpected AdMob response structure:", JSON.stringify(data).substring(0, 500));
      return [];
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

