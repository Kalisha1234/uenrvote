
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

export default function ReportsPage() {
  const { candidates, voters } = useContext(AppContext);

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTurnout = () => {
    const reportData = candidates.map(({ name, position, votes }) => ({
      candidateName: name,
      position,
      votes,
    }));
    downloadCSV(reportData, 'election-turnout-report.csv');
  };
  
  const handleDownloadAudit = () => {
    // This is a simplified audit log for demonstration
    const auditData = voters
      .filter(v => v.status === 'Voted')
      .map(v => ({
        voterId: v.id,
        action: 'Casted Vote',
        timestamp: new Date().toISOString(),
      }));
    downloadCSV(auditData, 'election-audit-log.csv');
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
          Reporting & Analytics
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          View voter turnout, audit logs, and download reports.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Election Results</CardTitle>
            <CardDescription>Download a report of the final vote count.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">The report will be generated in CSV format and include all candidates and their vote totals.</p>
          </CardContent>
          <div className="border-t p-4">
            <Button variant="outline" className="w-full" onClick={handleDownloadTurnout}>
                <Download className="mr-2" />
                Download Turnout Report
            </Button>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Audit Logs</CardTitle>
            <CardDescription>Track key events and actions.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground">Download a CSV file of all voting activity. For demonstration, timestamps are generated on demand.</p>
          </CardContent>
          <div className="border-t p-4">
            <Button variant="outline" className="w-full" onClick={handleDownloadAudit}>
                <Download className="mr-2" />
                Download Audit Logs
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
