import ReviewScoreWeightsSettingsTab from "@/features/settings/components/ReviewScoreWeightsSettingsTab";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

const SETTINGS_TABS = [
  {
    id: "review-score-weights",
    label: "Review Score Weights",
    content: ReviewScoreWeightsSettingsTab
  }
] as const;

export default function SettingsTabs() {
  return (
    <Tabs defaultValue={SETTINGS_TABS[0].id} className="w-full">
      <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1">
        {SETTINGS_TABS.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {SETTINGS_TABS.map((tab) => {
        const Panel = tab.content;

        return (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            <Panel />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
