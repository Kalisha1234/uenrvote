
export interface Candidate {
  id: number;
  name: string;
  position: string;
  bio: string;
  platform: string;
  votes: number;
  imageUrl: string;
}

export interface Position {
  id: string;
  title: string;
}

export interface Voter {
  id: string; // e.g. student email
  name: string;
  status: 'Eligible' | 'Voted' | 'Ineligible';
  loginCode: string;
}

export interface ElectionSettings {
  startTime: Date | null;
  endTime: Date | null;
}
