import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronDown, ChevronUp, CheckIcon } from 'lucide-react';

import { Inquiries } from './inquiries-working';
import { useSmoothScrollToNextCard } from '@/hooks/useSmoothScrollToNextCard';

interface HardInquiriesSectionProps {
  creditData: any;
  savedDisputes: { [key: string]: boolean | { reason: string; instruction: string; violations?: string[] } };
  onDisputeSaved: (disputeData: any) => void;
  onDisputeReset: (disputeData: any) => void;
  onInquirySaved: (id: string, bureau: 'TU' | 'EQ' | 'EX', isRecent: boolean) => void;
  onInquiryReset: (id: string) => void;
  aiViolations?: { [inquiryId: string]: string[] };
  aiSuggestions?: { [inquiryId: string]: string[] };
  aiScanCompleted?: boolean;
  
  // Hard Inquiries collapsed state
  hardCollapsed: boolean;
  setHardCollapsed: (collapsed: boolean) => void;
  showHardInquiries: boolean;
  setShowHardInquiries: (show: boolean) => void;
  
  // Recent Inquiries state
  recentInquiriesSaved: boolean;
  setRecentInquiriesSaved: (saved: boolean) => void;
  recentInquirySelections: Array<{ id: string; bureau: string; creditor: string }>;
  setRecentInquirySelections: (selections: Array<{ id: string; bureau: string; creditor: string }>) => void;
  recentInquiryDispute: { reason: string; instruction: string; selectedInquiries: string[] } | null;
  setRecentInquiryDispute: (dispute: { reason: string; instruction: string; selectedInquiries: string[] } | null) => void;
  onRecentInquiryDisputeSaved: (disputeData?: { selectedInquiries: Array<{ id: string; bureau: string; creditor: string }>; reason: string; instruction: string }) => void;
  
  // Older Inquiries state
  olderInquiriesSaved: boolean;
  setOlderInquiriesSaved: (saved: boolean) => void;
  olderInquirySelections: Array<{ id: string; bureau: string; creditor: string }>;
  setOlderInquirySelections: (selections: Array<{ id: string; bureau: string; creditor: string }>) => void;
  olderInquiryDispute: { reason: string; instruction: string; selectedInquiries: string[] } | null;
  setOlderInquiryDispute: (dispute: { reason: string; instruction: string; selectedInquiries: string[] } | null) => void;
  onOlderInquiryDisputeSaved: (disputeData?: { selectedInquiries: Array<{ id: string; bureau: string; creditor: string }>; reason: string; instruction: string }) => void;
}

