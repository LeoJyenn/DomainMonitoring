"use client";

import { differenceInDays, format, isPast, isToday, isValid } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import { Edit2, Trash2, AlertTriangle, CheckCircle2, Clock, CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import type { DomainInfo } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface DomainCardProps {
  domain: DomainInfo;
  onEdit: (domain: DomainInfo) => void;
  onDelete: (domainId: string) => void;
}

export function DomainCard({ domain, onEdit, onDelete }: DomainCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 确保过期日期是有效的Date对象
  const isValidExpDate = isValid(domain.expirationDate);
  const expiration = isValidExpDate ? domain.expirationDate : new Date();
  expiration.setHours(0, 0, 0, 0);

  const daysUntilExpiration = isValidExpDate ? differenceInDays(expiration, today) : 0;
  const expired = isValidExpDate ? (isPast(expiration) && !isToday(expiration)) : false;

  let statusText = `剩余 ${daysUntilExpiration} 天到期`;
  let statusColor: "destructive" | "warning" | "success" = "success";
  let StatusIcon = CheckCircle2;

  if (!isValidExpDate) {
    statusText = "日期无效";
    statusColor = "destructive";
    StatusIcon = AlertTriangle;
  } else if (expired) {
    statusText = `${Math.abs(daysUntilExpiration)} 天前已过期`;
    statusColor = "destructive";
    StatusIcon = AlertTriangle;
  } else if (daysUntilExpiration === 0) {
    statusText = "今天到期";
    statusColor = "destructive";
    StatusIcon = AlertTriangle;
  } else if (daysUntilExpiration < 7) {
    statusText = `剩余 ${daysUntilExpiration} 天到期`;
    statusColor = "destructive";
    StatusIcon = AlertTriangle;
  } else if (daysUntilExpiration < 30) {
    statusText = `剩余 ${daysUntilExpiration} 天到期`;
    statusColor = "warning";
    StatusIcon = Clock;
  }

  if (statusColor === 'success' && daysUntilExpiration > 0) {
    statusText = `剩余 ${daysUntilExpiration} 天到期`;
  }


  const dateDisplayClasses = cn(
    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold shadow mb-1 transition-all duration-200",
    {
      'bg-destructive text-destructive-foreground': statusColor === 'destructive',
      'bg-accent text-accent-foreground': statusColor === 'warning',
      'bg-green-500 text-white': statusColor === 'success',
    }
  );

  const statusTextClasses = cn(
    "text-xs transition-opacity duration-200",
    {
      'text-destructive': statusColor === 'destructive',
      'text-yellow-700 dark:text-yellow-400': statusColor === 'warning',
      'text-green-700 dark:text-green-400': statusColor === 'success',
      'text-muted-foreground': statusColor !== 'destructive' && statusColor !== 'warning' && statusColor !== 'success',
    }
  );

  return (
    <Card className="w-full shadow-md transition-all duration-200 hover:shadow-xl hover:scale-105 flex flex-col group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-semibold text-primary break-all mr-2">
            {domain.name}
          </CardTitle>
          <div className="flex gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => onEdit(domain)} aria-label={`编辑域名 ${domain.name}`}>
              <Edit2 className="h-5 w-5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/20" aria-label={`删除域名 ${domain.name}`}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>您确定吗？</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作无法撤销。这将从您的列表中永久删除域名 "{domain.name}"。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(domain.id)}>
                    删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow pt-0 pb-3 px-6">
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>添加于: {isValid(domain.dateAdded) ? format(domain.dateAdded, "PPP", { locale: zhCN }) : '日期无效'}</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-center justify-center pt-3 pb-4 border-t">
        <div className={dateDisplayClasses}>
          <StatusIcon className="h-4 w-4" />
          到期时间：{isValidExpDate ? format(expiration, "PPP", { locale: zhCN }) : '日期无效'}
        </div>
        <p className={statusTextClasses}>
          {isValidExpDate ? statusText : '日期无效'}
        </p>
      </CardFooter>
    </Card>
  );
}
