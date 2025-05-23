import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateOrder() {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [selectedProducts, setSelectedProducts] = useState({});
  const [categoryLoading, setCategoryLoading] = useState({});
  const [error, setError] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCategories() {
      setPageLoading(true);
      try {
        const response = await axios.get("http://localhost:8080/api/product/list-availables-categorys");
        setCategories(response.data);
      } catch (err) {
        setError("Erro ao carregar categorias");
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
          const response = await axios.get(
            `http://localhost:8080/api/product/list-availables-by-category/${encodeURIComponent(category)}`
          );
          productsMap[category] = response.data;
        } catch (err) {
          setError("Erro ao carregar produtos");
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
      const current = prev[category] || [];
      const exists = current.find(p => p.id === product.id);

      if (exists) {
        return {
          ...prev,
          [category]: current.filter(p => p.id !== product.id)
        };
      } else {
        return {
          ...prev,
          [category]: [...current, { ...product, quantity: 1 }]
        };
      }
    });
  }

  function updateQuantity(category, productId, quantity) {
    setSelectedProducts(prev => {
      const updatedList = prev[category].map(p =>
        p.id === productId ? { ...p, quantity: Number(quantity) } : p
      );
      return {
        ...prev,
        [category]: updatedList
      };
    });
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
        navigate('/login-customer');
        return;
      }

      const items = Object.entries(selectedProducts).flatMap(([category, products]) =>
        products.map(product => ({
          productId: product.id,
          quantity: product.quantity,
          category
        }))
      );

      const order = {
        customerId,
        items
      };

      console.log(order.items);
      await axios.post("http://localhost:8080/api/order/save", order);
      setShowSuccessModal(true);
      setTimeout(() => navigate("/login-customer"), 3000);
    } catch (err) {
      let message = err?.response?.data;
      console.error(err);
      setErrorMessage('Erro ao criar pedido: ' + message);
    }
  }

  function handleCancel() {
    setShowCancelModal(true);
  }

  function confirmCancel() {
    setShowCancelModal(false);
    navigate('/login-customer');
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

      {errorMessage && (
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
                    const selected = (selectedProducts[category] || []).find(p => p.id === product.id);
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
                                  onChange={e => updateQuantity(category, product.id, e.target.value)}
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
          disabled={Object.values(selectedProducts).flat().length === 0}
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

      {/* Modal de sucesso */}
      {showSuccessModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border border-2 border-danger">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Pedido criado com sucesso!</h5>
              </div>
              <div className="modal-body">
                <p className="mb-4">Muito obrigado por escolher a Challenge, volte sempre!</p>
                <button className="btn btn-danger" onClick={backToLogin}>Voltar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateOrder;
