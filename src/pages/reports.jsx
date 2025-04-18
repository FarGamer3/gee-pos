import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import Layout from '../components/Layout';

function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

  // Report types
  const reportTypes = [
    { value: 'sales', label: 'ລາຍງານການຂາຍ' },
    { value: 'inventory', label: 'ລາຍງານສິນຄ້າຄົງເຫຼືອ' },
    { value: 'imports', label: 'ລາຍງານການນຳເຂົ້າ' },
    { value: 'exports', label: 'ລາຍງານການນຳອອກ' }
  ];

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };

  const handleGenerateReport = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // This is mock data - in a real application you'd fetch from your API
      const mockData = generateMockData(reportType);
      setReportData(mockData);
      setLoading(false);
    }, 1500);
  };

  // Generate mock data based on report type
  const generateMockData = (type) => {
    switch (type) {
      case 'sales':
        return [
          { id: 1, date: '14/04/2025', customer: 'ພຸດທະເສນ ສິມມະຫາໂນ', totalAmount: 8000000, items: 3 },
          { id: 2, date: '15/04/2025', customer: 'ລຸ້ງຟ້າ ງາມ', totalAmount: 4500000, items: 1 },
          { id: 3, date: '16/04/2025', customer: 'ລູກຄ້າທົ່ວໄປ', totalAmount: 6000000, items: 2 }
        ];
      case 'inventory':
        return [
          { id: 1, name: 'ແອ Samsung Wind-Free Premium', stock: 10, location: 'A', minLevel: 2 },
          { id: 2, name: 'LG DUALCOOL Inverter', stock: 2, location: 'A', minLevel: 2 },
          { id: 3, name: 'ຕູ້ເຢັນ Samsung Twin Cooling Plus', stock: 10, location: 'B', minLevel: 2 }
        ];
      case 'imports':
        return [
          { id: 1, date: '10/04/2025', supplier: 'ບໍລິສັດ ໂອດ່ຽນ', items: 5, totalCost: 30000000 },
          { id: 2, date: '12/04/2025', supplier: 'ບໍລິສັດ LTH', items: 3, totalCost: 15000000 }
        ];
      case 'exports':
        return [
          { id: 1, date: '11/04/2025', reason: 'ສິນຄ້າເສຍຫາຍ', items: 2 },
          { id: 2, date: '13/04/2025', reason: 'ສິນຄ້າໝົດອາຍຸ', items: 1 }
        ];
      default:
        return [];
    }
  };

  // Format number with commas - FIXED to handle undefined/null values
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Render the appropriate table based on report type
  const renderReportTable = () => {
    if (reportData.length === 0) {
      return null;
    }

    switch (reportType) {
      case 'sales':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ລະຫັດໃບບິນ</TableCell>
                  <TableCell>ວັນທີຂາຍ</TableCell>
                  <TableCell>ລູກຄ້າ</TableCell>
                  <TableCell align="center">ຈຳນວນລາຍການ</TableCell>
                  <TableCell align="right">ຈຳນວນເງິນ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.date || '-'}</TableCell>
                    <TableCell>{row.customer || '-'}</TableCell>
                    <TableCell align="center">{row.items || 0}</TableCell>
                    <TableCell align="right">{formatNumber(row.totalAmount)} ກີບ</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} />
                  <TableCell align="right"><strong>ລວມທັງໝົດ:</strong></TableCell>
                  <TableCell align="right">
                    <strong>
                      {formatNumber(reportData.reduce((sum, row) => sum + (row.totalAmount || 0), 0))} ກີບ
                    </strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        );
      
      case 'inventory':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ລະຫັດ</TableCell>
                  <TableCell>ຊື່ສິນຄ້າ</TableCell>
                  <TableCell align="center">ຈຳນວນຄົງເຫຼືອ</TableCell>
                  <TableCell align="center">ຈຳນວນຕໍ່າສຸດ</TableCell>
                  <TableCell align="center">ບ່ອນຈັດວາງ</TableCell>
                  <TableCell align="center">ສະຖານະ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name || '-'}</TableCell>
                    <TableCell align="center">{row.stock || 0}</TableCell>
                    <TableCell align="center">{row.minLevel || 0}</TableCell>
                    <TableCell align="center">{row.location || '-'}</TableCell>
                    <TableCell align="center">
                      {row.stock <= row.minLevel ? 
                        <span style={{ color: 'red' }}>ຕ້ອງສັ່ງຊື້</span> : 
                        <span style={{ color: 'green' }}>ປົກກະຕິ</span>
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      
      case 'imports':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ລະຫັດ</TableCell>
                  <TableCell>ວັນທີນຳເຂົ້າ</TableCell>
                  <TableCell>ຜູ້ສະໜອງ</TableCell>
                  <TableCell align="center">ຈຳນວນລາຍການ</TableCell>
                  <TableCell align="right">ມູນຄ່າລວມ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.date || '-'}</TableCell>
                    <TableCell>{row.supplier || '-'}</TableCell>
                    <TableCell align="center">{row.items || 0}</TableCell>
                    <TableCell align="right">{formatNumber(row.totalCost)} ກີບ</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} />
                  <TableCell align="right"><strong>ລວມທັງໝົດ:</strong></TableCell>
                  <TableCell align="right">
                    <strong>
                      {formatNumber(reportData.reduce((sum, row) => sum + (row.totalCost || 0), 0))} ກີບ
                    </strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        );
      
      case 'exports':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ລະຫັດ</TableCell>
                  <TableCell>ວັນທີນຳອອກ</TableCell>
                  <TableCell>ສາເຫດການນຳອອກ</TableCell>
                  <TableCell align="center">ຈຳນວນລາຍການ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.date || '-'}</TableCell>
                    <TableCell>{row.reason || '-'}</TableCell>
                    <TableCell align="center">{row.items || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <Layout title="ລາຍງານ">
      <Box sx={{ mb: 3 }}>
        <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            ລາຍງານຕ່າງໆ
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="ປະເພດລາຍງານ"
              value={reportType}
              onChange={handleReportTypeChange}
            >
              {reportTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="ວັນທີເລີ່ມຕົ້ນ"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="ວັນທີສິ້ນສຸດ"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'ສ້າງລາຍງານ'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          {reportData.length > 0 ? (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {reportTypes.find(r => r.value === reportType)?.label}
              </Typography>
              {renderReportTable()}
            </>
          ) : (
            <Typography variant="body1" align="center" color="text.secondary">
              ກະລຸນາເລືອກປະເພດລາຍງານແລະກົດປຸ່ມສ້າງລາຍງານ
            </Typography>
          )}
        </Paper>
      )}
    </Layout>
  );
}

export default Reports;