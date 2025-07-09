import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-secondary-foreground">
          Manage your CRM preferences and configuration
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" defaultValue="Your Company" />
            </div>
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Input id="currency" defaultValue="USD" />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="UTC-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="quote-alerts">Quote Status Alerts</Label>
              <Switch id="quote-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="opportunity-reminders">
                Opportunity Reminders
              </Label>
              <Switch id="opportunity-reminders" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </div>
  );
}
