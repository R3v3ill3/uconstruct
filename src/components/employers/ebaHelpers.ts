export type EbaStatusInfo = {
  status: string;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
};

export function getEbaStatusInfo(ebaRecord: any): EbaStatusInfo {
  if (ebaRecord.fwc_certified_date) {
    return {
      status: "certified",
      label: "Certified",
      variant: "default"
    };
  }
  
  if (ebaRecord.date_eba_signed) {
    return {
      status: "signed",
      label: "Signed",
      variant: "secondary"
    };
  }
  
  if (ebaRecord.eba_lodged_fwc) {
    return {
      status: "lodged",
      label: "Lodged with FWC",
      variant: "outline"
    };
  }
  
  if (ebaRecord.eba_data_form_received || ebaRecord.date_draft_signing_sent || ebaRecord.date_barg_docs_sent) {
    return {
      status: "in_progress",
      label: "In Progress",
      variant: "outline"
    };
  }
  
  return {
    status: "no_eba",
    label: "No EBA",
    variant: "destructive"
  };
}

export function getEbaProgress(ebaRecord: any): { stage: string; percentage: number } {
  const stages = [
    { key: 'eba_data_form_received', label: 'Form Received' },
    { key: 'date_barg_docs_sent', label: 'Docs Sent' },
    { key: 'date_draft_signing_sent', label: 'Draft Sent' },
    { key: 'date_eba_signed', label: 'Signed' },
    { key: 'eba_lodged_fwc', label: 'Lodged' },
    { key: 'fwc_certified_date', label: 'Certified' }
  ];
  
  let completedStages = 0;
  let currentStage = 'Not Started';
  
  for (const stage of stages) {
    if (ebaRecord[stage.key]) {
      completedStages++;
      currentStage = stage.label;
    } else {
      break;
    }
  }
  
  return {
    stage: currentStage,
    percentage: Math.round((completedStages / stages.length) * 100)
  };
}