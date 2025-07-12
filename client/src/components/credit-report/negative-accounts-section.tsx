import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';
import { AccountRow } from './account-row';
import { SavedCollapsedCard } from '@/components/ui/saved-collapsed-card';
import { cn } from '@/lib/utils';

interface NegativeAccountsSectionProps {
  negativeAccounts: any[];
  aiViolations: { [accountId: string]: string[] };
  disputeReasons: any;
  disputeInstructions: any;
  onDisputeSaved: (accountId: string, disputeData: any) => void;
  onDisputeReset: (accountId: string) => void;
  aiScanCompleted: boolean;
  savedDisputes: { [accountId: string]: boolean | { reason: string; instruction: string; violations?: string[] } };
  showNegativeAccounts: boolean;
  setShowNegativeAccounts: (show: boolean) => void;
  expandAll: boolean;
  setExpandAll: (expand: boolean) => void;
}

export function NegativeAccountsSection({
  negativeAccounts,
  aiViolations,
  disputeReasons,
  disputeInstructions,
  onDisputeSaved,
  onDisputeReset,
  aiScanCompleted,
  savedDisputes,
  showNegativeAccounts,
  setShowNegativeAccounts,
  expandAll,
  setExpandAll,
}: NegativeAccountsSectionProps) {
  const [negativeAccountsCollapsed, setNegativeAccountsCollapsed] = useState(true);
  const [showAllDetails, setShowAllDetails] = useState(false);

  // Compute summary text for saved disputes
  const totalSavedDisputes = negativeAccounts.filter((account: any) => {
    const accountId = account['@CreditLiabilityID'] || account['@_AccountNumber'] || account['@_AccountIdentifier'];
    return savedDisputes[accountId];
  }).length;
  const summaryText = `You've saved disputes for ${totalSavedDisputes} negative account(s) across TransUnion, Equifax, and Experian.`;

  // Check if all negative accounts have saved disputes
  const allNegativeAccountsSaved = negativeAccounts.length > 0 && negativeAccounts.every((account: any) => {
    const accountId = account['@CreditLiabilityID'] || account['@_AccountNumber'] || account['@_AccountIdentifier'];
    return savedDisputes[accountId];
  });

  // Handle toggle for both states
  const handleToggle = () => {
    if (negativeAccountsCollapsed) {
      setNegativeAccountsCollapsed(false);
      setShowNegativeAccounts(true);
    } else {
      setNegativeAccountsCollapsed(true);
      setShowNegativeAccounts(false);
    }
  };



  return (
    <div data-section="negative-accounts">
      {allNegativeAccountsSaved ? (
        <SavedCollapsedCard
          sectionName="Negative Accounts"
          successMessage="Negative Accounts – Disputes Saved"
          summaryText={summaryText}
          onExpand={() => {
            setNegativeAccountsCollapsed(false);
            setShowNegativeAccounts(true);
          }}
        />
      ) : (
        <Card className={cn(
          "rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg",
          negativeAccountsCollapsed
            ? "border-2 border-red-500 bg-rose-50"
            : "border-2 border-gray-300 bg-white shadow-sm"
        )}>
          <CardHeader 
            onClick={handleToggle}
            className={cn(
              "flex flex-row items-center justify-between px-6 pt-2 pb-2 min-h-[92px] cursor-pointer",
              negativeAccountsCollapsed
                ? "hover:bg-red-100"
                : "hover:bg-gray-50"
            )}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm font-bold flex items-center justify-center">
                {negativeAccounts.length}
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-700 m-0">Negative Accounts</h3>
                <p className="flex flex-row items-center gap-2 text-sm text-red-600 m-0">
                  <AlertTriangle className="w-4 h-4" /> {negativeAccounts.length} negative accounts need dispute review
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2">
              <span className="text-sm text-red-600">{negativeAccounts.length} accounts</span>
              {negativeAccountsCollapsed ? (
                <ChevronDown className="h-5 w-5 text-red-600" />
              ) : (
                <ChevronUp className="h-5 w-5 text-red-600" />
              )}
            </div>
          </CardHeader>

          {!negativeAccountsCollapsed && (
            <CardContent className="px-6 pt-2 pb-6 flex flex-col gap-6">
              {showNegativeAccounts && negativeAccounts.map((account: any, index: number) => {

                    const accountId = account['@CreditLiabilityID'] || account['@_AccountNumber'] || account['@_AccountIdentifier'];
                    return (
                      <AccountRow
                        key={`negative-${accountId || index}`}
                        account={account}
                        aiViolations={aiViolations[account['@CreditLiabilityID']] || []}
                        disputeReasons={disputeReasons}
                        disputeInstructions={disputeInstructions}
                        onDisputeSaved={onDisputeSaved}
                        onDisputeReset={onDisputeReset}
                        expandAll={expandAll}
                        showAllDetails={showAllDetails}
                        aiScanCompleted={aiScanCompleted}
                        savedDisputes={savedDisputes}
                        isFirstInConnectedSection={index === 0}
                        allNegativeAccountsSaved={negativeAccounts.every(
                          (acc: any) =>
                            savedDisputes[
                              acc['@CreditLiabilityID'] ||
                                acc['@_AccountNumber'] ||
                                acc['@_AccountIdentifier']
                            ]
                        )}
                        isExpanded={undefined}
                      />
                    );
                })}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}