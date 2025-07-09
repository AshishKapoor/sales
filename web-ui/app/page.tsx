"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useV1LeadsList,
  useV1OpportunitiesList,
  useV1QuotesList,
  useV1TasksList,
  useV1InteractionsList,
  useV1ProductsList,
} from "@/client/gen/sales/v1/v1";
import {
  CheckSquare,
  DollarSign,
  Target,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react";
import { useMemo } from "react";
import { LeadStatusEnum } from "@/client/gen/sales/leadStatusEnum";
import { StageEnum } from "@/client/gen/sales/stageEnum";
import { TaskStatusEnum } from "@/client/gen/sales/taskStatusEnum";

export default function Dashboard() {
  // Fetch data from APIs
  const {
    data: leads,
    isLoading: leadsLoading,
    error: leadsError,
  } = useV1LeadsList();
  const {
    data: opportunities,
    isLoading: opportunitiesLoading,
    error: opportunitiesError,
  } = useV1OpportunitiesList();
  const {
    data: quotes,
    isLoading: quotesLoading,
    error: quotesError,
  } = useV1QuotesList();
  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
  } = useV1TasksList();
  const {
    data: interactions,
    isLoading: interactionsLoading,
    error: interactionsError,
  } = useV1InteractionsList();
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useV1ProductsList();

  // Check for any errors
  const hasError =
    leadsError ||
    opportunitiesError ||
    quotesError ||
    tasksError ||
    interactionsError ||
    productsError;

  // Calculate stats from API data
  const stats = useMemo(() => {
    const totalQuotesValue =
      quotes?.results?.reduce(
        (sum, quote) => sum + parseFloat(quote.total_price || "0"),
        0
      ) || 0;

    const activeLeadsCount =
      leads?.results?.filter(
        (lead) =>
          lead.status !== LeadStatusEnum.converted &&
          lead.status !== LeadStatusEnum.disqualified
      ).length || 0;

    const pendingTasksCount =
      tasks?.results?.filter((task) => task.status !== TaskStatusEnum.completed)
        .length || 0;

    const activeOpportunitiesCount =
      opportunities?.results?.filter(
        (opp) => opp.stage !== StageEnum.won && opp.stage !== StageEnum.lost
      ).length || 0;

    return [
      {
        title: "Total Quotes Value",
        value: `$${totalQuotesValue.toLocaleString()}`,
        icon: DollarSign,
        change: "+12.5%",
        isLoading: quotesLoading,
      },
      {
        title: "Active Leads",
        value: activeLeadsCount.toString(),
        icon: Users,
        change: `+${
          activeLeadsCount > 0 ? Math.ceil(activeLeadsCount * 0.1) : 0
        }`,
        isLoading: leadsLoading,
      },
      {
        title: "Pending Tasks",
        value: pendingTasksCount.toString(),
        icon: CheckSquare,
        change: `-${
          pendingTasksCount > 0 ? Math.ceil(pendingTasksCount * 0.05) : 0
        }`,
        isLoading: tasksLoading,
      },
      {
        title: "Active Opportunities",
        value: activeOpportunitiesCount.toString(),
        icon: Target,
        change: `+${
          activeOpportunitiesCount > 0
            ? Math.ceil(activeOpportunitiesCount * 0.15)
            : 0
        }`,
        isLoading: opportunitiesLoading,
      },
    ];
  }, [
    leads,
    opportunities,
    quotes,
    tasks,
    leadsLoading,
    opportunitiesLoading,
    quotesLoading,
    tasksLoading,
  ]);

  // Show loading state if critical data is still loading
  const isLoading =
    leadsLoading || opportunitiesLoading || quotesLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-secondary-foreground">
            Loading your sales data...
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-red-600">
            Error loading dashboard data. Please try refreshing the page.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-secondary-foreground">
                Unable to load sales data at this time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-secondary-foreground">
          Welcome back! Here's what's happening with your CRM.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-secondary-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-secondary-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stat.value
                )}
              </div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quotesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : quotes?.results?.length ? (
                quotes.results.slice(0, 3).map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{quote.title}</p>
                      <p className="text-sm text-secondary-foreground">
                        by {quote.created_by_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${parseFloat(quote.total_price || "0").toLocaleString()}
                      </p>
                      <p className="text-xs text-secondary-foreground">
                        {quote.opportunity_name}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-secondary-foreground p-4">
                  No quotes found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : products?.results?.length ? (
                products.results
                  .filter((p) => p.is_active)
                  .slice(0, 3)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-secondary-foreground">
                          {product.description?.slice(0, 40) ||
                            "No description"}
                          ...
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${parseFloat(product.price).toLocaleString()}
                        </p>
                        <p className="text-xs text-secondary-foreground">
                          {product.currency}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-center text-secondary-foreground p-4">
                  No active products found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interactionsLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : interactions?.results?.length ? (
              interactions.results.slice(0, 3).map((interaction) => (
                <div
                  key={interaction.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{interaction.summary}</p>
                    <p className="text-sm text-secondary-foreground">
                      {interaction.type} -{" "}
                      {interaction.lead_name ||
                        interaction.contact_name ||
                        interaction.opportunity_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-secondary-foreground">
                      {new Date(interaction.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-secondary-foreground">
                      {interaction.user_name}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-secondary-foreground p-4">
                No recent activities found
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-foreground">
                  Lead Conversion Rate
                </span>
                <span className="font-medium">
                  {leads?.results?.length
                    ? `${Math.round(
                        (leads.results.filter(
                          (l) => l.status === LeadStatusEnum.converted
                        ).length /
                          leads.results.length) *
                          100
                      )}%`
                    : "0%"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-foreground">
                  Opportunities Won
                </span>
                <span className="font-medium">
                  {opportunities?.results?.filter(
                    (o) => o.stage === StageEnum.won
                  ).length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-foreground">
                  Average Deal Size
                </span>
                <span className="font-medium">
                  $
                  {opportunities?.results?.length
                    ? Math.round(
                        opportunities.results.reduce(
                          (sum, opp) => sum + parseFloat(opp.amount),
                          0
                        ) / opportunities.results.length
                      ).toLocaleString()
                    : "0"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunitiesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : opportunities?.results?.length ? (
                Object.entries(
                  opportunities.results.reduce((acc, opp) => {
                    const stage = opp.stage || "unknown";
                    if (!acc[stage]) acc[stage] = { count: 0, value: 0 };
                    acc[stage].count++;
                    acc[stage].value += parseFloat(opp.amount);
                    return acc;
                  }, {} as Record<string, { count: number; value: number }>)
                ).map(([stage, data]) => (
                  <div
                    key={stage}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-secondary-foreground capitalize">
                      {stage.replace(/_/g, " ")}
                    </span>
                    <div className="text-right">
                      <span className="font-medium">{data.count}</span>
                      <span className="text-xs text-secondary-foreground ml-2">
                        (${data.value.toLocaleString()})
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-secondary-foreground p-4">
                  No pipeline data
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasksLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : tasks?.results?.length ? (
                Object.entries(
                  tasks.results.reduce((acc, task) => {
                    const status = task.status || "unknown";
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-secondary-foreground capitalize">
                      {status}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-secondary-foreground p-4">
                  No tasks found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
