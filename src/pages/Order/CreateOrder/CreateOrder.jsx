import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QRCode } from 'react-qrcode-logo';

function CreateOrder() {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState({});
  const [error, setError] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState(null);
  const [showPaymenModal, setShowPaymenModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [order, setOrder] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCategories() {
      setPageLoading(true);
      try {
        const response = await axios.get("http://localhost:8080/api/product/list-availables-categorys");
        setCategories(response.data);
      } catch (err) {
        let message = err?.response?.data?.message || "Erro inesperado.";
        setError("Erro ao carregar categorias: " + message);
      } finally {
        setPageLoading(false);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      const productsMap = {};
      const loadingMap = {};

      for (const category of categories) {
        loadingMap[category] = true;
        setCategoryLoading(prev => ({ ...prev, ...loadingMap }));

        try {
          const response = await axios.get(`http://localhost:8080/api/product/list-availables-by-category/${encodeURIComponent(category)}`);
          productsMap[category] = response.data;
        } catch (err) {
          let message = err?.response?.data?.message || "Erro inesperado.";
          setError("Erro ao carregar produtos: " + message);
        }

        loadingMap[category] = false;
        setCategoryLoading(prev => ({ ...prev, ...loadingMap }));
      }

      setProductsByCategory(productsMap);

      const expanded = {};
      categories.forEach(cat => expanded[cat] = true);
      setExpandedCategories(expanded);
    }

    if (categories.length > 0) {
      fetchProducts();
    }
  }, [categories]);

  function toggleProduct(category, product) {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, { ...product, category, quantity: 1 }];
      }
    });
  }

  function updateQuantity(productId, quantity) {
    setSelectedProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, quantity: Number(quantity) } : p
      )
    );
  }

  function toggleCategory(category) {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }

  async function handleConfirm() {
    try {
      const customer = JSON.parse(localStorage.getItem('customer'));
      const customerId = customer?.id;

      if (!customerId) {
        setErrorMessage('Cliente não encontrado. Faça login novamente.');
        backToLogin();
        return;
      }

      const items = selectedProducts.map(product => ({
        productId: product.id,
        quantity: product.quantity,
        category: product.category
      }));

      const order = {
        customerId,
        items
      };

      const orderResponse = await axios.post("http://localhost:8080/api/order/save", order);
      const orderId = orderResponse.data.id;
      setOrder(orderResponse.data);

      const paymentResponse = await axios.post("http://localhost:8080/api/pagamento", { orderId });
      setQrCodeData(paymentResponse.data.qrCodeImage);
      setShowPaymenModal(true);
    } catch (err) {
      console.error(err);
      let message = err?.response?.data?.message || "Erro inesperado.";
      setErrorMessage('Erro ao criar pedido: ' + message);
    }
  }

  async function handleConfirmPayment() {
    try {
      const response = await axios.get(`http://localhost:8080/api/pagamento/${order.id}`);
      const paymentStatus = response.data;

      if (paymentStatus === "PENDING") {
        setPaymentErrorMessage("Pagamento ainda não efetuado.");
      } else if ((paymentStatus === "REJECTED") || (paymentStatus === "EXPIRED")) {
        setPaymentErrorMessage("Pagamento rejeitado. Por favor, fale com um atendente.");
      } else if (paymentStatus === "APPROVED") {
        setShowPaymenModal(false);
        setShowSuccessModal(true);
        setTimeout(() => navigate("/login-customer"), 5000);
      }
    } catch (err) {
      console.error(err);
      let message = err?.response?.data?.message || "Erro inesperado.";
      setPaymentErrorMessage('Erro ao verificar pagamento: ' + message);
    }
  }

  function handleCancel() {
    setShowCancelModal(true);
  }

  function confirmCancel() {
    setShowCancelModal(false);
    backToLogin();
  }

  function backToLogin() {
    navigate('/login-customer');
  }

  if (pageLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show mt-3" role="alert">
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)}></button>
        </div>
      )}

      {errorMessage && !showPaymenModal && (
        <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
          {errorMessage}
          <button type="button" className="btn-close" onClick={() => setErrorMessage(null)}></button>
        </div>
      )}

      <h2 className="text-center mb-4">Monte seu Pedido</h2>

      {categories.map(category => (
        <section key={category} className="mb-4">
          <div
            className="d-flex justify-content-between align-items-center px-3 py-2 bg-danger text-white rounded"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleCategory(category)}
          >
            <h5 className="mb-0">{category}</h5>
            <span style={{ fontSize: 20 }}>
              {expandedCategories[category] ? '−' : '+'}
            </span>
          </div>

          {expandedCategories[category] && (
            categoryLoading[category] ? (
              <div className="d-flex justify-content-center my-3">
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : (
              <div className="row mt-3">
                {Array.isArray(productsByCategory[category]) &&
                  productsByCategory[category].map(product => {
                    const selected = selectedProducts.find(p => p.id === product.id);

                    return (
                      <div key={product.id} className="col-md-4 mb-3">
                        <div className="card border border-danger shadow-sm h-100">
                          <div className="card-body d-flex flex-column justify-content-between">
                            <div>
                              <h6 className="card-title text-danger">{product.name}</h6>
                              <p className="card-text text-muted" style={{ fontSize: '0.9rem' }}>
                                {product.description}
                              </p>
                            </div>
                            <div className="d-flex align-items-center gap-2 mt-2">
                              <button
                                type="button"
                                className={`btn btn-sm ${selected ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleProduct(category, product);
                                }}
                              >
                                {selected ? 'Remover' : 'Selecionar'}
                              </button>
                              {selected && (
                                <input
                                  type="number"
                                  min="1"
                                  className="form-control form-control-sm w-25"
                                  value={selected.quantity}
                                  onChange={e => updateQuantity(product.id, e.target.value)}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )
          )}
        </section>
      ))}

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-outline-danger" onClick={handleCancel}>
          Cancelar
        </button>

        <button
          className="btn btn-danger"
          onClick={handleConfirm}
          disabled={selectedProducts.length === 0}
        >
          Confirmar Pedido
        </button>
      </div>

      {/* Modal de cancelamento */}
      {showCancelModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cancelar Pedido</h5>
                <button type="button" className="btn-close" onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Tem certeza que deseja cancelar o pedido?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>Voltar</button>
                <button className="btn btn-danger" onClick={confirmCancel}>Sim, cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showPaymenModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border border-2 border-danger">
              <div className="modal-body text-center">
                {qrCodeData && (
                  <div className="d-flex flex-column align-items-center">
                    <p className="fw-bold">Use o QR Code abaixo para efetuar o pagamento:</p>
                    <QRCode value={qrCodeData} size={180} />
                  </div>
                )}
                {paymentErrorMessage && (
                  <div className="alert alert-danger mt-3" role="alert">
                    {paymentErrorMessage}
                  </div>
                )}
                <button className="btn btn-danger mt-4" onClick={handleConfirmPayment}>Confirmar Pagamento</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de sucesso */}
      {showSuccessModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border border-2 border-danger">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Pedido criado com sucesso!</h5>
              </div>
              <div className="modal-body text-center">
                <p className="mb-3">Muito obrigado por escolher a Challenge, volte sempre!</p>
                <button className="btn btn-danger mt-4" onClick={backToLogin}>Voltar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateOrder;