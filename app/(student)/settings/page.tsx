import { AccountSettings } from "@/components/shared/account-settings";

export default function SettingsPage() {
  return <div className="mx-auto max-w-2xl space-y-6"><header><h1 className="text-2xl font-bold text-white">Settings</h1><p className="mt-2 text-sm text-muted-foreground">Make your learning space feel like you.</p></header><AccountSettings /></div>;
}
