"use client";

import type React from "react";
import { useEffect, useState, useTransition } from "react";
import { PlusCircle, ListChecks, SearchX, LogOut, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddEditDomainDialog } from "@/components/add-edit-domain-dialog";
import { SettingsDialog } from "@/components/settings-dialog";
import { DomainCard } from "@/components/domain-card";
import type { DomainInfo } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

// Stricter type for user credentials
type UserCredentials = {
  username: string;
  password: string; // Password is now non-optional
};

export default function HomePage() {
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<DomainInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserCredentials | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sessionActive = localStorage.getItem("sessionActive");

      if (sessionActive === "true") {
        const storedCredentialsString = localStorage.getItem("userCredentials");
        if (storedCredentialsString) {
          try {
            const creds = JSON.parse(storedCredentialsString);
            // Ensure creds.password is a non-empty string
            if (creds && creds.username && typeof creds.password === 'string' && creds.password.length > 0) {
              setCurrentUser(creds as UserCredentials);
            } else {
              // Corrupted or incomplete credentials (e.g. password missing or empty)
              localStorage.removeItem("userCredentials");
              localStorage.removeItem("sessionActive");
              router.replace("/login");
            }
          } catch (e) {
            // Error parsing credentials
            localStorage.removeItem("userCredentials");
            localStorage.removeItem("sessionActive");
            router.replace("/login");
          }
        } else {
          // Session active but no credentials (should ideally not happen with proper login/logout)
          localStorage.removeItem("sessionActive"); // Clear invalid session state
          router.replace("/login");
        }
      } else {
        // Session not active or flag missing
        router.replace("/login");
      }
      setIsLoadingAuth(false);

      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (storedTheme) {
        setTheme(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      } else {
        // Default to light if no theme set or if system preference is not desired
        document.documentElement.classList.remove('dark');
        setTheme('light');
      }
    }
  }, [router]);

  useEffect(() => {
    if (isLoadingAuth) return;
    const storedDomains = localStorage.getItem("domains");
    if (storedDomains) {
      try {
        const parsedDomains: DomainInfo[] = JSON.parse(storedDomains).map((domain: any) => {
          let expDateObj: Date;
          const tempExpDate = new Date(domain.expirationDate);
          if (domain.expirationDate === null || domain.expirationDate === undefined || domain.expirationDate === "" || isNaN(tempExpDate.getTime())) {
            expDateObj = new Date(NaN); // Consistent Invalid Date
          } else {
            expDateObj = tempExpDate;
          }

          let dateAddedObj: Date;
          const tempDateAdded = new Date(domain.dateAdded);
          if (domain.dateAdded === null || domain.dateAdded === undefined || domain.dateAdded === "" || isNaN(tempDateAdded.getTime())) {
            dateAddedObj = new Date(NaN); // Consistent Invalid Date
          } else {
            dateAddedObj = tempDateAdded;
          }

          return {
            ...domain,
            id: domain.id || crypto.randomUUID(), // Ensure ID exists
            name: domain.name || "Unnamed Domain",
            expirationDate: expDateObj,
            dateAdded: dateAddedObj,
          };
        });
        setDomains(parsedDomains);
      } catch (error) {
        console.error("Failed to parse domains from localStorage", error);
        localStorage.removeItem("domains");
      }
    }
  }, [isLoadingAuth]);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (domains.length > 0 || localStorage.getItem("domains")) { // Only save if there are domains or if there was something to clear
      localStorage.setItem("domains", JSON.stringify(domains));
    }
  }, [domains, isLoadingAuth]);

  useEffect(() => {
    if (isLoadingAuth) return; // Don't run timer if auth is still loading
    const updateBeijingTime = () => {
      const now = new Date();
      // Ensure 'Asia/Shanghai' is a valid time zone for toLocaleString, might need polyfill for older envs
      const beijingTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
      setCurrentTime(beijingTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };

    updateBeijingTime();
    const timer = setInterval(updateBeijingTime, 1000);

    return () => clearInterval(timer);
  }, [isLoadingAuth]);

  const handleLogout = () => {
    localStorage.setItem("sessionActive", "false"); // Mark session as inactive
    // Do NOT remove userCredentials, so changed password persists
    setCurrentUser(null); // Clear local user state

    // Force page reload to ensure login form fields are reset properly
    router.push("/login");
  };

  const handleAddDomain = (data: { name: string; expirationDate: Date }) => {
    startTransition(() => {
      const newDomain: DomainInfo = {
        id: crypto.randomUUID(),
        ...data,
        dateAdded: new Date(),
      };
      setDomains((prev) => [...prev, newDomain]);
      toast({
        title: "域名已添加",
        description: `${data.name} 已添加到您的观察列表。`,
        variant: "success",
      });
      setIsAddEditDialogOpen(false);
    });
  };

  const handleEditDomain = (data: { name: string; expirationDate: Date }) => {
    if (!editingDomain) return;
    startTransition(() => {
      setDomains((prev) =>
        prev.map((d) => (d.id === editingDomain.id ? { ...editingDomain, ...data } : d))
      );
      toast({
        title: "域名已更新",
        description: `${data.name} 已更新。`,
        variant: "success",
      });
      setIsAddEditDialogOpen(false);
      setEditingDomain(null);
    });
  };

  const handleDeleteDomain = (domainId: string) => {
    startTransition(() => {
      const domainToDelete = domains.find(d => d.id === domainId);
      setDomains((prev) => prev.filter((d) => d.id !== domainId));
      if (domainToDelete) {
        toast({
          title: "域名已删除",
          description: `${domainToDelete.name} 已从您的观察列表中移除。`,
          variant: "destructive",
        });
      }
    });
  };

  const openAddDialog = () => {
    setEditingDomain(null);
    setIsAddEditDialogOpen(true);
  };

  const openEditDialog = (domain: DomainInfo) => {
    setEditingDomain(domain);
    setIsAddEditDialogOpen(true);
  };

  const handlePasswordChange = (newPassword: string) => {
    if (currentUser) {
      // Explicitly construct the object to ensure correct fields and types
      const updatedCredentials: UserCredentials = {
        username: currentUser.username,
        password: newPassword, // newPassword is validated by Zod in SettingsDialog to be min 6 chars
      };
      localStorage.setItem("userCredentials", JSON.stringify(updatedCredentials));
      setCurrentUser(updatedCredentials); // Update local state for current session
      toast({
        title: "密码已更新",
        description: "您的密码已成功更改。",
        variant: "success",
      });
      return true;
    }
    toast({
      title: "密码更新失败",
      description: "无法找到当前用户信息。",
      variant: "destructive",
    });
    return false;
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    toast({
      title: "主题已切换",
      description: `已切换到${newTheme === 'dark' ? '深色' : '浅色'}模式。`,
      variant: "default"
    });
  };

  const filteredAndSortedDomains = domains
    .filter(domain => domain.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      // Primary sort: Expiration Date (soonest first, invalids last)
      const aExpDate = a.expirationDate;
      const bExpDate = b.expirationDate;
      const aExpIsValid = aExpDate && !isNaN(aExpDate.getTime());
      const bExpIsValid = bExpDate && !isNaN(bExpDate.getTime());

      if (aExpIsValid && bExpIsValid) {
        if (aExpDate.getTime() !== bExpDate.getTime()) {
          return aExpDate.getTime() - bExpDate.getTime();
        }
      } else if (aExpIsValid && !bExpIsValid) {
        return -1; // Valid dates come before invalid dates
      } else if (!aExpIsValid && bExpIsValid) {
        return 1;  // Invalid dates go after valid dates
      }
      // If expiration dates are same or both invalid, secondary sort: Date Added (newest first, invalids last)
      const aDateAdded = a.dateAdded;
      const bDateAdded = b.dateAdded;
      const aAddedIsValid = aDateAdded && !isNaN(aDateAdded.getTime());
      const bAddedIsValid = bDateAdded && !isNaN(bDateAdded.getTime());

      if (aAddedIsValid && bAddedIsValid) {
        return bDateAdded.getTime() - aDateAdded.getTime(); // Newest added first
      } else if (aAddedIsValid && !bAddedIsValid) {
        return -1;
      } else if (!aAddedIsValid && bAddedIsValid) {
        return 1;
      }
      return 0; // If all dates are same or all invalid, keep original order relative to each other
    });

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">正在加载...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-background text-foreground flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <ListChecks className="h-8 w-8 sm:h-10 sm:w-10" />
            <h1 className="text-2xl sm:text-3xl font-bold">域名监控</h1>
          </div>
          <div className="flex gap-2 items-center">
            <Button onClick={openAddDialog} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-5 w-5" /> 添加新域名
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSettingsDialogOpen(true)}
              className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
              aria-label="打开设置"
            >
              <Cog className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="icon"
              className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
              aria-label="登出"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow overflow-y-auto">
        <div className="mb-8 p-6 bg-card rounded-lg shadow">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="text-sm font-semibold whitespace-nowrap p-2 rounded-md border bg-background h-10 flex items-center justify-center text-foreground">
              {currentTime !== null ? currentTime : '加载时间中...'}
            </div>
            <Input
              type="search"
              placeholder="搜索域名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
          </div>
        </div>

        {filteredAndSortedDomains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedDomains.map((domain) => (
              <DomainCard
                key={domain.id}
                domain={domain}
                onEdit={openEditDialog}
                onDelete={handleDeleteDomain}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <SearchX className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-2 text-card-foreground">未找到域名</h2>
            <p className="text-muted-foreground">
              {domains.length === 0 ? '您还没有添加任何域名。点击"添加新域名"开始。' : '没有域名符合您的搜索条件。'}
            </p>
            {domains.length > 0 && searchTerm && (
              <Button variant="link" onClick={() => setSearchTerm("")} className="mt-4">清除搜索</Button>
            )}
          </div>
        )}
      </main>

      <AddEditDomainDialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
        onSubmit={editingDomain ? handleEditDomain : handleAddDomain}
        initialData={editingDomain}
        isPending={isPending}
      />

      {currentUser && currentUser.password && (
        <SettingsDialog
          open={isSettingsDialogOpen}
          onOpenChange={setIsSettingsDialogOpen}
          currentPassword={currentUser.password}
          onPasswordChange={handlePasswordChange}
          currentTheme={theme}
          onThemeChange={handleThemeChange}
        />
      )}

      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} 域名监控。关注您的域名状态。
        </div>
      </footer>
    </div>
  );
}
