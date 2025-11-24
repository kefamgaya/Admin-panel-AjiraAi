import { Title, Text, TabGroup, TabList, Tab, TabPanels, TabPanel } from "@tremor/react";
import { GeneralSettings } from "@/components/admin/settings/GeneralSettings";
import { PlatformSettings } from "@/components/admin/settings/PlatformSettings";
import { EmailSettings } from "@/components/admin/settings/EmailSettings";
import { getSettings } from "@/app/actions/settings";

// Force dynamic rendering since this page uses cookies
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  try {
    const { success, settings, error } = await getSettings();

    if (!success) {
      console.error("Error loading settings:", error);
    }

    // Convert settings array to object with setting_key as key
    const generalSettings = (settings?.general || []).reduce((acc: any, setting: any) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {});

    const platformSettings = (settings?.platform || []).reduce((acc: any, setting: any) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {});

    const emailSettings = (settings?.email || []).reduce((acc: any, setting: any) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {});

    return (
      <div className="p-6 space-y-6">
        <div>
          <Title>Platform Settings</Title>
          <Text className="mt-2">
            Configure and manage your platform settings
          </Text>
        </div>

        <TabGroup>
          <TabList>
            <Tab>General</Tab>
            <Tab>Platform</Tab>
            <Tab>Email</Tab>
          </TabList>
          <TabPanels>
            {/* General Settings Tab */}
            <TabPanel>
              <div className="mt-6">
                <GeneralSettings initialSettings={generalSettings} />
              </div>
            </TabPanel>

            {/* Platform Settings Tab */}
            <TabPanel>
              <div className="mt-6">
                <PlatformSettings initialSettings={platformSettings} />
              </div>
            </TabPanel>

            {/* Email Settings Tab */}
            <TabPanel>
              <div className="mt-6">
                <EmailSettings initialSettings={emailSettings} />
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    );
  } catch (error) {
    console.error("Error loading settings page:", error);
    return (
      <div className="p-6">
        <Title>Error</Title>
        <Text className="mt-2 text-red-500">
          Failed to load settings. Please try again later.
        </Text>
      </div>
    );
  }
}

