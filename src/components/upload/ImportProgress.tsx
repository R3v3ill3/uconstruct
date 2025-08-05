import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  Download, 
  Upload as UploadIcon,
  Clock,
  Database
} from "lucide-react";
import { ParsedCSV, ColumnMapping, ValidationResult } from "@/pages/Upload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImportProgressProps {
  parsedCSV: ParsedCSV;
  selectedTable: string;
  columnMappings: ColumnMapping[];
  validationResult: ValidationResult | null;
  progress: {
    status: 'idle' | 'running' | 'completed' | 'error';
    processed: number;
    total: number;
    results?: {
      inserted: number;
      updated: number;
      skipped: number;
      errors: number;
    };
  };
  onComplete: (results: any) => void;
  onReset: () => void;
}

interface ImportError {
  row: number;
  data: Record<string, any>;
  error: string;
}

const ImportProgress = ({ 
  parsedCSV, 
  selectedTable, 
  columnMappings, 
  validationResult,
  progress: initialProgress,
  onComplete, 
  onReset 
}: ImportProgressProps) => {
  const [progress, setProgress] = useState(initialProgress);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const transformRowData = (row: Record<string, any>) => {
    const transformedRow: Record<string, any> = {};
    
    columnMappings.forEach(mapping => {
      if (mapping.action === 'skip') return;
      
      let value = row[mapping.csvColumn];
      
      // Transform data based on type
      if (value !== null && value !== undefined && value !== '') {
        if (mapping.dataType === 'date' || mapping.dbColumn.includes('date')) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            value = date.toISOString().split('T')[0];
          }
        } else if (mapping.dataType === 'number') {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            value = num;
          }
        } else if (mapping.dataType === 'boolean') {
          value = ['true', 'yes', '1', 'y'].includes(String(value).toLowerCase());
        } else if (mapping.dataType === 'array') {
          // Handle arrays (split by comma)
          value = String(value).split(',').map(v => v.trim()).filter(Boolean);
        }
      } else {
        value = null;
      }
      
      transformedRow[mapping.dbColumn] = value;
    });
    
    return transformedRow;
  };

  const performImport = async () => {
    setStartTime(new Date());
    setProgress(prev => ({ ...prev, status: 'running', processed: 0 }));
    
    const batchSize = 100;
    const totalRows = parsedCSV.rows.length;
    let processed = 0;
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const importErrorList: ImportError[] = [];

    try {
      // Process in batches
      for (let i = 0; i < totalRows; i += batchSize) {
        const batch = parsedCSV.rows.slice(i, i + batchSize);
        const transformedBatch = batch.map(transformRowData);
        
        // Insert batch into database
        console.log('Inserting batch:', transformedBatch.slice(0, 2)); // Log first 2 rows for debugging
        const { data, error } = await supabase
          .from(selectedTable as any)
          .insert(transformedBatch)
          .select();

        if (error) {
          console.log('Batch error:', error.message, error.details);
          // Handle batch error - try individual rows
          for (let j = 0; j < transformedBatch.length; j++) {
            const rowData = transformedBatch[j];
            console.log('Trying individual row:', rowData);
            const { error: rowError } = await supabase
              .from(selectedTable as any)
              .insert([rowData]);
            
            if (rowError) {
              console.log('Row error:', rowError.message, rowError.details);
              errors++;
              importErrorList.push({
                row: i + j + 2, // +2 for header and 0-based index
                data: rowData,
                error: rowError.message
              });
            } else {
              inserted++;
            }
          }
        } else {
          inserted += data?.length || transformedBatch.length;
        }
        
        processed += batch.length;
        setProgress(prev => ({ 
          ...prev, 
          processed,
          total: totalRows
        }));

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setEndTime(new Date());
      setImportErrors(importErrorList);
      
      const results = { inserted, updated, skipped, errors };
      setProgress(prev => ({ 
        ...prev, 
        status: 'completed',
        results 
      }));
      
      onComplete(results);
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${inserted} records with ${errors} errors.`,
        variant: errors > 0 ? "destructive" : "default"
      });

    } catch (error) {
      setEndTime(new Date());
      setProgress(prev => ({ ...prev, status: 'error' }));
      
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (progress.status === 'idle') {
      // Auto-start import when component mounts
      performImport();
    }
  }, []);

  const getProgressPercentage = () => {
    if (progress.total === 0) return 0;
    return (progress.processed / progress.total) * 100;
  };

  const getDuration = () => {
    if (!startTime) return null;
    const end = endTime || new Date();
    const durationMs = end.getTime() - startTime.getTime();
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const downloadErrorReport = () => {
    if (importErrors.length === 0) return;
    
    const csvContent = [
      ['Row', 'Error', 'Data'],
      ...importErrors.map(err => [
        err.row.toString(),
        err.error,
        JSON.stringify(err.data)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-errors-${selectedTable}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Import Progress
          </CardTitle>
          <CardDescription>
            Importing {parsedCSV.rows.length.toLocaleString()} rows into {selectedTable} table
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {progress.status === 'running' && (
                  <Clock className="h-4 w-4 animate-spin" />
                )}
                {progress.status === 'completed' && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                {progress.status === 'error' && (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">
                  {progress.status === 'running' && 'Importing data...'}
                  {progress.status === 'completed' && 'Import completed'}
                  {progress.status === 'error' && 'Import failed'}
                  {progress.status === 'idle' && 'Preparing import...'}
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {progress.processed.toLocaleString()} / {progress.total.toLocaleString()} rows
                {getDuration() && ` • ${getDuration()}`}
              </div>
            </div>
            
            <Progress value={getProgressPercentage()} className="w-full" />
          </div>

          {/* Results Summary */}
          {progress.results && (
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {progress.results.inserted.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Inserted</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">
                  {progress.results.updated.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Updated</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-600">
                  {progress.results.skipped.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">
                  {progress.results.errors.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {progress.status === 'completed' && progress.results && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Import completed successfully! {progress.results.inserted} records were imported
                {progress.results.errors > 0 && ` with ${progress.results.errors} errors`}.
              </AlertDescription>
            </Alert>
          )}

          {progress.status === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Import failed due to an error. Please check your data and try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Details */}
          {importErrors.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Import Errors ({importErrors.length})
                </CardTitle>
                <Button variant="outline" size="sm" onClick={downloadErrorReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {importErrors.slice(0, 10).map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">Row {error.row}</div>
                            <div className="text-sm text-red-700 mt-1">{error.error}</div>
                            <div className="text-xs text-gray-600 mt-2">
                              Data: {JSON.stringify(error.data).substring(0, 100)}...
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {importErrors.length > 10 && (
                      <div className="text-center py-2 text-sm text-muted-foreground">
                        ... and {importErrors.length - 10} more errors. Download the full report for details.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Import Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Import Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Source file:</span>
                <span className="font-medium">{parsedCSV.filename}</span>
              </div>
              <div className="flex justify-between">
                <span>Target table:</span>
                <span className="font-medium">{selectedTable}</span>
              </div>
              <div className="flex justify-between">
                <span>Columns mapped:</span>
                <span className="font-medium">{columnMappings.filter(m => m.action !== 'skip').length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total rows processed:</span>
                <span className="font-medium">{progress.processed.toLocaleString()}</span>
              </div>
              {startTime && (
                <div className="flex justify-between">
                  <span>Started:</span>
                  <span className="font-medium">{startTime.toLocaleTimeString()}</span>
                </div>
              )}
              {endTime && (
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-medium">{endTime.toLocaleTimeString()}</span>
                </div>
              )}
              {getDuration() && (
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{getDuration()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Import Another File
        </Button>
        
        {progress.status === 'completed' && (
          <Button onClick={() => window.location.reload()}>
            View Imported Data
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImportProgress;