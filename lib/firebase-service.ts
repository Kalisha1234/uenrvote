// src/lib/firebase-service.ts
import { collection, getDocs, getFirestore, addDoc, serverTimestamp, doc, setDoc, updateDoc, deleteDoc, getDoc, Timestamp } from 'firebase/firestore';
import app from './firebase';
import type { Candidate, Position, Voter, ElectionSettings } from './mock-data';

const db = getFirestore(app);

// Position Functions
export async function getPositions(): Promise<Position[]> {
  const positionsCol = collection(db, 'positions');
  const positionSnapshot = await getDocs(positionsCol);
  const positionList = positionSnapshot.docs.map(doc => doc.data() as Position);
  return positionList;
}

export async function addPosition(title: string): Promise<Position> {
  const newPosition = {
    id: title.toLowerCase().replace(/\s+/g, '-'), // e.g., "Student Body President" -> "student-body-president"
    title: title,
  };
  const positionRef = doc(db, 'positions', newPosition.id);
  await setDoc(positionRef, newPosition);
  return newPosition;
}

export async function updatePosition(positionId: string, data: Partial<Omit<Position, 'id'>>): Promise<void> {
    const positionRef = doc(db, 'positions', positionId);
    await updateDoc(positionRef, data);
}

export async function deletePosition(positionId: string): Promise<void> {
    const positionRef = doc(db, 'positions', positionId);
    await deleteDoc(positionRef);
}

// Candidate Functions
export async function getCandidates(): Promise<Candidate[]> {
  const candidatesCol = collection(db, 'candidates');
  const candidateSnapshot = await getDocs(candidatesCol);
  const candidateList = candidateSnapshot.docs.map(doc => ({ ...doc.data(), id: Number(doc.id) } as Candidate));
  return candidateList.sort((a, b) => a.id - b.id);
}

export async function addCandidate(name: string, position: string): Promise<Candidate> {
    const candidatesCol = collection(db, 'candidates');
    const allCandidates = await getDocs(candidatesCol);
    const highestId = allCandidates.docs.reduce((maxId, doc) => {
        const id = Number(doc.id);
        return id > maxId ? id : maxId;
    }, 0);
    const newId = highestId + 1;
    const initials = name.split(' ').map(n => n[0]).join('');
    const newCandidateData = {
        id: newId,
        name,
        position,
        bio: 'A newly added candidate. Please update their biography.',
        platform: 'The platform for this candidate has not been set yet.',
        votes: 0,
        imageUrl: `https://placehold.co/400x400/EBF4FF/76A9FA?text=${initials}`,
    };
    const candidateRef = doc(db, 'candidates', String(newId));
    await setDoc(candidateRef, newCandidateData);
    return newCandidateData;
}

export async function updateCandidate(candidateId: number, data: Partial<Omit<Candidate, 'id'>>): Promise<void> {
    const candidateRef = doc(db, 'candidates', String(candidateId));
    await updateDoc(candidateRef, data);
}

export async function updateCandidateVotes(candidateId: number, newVoteCount: number): Promise<void> {
    const candidateRef = doc(db, 'candidates', String(candidateId));
    await updateDoc(candidateRef, { votes: newVoteCount });
}

export async function deleteCandidate(candidateId: number): Promise<void> {
    const candidateRef = doc(db, 'candidates', String(candidateId));
    await deleteDoc(candidateRef);
}


// Voter Functions
export async function getVoters(): Promise<Voter[]> {
    const votersCol = collection(db, 'voters');
    const voterSnapshot = await getDocs(votersCol);
    return voterSnapshot.docs.map(doc => ({ ...doc.data() } as Voter));
}

export async function addVoter(voter: Omit<Voter, 'loginCode'>): Promise<Voter> {
    const newLoginCode = `VOTE${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newVoter: Voter = { ...voter, loginCode: newLoginCode };
    const voterRef = doc(db, 'voters', newVoter.id);
    await setDoc(voterRef, newVoter);
    return newVoter;
}

export async function updateVoter(voterId: string, data: Partial<Voter>): Promise<void> {
    const voterRef = doc(db, 'voters', voterId);
    await updateDoc(voterRef, data);
}

export async function deleteVoter(voterId: string): Promise<void> {
    const voterRef = doc(db, 'voters', voterId);
    await deleteDoc(voterRef);
}

// Election Settings Functions
export async function getElectionSettings(): Promise<ElectionSettings> {
    const settingsRef = doc(db, 'settings', 'election');
    const docSnap = await getDoc(settingsRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            startTime: data.startTime ? (data.startTime as Timestamp).toDate() : null,
            endTime: data.endTime ? (data.endTime as Timestamp).toDate() : null,
        };
    }
    return { startTime: null, endTime: null };
}

export async function updateElectionSettings(settings: ElectionSettings): Promise<void> {
    const settingsRef = doc(db, 'settings', 'election');
    const dataToUpdate: { startTime?: Timestamp | null; endTime?: Timestamp | null } = {};
    if (settings.startTime) {
        dataToUpdate.startTime = Timestamp.fromDate(settings.startTime);
    }
    if (settings.endTime) {
        dataToUpdate.endTime = Timestamp.fromDate(settings.endTime);
    }
    await setDoc(settingsRef, dataToUpdate, { merge: true });
}
