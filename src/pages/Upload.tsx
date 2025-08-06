import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FileUpload from "@/components/upload/FileUpload";
import ColumnMapper from "@/components/upload/ColumnMapper";
import DataPreview from "@/components/upload/DataPreview";
import ImportProgress from "@/components/upload/ImportProgress";
import WorkerImport from "@/components/upload/WorkerImport";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Clock, Building, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, any>[];
  filename: string;
}

export interface ColumnMapping {
  csvColumn: string;
  dbTable: string;
  dbColumn: string;
  action: 'map' | 'create' | 'skip';
  dataType?: string;
  confidence?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    column: string;
    message: string;
    value: any;
  }>;
  warnings: Array<{
    row: number;
    column: string;
    message: string;
    value: any;
  }>;
}

const Upload = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'import'>('upload');
  const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [selectedEmployer, setSelectedEmployer] = useState<{id: string, name: string} | null>(null);
  const [isAddEmployerOpen, setIsAddEmployerOpen] = useState(false);
  const [newEmployerName, setNewEmployerName] = useState('');
  const [importProgress, setImportProgress] = useState<{
    status: 'idle' | 'running' | 'completed' | 'error';
    processed: number;
    total: number;
    results?: {
      inserted: number;
      updated: number;
      skipped: number;
      errors: number;
    };
  }>({ status: 'idle', processed: 0, total: 0 });

  // Get URL parameters for pre-selected employer
  const preSelectedEmployerId = searchParams.get('employerId');
  const preSelectedEmployerName = searchParams.get('employerName');
  
  // Load employers for selection
  const { data: employers } = useQuery({
    queryKey: ['employers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employers')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Set pre-selected employer from URL params
  useEffect(() => {
    if (preSelectedEmployerId && preSelectedEmployerName && !selectedEmployer) {
      setSelectedEmployer({
        id: preSelectedEmployerId,
        name: decodeURIComponent(preSelectedEmployerName)
      });
      setSelectedTable('workers'); // Auto-select workers table
    }
  }, [preSelectedEmployerId, preSelectedEmployerName, selectedEmployer]);

  // Add new employer mutation
  const addEmployerMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('employers')
        .insert({
          name,
          employer_type: 'large_contractor'
        })
        .select('id, name')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (newEmployer) => {
      setSelectedEmployer(newEmployer);
      setSelectedTable('workers');
      setIsAddEmployerOpen(false);
      setNewEmployerName('');
      queryClient.invalidateQueries({ queryKey: ['employers'] });
      toast({
        title: "Employer added",
        description: `${newEmployer.name} has been added successfully.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding employer",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileUploaded = (csv: ParsedCSV) => {
    setParsedCSV(csv);
    setStep('mapping');
  };

  const handleMappingComplete = (table: string, mappings: ColumnMapping[]) => {
    setSelectedTable(table);
    setColumnMappings(mappings);
    setStep('preview');
  };

  const handleValidationComplete = (result: ValidationResult) => {
    setValidationResult(result);
  };

  const handleImportStart = () => {
    setStep('import');
    setImportProgress(prev => ({ ...prev, status: 'running' }));
  };

  const getStepStatus = (stepName: string) => {
    const currentSteps = ['upload', 'mapping', 'preview', 'import'];
    const currentIndex = currentSteps.indexOf(step);
    const stepIndex = currentSteps.indexOf(stepName);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'current': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const resetUpload = () => {
    setStep('upload');
    setParsedCSV(null);
    setSelectedTable(preSelectedEmployerId ? 'workers' : '');
    setColumnMappings([]);
    setValidationResult(null);
    setImportProgress({ status: 'idle', processed: 0, total: 0 });
    // Keep selected employer if it was pre-selected from URL
    if (!preSelectedEmployerId) {
      setSelectedEmployer(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Upload</h1>
          <p className="text-muted-foreground">
            {selectedEmployer 
              ? `Upload workers for ${selectedEmployer.name}` 
              : "Import CSV data with intelligent mapping and validation"
            }
          </p>
        </div>
        {step !== 'upload' && (
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-secondary"
            onClick={resetUpload}
          >
            Start New Upload
          </Badge>
        )}
      </div>

      {/* Company Selection for Workers Upload */}
      {selectedTable === 'workers' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Select Company
            </CardTitle>
            <CardDescription>
              Choose the company these workers will be associated with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="employer-select">Company</Label>
                <Select
                  value={selectedEmployer?.id || ''}
                  onValueChange={(value) => {
                    const employer = employers?.find(e => e.id === value);
                    if (employer) setSelectedEmployer(employer);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employers?.map((employer) => (
                      <SelectItem key={employer.id} value={employer.id}>
                        {employer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isAddEmployerOpen} onOpenChange={setIsAddEmployerOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Company
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Company</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        value={newEmployerName}
                        onChange={(e) => setNewEmployerName(e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => addEmployerMutation.mutate(newEmployerName)}
                        disabled={!newEmployerName.trim() || addEmployerMutation.isPending}
                      >
                        {addEmployerMutation.isPending ? 'Adding...' : 'Add Company'}
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddEmployerOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {selectedEmployer && (
              <div className="mt-3">
                <Badge variant="secondary">
                  Selected: {selectedEmployer.name}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Progress</CardTitle>
          <CardDescription>Follow these steps to import your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {[
              { key: 'upload', label: 'Upload File' },
              { key: 'mapping', label: 'Map Columns' },
              { key: 'preview', label: 'Preview & Validate' },
              { key: 'import', label: 'Import Data' }
            ].map((stepItem, index) => {
              const status = getStepStatus(stepItem.key);
              return (
                <div key={stepItem.key} className="flex items-center space-x-2">
                  {getStepIcon(status)}
                  <span className={`text-sm ${
                    status === 'completed' ? 'text-green-600' :
                    status === 'current' ? 'text-blue-600' :
                    'text-gray-400'
                  }`}>
                    {stepItem.label}
                  </span>
                  {index < 3 && <span className="text-gray-300">→</span>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={step} className="space-y-6">
        <TabsContent value="upload">
          <FileUpload 
            onFileUploaded={handleFileUploaded}
          />
        </TabsContent>

        <TabsContent value="mapping">
          {parsedCSV && (
            <ColumnMapper
              parsedCSV={parsedCSV}
              onMappingComplete={handleMappingComplete}
              onBack={() => setStep('upload')}
            />
          )}
        </TabsContent>

        <TabsContent value="preview">
          {parsedCSV && columnMappings.length > 0 && selectedTable === 'workers' && selectedEmployer ? (
            <WorkerImport
              csvData={parsedCSV.rows}
              selectedEmployer={selectedEmployer}
              onImportComplete={(results) => {
                setImportProgress(prev => ({ 
                  ...prev, 
                  status: 'completed',
                  results: {
                    inserted: results.successful,
                    updated: results.duplicates,
                    skipped: 0,
                    errors: results.failed
                  }
                }));
                setStep('import');
              }}
              onBack={() => setStep('mapping')}
            />
          ) : parsedCSV && columnMappings.length > 0 ? (
            <DataPreview
              parsedCSV={parsedCSV}
              selectedTable={selectedTable}
              columnMappings={columnMappings}
              onValidationComplete={handleValidationComplete}
              onImportStart={handleImportStart}
              onBack={() => setStep('mapping')}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="import">
          {selectedTable === 'workers' ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Workers Import Complete</h3>
                <p className="text-muted-foreground">
                  Successfully imported workers for {selectedEmployer?.name}
                </p>
              </div>
              <Button onClick={resetUpload}>Start New Upload</Button>
            </div>
          ) : parsedCSV && columnMappings.length > 0 ? (
            <ImportProgress
              parsedCSV={parsedCSV}
              selectedTable={selectedTable}
              columnMappings={columnMappings}
              validationResult={validationResult}
              progress={importProgress}
              onComplete={(results) => {
                setImportProgress(prev => ({ 
                  ...prev, 
                  status: 'completed',
                  results 
                }));
              }}
              onReset={resetUpload}
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Upload;