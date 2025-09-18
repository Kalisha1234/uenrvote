'use client';

import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResultsCharts from '@/components/results-charts';
import { motion } from 'framer-motion';

export default function ResultsPage() {
  const { positions } = useContext(AppContext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
          Live Election Results
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Watch the results update in real-time as votes are counted.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
        {positions.map((position) => (
          <motion.div
            key={position.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * positions.indexOf(position) }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">{position.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResultsCharts position={position.title} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
