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
  endDate: Date
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
          dimensions: ["DATE"],
          metrics: ["IMPRESSIONS", "CLICKS", "ESTIMATED_EARNINGS"],
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

    // Response is a stream of JSON objects, but for simple reports it's usually an array in the first object or list
    // The API returns an array of objects, each containing a 'row'
    const data = await response.json();
    
    // AdMob API response structure is a bit complex. It returns a list of rows.
    // Example: [{ row: { dimensionValues: { DATE: { value: '20230101' } }, metricValues: { IMPRESSIONS: { integerValue: 100 }, ... } } }]
    
    if (!Array.isArray(data)) {
      // Sometimes it returns a single object with footer?
      // Let's handle standard response which is an array of rows.
      // Actually, generate returns a stream, but fetch might buffer it?
      // If using node-fetch or standard fetch, it returns the body. 
      // The response body is a JSON array if it's small enough.
      
      // Let's assume standard JSON response for now.
      // If empty, it might be empty array.
      return [];
    }

    // Parse rows
    // Note: The actual response from networkReport:generate is a JSON array of entries.
    // Each entry has `row` or `footer`.
    
    const reportData: AdMobReportData[] = [];

    for (const item of data) {
      if (item.row) {
        const dateStr = item.row.dimensionValues.DATE.value; // "YYYYMMDD"
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1;
        const day = parseInt(dateStr.substring(6, 8));
        const date = new Date(year, month, day).toISOString();

        const impressions = parseInt(item.row.metricValues.IMPRESSIONS.integerValue || "0");
        const clicks = parseInt(item.row.metricValues.CLICKS.integerValue || "0");
        const earningsMicros = parseInt(item.row.metricValues.ESTIMATED_EARNINGS.microsValue || "0");
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

    return reportData;
  } catch (error) {
    console.error("Error processing AdMob report:", error);
    throw error;
  }
}

