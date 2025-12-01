"use client";

import { useState } from "react";
import { createOrganisation } from "@/lib/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/modal";
import { Plus, Copy, RefreshCw, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing"; // Optional: if you want logo upload here

export function CreateOrgDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // Admin sets this manually
    mobile: "",
  });
  const [copied, setCopied] = useState(false);

  // Generate a random strong password for convenience
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const copyCredentials = () => {
    const text = `Email: ${formData.email}\nPassword: ${formData.password}\nLogin URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!", description: "Credentials copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = new FormData();
    Object.entries(formData).forEach(([key, val]) => payload.append(key, val));

    const result = await createOrganisation(null, payload);

    if (result?.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ 
        title: "Success", 
        description: "Organisation created. Don't forget to share the credentials!", 
        variant: "success" 
      });
      setIsOpen(false);
      setFormData({ name: "", email: "", password: "", mobile: "" });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create Organisation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Organisation</DialogTitle>
          <DialogDescription>
            Create an account with public credentials. They will be forced to change password on first login.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Firm Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Temporary Password</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
              />
              <Button type="button" variant="outline" size="icon" onClick={generatePassword} title="Generate Random">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Tip: Copy this password before creating.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mobile">Mobile (Optional)</Label>
            <Input
              id="mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
            />
          </div>

          {/* Helper to Copy Credentials before submitting */}
          {formData.email && formData.password && (
            <div className="flex items-center justify-between rounded-md bg-secondary/50 p-2 text-xs">
               <span>Share these credentials</span>
               <Button 
                 type="button" 
                 variant="ghost" 
                 size="sm" 
                 className="h-6 gap-1"
                 onClick={copyCredentials}
               >
                 {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                 {copied ? "Copied" : "Copy"}
               </Button>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}