export function HardInquiriesSection({
  creditData,
  savedDisputes,
  onDisputeSaved,
  onDisputeReset,
  onInquirySaved,
  onInquiryReset,
  hardCollapsed,
  setHardCollapsed,
  showHardInquiries,
  setShowHardInquiries,
  recentInquiriesSaved,
  setRecentInquiriesSaved,
  recentInquirySelections,
  setRecentInquirySelections,
  recentInquiryDispute,
  setRecentInquiryDispute,
  onRecentInquiryDisputeSaved,
  olderInquiriesSaved,
  setOlderInquiriesSaved,
  olderInquirySelections,
  setOlderInquirySelections,
  olderInquiryDispute,
  setOlderInquiryDispute,
  onOlderInquiryDisputeSaved,
  aiViolations = {},
  aiSuggestions = {},
  aiScanCompleted = false
}: HardInquiriesSectionProps) {
  const hardInquiriesRef = useRef<HTMLDivElement>(null);
  const { scrollToSection } = useSmoothScrollToNextCard();

  // Auto-collapse Hard Inquiries section when Recent Inquiries is saved
  useEffect(() => {
    if (recentInquiriesSaved && showHardInquiries && !hardCollapsed) {

      
      // Wait 500ms (half second pause as specified)
      setTimeout(() => {

        
        // Phase 1: Show green feedback (already visible from recentInquiriesSaved state)

        
        // Phase 2: Scroll to self with 20px offset
        if (hardInquiriesRef.current) {

          hardInquiriesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            window.scrollBy(0, -20);
          }, 100);
        }
        
        // Phase 3: Wait 500ms, then collapse
        setTimeout(() => {

          setShowHardInquiries(false);
          
          // Phase 4: Set collapsed state after 300ms
          setTimeout(() => {
            setHardCollapsed(true);

            
            // Phase 5: Wait 500ms, then scroll to next section
            setTimeout(() => {

              scrollToSection('[data-section="credit-accounts"]');
            }, 500);
          }, 300);
        }, 500);
      }, 500);
    }
  }, [recentInquiriesSaved, showHardInquiries, hardCollapsed, setShowHardInquiries, setHardCollapsed]);

  // Calculate recent inquiries count
  const calculateRecentInquiriesCount = () => {
    const inquiries = creditData?.CREDIT_RESPONSE?.CREDIT_INQUIRY || [];
    const inquiriesArray = Array.isArray(inquiries) ? inquiries : [inquiries];

    const currentDate = new Date('2025-06-18'); // Use consistent report date
    const cutoffDate = new Date(currentDate);
    cutoffDate.setMonth(cutoffDate.getMonth() - 24); // 24 months ago

    return inquiriesArray.filter((inquiry: any) => {
      const inquiryDate = new Date(inquiry['@_Date']);
      return inquiryDate >= cutoffDate;
    }).length;
  };

  // Calculate total inquiries count for badge
  const calculateTotalInquiriesCount = () => {
    const inquiries = creditData?.CREDIT_RESPONSE?.CREDIT_INQUIRY || [];
    const inquiriesArray = Array.isArray(inquiries) ? inquiries : [inquiries];
    return inquiriesArray.length;
  };

  const recentInquiriesCount = calculateRecentInquiriesCount();
  const totalInquiriesCount = calculateTotalInquiriesCount();

  // Helper function for inquiry status text
  const getInquiryStatusText = () => {
    if (recentInquiriesCount === 0) {
      return "You have 0 inquiries that affect your credit score";
    }
    const inquiryWord = recentInquiriesCount === 1 ? 'inquiry' : 'inquiries';
    return `${recentInquiriesCount} ${inquiryWord} may be impacting your credit score`;
  };

  // Handle header reset
  const handleHeaderReset = () => {
    setRecentInquiriesSaved(false);
    setOlderInquiriesSaved(false);
    setRecentInquirySelections([]);
    setOlderInquirySelections([]);
    setRecentInquiryDispute(null);
    setOlderInquiryDispute(null);
  };

  // Hard Inquiries now has neutral appearance - no visual indicators



  return (
    <div className="mb-4" ref={hardInquiriesRef}>
      {hardCollapsed ? (
        <Card className="border border-gray-200 rounded-lg transition-all duration-300 hover:shadow-lg overflow-hidden">
          <CardHeader
            className="cursor-pointer flex flex-row items-center p-6 bg-white hover:bg-gray-50 transition-colors duration-200"
            onClick={() => {
              setHardCollapsed(false);
              setShowHardInquiries(true);
            }}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                  {totalInquiriesCount}
                </div>
                <div>
                  <h3 className="text-lg font-bold">Hard Inquiries</h3>
                  <p className={`text-sm ${recentInquiriesCount > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                    {getInquiryStatusText()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">{totalInquiriesCount} inquiries</span>
                <ChevronDown className="text-gray-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <Card
          className={`${
            showHardInquiries 
              ? 'border-2 border-gray-300' 
              : 'border border-gray-200'
          } rounded-lg transition-all duration-300 hover:shadow-lg overflow-hidden`}
        >
          <CardHeader
            className="cursor-pointer flex flex-row items-center p-6 bg-white hover:bg-gray-50 transition-colors duration-200"
            onClick={() => setShowHardInquiries(!showHardInquiries)}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                  {totalInquiriesCount}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Hard Inquiries
                  </h3>
                  <p className={`text-sm ${recentInquiriesCount > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                    {getInquiryStatusText()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">{totalInquiriesCount} inquiries</span>
                {showHardInquiries ? <ChevronUp className="text-gray-600" /> : <ChevronDown className="text-gray-600" />}
              </div>
            </div>
          </CardHeader>
          {showHardInquiries && (
            <CardContent className="bg-white">
              <Inquiries
                creditData={creditData}
                onDisputeSaved={onDisputeSaved}
                onHeaderReset={handleHeaderReset}
                onOlderInquiriesSaved={setOlderInquiriesSaved}
                onRecentInquiriesSaved={setRecentInquiriesSaved}
                onRecentInquiryDisputeSaved={onRecentInquiryDisputeSaved}
                onOlderInquiryDisputeSaved={onOlderInquiryDisputeSaved}
                initialRecentSelections={recentInquirySelections}
                initialOlderSelections={olderInquirySelections}
                initialRecentDisputeData={recentInquiryDispute}
                initialOlderDisputeData={olderInquiryDispute}
                aiViolations={aiViolations}
                aiSuggestions={aiSuggestions}
                aiScanCompleted={aiScanCompleted}
              />
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}