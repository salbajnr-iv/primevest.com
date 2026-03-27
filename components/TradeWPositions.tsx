"use client";

import * as React from \"react\";
import { Button } from \"@/components/ui/button\";
import { Card, CardContent, CardHeader, CardTitle } from \"@/components/ui/card\";
import { Badge } from \"@/components/ui/badge\";
import { usePositions } from \"@/hooks/usePositions\";
import { useAuth } from \"@/contexts/AuthContext\";
import { cn } from \"@/lib/utils\";

interface Position {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  profitPercent: number;
  accountType: string;
}

const TradeWPositions: React.FC = () => {
  const { user } = useAuth();
  const { positions, isLoading, error } = usePositions(user?.id || '') as { positions: Position[], isLoading: boolean, error: string | null };
  const [activeTab, setActiveTab] = React.useState(\"tradew\");

  const tabs = [
    { id: \"tradew\", label: \"Trade W\" },
    { id: \"mt4\", label: \"MT4\" },
    { id: \"mt5\", label: \"MT5\" },
  ];

  const getPositionsForTab = () => {
    return positions.filter(p => p.accountType === activeTab);
  };

  const formatProfit = (profit: number, profitPercent: number) => {
    const profitStr = profit >= 0 ? `+€${profit.toFixed(2)}` : `€${profit.toFixed(2)}`;
    const pctStr = profitPercent >= 0 ? `+${profitPercent.toFixed(1)}%` : `${profitPercent.toFixed(1)}%`;
    const isPositive = profit >= 0;
    return (
      <Badge 
        variant={isPositive ? \"default\" : \"secondary\"} 
        className={cn(
          \"ml-auto text-xs\",
          isPositive ? \"bg-green-500 hover:bg-green-500/90\" : \"bg-destructive hover:bg-destructive/90\"
        )}
      >
        {profitStr} ({pctStr})
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className=\"border-0 shadow-sm\">
        <CardContent className=\"flex items-center justify-center py-12\">
          <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-primary\"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className=\"border-destructive/50 bg-destructive/5\">
        <CardContent className=\"py-12 text-center\">
          <div className=\"text-destructive font-medium mb-2\">Error loading positions</div>
          <div className=\"text-sm text-muted-foreground\">{error}</div>
        </CardContent>
      </Card>
    );
  }

  const currentPositions = getPositionsForTab();

  return (
    <div className=\"space-y-6\">
      <Card className=\"overflow-hidden shadow-sm border-card\">
        <CardHeader className=\"pb-4 px-6\">
          <div className=\"flex items-center justify-between\">
            <CardTitle className=\"text-xl font-semibold leading-tight tracking-tight\">Open Positions</CardTitle>
            <Button variant=\"ghost\" size=\"sm\" className=\"h-8 px-3 flex items-center gap-1\">
              More
              <svg className=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 5l7 7-7 7\" />
              </svg>
            </Button>
          </div>
        </CardHeader>
        <CardContent className=\"px-6 pb-6 pt-0\">
          <div className=\"flex gap-1 mb-6 -mx-1.5\">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? \"default\" : \"outline\"}
                size=\"sm\"
                className=\"flex-1 h-11 mx-1.5\"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
          {currentPositions.length === 0 ? (
            <div className=\"flex flex-col items-center justify-center py-16 px-8 text-center space-y-4\">
              <div className=\"w-20 h-20 rounded-2xl bg-muted flex items-center justify-center\">
                <svg className=\"w-10 h-10 text-muted-foreground\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                  <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={1.5} d=\"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z\" />
                </svg>
              </div>
              <div className=\"space-y-1\">
                <h3 className=\"text-lg font-semibold text-foreground\">No {activeTab.toUpperCase()} positions</h3>
                <p className=\"text-sm text-muted-foreground\">Open your first {activeTab.toUpperCase().toLowerCase()} position to get started</p>
              </div>
              <Button variant=\"outline\" className=\"mt-4\">
                New Position
              </Button>
            </div>
          ) : (
            <div className=\"overflow-x-auto -mx-6 mb-6\">
              <table className=\"w-full min-w-[600px]\">
                <thead>
                  <tr className=\"border-b border-border/50 bg-muted/50\">
                    <th className=\"text-left py-4 px-6 text-xs font-medium uppercase tracking-wider text-muted-foreground\">Symbol</th>
                    <th className=\"text-left py-4 px-6 text-xs font-medium uppercase tracking-wider text-muted-foreground\">Type</th>
                    <th className=\"text-right py-4 px-6 text-xs font-medium uppercase tracking-wider text-muted-foreground\">Volume</th>
                    <th className=\"text-right py-4 px-6 text-xs font-medium uppercase tracking-wider text-muted-foreground\">Open Price</th>
                    <th className=\"text-right py-4 px-6 text-xs font-medium uppercase tracking-wider text-muted-foreground\">Current Price</th>
                    <th className=\"text-right py-4 px-6 text-xs font-medium uppercase tracking-wider text-muted-foreground\">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPositions.map((position: any) => (
                    <tr key={position.id} className=\"border-b border-border/50 hover:bg-accent transition-colors\">
                      <td className=\"py-4 px-6 font-medium text-foreground\">{position.symbol}</td>
                      <td className=\"py-4 px-6\">
                        <Badge variant={position.type === \"buy\" ? \"default\" : \"secondary\"} className={cn(
                          position.type === \"buy\" ? \"bg-green-500 hover:bg-green-500/90 border-transparent shadow-sm\" : \"bg-destructive hover:bg-destructive/90 border-transparent shadow-sm\"
                        )}>
                          {position.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className=\"py-4 px-6 text-right font-mono text-sm text-muted-foreground\">{position.volume.toFixed(4)}</td>
                      <td className=\"py-4 px-6 text-right font-mono text-sm text-foreground\">€{position.openPrice.toFixed(2)}</td>
                      <td className=\"py-4 px-6 text-right font-mono text-sm text-foreground\">€{position.currentPrice.toFixed(2)}</td>
                      <td>{formatProfit(position.profit, position.profitPercent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeWPositions;

