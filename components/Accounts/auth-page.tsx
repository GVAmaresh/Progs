import * as React from "react";
import { useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { Icons } from "../../public/icons";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../ui/card";

import { Input } from "../ui/input";
import { Label } from "../ui/label";

import { useRouter } from "next/navigation";
import { useClerk, useSignUp, useSignIn } from "@clerk/nextjs";

export function AuthPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const router = useRouter();

  const refreshPage = () => {
    router.refresh();
  };


  return (
    <>
      <Card className="bg-black text-white border-zinc-400 border-2 border-r-4">
        <CardHeader className="">
          <CardTitle className="text-2xl">Get an Account</CardTitle>
          <CardDescription>
            Enter your email below to Get an Account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex justify-center text-slate-800" >
            <Button variant="outline">
              <Icons.google className="mr-2 h-4 w-1/2" />
              Google
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs font-semibold uppercase">
              <span className="bg-background px-2 text-muted-foreground text-slate-800">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              style={{ color: 'black' }}
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              style={{ color: 'black' }}
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              style={{ color: 'black' }}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            Get an Account
          </Button>
        </CardFooter>
      </Card>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}
        autoHideDuration={6000}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error || "An unexpected error occurred"}
        </Alert>
      </Snackbar>
    </>
  );
}
