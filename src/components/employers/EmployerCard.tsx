import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Hammer, Users, Truck, Phone, Mail, ExternalLink } from "lucide-react";
import { getEbaStatusInfo } from "./ebaHelpers";

type EmployerWithEba = {
  id: string;
  name: string;
  abn: string | null;
  employer_type: string;
  enterprise_agreement_status: boolean | null;
  company_eba_records: {
    id: string;
    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    eba_file_number: string | null;
    fwc_document_url: string | null;
    eba_lodged_fwc: string | null;
    date_eba_signed: string | null;
    fwc_certified_date: string | null;
    sector: string | null;
  }[];
};

interface EmployerCardProps {
  employer: EmployerWithEba;
  onClick: () => void;
}

export const EmployerCard = ({ employer, onClick }: EmployerCardProps) => {
  const getEmployerTypeIcon = (type: string) => {
    switch (type) {
      case "builder": return <Hammer className="h-4 w-4" />;
      case "principal_contractor": return <Building className="h-4 w-4" />;
      case "large_contractor": return <Users className="h-4 w-4" />;
      case "small_contractor": return <Users className="h-4 w-4" />;
      case "individual": return <Truck className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const getEmployerTypeBadge = (type: string) => {
    const variants = {
      builder: "default",
      principal_contractor: "secondary", 
      large_contractor: "outline",
      small_contractor: "outline",
      individual: "destructive",
    } as const;

    const labels = {
      builder: "Builder",
      principal_contractor: "Principal Contractor",
      large_contractor: "Large Contractor", 
      small_contractor: "Small Contractor",
      individual: "Individual",
    };
    
    return (
      <Badge variant={variants[type as keyof typeof variants] || "secondary"}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const ebaStatus = employer.company_eba_records?.[0] ? getEbaStatusInfo(employer.company_eba_records[0]) : null;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            {getEmployerTypeIcon(employer.employer_type)}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">{employer.name}</CardTitle>
              {employer.abn && (
                <CardDescription className="text-sm">
                  ABN: {employer.abn}
                </CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between">
          {getEmployerTypeBadge(employer.employer_type)}
          {ebaStatus && (
            <Badge variant={ebaStatus.variant} className="text-xs">
              {ebaStatus.label}
            </Badge>
          )}
        </div>

        {employer.company_eba_records?.[0] && (
          <div className="space-y-2">
            {employer.company_eba_records[0].eba_file_number && (
              <div className="text-xs text-muted-foreground">
                EBA: {employer.company_eba_records[0].eba_file_number}
              </div>
            )}
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {employer.company_eba_records[0].contact_phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span className="truncate">{employer.company_eba_records[0].contact_phone}</span>
                </div>
              )}
              
              {employer.company_eba_records[0].contact_email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{employer.company_eba_records[0].contact_email}</span>
                </div>
              )}
            </div>

            {employer.company_eba_records[0].fwc_document_url && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(employer.company_eba_records![0].fwc_document_url!, '_blank');
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Document
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};