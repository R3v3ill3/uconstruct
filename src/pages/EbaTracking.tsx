import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Building, Phone, Mail, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface EbaRecord {
  id: string;
  employer_id: string;
  eba_file_number: string;
  sector: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  fwc_lodgement_number: string;
  fwc_matter_number: string;
  fwc_document_url: string;
  eba_data_form_received: string;
  date_draft_signing_sent: string;
  followup_phone_call: string;
  followup_email_sent: string;
  out_of_office_received: string;
  docs_prepared: string;
  date_barg_docs_sent: string;
  date_eba_signed: string;
  date_vote_occurred: string;
  eba_lodged_fwc: string;
  fwc_certified_date: string;
  comments: string;
  created_at: string;
  employers: {
    name: string;
    abn: string;
  };
}

const EbaTracking = () => {
  const [records, setRecords] = useState<EbaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchEbaRecords();
  }, []);

  const fetchEbaRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('company_eba_records')
        .select(`
          *,
          employers (
            name,
            abn
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching EBA records:', error);
      toast({
        title: "Error",
        description: "Failed to load EBA records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record =>
    record.employers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.eba_file_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressStage = (record: EbaRecord) => {
    if (record.fwc_certified_date) return { stage: "Certified", variant: "default" as const };
    if (record.eba_lodged_fwc) return { stage: "Lodged with FWC", variant: "secondary" as const };
    if (record.date_vote_occurred) return { stage: "Vote Occurred", variant: "secondary" as const };
    if (record.date_eba_signed) return { stage: "EBA Signed", variant: "secondary" as const };
    if (record.date_barg_docs_sent) return { stage: "Docs Sent", variant: "outline" as const };
    if (record.docs_prepared) return { stage: "Docs Prepared", variant: "outline" as const };
    if (record.followup_email_sent) return { stage: "Follow-up Sent", variant: "outline" as const };
    if (record.eba_data_form_received) return { stage: "Form Received", variant: "outline" as const };
    return { stage: "Initial", variant: "outline" as const };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading EBA records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">EBA Tracking</h1>
        <p className="text-muted-foreground">
          Track Enterprise Bargaining Agreement progress across companies
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search companies, EBA numbers, or sectors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">
          {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {filteredRecords.map((record) => {
          const progress = getProgressStage(record);
          return (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {record.employers?.name || 'Unknown Company'}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {record.employers?.abn && (
                        <span>ABN: {record.employers.abn}</span>
                      )}
                      {record.sector && (
                        <span>Sector: {record.sector}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant={progress.variant}>
                    {progress.stage}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">EBA Details</h4>
                    {record.eba_file_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4" />
                        File: {record.eba_file_number}
                      </div>
                    )}
                    {record.fwc_lodgement_number && (
                      <div className="text-sm">
                        FWC Lodgement: {record.fwc_lodgement_number}
                      </div>
                    )}
                     {record.fwc_matter_number && (
                       <div className="text-sm">
                         FWC Matter: {record.fwc_matter_number}
                       </div>
                     )}
                     {record.fwc_document_url && (
                       <div className="text-sm">
                         <a 
                           href={record.fwc_document_url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-primary hover:underline flex items-center gap-1"
                         >
                           <ExternalLink className="h-3 w-3" />
                           View FWC Record
                         </a>
                       </div>
                     )}
                   </div>

                   <div className="space-y-2">
                     <h4 className="font-semibold text-sm">Contact Information</h4>
                    {record.contact_name && (
                      <div className="text-sm">{record.contact_name}</div>
                    )}
                    {record.contact_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4" />
                        {record.contact_phone}
                      </div>
                    )}
                    {record.contact_email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4" />
                        {record.contact_email}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Key Dates</h4>
                    {record.eba_data_form_received && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        Form: {new Date(record.eba_data_form_received).toLocaleDateString()}
                      </div>
                    )}
                    {record.date_eba_signed && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        Signed: {new Date(record.date_eba_signed).toLocaleDateString()}
                      </div>
                    )}
                    {record.fwc_certified_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        Certified: {new Date(record.fwc_certified_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    Added {new Date(record.created_at).toLocaleDateString()}
                  </div>
                  <Link to={`/eba/${record.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRecords.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No EBA records found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Upload EBA data to start tracking progress"}
            </p>
            {!searchTerm && (
              <Link to="/upload">
                <Button className="mt-4">
                  Upload EBA Data
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EbaTracking;