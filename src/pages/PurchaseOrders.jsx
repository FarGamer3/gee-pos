import { useState, useEffect } from 'react';
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
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { DeleteConfirmDialog, ActionSuccessDialog } from '../components/ConfirmationDialog';
import PurchaseOrderDetail from '../components/PurchaseOrderDetail';
import { getAllOrders, deleteOrder } from '../services/orderService';

function PurchaseOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
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

  // ດຶງຂໍ້ມູນລາຍການສັ່ງຊື້ເມື່ອໜ້າຖືກໂຫຼດ
  useEffect(() => {
    fetchOrders();
  }, []);

  // ຟັງຊັນດຶງຂໍ້ມູນລາຍການສັ່ງຊື້ທັງໝົດ
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
    } finally {
      setLoading(false);
    }
  };

  // ຄົ້ນຫາລາຍການສັ່ງຊື້ຕາມຄຳຄົ້ນຫາ
  const filteredOrders = orders.filter(order => 
    (order.supplier && order.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.orderDate && order.orderDate.includes(searchTerm)) ||
    (order.order_id && order.order_id.toString().includes(searchTerm))
  );

  // ຟັງຊັນຈັດການການລຶບລາຍການສັ່ງຊື້
  const handleDeleteOrder = (id) => {
    setSelectedOrderId(id);
    setDeleteDialogOpen(true);
  };
  
  // ຟັງຊັນເປີດລາຍລະອຽດລາຍການສັ່ງຊື້
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };
  
  // ຢືນຢັນການລຶບລາຍການສັ່ງຊື້
  const confirmDelete = async (id) => {
    try {
      setLoading(true);
      await deleteOrder(id);
      
      // ອັບເດດລາຍການໃນ state
      setOrders(prevOrders => prevOrders.filter(order => order.order_id !== id));
      
      // ປິດກ່ອງຂໍ້ຄວາມຢືນຢັນການລຶບແລະສະແດງກ່ອງຂໍ້ຄວາມສຳເລັດ
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
  
  // ປິດກ່ອງຂໍ້ຄວາມ dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
  };
  
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };

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
      
      <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          ລາຍລະອຽດການສັ່ງຊື້
        </Typography>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            placeholder="ຄົ້ນຫາ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/buy')}
          >
            ສ້າງການສັ່ງຊື້ໃໝ່
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell align="center">#</TableCell>
                  <TableCell align="center">ເລກທີໃບສັ່ງຊື້</TableCell>
                  <TableCell align="center">ວັນທີ ຊື້ສິນຄ້າ</TableCell>
                  <TableCell align="center">ຜູ້ສະໜອງ</TableCell>
                  <TableCell align="center">ພະນັກງານ</TableCell>
                  <TableCell align="center">ຄຳສັ່ງ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => (
                    <TableRow
                      key={order.order_id}
                      sx={{ "&:nth-of-type(odd)": { bgcolor: 'action.hover' } }}
                    >
                      <TableCell align="center">{index + 1}</TableCell>
                      <TableCell align="center">{order.order_id}</TableCell>
                      <TableCell align="center">{order.order_date || order.orderDate}</TableCell>
                      <TableCell align="center">{order.supplier}</TableCell>
                      <TableCell align="center">{order.employee}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="info"
                            size="small"
                            sx={{ borderRadius: 4 }}
                            onClick={() => handleViewOrder(order)}
                            startIcon={<VisibilityIcon />}
                          >
                            ລາຍລະອຽດ
                          </Button>
                          
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            sx={{ borderRadius: 4 }}
                            onClick={() => handleDeleteOrder(order.order_id)}
                          >
                            ລຶບ
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {error ? (
                        <Typography color="error">{error}</Typography>
                      ) : (
                        <Typography>ບໍ່ພົບຂໍ້ມູນລາຍການສັ່ງຊື້</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Layout>
  );
}

export default PurchaseOrders;