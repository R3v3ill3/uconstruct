import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "@/components/upload/FileUpload";
import ColumnMapper from "@/components/upload/ColumnMapper";
import DataPreview from "@/components/upload/DataPreview";
import ImportProgress from "@/components/upload/ImportProgress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

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
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'import'>('upload');
  const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
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
    setSelectedTable('');
    setColumnMappings([]);
    setValidationResult(null);
    setImportProgress({ status: 'idle', processed: 0, total: 0 });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Upload</h1>
          <p className="text-muted-foreground">Import CSV data with intelligent mapping and validation</p>
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
          <FileUpload onFileUploaded={handleFileUploaded} />
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
          {parsedCSV && columnMappings.length > 0 && (
            <DataPreview
              parsedCSV={parsedCSV}
              selectedTable={selectedTable}
              columnMappings={columnMappings}
              onValidationComplete={handleValidationComplete}
              onImportStart={handleImportStart}
              onBack={() => setStep('mapping')}
            />
          )}
        </TabsContent>

        <TabsContent value="import">
          {parsedCSV && columnMappings.length > 0 && (
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Upload;