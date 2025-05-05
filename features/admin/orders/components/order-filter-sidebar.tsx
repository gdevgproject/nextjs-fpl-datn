// Get authentication session to determine user role
const { data: session } = useAuthQuery();
const userRole = session?.user?.app_metadata?.role || "authenticated";
const isShipper = userRole === "shipper";

// Get order statuses for filter
const { data: statusesResponse, isLoading: statusesLoading } =
  useOrderStatuses();
const orderStatuses = statusesResponse?.data || [];

// Get shippers for filter - only for admin and staff
const { data: shippersResponse, isLoading: shippersLoading } = useShippers({
  enabled: !isShipper, // Don't load shippers data if user is a shipper
});
