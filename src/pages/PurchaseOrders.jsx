import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Grid,
  Tooltip,
  Alert,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Collapse,
  TablePagination,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Print as PrintIcon,
  History as HistoryIcon,
  MoreVert as MoreVertIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarMonthIcon,
  Event as EventIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Assignment as AssignmentIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  FilterAlt as FilterAltIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { DeleteConfirmDialog, ActionSuccessDialog } from '../components/ConfirmationDialog';
import PurchaseOrderDetail from '../components/PurchaseOrderDetail';
import { getAllOrders, deleteOrder } from '../services/orderService';
import axios from 'axios';
import API_BASE_URL from '../config/api';

// Format number with commas
const formatNumber = (num) => {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Custom Row component with expandable details
const OrderRow = ({ order, index, onViewDetails, onDelete, onCreateImport }) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    event.stopPropagation();
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleView = () => {
    onViewDetails(order);
    handleMenuClose();
  };
  
  const handleDelete = () => {
    onDelete(order.order_id);
    handleMenuClose();
  };
  
  const handleCreateImport = () => {
    onCreateImport(order);
    handleMenuClose();
  };
  
  // Format date as DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    
    try {
      // Handle different date formats
      let date;
      if (dateStr.includes('T')) {
        // ISO format
        date = new Date(dateStr);
      } else if (dateStr.includes('/')) {
        // DD/MM/YYYY format
        const parts = dateStr.split('/');
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        // Other formats
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) return dateStr;
      
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      return dateStr;
    }
  };
  
  const formattedDate = order.formattedDate || formatDate(order.order_date);
  
  // Determine if the order has been imported
  const hasBeenImported = order.imported;
  
  return (
    <>
      <TableRow 
        hover 
        sx={{ 
          cursor: 'pointer',
          '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
          '& > *': { borderBottom: 'unset' }
        }}
        onClick={() => setOpen(!open)}
      >
        <TableCell align="center">
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="center">{index + 1}</TableCell>
        <TableCell align="center">
          <Chip 
            label={`#${order.order_id}`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{formattedDate}</Typography>
          </Box>
        </TableCell>
        <TableCell align="center">{order.supplier}</TableCell>
        <TableCell align="center">{order.employee}</TableCell>
        <TableCell align="center">
          {hasBeenImported ? (
            <Chip 
              label="ນຳເຂົ້າແລ້ວ"
              color="success"
              size="small"
            />
          ) : (
            <Chip 
              label="ລໍຖ້ານຳເຂົ້າ"
              color="warning"
              size="small"
            />
          )}
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Tooltip title="ເບິ່ງລາຍລະອຽດ">
              <IconButton
                size="small"
                color="info"
                onClick={(event) => {
                  event.stopPropagation();
                  onViewDetails(order);
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <IconButton
              size="small"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={(event) => event.stopPropagation()}
            >
              <MenuItem onClick={handleView}>
                <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                ເບິ່ງລາຍລະອຽດ
              </MenuItem>
              {!hasBeenImported && (
                <MenuItem onClick={handleCreateImport}>
                  <LocalShippingIcon fontSize="small" sx={{ mr: 1 }} />
                  ສ້າງການນຳເຂົ້າ
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                ລຶບລາຍການ
              </MenuItem>
            </Menu>
          </Box>
        </TableCell>
      </TableRow>
      
      {/* Expandable detail row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ my: 2, mx: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }} variant="outlined">
                    <Typography variant="subtitle2" color="primary.main" gutterBottom>
                      ຂໍ້ມູນການສັ່ງຊື້
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">ລະຫັດໃບສັ່ງຊື້:</Typography>
                        <Typography variant="body2" fontWeight="bold">#{order.order_id}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">ວັນທີສັ່ງຊື້:</Typography>
                        <Typography variant="body2">{formattedDate}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">ຜູ້ສະໜອງ:</Typography>
                        <Typography variant="body2">{order.supplier}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">ພະນັກງານ:</Typography>
                        <Typography variant="body2">{order.employee}</Typography>
                      </Box>
                      {order.importId && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">ລະຫັດນຳເຂົ້າ:</Typography>
                          <Typography variant="body2">#{order.importId}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} variant="outlined">
                    <Typography 
                      variant="subtitle2" 
                      color={hasBeenImported ? "success.main" : "warning.main"} 
                      gutterBottom
                    >
                      ສະຖານະ: {hasBeenImported ? "ນຳເຂົ້າແລ້ວ" : "ລໍຖ້ານຳເຂົ້າ"}
                    </Typography>
                    {hasBeenImported ? (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button 
                          variant="outlined"
                          color="primary"
                          startIcon={<VisibilityIcon />}
                          onClick={(event) => {
                            event.stopPropagation();
                            // Navigate to import detail page
                            window.open(`/import-detail?id=${order.importId}`, '_blank');
                          }}
                          size="small"
                        >
                          ເບິ່ງການນຳເຂົ້າ
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button 
                          variant="contained"
                          color="primary"
                          startIcon={<LocalShippingIcon />}
                          onClick={(event) => {
                            event.stopPropagation();
                            onCreateImport(order);
                          }}
                          size="small"
                        >
                          ສ້າງການນຳເຂົ້າ
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// Filters component
const OrderFilters = ({ onApplyFilters, onClearFilters }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const handleApplyFilters = () => {
    onApplyFilters({
      fromDate,
      toDate,
      supplier: supplierFilter,
      status: statusFilter
    });
  };
  
  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    setSupplierFilter('');
    setStatusFilter('');
    onClearFilters();
  };
  
  return (
    <Box sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        color="primary"
        startIcon={showFilters ? <KeyboardArrowUpIcon /> : <FilterAltIcon />}
        onClick={() => setShowFilters(!showFilters)}
        sx={{ mb: 1 }}
      >
        {showFilters ? 'ເຊື່ອງຕົວກອງ' : 'ສະແດງຕົວກອງ'}
      </Button>
      
      <Collapse in={showFilters}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="ວັນທີເລີ່ມຕົ້ນ"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="ວັນທີສິ້ນສຸດ"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="ຜູ້ສະໜອງ"
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                label="ສະຖານະ"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
              >
                <MenuItem value="">ທັງໝົດ</MenuItem>
                <MenuItem value="imported">ນຳເຂົ້າແລ້ວ</MenuItem>
                <MenuItem value="pending">ລໍຖ້ານຳເຂົ້າ</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FilterListIcon />}
                  onClick={handleApplyFilters}
                >
                  ກອງ
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                >
                  ລ້າງ
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
    </Box>
  );
};

// Purchase order statistics cards
const OrderStatistics = ({ orders }) => {
  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => !order.imported).length;
  const importedOrders = orders.filter(order => order.imported).length;
  const thisMonthOrders = orders.filter(order => {
    const orderDate = new Date(order.order_date);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  }).length;
  
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssignmentIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle2">ໃບສັ່ງຊື້ທັງໝົດ</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">{totalOrders}</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <HistoryIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle2">ລໍຖ້ານຳເຂົ້າ</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">{pendingOrders}</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle2">ນຳເຂົ້າແລ້ວ</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">{importedOrders}</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TodayIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle2">ເດືອນນີ້</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">{thisMonthOrders}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

function PurchaseOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [actionType, setActionType] = useState('');
  
  // Order detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);
  
  // Update filtered orders when search term or orders change
  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm]);
  
  // Check if orders have been imported
  const checkImportStatus = async (ordersData) => {
    try {
      // Get all imports
      const importsResponse = await axios.get(`${API_BASE_URL}/import/All/Import`);
      
      if (importsResponse.data && importsResponse.data.imports) {
        const imports = importsResponse.data.imports;
        
        // Create a map of order_id to import for quick lookup
        const importsMap = {};
        imports.forEach(imp => {
          if (imp.order_id) {
            importsMap[imp.order_id] = imp;
          }
        });
        
        // Update orders with import status
        const updatedOrders = ordersData.map(order => {
          const matchingImport = importsMap[order.order_id];
          return {
            ...order,
            imported: !!matchingImport,
            importId: matchingImport ? matchingImport.imp_id : null
          };
        });
        
        return updatedOrders;
      }
      
      return ordersData;
    } catch (error) {
      console.error("Error checking import status:", error);
      return ordersData;
    }
  };
  
  // Fetch all purchase orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      
      // Process dates in the received data
      let processedData = Array.isArray(data) ? data.map(order => ({
        ...order,
        // Format the date for display
        formattedDate: formatDate(order.order_date || order.orderDate)
      })) : [];
      
      // Check import status for each order
      processedData = await checkImportStatus(processedData);
      
      setOrders(processedData);
      setFilteredOrders(processedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    
    try {
      // Handle different date formats
      let date;
      if (dateStr.includes('T')) {
        // ISO format
        date = new Date(dateStr);
      } else if (dateStr.includes('/')) {
        // DD/MM/YYYY format
        const parts = dateStr.split('/');
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        // Other formats
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) return dateStr;
      
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      return dateStr;
    }
  };
  
  // Filter orders based on search term
  const filterOrders = () => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
      return;
    }
    
    const filtered = orders.filter(order => 
      (order.supplier && order.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.formattedDate && order.formattedDate.includes(searchTerm)) ||
      (order.order_id && order.order_id.toString().includes(searchTerm))
    );
    
    setFilteredOrders(filtered);
  };
  
  // Apply custom filters
  const handleApplyFilters = (filters) => {
    const { fromDate, toDate, supplier, status } = filters;
    
    let filtered = [...orders];
    
    // Filter by date range
    if (fromDate) {
      const fromDateObj = new Date(fromDate);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.order_date);
        return orderDate >= fromDateObj;
      });
    }
    
    if (toDate) {
      const toDateObj = new Date(toDate);
      // Set time to end of day
      toDateObj.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.order_date);
        return orderDate <= toDateObj;
      });
    }
    
    // Filter by supplier
    if (supplier) {
      filtered = filtered.filter(order =>
        order.supplier && order.supplier.toLowerCase().includes(supplier.toLowerCase())
      );
    }
    
    // Filter by status
    if (status) {
      filtered = filtered.filter(order => {
        if (status === 'imported') {
          return order.imported;
        } else if (status === 'pending') {
          return !order.imported;
        }
        return true;
      });
    }
    
    setFilteredOrders(filtered);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilteredOrders(orders);
    setSearchTerm('');
  };
  
  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Open order details dialog
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };
  
  // Handle order deletion
  const handleDeleteOrder = (id) => {
    setSelectedOrderId(id);
    setDeleteDialogOpen(true);
  };
  
  // Create import from order
  const handleCreateImport = (order) => {
    // Save the order ID to session storage so the import page can access it
    sessionStorage.setItem('selectedOrderId', order.order_id);
    navigate('/import');
  };
  
  // Confirm deletion
  const confirmDelete = async (id) => {
    try {
      setLoading(true);
      await deleteOrder(id);
      
      // Update orders list
      setOrders(prevOrders => prevOrders.filter(order => order.order_id !== id));
      
      // Close dialog and show success dialog
      setDeleteDialogOpen(false);
      setActionType('delete');
      setSuccessDialogOpen(true);
    } catch (err) {
      console.error("Error deleting order:", err);
      alert('ເກີດຂໍ້ຜິດພາດໃນການລຶບລາຍການສັ່ງຊື້');
    } finally {
      setLoading(false);
    }
  };
  
  // Dialog handlers
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
  };
  
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };
  
  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Layout title="ລາຍການສັ່ງຊື້">
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog 
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={confirmDelete}
        itemId={selectedOrderId}
        loading={loading}
      />
      
      {/* Success Dialog */}
      <ActionSuccessDialog 
        open={successDialogOpen}
        onClose={handleCloseSuccessDialog}
        actionType={actionType}
      />
      
      {/* Order Detail Dialog */}
      <PurchaseOrderDetail
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        order={selectedOrder}
      />
      
      {/* Page header */}
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          <AssignmentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          ລາຍການສັ່ງຊື້ທັງໝົດ
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchOrders}
            sx={{ mr: 1 }}
            disabled={loading}
          >
            ໂຫຼດຄືນໃໝ່
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/buy')}
          >
            ສ້າງການສັ່ງຊື້ໃໝ່
          </Button>
        </Box>
      </Box>
      {/* Statistics cards */}
      <OrderStatistics orders={orders} />
      
      {/* Filters */}
      <OrderFilters 
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
      
      {/* Search box */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          placeholder="ຄົ້ນຫາ..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: { xs: '100%', sm: '350px' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <Badge 
          badgeContent={filteredOrders.length} 
          color="primary"
          showZero
          sx={{ ml: 2 }}
        >
          <Typography variant="body2">ລາຍການທັງໝົດ</Typography>
        </Badge>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          
          {filteredOrders.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                ບໍ່ພົບຂໍ້ມູນລາຍການສັ່ງຊື້
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ທ່ານສາມາດສ້າງລາຍການສັ່ງຊື້ໃໝ່ໄດ້ໂດຍກົດປຸ່ມ "ສ້າງການສັ່ງຊື້ໃໝ່"
              </Typography>
            </Paper>
          ) : (
            <Paper>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.main' }}>
                    <TableRow>
                      <TableCell align="center" width="50px" sx={{ color: 'white' }}></TableCell>
                      <TableCell align="center" width="50px" sx={{ color: 'white' }}>#</TableCell>
                      <TableCell align="center" sx={{ color: 'white' }}>ລະຫັດສັ່ງຊື້</TableCell>
                      <TableCell align="center" sx={{ color: 'white' }}>ວັນທີສັ່ງຊື້</TableCell>
                      <TableCell align="center" sx={{ color: 'white' }}>ຜູ້ສະໜອງ</TableCell>
                      <TableCell align="center" sx={{ color: 'white' }}>ພະນັກງານ</TableCell>
                      <TableCell align="center" sx={{ color: 'white' }}>ສະຖານະ</TableCell>
                      <TableCell align="center" sx={{ color: 'white' }}>ຄຳສັ່ງ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedOrders.map((order, index) => (
                      <OrderRow
                        key={order.order_id}
                        order={order}
                        index={page * rowsPerPage + index}
                        onViewDetails={handleViewOrder}
                        onDelete={handleDeleteOrder}
                        onCreateImport={handleCreateImport}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="ແຖວຕໍ່ໜ້າ:"
                labelDisplayedRows={({ from, to, count }) => 
                  `${from}-${to} ຈາກ ${count !== -1 ? count : `ຫຼາຍກວ່າ ${to}`}`}
              />
            </Paper>
          )}
        </>
      )}
    </Layout>
  );
}

export default PurchaseOrders;