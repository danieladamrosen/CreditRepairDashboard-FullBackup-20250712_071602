import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SavedCheckIcon } from '@/components/ui/saved-check-icon';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { PublicRecordRow } from './public-record-row';


interface PublicRecordsSectionProps {
  publicRecords: any[];
  hasPublicRecords: boolean;
  savedDisputes: { [key: string]: boolean | { reason: string; instruction: string; violations?: string[]; } };
  handleDisputeSaved: (disputeData: any) => void;
  handleDisputeReset: (disputeType: string) => void;
  expandAll: boolean;
  aiViolations?: { [recordId: string]: string[] };
  aiSuggestions?: { [recordId: string]: string[] };
  aiScanCompleted?: boolean;
}

export function PublicRecordsSection({
  publicRecords,
  hasPublicRecords,
  savedDisputes,
  handleDisputeSaved,
  handleDisputeReset,
  expandAll,
  aiViolations = {},
  aiSuggestions = {},
  aiScanCompleted = false
}: PublicRecordsSectionProps) {
  const [showPublicRecords, setShowPublicRecords] = useState(false);
  const [publicRecordsCollapsed, setPublicRecordsCollapsed] = useState(true);

  // Check for unsaved public records - persistent across expand/collapse actions
  const hasUnsavedPublicRecords = useMemo(() => {
    const hasUnsaved = publicRecords.some((record: any) => {
      const recordId = record['@CreditLiabilityID'] || record['@_SubscriberCode'] || `record_${record.index || 0}`;
      return !savedDisputes[recordId];
    });
    
    return hasUnsaved;
  }, [publicRecords, savedDisputes]);

  const getUnsavedPublicRecordsMessage = () => {
    const unsavedCount = publicRecords.filter((record: any) => {
      const recordId = record['@CreditLiabilityID'] || record['@_SubscriberCode'] || `record_${record.index || 0}`;
      return !savedDisputes[recordId];
    }).length;
    
    if (unsavedCount > 0) {
      return `${unsavedCount} public record${unsavedCount > 1 ? 's' : ''} need dispute review`;
    }
    return '';
  };



  if (!hasPublicRecords) {
    return null;
  }

  return (
    <div className="mb-4">
      {publicRecordsCollapsed ? (
        (() => {
          const unsavedPublicRecordCount = publicRecords.filter((record: any) => {
            const recordId = record['@CreditLiabilityID'] || record['@_SubscriberCode'] || `record_${record.index || 0}`;
            return !savedDisputes[recordId];
          }).length;
          
          const showIndicator = publicRecordsCollapsed && unsavedPublicRecordCount > 0;
          

          
          return (
            <Card className={`cursor-pointer transition-all duration-300 hover:shadow-lg rounded-lg ${
              showIndicator ? 'border-2 border-red-500 bg-red-50' : 
              'border border-gray-200 bg-white hover:border-gray-300'
            }`} onClick={() => {
              setPublicRecordsCollapsed(false);
              setShowPublicRecords(true);
            }}>
              <CardHeader className={
                showIndicator 
                  ? 'cursor-pointer hover:bg-red-100 transition-colors duration-200 rounded-lg min-h-[72px] flex items-center' 
                  : 'cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg min-h-[72px] flex items-center'
              }>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                    {showIndicator ? (
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
                        {unsavedPublicRecordCount}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-bold">
                        {publicRecords.length}
                      </div>
                    )}
                    <div className="flex flex-col justify-center">
                      <h3 className={`text-lg font-bold ${showIndicator ? 'text-red-700' : 'text-gray-700'}`}>
                        Public Records
                      </h3>
                      <p className={`text-sm flex items-center gap-1 ${showIndicator ? 'text-red-700' : 'text-gray-600'}`}>
                        {showIndicator && <AlertTriangle className="w-4 h-4" />}
                        {showIndicator ? `${unsavedPublicRecordCount} public record${unsavedPublicRecordCount > 1 ? 's' : ''} need dispute review` : 
                        (publicRecords.length > 0 ? `${publicRecords.length} public record${publicRecords.length > 1 ? 's' : ''} are impacting your credit score` : 'There are 0 public records impacting your credit score')
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm ${showIndicator ? 'text-red-600' : 'text-gray-600'}`}>
                      {publicRecords.length} records
                    </span>
                    <ChevronDown className={showIndicator ? 'text-red-600' : 'text-gray-600'} />
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })()
      ) : (
        <Card
          className={(() => {
            // Check for unsaved public records in expanded state
            const unsavedPublicRecordCountExpanded = publicRecords.filter((record: any) => {
              const recordId = record['@CreditLiabilityID'] || record['@_SubscriberCode'] || `record_${record.index || 0}`;
              return !savedDisputes[recordId];
            }).length;
            
            const showIndicatorExpanded = unsavedPublicRecordCountExpanded > 0;
            
            // Always use gray border when expanded, regardless of unsaved status
            return 'border-2 border-gray-300 bg-white rounded-lg transition-all duration-300 hover:shadow-lg overflow-hidden';
          })()}
        >
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg min-h-[72px] flex items-center"
            onClick={() => {
              setShowPublicRecords(!showPublicRecords);
              if (!showPublicRecords) {
                setPublicRecordsCollapsed(false);
              } else {
                setPublicRecordsCollapsed(true);
              }
            }}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">
                  {publicRecords.length}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${(() => {
                    const unsavedPublicRecordCountExpanded = publicRecords.filter((record: any) => {
                      const recordId = record['@CreditLiabilityID'] || record['@_SubscriberCode'] || `record_${record.index || 0}`;
                      return !savedDisputes[recordId];
                    }).length;
                    return unsavedPublicRecordCountExpanded > 0 ? 'text-red-700' : 'text-gray-700';
                  })()}`}>Public Records</h3>
                  <p className={`text-sm flex items-center gap-1 ${(() => {
                    const unsavedPublicRecordCountExpanded = publicRecords.filter((record: any) => {
                      const recordId = record['@CreditLiabilityID'] || record['@_SubscriberCode'] || `record_${record.index || 0}`;
                      return !savedDisputes[recordId];
                    }).length;
                    return unsavedPublicRecordCountExpanded > 0 ? 'text-red-700' : 'text-gray-600';
                  })()}`}>
                    {(() => {
                      const unsavedPublicRecordCountExpanded = publicRecords.filter((record: any) => {
                        const recordId = record['@CreditLiabilityID'] || record['@_SubscriberCode'] || `record_${record.index || 0}`;
                        return !savedDisputes[recordId];
                      }).length;
                      
                      if (unsavedPublicRecordCountExpanded > 0) {
                        return (
                          <>
                            <AlertTriangle className="w-4 h-4" />
                            {unsavedPublicRecordCountExpanded} public record{unsavedPublicRecordCountExpanded > 1 ? 's' : ''} need dispute review
                          </>
                        );
                      } else if (publicRecords.length > 0) {
                        return `${publicRecords.length} public record${publicRecords.length > 1 ? 's' : ''} are impacting your credit score`;
                      } else {
                        return 'There are 0 public records impacting your credit score';
                      }
                    })()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-sm ${(() => {
                  const unsavedPublicRecordCountExpanded = publicRecords.filter((record: any) => {
                    const recordId = record['@CreditLiabilityID'] || record['@_SubscriberCode'] || `record_${record.index || 0}`;
                    return !savedDisputes[recordId];
                  }).length;
                  return unsavedPublicRecordCountExpanded > 0 ? 'text-red-600' : 'text-gray-600';
                })()}`}>{publicRecords.length} records</span>
                {showPublicRecords ? (
                  <ChevronUp className={(() => {
                    const unsavedPublicRecordCountExpanded = publicRecords.filter((record: any) => {
                      const recordId = record['@CreditLiabilityID'] || record['@_SubscriberCode'] || `record_${record.index || 0}`;
                      return !savedDisputes[recordId];
                    }).length;
                    return unsavedPublicRecordCountExpanded > 0 ? 'text-red-600' : 'text-gray-600';
                  })()} />
                ) : (
                  <ChevronDown className={(() => {
                    const unsavedPublicRecordCountExpanded = publicRecords.filter((record: any) => {
                      const recordId = record['@CreditLiabilityID'] || record['@_SubscriberCode'] || `record_${record.index || 0}`;
                      return !savedDisputes[recordId];
                    }).length;
                    return unsavedPublicRecordCountExpanded > 0 ? 'text-red-600' : 'text-gray-600';
                  })()} />
                )}
              </div>
            </div>
          </CardHeader>
          {showPublicRecords && (
          <CardContent className="px-6 pt-2 pb-6">
            <div className="space-y-6">
              <div className="flex flex-col gap-6">
                {publicRecords.map((record: any, index: number) => {
                    // 🔥 CRITICAL FIX: Calculate absolute index matching backend logic
                    // Backend combines: negativeAccounts (17) + publicRecords (3) + inquiries (11)
                    // Public records start at index 17 in the combined array
                    const negativeAccountsCount = 17; // From backend console logs
                    const absoluteIndex = negativeAccountsCount + index; // 17, 18, 19
                    const recordId = record['@CreditLiabilityID'] || record['@_SubscriberCode'] || `record_${absoluteIndex}`;
                    console.log(`[PUBLIC-RECORDS-SECTION] Record ${index}: ID=${recordId}, violations=${aiViolations[recordId]?.length || 0}`);
                    return (
                      <PublicRecordRow
                        key={`public-record-${recordId}`}
                        record={record}
                        recordIndex={absoluteIndex}
                        onDispute={() => {}}
                        onDisputeSaved={handleDisputeSaved}
                        onDisputeReset={handleDisputeReset}
                        onHeaderReset={() => {}}
                        expandAll={expandAll}
                        aiViolations={aiViolations[recordId] || []}
                        aiSuggestions={aiSuggestions[recordId] || []}
                        aiScanCompleted={aiScanCompleted}
                      />
                    );
                })}
              </div>
            </div>
          </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}