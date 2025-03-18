"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { RestrictedContent } from "@/components/restricted-content";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, UserPlus, Users } from "lucide-react";

// Interface for team member data
interface TeamMember {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  invitedAt: Date;
  status: 'invited' | 'active';
  name?: string;
}

export default function TeamPage() {
  const { user } = useAuth();
  const { subscription, hasAccess } = useSubscription();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state for inviting team members
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  
  // Fetch team members
  const fetchTeamMembers = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const teamQuery = query(
        collection(db, "teams"),
        where("ownerId", "==", user.uid)
      );
      
      const querySnapshot = await getDocs(teamQuery);
      const members: TeamMember[] = [];
      
      querySnapshot.forEach((doc) => {
        members.push({
          id: doc.id,
          ...doc.data() as Omit<TeamMember, 'id'>,
          invitedAt: (doc.data().invitedAt as any).toDate()
        });
      });
      
      setTeamMembers(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load team members on component mount
  useEffect(() => {
    if (user) {
      fetchTeamMembers();
    }
  }, [user]);
  
  // Invite team member
  const handleInviteTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsInviting(true);
    
    try {
      // Check subscription limits
      if (subscription.plan === "free" && teamMembers.length >= 1) {
        toast.error("Free plan is limited to 1 team member. Please upgrade your plan.");
        return;
      }
      
      if (subscription.plan === "basic" && teamMembers.length >= 3) {
        toast.error("Basic plan is limited to 3 team members. Please upgrade to Pro.");
        return;
      }
      
      // Add team member to Firestore
      await addDoc(collection(db, "teams"), {
        email: inviteEmail,
        role: inviteRole,
        status: "invited",
        invitedBy: user.uid,
        invitedAt: new Date(),
        ownerId: user.uid
      });
      
      // Reset form and close dialog
      setInviteEmail("");
      setInviteRole("member");
      setIsDialogOpen(false);
      
      // Refresh team members
      fetchTeamMembers();
      
      toast.success(`Invitation sent to ${inviteEmail}`);
    } catch (error) {
      console.error("Error inviting team member:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };
  
  // Remove team member
  const handleRemoveTeamMember = async (teamMemberId: string, email: string) => {
    if (!user) return;
    
    // Confirm before removing
    if (!window.confirm(`Are you sure you want to remove ${email} from your team?`)) {
      return;
    }
    
    try {
      // Delete team member from Firestore
      await deleteDoc(doc(db, "teams", teamMemberId));
      
      // Refresh team members
      fetchTeamMembers();
      
      toast.success(`Successfully removed ${email} from your team`);
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error(`Failed to remove ${email}`);
    }
  };
  
  // Check if current plan allows adding more team members
  const canAddTeamMember = (): boolean => {
    if (subscription.plan === "free" && teamMembers.length >= 1) {
      return false;
    }
    
    if (subscription.plan === "basic" && teamMembers.length >= 3) {
      return false;
    }
    
    return true;
  };
  
  // Get max team members allowed for current plan
  const getMaxTeamMembers = (): number => {
    switch (subscription.plan) {
      case "free":
        return 1;
      case "basic":
        return 3;
      case "pro":
        return Infinity;
      default:
        return 0;
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Invite and manage your team members
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canAddTeamMember()}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your team
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteTeamMember} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={setInviteRole}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isInviting}
                >
                  {isInviting ? "Sending Invitation..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <RestrictedContent minimumPlan="basic">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {teamMembers.length} of {getMaxTeamMembers() === Infinity ? 'unlimited' : getMaxTeamMembers()} team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No team members yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Invite your colleagues to collaborate with you
                  </p>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Invite Your First Team Member
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {member.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.email}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm capitalize text-muted-foreground">
                              {member.role}
                            </span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm capitalize text-muted-foreground">
                              {member.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTeamMember(member.id, member.email)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {teamMembers.length > 0 && (
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  {subscription.plan === "pro"
                    ? "With the Pro plan, you can invite unlimited team members."
                    : `Your current plan allows up to ${getMaxTeamMembers()} team members. Upgrade for more.`}
                </p>
              </CardFooter>
            )}
          </Card>
        )}
      </RestrictedContent>
      
      {!hasAccess("basic") && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Access Team Features</CardTitle>
            <CardDescription>
              Team management is available on Basic and Pro plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Upgrade to our Basic or Pro plan to invite team members and collaborate with your colleagues.
              The Basic plan includes up to 3 team members, while Pro offers unlimited team members.
            </p>
            <Button onClick={() => window.location.href = "/pricing"}>
              View Pricing Plans
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}