// Get authentication session to determine user role
const { data: session } = useAuthQuery();
const userRole = session?.user?.app_metadata?.role || "authenticated";
const currentUserId = session?.user?.id;
const isShipper = userRole === "shipper";

// Sidebar filters
const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<
  string | null
>(null);
const [selectedShipper, setSelectedShipper] = useState<string | null>(null);
const [showUnassigned, setShowUnassigned] = useState<boolean>(false);
const [showDeliveryIssues, setShowDeliveryIssues] = useState<boolean>(false);
const [showCancelledOrders, setShowCancelledOrders] = useState<boolean>(false);
const [dateRange, setDateRange] = useState<
  [Date | undefined, Date | undefined]
>([undefined, undefined]);
