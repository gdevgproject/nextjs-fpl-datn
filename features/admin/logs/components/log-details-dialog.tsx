import { memo, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Clock, 
  User, 
  FileText, 
  Tag, 
  Hash, 
  Code, 
  Copy, 
  ExternalLink, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { JsonView } from "./json-view";
import { useUserEmails } from "../hooks/use-user-emails";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { cn } from "@/lib/utils";
import type { AdminActivityLog } from "../types";

interface LogDetailsDialogProps {
  log: AdminActivityLog;
  logs?: AdminActivityLog[];
  currentIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (index: number) => void;
}

// Memoize component để tránh re-render không cần thiết
export const LogDetailsDialog = memo(function LogDetailsDialog({
  log,
  logs = [],
  currentIndex = -1,
  open,
  onOpenChange,
  onNavigate
}: LogDetailsDialogProps) {
  const toast = useSonnerToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  
  // Parse JSON details một lần duy nhất
  const parsedDetails = useMemo(() => {
    if (!log.details) return null;
    try {
      return typeof log.details === "string"
        ? JSON.parse(log.details)
        : log.details;
    } catch (error) {
      console.error("Error parsing log details:", error);
      return log.details;
    }
  }, [log.details]);
  
  // Xác định ID người dùng cần lấy email (admin_user_id + cancelled_by_user_id nếu có)
  const userIdsToFetch = useMemo(() => {
    const ids = log?.admin_user_id ? [log.admin_user_id] : [];
    
    // Thêm cancelled_by_user_id nếu có trong details
    if (parsedDetails && 
        typeof parsedDetails === 'object' && 
        parsedDetails.cancelled_by_user_id && 
        typeof parsedDetails.cancelled_by_user_id === 'string') {
      ids.push(parsedDetails.cancelled_by_user_id);
    }
    
    return ids;
  }, [log.admin_user_id, parsedDetails]);

  // Fetch user email - dùng hook đã tối ưu với caching
  const { data: userEmails, isLoading: isLoadingEmails } = useUserEmails(userIdsToFetch);

  // Memoize các giá trị phái sinh để tránh tính toán lại nếu props không đổi
  const activityTypeColor = useMemo(
    () => getActivityTypeColor(log.activity_type),
    [log.activity_type]
  );
  
  const entityTypeColor = useMemo(
    () => getEntityTypeColor(log.entity_type),
    [log.entity_type]
  );
  
  const formattedTimestamp = useMemo(() => {
    const date = new Date(log.timestamp);
    return {
      full: date.toLocaleString("vi-VN"),
      date: date.toLocaleDateString("vi-VN"),
      time: date.toLocaleTimeString("vi-VN")
    };
  }, [log.timestamp]);
  
  const adminEmail = useMemo(() => {
    if (!log.admin_user_id) return "Không xác định";
    if (isLoadingEmails) return "Đang tải...";
    return userEmails?.[log.admin_user_id] || log.admin_user_id;
  }, [log.admin_user_id, userEmails, isLoadingEmails]);

  // Xác định người hủy đơn nếu có
  const cancelledByUser = useMemo(() => {
    if (!parsedDetails || typeof parsedDetails !== 'object' || !parsedDetails.cancelled_by_user_id) {
      return null;
    }
    
    const userId = parsedDetails.cancelled_by_user_id;
    const isAuthenticated = parsedDetails.is_authenticated === true;
    const reason = parsedDetails.reason || "Không có lý do";
    
    let userEmail = isLoadingEmails ? "Đang tải..." : (userEmails?.[userId] || userId);
    
    return {
      userId,
      email: userEmail,
      isAuthenticated,
      reason
    };
  }, [parsedDetails, userEmails, isLoadingEmails]);

  // Phân tích chi tiết dữ liệu thay đổi cho update operations
  const changeDetails = useMemo(() => {
    if (!parsedDetails || log.activity_type.indexOf('UPDATE') === -1) return null;
    
    const oldData = parsedDetails.old || {};
    const newData = parsedDetails.new || {};
    
    // Xác định các trường đã thay đổi
    const changes = {};
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    
    allKeys.forEach(key => {
      // So sánh giá trị cũ và mới
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes[key] = {
          old: oldData[key],
          new: newData[key]
        };
      }
    });
    
    return Object.keys(changes).length > 0 ? changes : null;
  }, [parsedDetails, log.activity_type]);

  // Hàm sao chép nội dung log dưới dạng JSON
  const handleCopyJson = () => {
    const logData = {
      id: log.id,
      type: log.activity_type,
      description: log.description,
      entity: {
        type: log.entity_type,
        id: log.entity_id
      },
      user: adminEmail,
      timestamp: log.timestamp,
      details: parsedDetails
    };
    
    navigator.clipboard.writeText(JSON.stringify(logData, null, 2))
      .then(() => {
        setCopied(true);
        toast.success("Đã sao chép thông tin log");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        toast.error("Không thể sao chép: " + err.message);
      });
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < logs.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2">
            <Badge
              className={`${activityTypeColor} hover:${activityTypeColor} mr-2`}
            >
              {log.activity_type}
            </Badge>
            <span className="truncate">{log.description}</span>
          </DialogTitle>
          <div className="flex flex-wrap gap-3 items-center text-sm text-muted-foreground">
            <Badge variant="outline" className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {formattedTimestamp.full}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5">
              <User className="h-3 w-3" />
              {adminEmail}
            </Badge>
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1.5 ${entityTypeColor} text-white border-0`}
            >
              <FileText className="h-3 w-3" />
              {log.entity_type}
            </Badge>
            {log.entity_id && (
              <Badge variant="outline" className="flex items-center gap-1.5">
                <Hash className="h-3 w-3" />
                {log.entity_id}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="changes" disabled={!changeDetails}>Thay đổi</TabsTrigger>
            <TabsTrigger value="raw">Dữ liệu thô</TabsTrigger>
          </TabsList>
          
          <div className="pt-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 200px)' }}>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="bg-muted/50 rounded-md p-3">
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> Thời gian
                    </h4>
                    <p className="text-sm">{formattedTimestamp.date}</p>
                    <p className="text-sm font-medium">{formattedTimestamp.time}</p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-md p-3">
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                      <User className="h-4 w-4" /> Người thực hiện
                    </h4>
                    <p className="text-sm">{adminEmail}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-muted/50 rounded-md p-3">
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                      <FileText className="h-4 w-4" /> Loại đối tượng
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className={`${entityTypeColor}`}>
                        {log.entity_type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-md p-3">
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                      <Tag className="h-4 w-4" /> Loại hoạt động
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className={`${activityTypeColor}`}>
                        {log.activity_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {getActivityDescription(log.activity_type)}
                      </span>
                    </div>
                  </div>
                  
                  {log.entity_id && (
                    <div className="bg-muted/50 rounded-md p-3">
                      <h4 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                        <Hash className="h-4 w-4" /> ID đối tượng
                      </h4>
                      <p className="text-sm font-mono">{log.entity_id}</p>
                    </div>
                  )}
                </div>
              </div>

              {cancelledByUser && (
                <div className="bg-muted/50 rounded-md p-3">
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                    <User className="h-4 w-4" /> Người hủy đơn
                  </h4>
                  <p className="text-sm">{cancelledByUser.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Lý do: {cancelledByUser.reason}</p>
                </div>
              )}

              {parsedDetails && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Code className="h-4 w-4" /> Dữ liệu liên quan
                    </h4>
                    <div className="bg-muted/50 rounded-md p-1 max-h-[300px] overflow-auto">
                      <JsonView data={parsedDetails} />
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="changes" className="space-y-4">
              {changeDetails && (
                <div className="space-y-4">
                  <div className="bg-muted rounded-md p-4">
                    <h4 className="text-base font-medium mb-3">Các trường đã thay đổi</h4>
                    {Object.entries(changeDetails).map(([key, value]: [string, any]) => (
                      <div key={key} className="mb-4 rounded-md border">
                        <div className="bg-muted/70 px-3 py-2 border-b">
                          <h5 className="font-medium">{formatFieldName(key)}</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3">
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Giá trị cũ:</div>
                            <div className="bg-rose-500/10 rounded p-2 text-sm overflow-auto max-h-[150px]">
                              <DisplayValue value={value.old} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Giá trị mới:</div>
                            <div className="bg-emerald-500/10 rounded p-2 text-sm overflow-auto max-h-[150px]">
                              <DisplayValue value={value.new} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="raw" className="space-y-4">
              <div className="bg-muted/50 rounded-md p-3 relative">
                <div className="absolute right-3 top-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={handleCopyJson}
                          className="h-7 w-7"
                        >
                          {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sao chép JSON</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Code className="h-4 w-4" /> Dữ liệu log thô
                </h4>
                <div className="bg-muted rounded-md p-2 overflow-auto max-h-[400px]">
                  <pre className="text-xs">
                    {JSON.stringify(
                      {
                        id: log.id,
                        admin_user_id: log.admin_user_id,
                        admin_email: adminEmail,
                        activity_type: log.activity_type,
                        description: log.description,
                        entity_type: log.entity_type,
                        entity_id: log.entity_id,
                        details: parsedDetails,
                        timestamp: log.timestamp,
                        formatted_date: formattedTimestamp.full
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center border-t pt-2 mt-2">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleCopyJson}
                    className="h-8 w-8"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sao chép JSON</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {log.entity_type === 'product' && log.entity_id && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(`/admin/catalog/products/${log.entity_id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Xem chi tiết sản phẩm</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {logs.length > 1 && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                disabled={!canGoPrevious}
                onClick={() => onNavigate && canGoPrevious && onNavigate(currentIndex - 1)}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} / {logs.length}
              </span>
              
              <Button 
                variant="outline" 
                size="icon"
                disabled={!canGoNext}
                onClick={() => onNavigate && canGoNext && onNavigate(currentIndex + 1)}
                className="h-8 w-8"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <Button variant="default" onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

// Function để lấy màu badge theo loại hoạt động
function getActivityTypeColor(type: string) {
  if (type.includes("CREATE") || type.includes("INSERT")) return "bg-green-500";
  if (type.includes("UPDATE")) return "bg-blue-500";
  if (type.includes("DELETE")) return "bg-red-500";
  if (type.includes("CANCEL")) return "bg-orange-500";
  if (type.includes("APPROVE")) return "bg-emerald-500";
  return "bg-gray-500";
}

// Function để lấy màu badge theo loại đối tượng
function getEntityTypeColor(type: string) {
  switch (type) {
    case "product":
    case "products":
      return "bg-indigo-500";
    case "order":
    case "orders":
      return "bg-amber-500";
    case "review":
    case "reviews":
      return "bg-purple-500";
    case "user":
    case "users":
    case "profile":
    case "profiles":
      return "bg-cyan-500";
    case "brand":
    case "brands":
      return "bg-pink-500";
    case "category":
    case "categories":
      return "bg-teal-500";
    default:
      return "bg-slate-500";
  }
}

// Function để hiển thị mô tả hoạt động
function getActivityDescription(type: string) {
  if (type.includes("INSERT") || type.includes("CREATE")) return "Tạo mới";
  if (type.includes("UPDATE")) return "Cập nhật";
  if (type.includes("DELETE")) return "Xóa";
  if (type.includes("CANCEL")) return "Hủy";
  if (type.includes("APPROVE")) return "Phê duyệt";
  return "Hoạt động";
}

// Function để định dạng tên trường
function formatFieldName(key: string) {
  // Thay thế gạch dưới bằng khoảng trắng và viết hoa chữ cái đầu
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Component hiển thị giá trị
function DisplayValue({ value }: { value: any }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">Không có giá trị</span>;
  }
  
  if (typeof value === 'object') {
    return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
  }
  
  if (typeof value === 'boolean') {
    return value ? (
      <Badge variant="default" className="bg-green-500">Có</Badge>
    ) : (
      <Badge variant="outline">Không</Badge>
    );
  }
  
  // Kiểm tra nếu là chuỗi URL hình ảnh
  if (typeof value === 'string' && (value.match(/\.(jpeg|jpg|gif|png)$/) || value.includes('storage.googleapis') || value.includes('supabase'))) {
    return (
      <div>
        <span className="text-xs text-muted-foreground block mb-1">{value}</span>
        <img src={value} alt="Preview" className="max-h-[100px] max-w-full object-contain rounded" />
      </div>
    );
  }
  
  // Kiểm tra nếu là định dạng ngày tháng
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    try {
      const date = new Date(value);
      return date.toLocaleString('vi-VN');
    } catch (e) {
      return value;
    }
  }
  
  return value.toString();
}
