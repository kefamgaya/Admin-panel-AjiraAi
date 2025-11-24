"use client";

import {
  Card,
  Title,
  Text,
  TextInput,
  Button,
  Switch,
  Divider,
} from "@tremor/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Setting {
  id?: number;
  setting_key: string;
  setting_value: any;
  category: string;
}

export default function GeneralSettingsForm({ settings }: { settings: Setting[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Helper to extract value
  const getValue = (key: string, defaultVal: any) => {
    const s = settings.find(x => x.setting_key === key);
    // setting_value is jsonb, so it might be wrapped or direct
    return s ? s.setting_value : defaultVal;
  };

  const [formState, setFormState] = useState({
    siteName: getValue('site_name', 'Ajira AI'),
    supportEmail: getValue('support_email', 'support@ajira.ai'),
    maintenanceMode: getValue('maintenance_mode', false),
    allowRegistrations: getValue('allow_registrations', true),
    itemsPerPage: getValue('items_per_page', 20),
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        settings: [
          { key: 'site_name', value: formState.siteName, category: 'general' },
          { key: 'support_email', value: formState.supportEmail, category: 'general' },
          { key: 'maintenance_mode', value: formState.maintenanceMode, category: 'system' },
          { key: 'allow_registrations', value: formState.allowRegistrations, category: 'system' },
          { key: 'items_per_page', value: Number(formState.itemsPerPage), category: 'ui' },
        ]
      };

      const res = await fetch('/api/admin/settings/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      
      router.refresh();
      alert("Settings saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Title>General Platform Settings</Title>
      <Text className="mb-6">Configure general parameters for the application.</Text>

      <div className="space-y-6">
        <div>
          <Text className="mb-1 font-medium">Site Information</Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Site Name</label>
              <TextInput 
                value={formState.siteName} 
                onChange={e => setFormState({...formState, siteName: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Support Email</label>
              <TextInput 
                value={formState.supportEmail} 
                onChange={e => setFormState({...formState, supportEmail: e.target.value})}
              />
            </div>
          </div>
        </div>

        <Divider />

        <div>
          <Text className="mb-1 font-medium">System Controls</Text>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-900">Maintenance Mode</Text>
                <Text className="text-xs">Disable access for non-admin users</Text>
              </div>
              <Switch 
                checked={formState.maintenanceMode} 
                onChange={(val) => setFormState({...formState, maintenanceMode: val})} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-900">Allow User Registrations</Text>
                <Text className="text-xs">Enable new users to sign up</Text>
              </div>
              <Switch 
                checked={formState.allowRegistrations} 
                onChange={(val) => setFormState({...formState, allowRegistrations: val})} 
              />
            </div>
          </div>
        </div>

        <Divider />

        <div>
          <Text className="mb-1 font-medium">Interface Preferences</Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="text-sm text-gray-500">Items Per Page (Default)</label>
              <TextInput 
                type="number"
                value={formState.itemsPerPage} 
                onChange={e => setFormState({...formState, itemsPerPage: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button loading={loading} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}

