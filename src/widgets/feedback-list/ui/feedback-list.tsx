"use client";

import { useLocale } from "app/providers/locale-provider";
import type { FeedbackStatus, FeedbackType } from "entities/feedback";
import { MoreHorizontal, Search } from "lucide-react";
import * as React from "react";
import { apiClient } from "shared/api/api-client";
import { getMessages } from "shared/lib/i18n/messages";
import { toast } from "shared/lib/toast";
import { cn } from "shared/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "shared/ui/alert-dialog";
import { Button } from "shared/ui/button";
import { Input } from "shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "shared/ui/select";
import { Textarea } from "shared/ui/textarea";

type FeedbackListItem = {
  id: string;
  title: string;
  description: string;
  type: FeedbackType;
  status: FeedbackStatus;
  createdAt: string;
  productId: string;
  product: { name: string };
  user?: { name: string; email: string };
};

type FeedbackListProps = {
  items: FeedbackListItem[];
  emptyMessage?: string;
  isAdmin?: boolean;
  initialProject?: string;
};

const STATUS_COLORS: Record<FeedbackStatus, string> = {
  OPEN: "bg-amber-500/15 text-amber-600 border-amber-400/30 dark:text-amber-400",
  IN_PROGRESS:
    "bg-blue-500/15 text-blue-600 border-blue-400/30 dark:text-blue-400",
  RESOLVED:
    "bg-emerald-500/15 text-emerald-600 border-emerald-400/30 dark:text-emerald-400",
};

const ALL = "ALL";

type EditData = {
  title: string;
  description: string;
  status: FeedbackStatus;
};

