
'use client';
import AiForm from '@/components/admin/ai-form';

export default function AiGeneratorPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
          AI Candidate Info Generator
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Generate a biography and platform summary for a candidate using AI.
        </p>
      </header>
      <AiForm />
    </div>
  );
}
