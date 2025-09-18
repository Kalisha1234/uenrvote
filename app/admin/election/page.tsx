
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AppContext } from '@/context/AppContext';
import { Pencil, PlusCircle, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Candidate, Position, ElectionSettings } from '@/lib/mock-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ElectionManagementPage() {
  const { positions, candidates, addCandidate, addPosition, deleteCandidate, deletePosition, updateCandidate, updatePosition, electionSettings, updateElectionSettings } = useContext(AppContext);
  const [isCandidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [isPositionDialogOpen, setPositionDialogOpen] = useState(false);
  
  const [isEditingCandidate, setIsEditingCandidate] = useState(false);
  const [isEditingPosition, setIsEditingPosition] = useState(false);

  const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);

  const [newCandidateName, setNewCandidateName] = useState('');
  const [newPositionTitle, setNewPositionTitle] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [candidateBio, setCandidateBio] = useState('');
  const [candidatePlatform, setCandidatePlatform] = useState('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'candidate' | 'position'; data: Candidate | Position } | null>(null);
  
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (electionSettings) {
      setStartTime(electionSettings.startTime);
      setEndTime(electionSettings.endTime);
    }
  }, [electionSettings]);

  const handleOpenNewCandidateDialog = () => {
    setIsEditingCandidate(false);
    setNewCandidateName('');
    setSelectedPosition('');
    setCandidateBio('');
    setCandidatePlatform('');
    setCandidateDialogOpen(true);
  }

  const handleOpenEditCandidateDialog = (candidate: Candidate) => {
    setIsEditingCandidate(true);
    setCurrentCandidate(candidate);
    setNewCandidateName(candidate.name);
    setSelectedPosition(candidate.position);
    setCandidateBio(candidate.bio);
    setCandidatePlatform(candidate.platform);
    setCandidateDialogOpen(true);
  }

  const handleOpenNewPositionDialog = () => {
    setIsEditingPosition(false);
    setNewPositionTitle('');
    setPositionDialogOpen(true);
  }
  
  const handleOpenEditPositionDialog = (position: Position) => {
    setIsEditingPosition(true);
    setCurrentPosition(position);
    setNewPositionTitle(position.title);
    setPositionDialogOpen(true);
  }

  const handleSaveCandidate = async () => {
    if (!newCandidateName.trim() || !selectedPosition) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a name and select a position.',
      });
      return;
    }
    try {
      if (isEditingCandidate && currentCandidate) {
        await updateCandidate(currentCandidate.id, { name: newCandidateName, position: selectedPosition, bio: candidateBio, platform: candidatePlatform });
        toast({
            title: 'Success!',
            description: `Candidate "${newCandidateName}" has been updated.`,
          });
      } else {
        await addCandidate(newCandidateName, selectedPosition);
        toast({
            title: 'Success!',
            description: `Candidate "${newCandidateName}" has been added.`,
        });
      }
      setCandidateDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: `Error ${isEditingCandidate ? 'updating' : 'adding'} candidate`,
        description: error.message,
      });
    }
  };
  
  const handleSavePosition = async () => {
    if (!newPositionTitle.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a title for the position.',
      });
      return;
    }
    try {
        if (isEditingPosition && currentPosition) {
            await updatePosition(currentPosition.id, { title: newPositionTitle });
            toast({
                title: 'Success!',
                description: `Position "${newPositionTitle}" has been updated.`,
              });
        } else {
            await addPosition(newPositionTitle);
            toast({
                title: 'Success!',
                description: `Position "${newPositionTitle}" has been added.`,
            });
        }
      setPositionDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: `Error ${isEditingPosition ? 'updating' : 'adding'} position`,
        description: error.message,
      });
    }
  };
  
  const confirmDelete = (type: 'candidate' | 'position', data: Candidate | Position) => {
    setItemToDelete({ type, data });
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'candidate') {
        await deleteCandidate((itemToDelete.data as Candidate).id);
        toast({
          title: 'Candidate Deleted',
          description: `Candidate "${(itemToDelete.data as Candidate).name}" has been deleted.`,
        });
      } else if (itemToDelete.type === 'position') {
        await deletePosition((itemToDelete.data as Position).id);
        toast({
          title: 'Position Deleted',
          description: `Position "${(itemToDelete.data as Position).title}" has been deleted.`,
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: `Error deleting ${itemToDelete.type}`,
        description: error.message,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };
  
  const handleTimeChange = (date: Date | null, time: string, setter: (d: Date | null) => void) => {
    if (!date) {
      setter(null);
      return;
    }
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    setter(newDate);
  };

  const handleSaveTiming = async () => {
    if (startTime && endTime && startTime >= endTime) {
        toast({
            variant: 'destructive',
            title: 'Invalid Dates',
            description: 'The start time must be before the end time.',
        });
        return;
    }
    try {
        await updateElectionSettings({ startTime, endTime });
        toast({
            title: 'Success!',
            description: 'Election timing has been updated.',
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error Saving Settings',
            description: error.message,
        });
    }
  };


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
          Election Management
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage positions and candidates for the election.
        </p>
      </header>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Election Timing</CardTitle>
            <CardDescription>
              Set the start and end dates and times for voting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-0 md:flex md:items-start md:gap-4">
            <div className="grid w-full items-center gap-1.5">
                <Label>Voting Starts</Label>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "flex-1 justify-start text-left font-normal",
                                !startTime && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startTime ? format(startTime, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={startTime ?? undefined}
                            onSelect={(day) => setStartTime(day ? new Date(day.setHours(startTime?.getHours() ?? 9, startTime?.getMinutes() ?? 0)) : null)}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Input
                        type="time"
                        className="w-[120px]"
                        value={startTime ? format(startTime, 'HH:mm') : ''}
                        onChange={(e) => handleTimeChange(startTime, e.target.value, setStartTime)}
                    />
                </div>
            </div>
            <div className="grid w-full items-center gap-1.5">
                <Label>Voting Ends</Label>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "flex-1 justify-start text-left font-normal",
                                !endTime && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endTime ? format(endTime, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={endTime ?? undefined}
                            onSelect={(day) => setEndTime(day ? new Date(day.setHours(endTime?.getHours() ?? 17, endTime?.getMinutes() ?? 0)) : null)}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Input
                        type="time"
                        className="w-[120px]"
                        value={endTime ? format(endTime, 'HH:mm') : ''}
                        onChange={(e) => handleTimeChange(endTime, e.target.value, setEndTime)}
                    />
                </div>
            </div>
          </CardContent>
          <div className="border-t p-4">
             <Button onClick={handleSaveTiming} className="w-full">Save Timing Settings</Button>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline">Positions</CardTitle>
                <CardDescription>
                  Define the roles students can vote for.
                </CardDescription>
              </div>
               <Dialog open={isPositionDialogOpen} onOpenChange={setPositionDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenNewPositionDialog}>
                    <PlusCircle className="mr-2" />
                    Add Position
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{isEditingPosition ? 'Edit' : 'Add New'} Position</DialogTitle>
                    <DialogDescription>
                      Enter the title for the {isEditingPosition ? '' : 'new'} position.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="position-title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="position-title"
                        value={newPositionTitle}
                        onChange={(e) => setNewPositionTitle(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., Treasurer"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPositionDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSavePosition}>Save Position</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.title}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditPositionDialog(position)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => confirmDelete('position', position)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
          <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline">Candidates</CardTitle>
                <CardDescription>
                  Add and edit the candidates for each position.
                </CardDescription>
              </div>
               <Dialog open={isCandidateDialogOpen} onOpenChange={setCandidateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenNewCandidateDialog}>
                    <PlusCircle className="mr-2" />
                    Add Candidate
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>{isEditingCandidate ? 'Edit' : 'Add New'} Candidate</DialogTitle>
                    <DialogDescription>
                      Enter the details for the candidate.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="candidate-name" className="text-right">
                        Full Name
                      </Label>
                      <Input
                        id="candidate-name"
                        value={newCandidateName}
                        onChange={(e) => setNewCandidateName(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="position" className="text-right">
                        Position
                      </Label>
                       <Select onValueChange={setSelectedPosition} value={selectedPosition}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((p) => (
                            <SelectItem key={p.id} value={p.title}>{p.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {isEditingCandidate && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="candidate-bio" className="text-right">
                            Bio
                          </Label>
                          <Textarea
                            id="candidate-bio"
                            value={candidateBio}
                            onChange={(e) => setCandidateBio(e.target.value)}
                            className="col-span-3"
                            placeholder="A short biography of the candidate."
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="candidate-platform" className="text-right">
                            Platform
                          </Label>
                          <Textarea
                            id="candidate-platform"
                            value={candidatePlatform}
                            onChange={(e) => setCandidatePlatform(e.target.value)}
                            className="col-span-3"
                            placeholder="A summary of the candidate's platform."
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCandidateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveCandidate}>Save Candidate</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell>{candidate.position}</TableCell>
                    <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditCandidateDialog(candidate)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => confirmDelete('candidate', candidate)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete?.type}{' '}
              <span className="font-semibold">{itemToDelete && (itemToDelete.type === 'candidate' ? (itemToDelete.data as Candidate).name : (itemToDelete.data as Position).title)}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    