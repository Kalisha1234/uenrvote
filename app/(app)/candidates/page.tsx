'use client';

import { useContext } from 'react';
import CandidateCard from '@/components/candidate-card';
import { AppContext } from '@/context/AppContext';
import { motion } from 'framer-motion';

export default function CandidatesPage() {
  const { candidates } = useContext(AppContext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
          Meet the Candidates
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Learn more about the candidates running for student government.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <CandidateCard candidate={candidate} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
