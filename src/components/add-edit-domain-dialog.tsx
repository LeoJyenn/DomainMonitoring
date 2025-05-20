"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse, isValid } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DomainInfo } from "@/lib/types";

const domainFormSchema = z.object({
  name: z.string().min(1, "域名为必填项。").refine(value => {
    try {
      // Ensure a scheme is present for URL parsing, default to http if not.
      const urlValue = value.includes('://') ? value : `http://${value}`;
      const url = new URL(urlValue);
      // Check if the hostname is what we expect (e.g., not a path of a larger URL)
      // and if it contains a period, which is typical for valid domains.
      return url.hostname === (value.includes('://') ? url.hostname : value) && value.includes('.');
    } catch (_) {
      return false;
    }
  }, "域名格式无效。应为例如 'example.com'。"),
  expirationDate: z.date({
    required_error: "到期日期为必填项。",
    invalid_type_error: "日期格式无效。",
  }).refine(date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare with the beginning of today
    return date >= today;
  }, { message: "到期日期不能早于今天。" }),
});

type DomainFormValues = z.infer<typeof domainFormSchema>;

interface AddEditDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DomainFormValues) => Promise<void> | void;
  initialData?: DomainInfo | null;
  isPending?: boolean;
}

export function AddEditDomainDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isPending = false,
}: AddEditDomainDialogProps) {
  const form = useForm<DomainFormValues>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      name: "",
      expirationDate: undefined,
    },
  });

  const [dateInputValue, setDateInputValue] = React.useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const dateInputRef = React.useRef<HTMLInputElement>(null);
  const [cursor, setCursor] = React.useState<number | null>(null);


  React.useEffect(() => {
    if (dateInputRef.current && cursor !== null) {
      dateInputRef.current.setSelectionRange(cursor, cursor);
      setCursor(null);
    }
  }, [dateInputValue, cursor]);


  React.useEffect(() => {
    if (open) {
      const name = initialData?.name || "";
      let expDate: Date | undefined = undefined;
      let expDateString = "";

      if (initialData?.expirationDate) {
        const parsedInitDate = new Date(initialData.expirationDate);
        if (isValid(parsedInitDate)) {
          expDate = parsedInitDate;
          expDateString = format(parsedInitDate, "yyyy-MM-dd");
        }
      }

      form.reset({
        name: name,
        expirationDate: expDate,
      });
      setDateInputValue(expDateString);
      form.clearErrors();
    }
  }, [open, initialData, form]);


  const handleFormSubmit = async (data: DomainFormValues) => {
    await onSubmit(data);
  };

  const dialogTitle = initialData ? "编辑域名" : "添加新域名";
  const dialogDescription = initialData
    ? "更新您的域名信息。"
    : "请输入域名及其到期日期。";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        setIsCalendarOpen(false);
      }
    }}>
      <DialogContent className="sm:max-w-[425px] shadow-xl max-h-[90vh] my-4 flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <Form {...form}>
            <form
              id="domain-form"
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-8 px-6 py-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>域名</FormLabel>
                    <FormControl>
                      <Input placeholder="example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>到期日期</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            ref={dateInputRef}
                            placeholder="YYYY-MM-DD"
                            value={dateInputValue}
                            maxLength={10}
                            onChange={(e) => {
                              const input = e.target;
                              let value = input.value;
                              const selectionStart = input.selectionStart;

                              let digits = value.replace(/[^\d]/g, "");

                              let formattedValue = "";
                              if (digits.length > 0) {
                                formattedValue = digits.substring(0, 4);
                              }
                              if (digits.length > 4) {
                                formattedValue += "-" + digits.substring(4, 6);
                              }
                              if (digits.length > 6) {
                                formattedValue += "-" + digits.substring(6, 8);
                              }

                              setDateInputValue(formattedValue);

                              if (selectionStart !== null) {
                                let nonHyphenOriginal = 0;
                                for (let i = 0; i < selectionStart; i++) if (value[i] !== '-' && /\d/.test(value[i])) nonHyphenOriginal++;

                                let nonHyphenFormatted = 0;
                                let finalCursorPos = 0;
                                for (let i = 0; i < formattedValue.length; i++) {
                                  if (formattedValue[i] !== '-' && /\d/.test(formattedValue[i])) nonHyphenFormatted++;
                                  finalCursorPos++;
                                  if (nonHyphenFormatted >= nonHyphenOriginal && value.length <= formattedValue.length) break;
                                  if (nonHyphenFormatted > nonHyphenOriginal && value.length > formattedValue.length) break;
                                }

                                if (value.length > formattedValue.length && selectionStart > 0) {
                                  if (value[selectionStart - 1] === '-' && formattedValue.length >= selectionStart - 1) {
                                    finalCursorPos = Math.max(0, selectionStart - 1);
                                  } else {
                                    let digitsBeforeOriginalCursor = 0;
                                    const prevCharWasDigit = selectionStart > 0 && /\d/.test(value[selectionStart - 1]);
                                    for (let i = 0; i < (selectionStart - (prevCharWasDigit ? 1 : 0)); i++) {
                                      if (/\d/.test(value[i])) digitsBeforeOriginalCursor++;
                                    }

                                    let currentDigitsInFormatted = 0;
                                    finalCursorPos = 0;
                                    for (let i = 0; i < formattedValue.length; i++) {
                                      if (/\d/.test(formattedValue[i])) currentDigitsInFormatted++;
                                      finalCursorPos++;
                                      if (currentDigitsInFormatted === digitsBeforeOriginalCursor) break;
                                    }
                                    if (selectionStart - 1 === 0 && digits.length === 0) finalCursorPos = 0;
                                    else if (digits.length > 0 && finalCursorPos === 0 && currentDigitsInFormatted < digitsBeforeOriginalCursor) finalCursorPos = formattedValue.length;


                                  }
                                } else if (selectionStart === value.length && value.length <= formattedValue.length) {
                                  finalCursorPos = formattedValue.length;
                                }
                                setCursor(finalCursorPos);
                              }


                              if (formattedValue === "") {
                                field.onChange(undefined);
                              } else {
                                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                                if (dateRegex.test(formattedValue)) {
                                  const parsedDate = parse(formattedValue, "yyyy-MM-dd", new Date());
                                  if (isValid(parsedDate)) {
                                    field.onChange(parsedDate);
                                  } else {
                                    field.onChange(undefined);
                                  }
                                } else {
                                  field.onChange(undefined);
                                }
                              }
                              if (formattedValue.length === 10 || formattedValue === "") {
                                form.trigger("expirationDate");
                              }
                            }}
                            onBlur={() => {
                              field.onBlur();
                              const formValueDate = form.getValues('expirationDate');
                              if (formValueDate && isValid(formValueDate)) {
                                const formattedRHFDate = format(formValueDate, 'yyyy-MM-dd');
                                if (dateInputValue !== formattedRHFDate) {
                                  setDateInputValue(formattedRHFDate);
                                }
                              } else if (!formValueDate && dateInputValue !== "" && !/^\d{4}(-\d{0,2}(-\d{0,2})?)?$/.test(dateInputValue)) {
                                // Keep invalid user input
                              } else if (!formValueDate && dateInputValue === "") {
                                // All good
                              }
                              form.trigger("expirationDate");
                            }}
                            className="flex-grow"
                          />
                        </FormControl>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-auto p-2 shrink-0",
                                !field.value && dateInputValue === "" && "text-muted-foreground"
                              )}
                              aria-label="打开日历"
                            >
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              locale={zhCN}
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date && isValid(date)) {
                                  field.onChange(date);
                                  setDateInputValue(format(date, "yyyy-MM-dd"));
                                } else {
                                  field.onChange(undefined);
                                }
                                setIsCalendarOpen(false);
                                form.trigger("expirationDate");
                              }}
                              disabled={(date) => {
                                const currentDisabledToday = new Date();
                                currentDisabledToday.setHours(0, 0, 0, 0);
                                return date < currentDisabledToday;
                              }}
                              initialFocus
                              fixedWeeks
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </form>
          </Form>
        </div>

        <DialogFooter className="p-6 pt-4 border-t flex flex-row w-full">
          <div className="mr-auto">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              取消
            </Button>
          </div>
          <Button
            type="submit"
            form="domain-form"
            onClick={() => form.handleSubmit(handleFormSubmit)()}
            disabled={isPending || !form.formState.isValid || (!!initialData && !form.formState.isDirty)}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "保存更改" : "添加新域名"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
