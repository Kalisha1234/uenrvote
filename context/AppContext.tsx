
'use client';

import { createContext, useState, type ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type Candidate, type Position, type Voter, type ElectionSettings } from '@/lib/mock-data';
import { 
  getCandidates, 
  getPositions, 
  addCandidate as addCandidateService, 
  addPosition as addPositionService,
  deleteCandidate as deleteCandidateService,
  deletePosition as deletePositionService,
  getVoters,
  addVoter as addVoterService,
  updateVoter as updateVoterService,
  updateCandidateVotes,
  deleteVoter as deleteVoterService,
  updateCandidate as updateCandidateService,
  updatePosition as updatePositionService,
  getElectionSettings,
  updateElectionSettings as updateElectionSettingsService,
} from '@/lib/firebase-service';

interface User {
  id: string; // voterId or 'admin'
  username?: string; // for admin
  type: 'voter' | 'admin';
}

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (identifier: string, password?: string) => void;
  logout: () => void;
  candidates: Candidate[];
  positions: Position[];
  voters: Voter[];
  electionSettings: ElectionSettings;
  updateElectionSettings: (settings: ElectionSettings) => Promise<void>;
  hasVoted: boolean;
  castVote: (selections: { positionId: string; candidateId: number }[]) => void;
  addVoter: (voterId: string, name: string) => Promise<string>;
  updateVoter: (voterId: string, data: Partial<Omit<Voter, 'id' | 'loginCode'>>) => Promise<void>;
  deleteVoter: (voterId: string) => Promise<void>;
  addCandidate: (name: string, position: string) => Promise<void>;
  updateCandidate: (candidateId: number, data: Partial<Omit<Candidate, 'id'>>) => Promise<void>;
  deleteCandidate: (candidateId: number) => Promise<void>;
  addPosition: (title: string) => Promise<void>;
  updatePosition: (positionId: string, data: Partial<Omit<Position, 'id'>>) => Promise<void>;
  deletePosition: (positionId: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  candidates: [],
  positions: [],
  voters: [],
  electionSettings: { startTime: null, endTime: null },
  updateElectionSettings: async () => {},
  hasVoted: false,
  castVote: () => {},
  addVoter: async () => '',
  updateVoter: async () => {},
  deleteVoter: async () => {},
  addCandidate: async () => {},
  updateCandidate: async () => {},
  deleteCandidate: async () => {},
  addPosition: async () => {},
  updatePosition: async () => {},
  deletePosition: async () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [electionSettings, setElectionSettings] = useState<ElectionSettings>({ startTime: null, endTime: null });
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [fetchedPositions, fetchedCandidates, fetchedVoters, fetchedSettings] = await Promise.all([
        getPositions(),
        getCandidates(),
        getVoters(),
        getElectionSettings()
      ]);
      setPositions(fetchedPositions);
      setCandidates(fetchedCandidates);
      setVoters(fetchedVoters);
      setElectionSettings(fetchedSettings);
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const login = async (identifier: string, password?: string) => {
    if (password) { // Admin login
      if (identifier === 'admin' && password === 'password') {
        setIsAuthenticated(true);
        setUser({ id: 'admin', username: 'admin', type: 'admin' });
        router.push('/admin');
        return;
      }
      throw new Error('Invalid username or password.');
    } else { // Voter login
      // Fetch fresh voter data to ensure new voters can log in
      const currentVoters = await getVoters();
      setVoters(currentVoters);
      
      const voter = currentVoters.find(v => v.loginCode === identifier);
      if (voter) {
        setIsAuthenticated(true);
        setUser({ id: voter.id, type: 'voter' });
        setHasVoted(voter.status === 'Voted');
        router.push('/candidates');
      } else {
        throw new Error('Invalid unique code.');
      }
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setHasVoted(false);
    router.push('/login');
  };

  const castVote = async (selections: { positionId: string; candidateId: number }[]) => {
    if (!user || user.type !== 'voter') return;

    const updatedCandidates = new Map(candidates.map(c => [c.id, c.votes]));
    selections.forEach(selection => {
        const currentVotes = updatedCandidates.get(selection.candidateId) ?? 0;
        updatedCandidates.set(selection.candidateId, currentVotes + 1);
    });

    try {
        await Promise.all(
            Array.from(updatedCandidates.entries()).map(([id, votes]) => 
                updateCandidateVotes(id, votes)
            )
        );
        await updateVoterService(user.id, { status: 'Voted' });

        setCandidates(prev => prev.map(c => ({...c, votes: updatedCandidates.get(c.id) ?? c.votes})));
        setVoters(prev => prev.map(v => v.id === user.id ? { ...v, status: 'Voted' } : v));
        setHasVoted(true);

    } catch (error) {
        console.error("Error casting vote:", error);
        // Optionally revert state or show an error to the user
    }
  };

  const addVoter = async (voterId: string, name: string) => {
    if (voters.some((v) => v.id === voterId)) {
      throw new Error('A voter with this ID already exists.');
    }
    const newVoterData = { id: voterId, name, status: 'Eligible' as const };
    const newVoter = await addVoterService(newVoterData);
    setVoters((prev) => [...prev, newVoter]);
    return newVoter.loginCode;
  };

  const updateVoter = async (voterId: string, data: Partial<Omit<Voter, 'id' | 'loginCode'>>) => {
    await updateVoterService(voterId, data);
    setVoters(prev => prev.map(v => v.id === voterId ? {...v, ...data} : v));
  };
  
  const deleteVoter = async (voterId: string) => {
    await deleteVoterService(voterId);
    setVoters(prev => prev.filter(v => v.id !== voterId));
  };


  const addCandidate = async (name: string, position: string) => {
    const newCandidate = await addCandidateService(name, position);
    setCandidates(prev => [...prev, newCandidate]);
  };

  const updateCandidate = async (candidateId: number, data: Partial<Omit<Candidate, 'id'>>) => {
    await updateCandidateService(candidateId, data);
    setCandidates(prev => prev.map(c => c.id === candidateId ? {...c, ...data} : c));
  };

  const deleteCandidate = async (candidateId: number) => {
    await deleteCandidateService(candidateId);
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
  };

  const addPosition = async (title: string) => {
    const newPosition = await addPositionService(title);
    setPositions(prev => [...prev, newPosition]);
  };

  const updatePosition = async (positionId: string, data: Partial<Omit<Position, 'id'>>) => {
    await updatePositionService(positionId, data);
    setPositions(prev => prev.map(p => p.id === positionId ? {...p, ...data} : p));
  };
  
  const deletePosition = async (positionId: string) => {
    await deletePositionService(positionId);
    setPositions(prev => prev.filter(p => p.id !== positionId));
  };

  const updateElectionSettings = async (settings: ElectionSettings) => {
    await updateElectionSettingsService(settings);
    setElectionSettings(settings);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    candidates,
    positions,
    voters,
    electionSettings,
    updateElectionSettings,
    hasVoted,
    castVote,
    addVoter,
    updateVoter,
    deleteVoter,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    addPosition,
    updatePosition,
    deletePosition,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
