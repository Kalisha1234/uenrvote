
'use client';

import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/context/AppContext';
import VoteForm from '@/components/vote-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, TimerOff, Info, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Countdown from '@/components/countdown';

export default function VotePage() {
  const { isAuthenticated, hasVoted, electionSettings } = useContext(AppContext);
  const [votingStatus, setVotingStatus] = useState<'open' | 'closed' | 'pending'>('pending');
  const [statusMessage, setStatusMessage] = useState('');
  const [countdownTarget, setCountdownTarget] = useState<Date | null>(null);

  useEffect(() => {
    if (electionSettings.startTime && electionSettings.endTime) {
      const now = new Date();
      if (now < electionSettings.startTime) {
        setVotingStatus('pending');
        setStatusMessage(`Voting opens on ${format(electionSettings.startTime, "PPP 'at' p")}.`);
        setCountdownTarget(electionSettings.startTime);
      } else if (now > electionSettings.endTime) {
        setVotingStatus('closed');
        setStatusMessage('The voting period has ended. Thank you for your participation.');
        setCountdownTarget(null);
      } else {
        setVotingStatus('open');
        setStatusMessage(`Voting is open and will close on ${format(electionSettings.endTime, "PPP 'at' p")}.`);
        setCountdownTarget(electionSettings.endTime);
      }
    } else {
        // If no times are set, voting is always open.
        setVotingStatus('open');
        setCountdownTarget(null);
    }
  }, [electionSettings]);
  
  const renderContent = () => {
    if (!isAuthenticated) {
        return (
            <Card className="text-center">
                <CardHeader>
                <CardTitle>Please Login to Vote</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="mb-4">You must be logged in to participate in the election.</p>
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
                </CardContent>
            </Card>
        )
    }
    
    if (hasVoted) {
        return (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Alert variant="default" className="bg-primary text-primary-foreground border-primary-foreground/20">
                    <CheckCircle className="h-5 w-5 !text-primary-foreground" />
                    <AlertTitle className="font-bold">Thank You for Voting!</AlertTitle>
                    <AlertDescription>
                    Your vote has been successfully recorded. Results will be available after the voting period ends.
                    </AlertDescription>
                </Alert>
            </motion.div>
        )
    }

    if (votingStatus === 'open') {
        return (
          <>
            {countdownTarget && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>
                    {votingStatus === 'open' ? 'Voting Closes In' : 'Voting Opens In'}
                </AlertTitle>
                <AlertDescription className="flex flex-col gap-2">
                    <Countdown targetDate={countdownTarget} />
                    <span>{statusMessage}</span>
                </AlertDescription>
              </Alert>
            )}
            <VoteForm />
          </>
        );
    }

    return (
        <Card>
            <CardHeader className="text-center">
                {votingStatus === 'pending' ? <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" /> : <TimerOff className="mx-auto h-12 w-12 text-muted-foreground mb-4" />}
                <CardTitle className="font-headline text-2xl">{votingStatus === 'pending' ? 'Voting Has Not Started' : 'Voting is Closed'}</CardTitle>
                {countdownTarget && (
                     <div className="pt-4">
                        <Countdown targetDate={countdownTarget} />
                    </div>
                )}
                <CardDescription>{statusMessage}</CardDescription>
            </CardHeader>
        </Card>
    )

  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
          Cast Your Vote
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Make your voice heard. Select one candidate for each position.
        </p>
      </header>
      <div className="space-y-6">
        {renderContent()}
      </div>
    </motion.div>
  );
}
