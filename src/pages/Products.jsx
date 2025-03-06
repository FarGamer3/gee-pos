import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import styles from './CSS/Products.module.css';

function Products() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([
    {
      id: 1,
      image: '/src/assets/products/refrigerator.png',
      code: '000001',
      name: 'ຕູ້ເຢັນ',
      quantity: 50,
      minQuantity: 10,
      purchasePrice: 1000000,
      sellingPrice: 1250000,
      brand: 'samsung',
      type: 'ເຄື່ອງໃຊ້ໃນເຮືອນ',
      model: 'E32-SA',
      location: 'A-3',
      status: 'ພໍລະສາຍ',
    }
  ]);

  // ຟັງຊັນເພີ່ມສິນຄ້າໃໝ່
  const handleAddProduct = () => {
    navigate('/add-product');
  };

  // ຟັງຊັນແກ້ໄຂສິນຄ້າ
  const handleEditProduct = (id) => {
    navigate(`/edit-product/${id}`);
  };

  // ຟັງຊັນລຶບສິນຄ້າ
  const handleDeleteProduct = (id) => {
    if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບສິນຄ້ານີ້?')) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  // ຟັງຊັນຄົ້ນຫາ
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ກັ່ນຕອງສິນຄ້າຕາມການຄົ້ນຫາ
  const filteredProducts = products.filter(product => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <Header />
        <main className={styles.mainContent}>
          <h1 className={styles.pageTitle}>ຈັດການຂໍ້ມູນສິນຄ້າ</h1>
          
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <input 
                type="text" 
                placeholder="ຄົ້ນຫາ..." 
                value={searchTerm} 
                onChange={handleSearch}
                className={styles.searchInput}
              />
            </div>
            <button 
              className={styles.addButton}
              onClick={handleAddProduct}
            >
              ເພີ່ມ
            </button>
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.productTable}>
              <thead>
                <tr>
                  <th className={styles.numCol}>#</th>
                  <th className={styles.imageCol}>ຮູບສິນຄ້າ</th>
                  <th className={styles.codeCol}>ລະຫັດສິນຄ້າ</th>
                  <th className={styles.nameCol}>ຊື່ສິນຄ້າ</th>
                  <th className={styles.qtyCol}>ຈຳນວນ</th>
                  <th className={styles.minQtyCol}>ຈຳນວນນ້ອຍສຸດ</th>
                  <th className={styles.purchasePriceCol}>ລາຄາຕົ້ນທຶນ</th>
                  <th className={styles.sellingPriceCol}>ລາຄາຂາຍ</th>
                  <th className={styles.brandCol}>ຍີ່ຫໍ້</th>
                  <th className={styles.typeCol}>ປະເພດ</th>
                  <th className={styles.modelCol}>ລຸ້ນ</th>
                  <th className={styles.locationCol}>ບ່ອນຈັດວາງ</th>
                  <th className={styles.statusCol}>ສະຖານະ</th>
                  <th className={styles.actionCol}>ແກ້ໄຂ</th>
                  <th className={styles.actionCol}>ລຶບ</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td className={styles.imageCell}>
                      <div className={styles.productImageContainer}>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className={styles.productImage} 
                        />
                      </div>
                    </td>
                    <td>{product.code}</td>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>{product.minQuantity}</td>
                    <td>{product.purchasePrice.toLocaleString()}</td>
                    <td>{product.sellingPrice.toLocaleString()}</td>
                    <td>{product.brand}</td>
                    <td>{product.type}</td>
                    <td>{product.model}</td>
                    <td>{product.location}</td>
                    <td>{product.status}</td>
                    <td>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEditProduct(product.id)}
                      >
                        ແກ້ໄຂ
                      </button>
                    </td>
                    <td>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        ລຶບ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Products;