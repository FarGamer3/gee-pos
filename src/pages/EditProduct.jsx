import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import styles from './CSS/ProductForm.module.css';

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [imagePreview, setImagePreview] = useState(null);
  const [product, setProduct] = useState({
    code: '',
    name: '',
    quantity: 0,
    minQuantity: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    brand: '',
    type: '',
    model: '',
    location: '',
    status: '',
    image: null
  });

  // ຈຳລອງການດຶງຂໍ້ມູນຈາກ API (ໃນກໍລະນີຈິງຄວນໃຊ້ API)
  useEffect(() => {
    // ກໍລະນີຈິງ: ຄວນໃຊ້ fetch ຫຼື axios ເພື່ອດຶງຂໍ້ມູນຈາກ API
    // ຕົວຢ່າງ: fetch(`/api/products/${id}`).then(res => res.json()).then(data => setProduct(data))
    
    // ຂໍ້ມູນຕົວຢ່າງສຳລັບການທົດສອບ
    const mockProduct = {
      id: parseInt(id),
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
      image: '/src/assets/products/refrigerator.png'
    };
    
    setProduct(mockProduct);
    
    // ກໍລະນີທີ່ມີຮູບພາບແລ້ວ, ສະແດງຮູບພາບເດີມ
    if (mockProduct.image) {
      setImagePreview(mockProduct.image);
    }
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: value
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct({
        ...product,
        image: file
      });
      
      // ສ້າງ URL ສຳລັບສະແດງຮູບພາບ preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // ໃນກໍລະນີຈິງ, ສົ່ງຂໍ້ມູນໄປຍັງ API ເພື່ອອັບເດດ
    console.log('Updating product:', product);
    
    // ກັບໄປຍັງໜ້າຈັດການສິນຄ້າ
    navigate('/products');
  };
  
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        <Header />
        <main className={styles.mainContent}>
          <h1 className={styles.pageTitle}>ແກ້ໄຂຂໍ້ມູນສິນຄ້າ</h1>
          
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formImageSection}>
                  <div className={styles.imagePreviewContainer}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        ບໍ່ມີຮູບພາບ
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className={styles.fileInput}
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" className={styles.fileInputLabel}>
                    ເລືອກຮູບພາບໃໝ່
                  </label>
                </div>
                
                <div className={styles.formFields}>
                  <div className={styles.formGroup}>
                    <label htmlFor="code">ລະຫັດສິນຄ້າ</label>
                    <input 
                      type="text" 
                      id="code" 
                      name="code" 
                      value={product.code} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="name">ຊື່ສິນຄ້າ</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={product.name} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="quantity">ຈຳນວນ</label>
                      <input 
                        type="number" 
                        id="quantity" 
                        name="quantity" 
                        value={product.quantity} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="minQuantity">ຈຳນວນນ້ອຍສຸດ</label>
                      <input 
                        type="number" 
                        id="minQuantity" 
                        name="minQuantity" 
                        value={product.minQuantity} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="purchasePrice">ລາຄາຕົ້ນທຶນ</label>
                      <input 
                        type="number" 
                        id="purchasePrice" 
                        name="purchasePrice" 
                        value={product.purchasePrice} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="sellingPrice">ລາຄາຂາຍ</label>
                      <input 
                        type="number" 
                        id="sellingPrice" 
                        name="sellingPrice" 
                        value={product.sellingPrice} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="brand">ຍີ່ຫໍ້</label>
                      <input 
                        type="text" 
                        id="brand" 
                        name="brand" 
                        value={product.brand} 
                        onChange={handleChange} 
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="model">ລຸ້ນ</label>
                      <input 
                        type="text" 
                        id="model" 
                        name="model" 
                        value={product.model} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="type">ປະເພດ</label>
                      <select 
                        id="type" 
                        name="type" 
                        value={product.type} 
                        onChange={handleChange} 
                        required
                      >
                        <option value="">ເລືອກປະເພດ</option>
                        <option value="ເຄື່ອງໃຊ້ໄຟຟ້າ">ເຄື່ອງໃຊ້ໄຟຟ້າ</option>
                        <option value="ເຄື່ອງໃຊ້ໃນເຮືອນ">ເຄື່ອງໃຊ້ໃນເຮືອນ</option>
                        <option value="ອຸປະກອນອິເລັກໂທຣນິກ">ອຸປະກອນອິເລັກໂທຣນິກ</option>
                      </select>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="location">ບ່ອນຈັດວາງ</label>
                      <input 
                        type="text" 
                        id="location" 
                        name="location" 
                        value={product.location} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="status">ສະຖານະ</label>
                    <select 
                      id="status" 
                      name="status" 
                      value={product.status} 
                      onChange={handleChange} 
                      required
                    >
                      <option value="">ເລືອກສະຖານະ</option>
                      <option value="ພໍລະສາຍ">ພໍລະສາຍ</option>
                      <option value="ໝົດສາງ">ໝົດສາງ</option>
                      <option value="ຍົກເລີກການຂາຍ">ຍົກເລີກການຂາຍ</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => navigate('/products')}>
                  ຍົກເລີກ
                </button>
                <button type="submit" className={styles.submitButton}>
                  ບັນທຶກການປ່ຽນແປງ
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EditProduct;