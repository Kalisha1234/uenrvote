
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, Download, Send, Edit, Loader2, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useContext, useState } from 'react';
import { AppContext } from '@/context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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
import type { Voter } from '@/lib/mock-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sendLoginCode } from '@/ai/flows/send-login-code';

export default function VoterManagementPage() {
  const { voters, addVoter, updateVoter, deleteVoter } = useContext(AppContext);
  const [isAddVoterOpen, setAddVoterOpen] = useState(false);
  const [isEditVoterOpen, setEditVoterOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [voterToDelete, setVoterToDelete] = useState<Voter | null>(null);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [newVoterId, setNewVoterId] = useState('');
  const [newVoterName, setNewVoterName] = useState('');
  const [editedVoterName, setEditedVoterName] = useState('');
  const [editedVoterStatus, setEditedVoterStatus] = useState<Voter['status']>('Eligible');
  const [generatedVoter, setGeneratedVoter] = useState<{ id: string; loginCode: string } | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [resendingVoterId, setResendingVoterId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddVoter = async () => {
    if (!newVoterId.trim() || !newVoterName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Voter ID and Name cannot be empty.' });
      return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(newVoterId)) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter a valid email address for the Voter ID.' });
        return;
    }
    try {
      const code = await addVoter(newVoterId, newVoterName);
      setGeneratedVoter({ id: newVoterId, loginCode: code });
      setNewVoterId('');
      setNewVoterName('');
      setAddVoterOpen(false);
      toast({ title: 'Voter Added', description: `A unique login code has been generated for ${newVoterName}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleEditVoter = (voter: Voter) => {
    setSelectedVoter(voter);
    setEditedVoterName(voter.name);
    setEditedVoterStatus(voter.status);
    setEditVoterOpen(true);
  };

  const handleUpdateVoter = async () => {
    if (!selectedVoter || !editedVoterName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Voter name cannot be empty.' });
      return;
    }
    try {
      await updateVoter(selectedVoter.id, { name: editedVoterName, status: editedVoterStatus });
      toast({ title: 'Voter Updated', description: `Details for ${editedVoterName} have been saved.` });
      setEditVoterOpen(false);
      setSelectedVoter(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update voter.' });
    }
  };
  
  const confirmDeleteVoter = (voter: Voter) => {
    setVoterToDelete(voter);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteVoter = async () => {
    if (!voterToDelete) return;
    try {
      await deleteVoter(voterToDelete.id);
      toast({
        title: 'Voter Deleted',
        description: `Voter ${voterToDelete.name} has been successfully deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete voter.',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setVoterToDelete(null);
    }
  };


  const handleSendCode = async () => {
    if (!generatedVoter) return;
    setIsSendingCode(true);
    try {
      const result = await sendLoginCode({
        emailAddress: generatedVoter.id,
        loginCode: generatedVoter.loginCode,
      });
      if (result.success) {
        toast({
          title: 'Code Sent',
          description: result.message,
        });
      } else {
        throw new Error(result.message);
      }
      setGeneratedVoter(null);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Sending Code',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
        setIsSendingCode(false);
    }
  };
  
  const handleResendCode = async (voter: Voter) => {
    setResendingVoterId(voter.id);
    try {
      const result = await sendLoginCode({
        emailAddress: voter.id,
        loginCode: voter.loginCode,
      });
      if (result.success) {
        toast({
          title: 'Code Resent',
          description: `Login code successfully sent to ${voter.name}.`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Sending Code',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setResendingVoterId(null);
    }
  };


  const handleExportVoters = () => {
    const csvContent = [
      "Voter ID,Name,Status,Login Code",
      ...voters.map(v => `${v.id},"${v.name}",${v.status},${v.loginCode}`)
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "voter-list.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
     toast({
      title: 'Export Successful',
      description: 'The voter list has been downloaded.',
    });
  };

  const handleImportVoters = () => {
    toast({
        title: 'Coming Soon!',
        description: 'The import feature is not yet available.',
      });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
          Voter Management
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Add, edit, and manage the list of eligible voters.
        </p>
      </header>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Voter List</CardTitle>
              <CardDescription>
                A list of all registered voters and their status.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportVoters}>
                <Download className="mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={handleImportVoters}>
                <Upload className="mr-2" />
                Import
              </Button>
              <Dialog open={isAddVoterOpen} onOpenChange={setAddVoterOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2" />
                    Add Voter
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Voter</DialogTitle>
                    <DialogDescription>
                      Enter the voter's details. A unique login code will be generated.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="voter-name" className="text-right">Full Name</Label>
                      <Input id="voter-name" value={newVoterName} onChange={(e) => setNewVoterName(e.target.value)} className="col-span-3" placeholder="e.g., Jane Doe" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="voter-id" className="text-right">Voter ID</Label>
                      <Input id="voter-id" value={newVoterId} onChange={(e) => setNewVoterId(e.target.value)} className="col-span-3" placeholder="e.g., student_email@school.edu"/>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddVoterOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddVoter}>Create Voter</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voter ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Login Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voters.map((voter) => (
                <TableRow key={voter.id}>
                  <TableCell className="font-medium">{voter.id}</TableCell>
                  <TableCell>{voter.name}</TableCell>
                  <TableCell>{voter.status}</TableCell>
                  <TableCell className="font-mono text-xs">{voter.loginCode}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleResendCode(voter)}
                      disabled={resendingVoterId === voter.id}
                      title="Resend login code"
                    >
                      {resendingVoterId === voter.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditVoter(voter)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => confirmDeleteVoter(voter)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Voter Dialog */}
      <Dialog open={isEditVoterOpen} onOpenChange={setEditVoterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Voter</DialogTitle>
            <DialogDescription>Update the voter's name and status.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-voter-name" className="text-right">Full Name</Label>
              <Input id="edit-voter-name" value={editedVoterName} onChange={(e) => setEditedVoterName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-voter-status" className="text-right">Status</Label>
              <Select onValueChange={(value: Voter['status']) => setEditedVoterStatus(value)} value={editedVoterStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eligible">Eligible</SelectItem>
                  <SelectItem value="Voted">Voted</SelectItem>
                  <SelectItem value="Ineligible">Ineligible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditVoterOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateVoter}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Voter Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the voter
              <span className="font-semibold"> {voterToDelete?.name}</span> and their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteVoter}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Generated Code Alert */}
      <AlertDialog open={!!generatedVoter} onOpenChange={() => setGeneratedVoter(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Voter Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>The voter has been added. Share their unique login code with them or send it to their email address now.</p>
                <div className="my-4 p-2 bg-muted rounded-md text-center font-mono text-lg font-bold tracking-widest">
                  {generatedVoter?.loginCode}
                </div>
                <p className="text-xs text-muted-foreground">This code will not be shown again once this dialog is closed.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendCode} disabled={isSendingCode}>
              {isSendingCode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
