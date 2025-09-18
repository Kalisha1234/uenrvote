'use client';
import ImageGeneratorForm from '@/components/admin/image-generator-form';

export default function ImageGeneratorPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
          AI Image Generator
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Create unique portraits for candidates using a text prompt.
        </p>
      </header>
      <ImageGeneratorForm />
    </div>
  );
}