function FeedbackList({
  items: initialItems,
  emptyMessage,
  isAdmin = false,
  initialProject,
}: FeedbackListProps) {
  const { locale } = useLocale();
  const t = getMessages(locale);

  const [items, setItems] = React.useState(initialItems);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editData, setEditData] = React.useState<EditData | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(
    null,
  );

  const [search, setSearch] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"desc" | "asc">("desc");
  const [typeFilter, setTypeFilter] = React.useState<FeedbackType | "ALL">(
    ALL,
  );
  const [statusTab, setStatusTab] = React.useState<FeedbackStatus | "ALL">(
    ALL,
  );
  const [projectFilter, setProjectFilter] = React.useState<string>(
    initialProject ?? "",
  );

  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const projectOptions = React.useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of items) {
      if (!seen.has(item.productId)) {
        seen.set(item.productId, item.product.name);
      }
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [items]);

  const typeOptions: Array<{ value: FeedbackType | "ALL"; label: string }> = [
    { value: ALL, label: t.feedbackList.filterTypeAll },
    { value: "BUG", label: t.feedbackType.BUG },
    { value: "ERROR", label: t.feedbackType.ERROR },
    { value: "FEATURE_REQUEST", label: t.feedbackType.FEATURE_REQUEST },
    { value: "UI_UX", label: t.feedbackType.UI_UX },
  ];

  const statusTabs: Array<{ value: FeedbackStatus | "ALL"; label: string }> = [
    { value: ALL, label: t.feedbackList.tabAll },
    { value: "OPEN", label: t.feedbackStatus.OPEN },
    { value: "IN_PROGRESS", label: t.feedbackStatus.IN_PROGRESS },
    { value: "RESOLVED", label: t.feedbackStatus.RESOLVED },
  ];

  const filtered = React.useMemo(() => {
    const q = search.trim().toLocaleLowerCase(locale);

    return items
      .filter((item) => {
        if (statusTab !== ALL && item.status !== statusTab) return false;
        if (typeFilter !== ALL && item.type !== typeFilter) return false;
        if (projectFilter && item.productId !== projectFilter) return false;
        if (q) {
          const hay = `${item.title} ${item.description}`.toLocaleLowerCase(
            locale,
          );
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const diff =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortOrder === "desc" ? -diff : diff;
      });
  }, [items, search, statusTab, typeFilter, projectFilter, sortOrder, locale]);

  async function handleStatusChange(id: string, status: FeedbackStatus) {
    setPendingId(id);
    try {
      await apiClient.patch(`/api/feedback/${id}`, { status });
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item)),
      );
      toast.success(t.admin.updateSuccess);
    } catch {
      toast.error(t.admin.updateError);
    } finally {
      setPendingId(null);
    }
  }

  function startEdit(item: FeedbackListItem) {
    setEditingId(item.id);
    setEditData({
      title: item.title,
      description: item.description,
      status: item.status,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData(null);
  }

  async function handleSaveEdit(id: string) {
    if (!editData) return;
    setPendingId(id);
    try {
      await apiClient.patch(`/api/feedback/${id}`, editData);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...editData } : item,
        ),
      );
      toast.success(t.admin.updateSuccess);
      cancelEdit();
    } catch {
      toast.error(t.admin.updateError);
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(id: string) {
    setPendingId(id);
    try {
      await apiClient.delete(`/api/feedback/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success(t.admin.deleteSuccess);
    } catch {
      toast.error(t.admin.deleteError);
    } finally {
      setPendingId(null);
      setDeleteTargetId(null);
    }
  }

  const isEmpty = items.length === 0;
  const noResults = !isEmpty && filtered.length === 0;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      {/* Sticky sidebar */}
      <div className="glass-panel sticky top-[var(--header-height)] z-20 self-start shrink-0 rounded-[1.5rem] p-4 md:w-64">
        <div className="grid gap-4">
          {/* Search */}
          <div className="grid gap-2">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-[0.18em]">
              {t.feedbackList.searchLabel}
            </span>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={search}
                placeholder={t.feedbackList.searchPlaceholder}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="grid gap-2">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-[0.18em]">
              {t.feedbackList.sortLabel}
            </span>
            <Select
              value={sortOrder}
              onValueChange={(v) => setSortOrder(v as "asc" | "desc")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">
                  {t.feedbackList.sortNewest}
                </SelectItem>
                <SelectItem value="asc">
                  {t.feedbackList.sortOldest}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project filter */}
          {projectOptions.length > 1 ? (
            <div className="grid gap-2">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-[0.18em]">
                {t.feedbackList.filterProjectLabel}
              </span>
              <Select
                value={projectFilter || ALL}
                onValueChange={(v) =>
                  setProjectFilter(v === ALL ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>
                    {t.feedbackList.filterProjectAll}
                  </SelectItem>
                  {projectOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {/* Type filter */}
          <div className="grid gap-2">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-[0.18em]">
              {t.feedbackList.filterTypeLabel}
            </span>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as FeedbackType | "ALL")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="min-w-0 flex-1">
        {/* Sticky status tabs */}
        <div className="glass-panel sticky top-[var(--header-height)] z-10 mb-4 flex gap-1 rounded-[1.25rem] p-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusTab(tab.value)}
              className={cn(
                "flex-1 rounded-[0.875rem] px-3 py-1.5 text-sm font-medium transition-colors",
                statusTab === tab.value
                  ? "border border-sky-300/30 bg-white/16 text-foreground"
                  : "text-muted-foreground hover:bg-white/8 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* States */}
        {isEmpty ? (
          <div className="glass-panel rounded-[1.5rem] border-dashed p-8 text-center">
            <p className="text-muted-foreground text-sm">
              {emptyMessage ?? t.myFeedback.empty}
            </p>
          </div>
        ) : noResults ? (
          <div className="glass-panel rounded-[1.5rem] border-dashed p-8 text-center">
            <p className="text-muted-foreground text-sm">
              {t.feedbackList.noResults}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((item) => {
              const isEditing = editingId === item.id;
              const isPending = pendingId === item.id;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "glass-panel rounded-[1.5rem] p-4 transition-opacity",
                    isPending && "opacity-60 pointer-events-none",
                  )}
                >
                  {isEditing && editData ? (
                    /* Edit form */
                    <div className="grid gap-3">
                      <Input
                        value={editData.title}
                        onChange={(e) =>
                          setEditData((d) =>
                            d ? { ...d, title: e.target.value } : d,
                          )
                        }
                      />
                      <Textarea
                        value={editData.description}
                        rows={4}
                        onChange={(e) =>
                          setEditData((d) =>
                            d ? { ...d, description: e.target.value } : d,
                          )
                        }
                      />
                      <Select
                        value={editData.status}
                        onValueChange={(v) =>
                          setEditData((d) =>
                            d ? { ...d, status: v as FeedbackStatus } : d,
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">
                            {t.feedbackStatus.OPEN}
                          </SelectItem>
                          <SelectItem value="IN_PROGRESS">
                            {t.feedbackStatus.IN_PROGRESS}
                          </SelectItem>
                          <SelectItem value="RESOLVED">
                            {t.feedbackStatus.RESOLVED}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => void handleSaveEdit(item.id)}
                        >
                          {t.admin.saveChanges}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          {t.admin.cancelEdit}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Normal view */
                    <>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="grid gap-1">
                          <h3 className="font-medium">{item.title}</h3>
                          {item.user ? (
                            <p className="text-muted-foreground text-sm">
                              {item.user.name} · {item.user.email}
                            </p>
                          ) : null}
                          <p className="text-muted-foreground text-sm">
                            {item.product.name}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <p className="text-muted-foreground text-sm">
                            {new Date(item.createdAt).toLocaleString(
                              t.localeTag,
                            )}
                          </p>
                          {isAdmin ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-7"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-36">
                                <button
                                  type="button"
                                  className="hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-sm"
                                  onClick={() => startEdit(item)}
                                >
                                  {t.admin.editFeedback}
                                </button>
                                <button
                                  type="button"
                                  className="text-destructive hover:bg-destructive/10 flex w-full items-center rounded-sm px-2 py-1.5 text-sm"
                                  onClick={() => setDeleteTargetId(item.id)}
                                >
                                  {t.admin.deleteFeedback}
                                </button>
                              </PopoverContent>
                            </Popover>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                        <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1">
                          {t.feedbackType[item.type]}
                        </span>
                        {isAdmin ? (
                          <Select
                            value={item.status}
                            onValueChange={(v) =>
                              void handleStatusChange(
                                item.id,
                                v as FeedbackStatus,
                              )
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                "h-auto w-fit rounded-full border px-3 py-1 text-sm",
                                STATUS_COLORS[item.status],
                              )}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OPEN">
                                {t.feedbackStatus.OPEN}
                              </SelectItem>
                              <SelectItem value="IN_PROGRESS">
                                {t.feedbackStatus.IN_PROGRESS}
                              </SelectItem>
                              <SelectItem value="RESOLVED">
                                {t.feedbackStatus.RESOLVED}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span
                            className={cn(
                              "rounded-full border px-3 py-1",
                              STATUS_COLORS[item.status],
                            )}
                          >
                            {t.feedbackStatus[item.status]}
                          </span>
                        )}
                      </div>

                      <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-6 whitespace-pre-wrap break-all">
                        {item.description}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.deleteConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.admin.deleteCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTargetId) void handleDelete(deleteTargetId);
              }}
            >
              {t.admin.deleteFeedback}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export type { FeedbackListItem };
export { FeedbackList };
