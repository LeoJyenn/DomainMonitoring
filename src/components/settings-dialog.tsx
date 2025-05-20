"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeyRound, Palette, Loader2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PasswordInput } from "@/components/ui/password-input";

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "当前密码为必填项。"),
    newPassword: z.string().min(6, "新密码至少需要6个字符。"),
    confirmPassword: z.string().min(1, "确认密码为必填项。"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "新密码和确认密码不匹配。",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPassword?: string;
  onPasswordChange: (newPassword: string) => boolean;
  currentTheme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  currentPassword,
  onPasswordChange,
  currentTheme,
  onThemeChange,
}: SettingsDialogProps) {
  const { toast } = useToast();
  const [isPasswordPending, setIsPasswordPending] = React.useState(false);
  const [isResetPending, setIsResetPending] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("password");
  const [passwordButtonEnabled, setPasswordButtonEnabled] = React.useState(false);
  const [passwordsMatch, setPasswordsMatch] = React.useState<boolean | null>(null);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange", // 实时验证
  });

  // 监听表单值变化以启用/禁用按钮
  React.useEffect(() => {
    const subscription = passwordForm.watch((formValues) => {
      const { currentPassword: current, newPassword: newPass, confirmPassword: confirm } = formValues;
      const allFieldsFilled = Boolean(current) && Boolean(newPass) && Boolean(confirm);
      const passwordsDoMatch = newPass === confirm;

      // 检查密码匹配状态
      if (confirm) {
        setPasswordsMatch(passwordsDoMatch);
      } else {
        setPasswordsMatch(null);
      }

      // 当所有字段都有值且新密码与确认密码匹配时启用按钮
      setPasswordButtonEnabled(allFieldsFilled && passwordsDoMatch);
    });

    return () => subscription.unsubscribe();
  }, [passwordForm]);

  React.useEffect(() => {
    if (open) {
      passwordForm.reset();
      setActiveTab("password");
      setPasswordButtonEnabled(false);
      setPasswordsMatch(null);
    }
  }, [open, passwordForm]);

  // 监听密码变化以显示不匹配提示
  React.useEffect(() => {
    const subscription = passwordForm.watch((value, { name }) => {
      // 清除手动错误
      if (passwordForm.formState.errors.currentPassword?.type === 'manual') {
        passwordForm.clearErrors('currentPassword');
      }

      // 检查密码是否匹配并通过toast通知
      if (name === 'confirmPassword' || name === 'newPassword') {
        const newPassword = value.newPassword;
        const confirmPassword = value.confirmPassword;

        if (confirmPassword &&
          confirmPassword.length > 0 &&
          newPassword &&
          newPassword !== confirmPassword) {
          // 不立即显示toast，因为用户可能正在输入
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [passwordForm]);

  const handlePasswordSubmit = async (data: PasswordFormValues) => {
    // 再次验证密码匹配
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "新密码和确认密码不匹配，请重新输入。",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordPending(true);
    if (data.currentPassword !== currentPassword) {
      toast({
        title: "密码错误",
        description: "当前密码不正确，请重新输入。",
        variant: "destructive",
      });
      setIsPasswordPending(false);
      return;
    }

    const success = onPasswordChange(data.newPassword);
    if (success) {
      passwordForm.reset();
      onOpenChange(false);
    }
    setIsPasswordPending(false);
  };

  const handleResetPassword = async () => {
    if (!window.confirm("确定要将密码重置为默认密码吗？")) {
      return;
    }

    setIsResetPending(true);
    const success = onPasswordChange("admin");
    setIsResetPending(false);

    if (success) {
      toast({
        title: "密码已重置",
        description: "您的密码已重置为默认密码。",
        variant: "success",
      });
      passwordForm.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 max-h-[90vh] flex flex-col min-h-[480px]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>管理您的账户设置和应用偏好。</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs
            defaultValue="password"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="border-b">
              <div className="px-6 py-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="password"
                    className="flex items-center z-10"
                    onClick={() => setActiveTab("password")}
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    修改密码
                  </TabsTrigger>
                  <TabsTrigger
                    value="appearance"
                    className="flex items-center z-10"
                    onClick={() => setActiveTab("appearance")}
                  >
                    <Palette className="mr-2 h-4 w-4" />
                    外观
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-4 min-h-[320px]">
                {activeTab === "password" && (
                  <div className="h-full flex flex-col">
                    <Form {...passwordForm}>
                      <form
                        id="password-form"
                        onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                        className="space-y-4 flex-1 flex flex-col"
                      >
                        <div className="space-y-4 flex-1">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>当前密码</FormLabel>
                                <FormControl>
                                  <PasswordInput {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>新密码</FormLabel>
                                <FormControl>
                                  <PasswordInput {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>确认新密码</FormLabel>
                                <FormControl>
                                  <PasswordInput {...field} />
                                </FormControl>
                                {passwordsMatch === false && (
                                  <p className="text-sm text-destructive mt-1">密码不匹配</p>
                                )}
                                {passwordsMatch === true && (
                                  <p className="text-sm text-green-500 mt-1">密码匹配</p>
                                )}
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="pt-2 border-t mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-4 flex items-center justify-center text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={handleResetPassword}
                            disabled={isResetPending}
                          >
                            {isResetPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                            重置为默认密码
                          </Button>
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            此操作将使您的密码重置为默认密码
                          </p>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <div className="space-y-4 h-full flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-4">主题</h3>
                      <div className="flex items-center justify-between rounded-lg border p-4 w-full">
                        <div className="flex flex-col space-y-1 pr-4 max-w-[70%]">
                          <span className="font-medium">深色模式</span>
                          <span className="font-normal leading-snug text-muted-foreground">
                            切换应用到深色主题。
                          </span>
                        </div>
                        <div className="flex-shrink-0 ml-auto">
                          <Switch
                            id="dark-mode-switch"
                            checked={currentTheme === "dark"}
                            onCheckedChange={(checked) =>
                              onThemeChange(checked ? "dark" : "light")
                            }
                            aria-label="切换深色模式"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </div>

        <div className="border-t px-6 py-4 flex flex-row items-center justify-between gap-4 bg-background">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="flex-shrink-0">
              关闭
            </Button>
          </DialogClose>

          <div className="flex justify-end">
            {activeTab === 'password' && (
              <Button
                form="password-form"
                type="submit"
                className="flex-shrink-0"
                disabled={isPasswordPending || !passwordButtonEnabled}
              >
                {isPasswordPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                保存密码
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
