import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { AccountRow } from './account-row';

interface PositiveClosedAccountsSectionProps {
  positiveAccounts: any[];
  aiViolations: { [accountId: string]: string[] };
  disputeReasons: any;
  disputeInstructions: any;
  onDisputeSaved: (accountId: string, disputeData: any) => void;
  onDisputeReset: (accountId: string) => void;
  aiScanCompleted: boolean;
  savedDisputes: { [accountId: string]: boolean | { reason: string; instruction: string; violations?: string[] } };
  showPositiveAccounts: boolean;
  setShowPositiveAccounts: (show: boolean) => void;
  expandAll: boolean;
  setExpandAll: (expand: boolean) => void;
  showAllDetails: boolean;
  setShowAllDetails: (show: boolean) => void;
}

export default function PositiveClosedAccountsSection({
  positiveAccounts,
  aiViolations,
  disputeReasons,
  disputeInstructions,
  onDisputeSaved,
  onDisputeReset,
  aiScanCompleted,
  savedDisputes,
  showPositiveAccounts,
  setShowPositiveAccounts,
  expandAll,
  setExpandAll,
  showAllDetails,
  setShowAllDetails,
}: PositiveClosedAccountsSectionProps) {
  
  // Function to determine if an account is closed
  const isClosedAccount = (account: any) => {
    // Check for closed account status
    const accountStatus = account['@_AccountStatusType'];
    if (
      accountStatus &&
      (accountStatus.toLowerCase().includes('closed') ||
        accountStatus.toLowerCase().includes('paid') ||
        accountStatus === 'C')
    )
      return true;

    // Check for closed date
    if (account['@_AccountClosedDate']) return true;

    // Check current rating for closed accounts
    const currentRating = account._CURRENT_RATING?.['@_Code'];
    if (currentRating && currentRating === 'C') return true;

    return false;
  };



  // Sort received positive accounts: open accounts first, closed accounts last
  const sortedPositiveAccounts = positiveAccounts.sort((a: any, b: any) => {
    const aIsClosed = isClosedAccount(a);
    const bIsClosed = isClosedAccount(b);
    
    // Open accounts first, closed accounts last
    if (aIsClosed && !bIsClosed) return 1;
    if (!aIsClosed && bIsClosed) return -1;
    return 0;
  });

  return (
    <div className="mb-4">
      <Card
        className={`${
          showPositiveAccounts 
            ? 'border-2 border-gray-300 bg-white rounded-lg shadow-sm' 
            : 'border border-gray-200 bg-white rounded-lg shadow-sm'
        } transition-all duration-300 hover:shadow-lg overflow-hidden`}
      >
        <CardHeader
          className="cursor-pointer flex flex-row items-center p-6 bg-white hover:bg-gray-50 transition-colors duration-200"
          onClick={() => setShowPositiveAccounts(!showPositiveAccounts)}
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full gauge-green flex items-center justify-center text-white text-sm font-bold">
                {sortedPositiveAccounts.length}
              </div>
              <div>
                <h3 className="text-lg font-bold">Positive & Closed Accounts</h3>
                <p className={`text-sm ${
                  sortedPositiveAccounts.length > 0 
                    ? 'text-green-600' 
                    : 'text-gray-600'
                } font-normal`}>
                  {sortedPositiveAccounts.length > 0 
                    ? `${sortedPositiveAccounts.length} accounts in good standing helping your credit score`
                    : 'There are 0 accounts currently helping your credit score'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-sm ${
                sortedPositiveAccounts.some((account: any) => {
                  const accountId = account['@CreditLiabilityID'] || account['@_AccountNumber'] || account['@_AccountIdentifier'];
                  return savedDisputes[accountId];
                }) ? 'text-green-600' : 'text-gray-600'
              }`}>{sortedPositiveAccounts.length} accounts</span>
              {showPositiveAccounts ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>
        </CardHeader>
        {showPositiveAccounts && (
          <CardContent className="px-6 pt-2 pb-6">
            <div className="space-y-3">
              <div className="flex justify-end items-center">
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    onClick={() => setExpandAll(!expandAll)}
                  >
                    {expandAll ? 'Collapse All' : 'Expand All'}
                  </button>
                  <button
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    onClick={() => setShowAllDetails(!showAllDetails)}
                  >
                    {showAllDetails ? 'Hide Details' : 'Show All Details'}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {sortedPositiveAccounts.map((account: any, index: number) => (
                  <AccountRow
                    key={`positive-${account['@CreditLiabilityID'] || account['@_AccountNumber'] || account['@_AccountIdentifier'] || index}`}
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
                    isFirstInConnectedSection={false}
                    allNegativeAccountsSaved={false}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}