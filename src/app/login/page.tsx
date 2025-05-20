"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn, AlertCircle } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // This effect runs on mount to clean up potentially inconsistent states
    const storedCredentialsString = localStorage.getItem("userCredentials");
    if (storedCredentialsString) {
      try {
        // Try to parse to see if it's valid JSON. Content validation happens during login attempt.
        JSON.parse(storedCredentialsString);
      } catch (e) {
        // If credentials string is not valid JSON, it's corrupted.
        localStorage.removeItem("userCredentials");
        localStorage.removeItem("sessionActive"); // Also clear session if creds are corrupted
      }
    }
    // If session is marked active but there are no userCredentials, the session is invalid.
    if (localStorage.getItem("sessionActive") === "true" && !localStorage.getItem("userCredentials")) {
      localStorage.removeItem("sessionActive");
    }

    // Clear input fields when component mounts, especially important after logout
    setUsername("");
    setPassword("");
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const storedCredentialsString = localStorage.getItem("userCredentials");

    if (storedCredentialsString) {
      try {
        const creds = JSON.parse(storedCredentialsString);

        // Crucially, check if creds.password is a string and exists
        if (creds && typeof creds.username === 'string' && typeof creds.password === 'string' && creds.password.length > 0) {
          // Stored credentials have a valid format (username and password are strings)
          if (username === creds.username && password === creds.password) {
            localStorage.setItem("sessionActive", "true"); // Mark session as active
            router.push("/");
          } else {
            setError("无效的用户名或密码。");
          }
        } else {
          // Stored credentials format is incorrect (e.g., password missing, not a string, or empty)
          setError("存储的凭据格式不正确。请尝试使用默认凭据重新登录。");
          localStorage.removeItem("userCredentials"); // Clear corrupted credentials
          localStorage.removeItem("sessionActive");  // Ensure session is marked inactive
        }
      } catch (parseError) {
        // JSON.parse failed for storedCredentialsString
        setError("凭据读取错误，请重试。");
        localStorage.removeItem("userCredentials");
        localStorage.removeItem("sessionActive");
      }
    } else {
      // No credentials stored in localStorage (e.g., first time user, or after credentials were cleared)
      if (username === "admin" && password === "admin") {
        // Save default credentials ONLY if none existed
        localStorage.setItem("userCredentials", JSON.stringify({ username: "admin", password: "admin" }));
        localStorage.setItem("sessionActive", "true");
        router.push("/");
      } else {
        setError("无效的用户名或密码。如首次使用，请用 'admin'/'admin' 登录。");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full inline-block">
            <LogIn className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">欢迎回来</CardTitle>
          <CardDescription>请输入您的凭据以继续。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder=""
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">密码</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="flex items-center p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <Button type="submit" className="w-full text-lg py-6">
              <LogIn className="mr-2 h-5 w-5" />
              登录
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground mt-4">
          <p>请输入正确的账号密码登录系统</p>
        </CardFooter>
      </Card>
    </div>
  );
}
