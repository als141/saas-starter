"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function SettingsPage() {
  const { user } = useAuth();
  
  // Profile form state
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Email form state
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  
  // Password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // Initialize form values
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Update profile information
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsUpdatingProfile(true);
    
    try {
      await updateProfile(user, {
        displayName,
        photoURL,
      });
      
      // Update profile in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName,
        photoURL,
      });
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Update email address with reauthentication
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.email) return;
    
    setIsUpdatingEmail(true);
    
    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update email
      await updateEmail(user, email);
      
      // Update email in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        email,
      });
      
      setIsEmailDialogOpen(false);
      setCurrentPassword("");
      toast.success("Email updated successfully");
    } catch (error: any) {
      console.error("Error updating email:", error);
      
      if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect password");
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error("Please log out and log back in before changing your email");
      } else {
        toast.error(error.message || "Failed to update email");
      }
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // Update password with reauthentication
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.email) return;
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, passwordCurrentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      setIsPasswordDialogOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordCurrentPassword("");
      toast.success("Password updated successfully");
    } catch (error: any) {
      console.error("Error updating password:", error);
      
      if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect password");
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error("Please log out and log back in before changing your password");
      } else {
        toast.error(error.message || "Failed to update password");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-fit">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 items-start">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={photoURL || undefined} alt={displayName || "User"} />
                      <AvatarFallback className="text-2xl">
                        {displayName ? displayName[0].toUpperCase() : user?.email?.[0].toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        placeholder="Your name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="photoURL">Profile Picture URL</Label>
                      <Input
                        id="photoURL"
                        placeholder="https://example.com/your-photo.jpg"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Enter a URL for your profile picture
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="flex-1"
                    />
                    <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline">
                          Change Email
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Email Address</DialogTitle>
                          <DialogDescription>
                            Enter your new email address and confirm with your current password
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateEmail} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="newEmail">New Email Address</Label>
                            <Input
                              id="newEmail"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              required
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              disabled={isUpdatingEmail}
                            >
                              {isUpdatingEmail ? "Updating..." : "Update Email"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Saving Changes..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">
                      Change your account password
                    </p>
                  </div>
                  <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Change Password</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and a new password
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdatePassword} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPasswordForReset">Current Password</Label>
                          <Input
                            id="currentPasswordForReset"
                            type="password"
                            value={passwordCurrentPassword}
                            onChange={(e) => setPasswordCurrentPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            disabled={isUpdatingPassword}
                          >
                            {isUpdatingPassword ? "Updating..." : "Update Password"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Management</h3>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}