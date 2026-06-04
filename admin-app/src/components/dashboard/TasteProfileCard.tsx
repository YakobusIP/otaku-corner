import { useState } from "react";

import QueryErrorState from "@/components/dashboard/QueryErrorState";
import TasteProfileRows from "@/components/dashboard/TasteProfileRows";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { TasteProfile } from "@/types/statistic.type";

import { ENTITY_TYPE } from "@/lib/enums";

import { motion } from "framer-motion";
import { Loader2Icon } from "lucide-react";

type TasteProfileCardProps = {
  data: TasteProfile | undefined;
  isLoading: boolean;
  error: unknown | null;
};

const tasteTabHighlightTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34
};

const tasteTabTriggerClass =
  "relative z-10 min-h-0 min-w-0 rounded-sm py-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none";

const TASTE_TABS = [
  { value: "genres", label: `${ENTITY_TYPE.GENRE}s` },
  { value: "themes", label: `${ENTITY_TYPE.THEME}s` },
  { value: "studios", label: `${ENTITY_TYPE.STUDIO}s` },
  { value: "authors", label: `${ENTITY_TYPE.AUTHOR}s` }
] as const;

export default function TasteProfileCard(props: TasteProfileCardProps) {
  const { data, isLoading, error } = props;
  const [tasteTab, setTasteTab] = useState("genres");

  if (error) {
    return (
      <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Taste Profile</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <QueryErrorState error={error} />
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="flex min-h-[200px] items-center justify-center">
          <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Taste Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tasteTab} onValueChange={setTasteTab} className="w-full">
          <div>
            <TabsList className="relative grid h-11 w-full grid-cols-4 gap-1 rounded-lg bg-muted p-1.5 md:inline-grid md:w-fit md:grid-flow-col md:grid-cols-none md:auto-cols-max">
              {TASTE_TABS.map(({ value, label }) => {
                const isActive = tasteTab === value;

                return (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={tasteTabTriggerClass}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="taste-profile-tab-highlight"
                        aria-hidden
                        className="pointer-events-none absolute inset-0.5 z-0 rounded-sm bg-background shadow-xs"
                        transition={tasteTabHighlightTransition}
                      />
                    ) : null}
                    <span className="relative z-10">{label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          <TabsContent value="genres">
            <TasteProfileRows rows={data.genres} />
          </TabsContent>
          <TabsContent value="themes">
            <TasteProfileRows rows={data.themes} />
          </TabsContent>
          <TabsContent value="studios">
            <TasteProfileRows rows={data.studios} />
          </TabsContent>
          <TabsContent value="authors">
            <TasteProfileRows rows={data.authors} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
