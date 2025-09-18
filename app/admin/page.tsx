
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Vote, Users, BarChart3, Bot, UserCheck, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import { Progress } from '@/components/ui/progress';
import ResultsCharts from '@/components/results-charts';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboardPage() {
  const { candidates, voters, positions } = useContext(AppContext);

  const totalVotes = candidates.reduce((acc, c) => acc + c.votes, 0);
  const eligibleVoters = voters.filter((v) => v.status !== 'Ineligible').length;
  const votersWhoVoted = voters.filter((v) => v.status === 'Voted').length;
  const turnoutPercentage = eligibleVoters > 0 ? (votersWhoVoted / eligibleVoters) * 100 : 0;
  
  const adminFeatures = [
    {
      title: 'Election Management',
      description: 'Control voting periods and manage positions and candidates.',
      icon: Vote,
      href: '/admin/election',
      cta: 'Manage Election',
    },
    {
      title: 'Voter Management',
      description: 'Import, export, and manage the list of eligible voters.',
      icon: Users,
      href: '/admin/voters',
      cta: 'Manage Voters',
    },
    {
      title: 'Reporting & Analytics',
      description: 'View voter turnout, audit logs, and download reports.',
      icon: BarChart3,
      href: '/admin/reports',
      cta: 'View Reports',
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Oversee and manage the student government election.
        </p>
      </header>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="font-headline">Live Voting Progress</CardTitle>
                <CardDescription>An overview of voter turnout.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-medium text-muted-foreground">Total Votes Cast</p>
                <p className="text-2xl font-bold">{totalVotes}</p>
              </div>
              <div className="space-y-2">
                <Progress value={turnoutPercentage} />
                <p className="text-sm text-muted-foreground text-right">{votersWhoVoted} of {eligibleVoters} eligible voters have participated ({turnoutPercentage.toFixed(1)}%).</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="font-headline">Live Election Results</CardTitle>
                <CardDescription>A real-time overview of votes per candidate.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {positions.map((position, index) => (
              <div key={position.id}>
                <h3 className="text-lg font-semibold mb-2">{position.title}</h3>
                <ResultsCharts position={position.title} />
                {index < positions.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {adminFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
          >
            <Card className="flex h-full flex-col">
              <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="font-headline">{feature.title}</CardTitle>
                  <CardDescription className="mt-1">{feature.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1" />
              <div className="border-t p-4">
                <Button asChild className="w-full">
                  <Link href={feature.href}>{feature.cta}</Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
