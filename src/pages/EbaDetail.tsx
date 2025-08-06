import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Calendar, Phone, Mail, FileText, Edit, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  updated_at: string;
  employers: {
    name: string;
    abn: string;
    email: string;
    phone: string;
  };
}

const EbaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<EbaRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchEbaRecord(id);
    }
  }, [id]);

  const fetchEbaRecord = async (recordId: string) => {
    try {
      const { data, error } = await supabase
        .from('company_eba_records')
        .select(`
          *,
          employers (
            name,
            abn,
            email,
            phone
          )
        `)
        .eq('id', recordId)
        .single();

      if (error) throw error;
      setRecord(data);
    } catch (error) {
      console.error('Error fetching EBA record:', error);
      toast({
        title: "Error",
        description: "Failed to load EBA record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const workflowSteps = [
    { key: 'eba_data_form_received', label: 'EBA Data Form Received', icon: FileText },
    { key: 'date_draft_signing_sent', label: 'Draft Signing Sent', icon: FileText },
    { key: 'followup_phone_call', label: 'Follow-up Phone Call', icon: Phone },
    { key: 'followup_email_sent', label: 'Follow-up Email Sent', icon: Mail },
    { key: 'out_of_office_received', label: 'Out of Office Received', icon: Mail },
    { key: 'docs_prepared', label: 'Documents Prepared', icon: FileText },
    { key: 'date_barg_docs_sent', label: 'Bargaining Docs Sent', icon: FileText },
    { key: 'date_eba_signed', label: 'EBA Signed', icon: CheckCircle },
    { key: 'date_vote_occurred', label: 'Vote Occurred', icon: CheckCircle },
    { key: 'eba_lodged_fwc', label: 'EBA Lodged with FWC', icon: FileText },
    { key: 'fwc_certified_date', label: 'FWC Certified', icon: CheckCircle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading EBA record...</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="space-y-4">
        <Link to="/eba">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to EBA Tracking
          </Button>
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">EBA record not found</h3>
            <p className="text-muted-foreground">The requested EBA record could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/eba">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to EBA Tracking
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{record.employers?.name || 'Unknown Company'}</h1>
          <p className="text-muted-foreground">EBA Progress Detail</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company Name</label>
              <p className="text-sm">{record.employers?.name || 'N/A'}</p>
            </div>
            {record.employers?.abn && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">ABN</label>
                <p className="text-sm">{record.employers.abn}</p>
              </div>
            )}
            {record.sector && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sector</label>
                <p className="text-sm">{record.sector}</p>
              </div>
            )}
            {record.employers?.email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company Email</label>
                <p className="text-sm">{record.employers.email}</p>
              </div>
            )}
            {record.employers?.phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company Phone</label>
                <p className="text-sm">{record.employers.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              EBA Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {record.contact_name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Name</label>
                <p className="text-sm">{record.contact_name}</p>
              </div>
            )}
            {record.contact_phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-sm">{record.contact_phone}</p>
              </div>
            )}
            {record.contact_email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{record.contact_email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* EBA Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              EBA References
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {record.eba_file_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">EBA File Number</label>
                <p className="text-sm">{record.eba_file_number}</p>
              </div>
            )}
            {record.fwc_lodgement_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">FWC Lodgement Number</label>
                <p className="text-sm">{record.fwc_lodgement_number}</p>
              </div>
            )}
            {record.fwc_matter_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">FWC Matter Number</label>
                <p className="text-sm">{record.fwc_matter_number}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              EBA Workflow Progress
            </CardTitle>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Dates
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const date = record[step.key as keyof EbaRecord] as string;
              const isCompleted = !!date;
              const isNext = !isCompleted && workflowSteps.slice(0, index).every(s => record[s.key as keyof EbaRecord]);
              
              return (
                <div key={step.key} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className={`flex-shrink-0 ${isCompleted ? 'text-green-600' : isNext ? 'text-blue-600' : 'text-muted-foreground'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isCompleted ? 'text-green-600' : isNext ? 'text-blue-600' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                      {isCompleted && <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>}
                      {isNext && <Badge variant="outline" className="text-blue-600 border-blue-600">Next</Badge>}
                    </div>
                    {date && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      {record.comments && (
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{record.comments}</p>
          </CardContent>
        </Card>
      )}

      {/* Record Information */}
      <Card>
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-muted-foreground">Created</label>
              <p>{new Date(record.created_at).toLocaleString()}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">Last Updated</label>
              <p>{new Date(record.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EbaDetail;