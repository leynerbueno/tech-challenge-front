import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faRotate } from "@fortawesome/free-solid-svg-icons";

function OrderDashboard() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [nameFilter, setNameFilter] = useState("");
    const [orderDetails, setOrderDetails] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [error, setError] = useState("");
    const today = new Date().toISOString().split("T")[0];
    const [initialDt, setInitialDt] = useState(today);
    const [finalDt, setFinalDt] = useState(today);

    useEffect(() => {
        axios.get("http://localhost:8080/api/order/list-status")
            .then(res => setStatuses(res.data))
            .catch(err => {
                let message = err?.response?.data?.message || "Erro inesperado.";;
                setError("Erro ao carregar status: " + message)
            });
    }, []);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        applyFilters(orders);
    }, [statusFilter, nameFilter]);

    const fetchOrders = () => {
        if (!validate()) return;
        const initialDateTime = `${initialDt}T00:00:00`;
        const finalDateTime = `${finalDt}T23:59:59`;

        axios.get(`http://localhost:8080/api/order/list-by-period/${initialDateTime}/${finalDateTime}`)
            .then((res) => {
                setOrders(res.data);
                applyFilters(res.data);
            })
            .catch((err) => {
                let message = err?.response?.data?.message || "Erro inesperado.";;
                setError("Erro ao carregar pedidos: " + message)
            });
    };

    const applyFilters = (ordersToFilter) => {
        const filtered = ordersToFilter.filter(order => {
            const statusMatch = !statusFilter || order.status === statusFilter;
            const nameMatch = order.customerName?.toLowerCase().includes(nameFilter.toLowerCase());
            return statusMatch && nameMatch;
        });
        setFilteredOrders(filtered);
    };

    const openEditModal = (orderId) => {
        setOrderDetails(null);
        axios.get(`http://localhost:8080/api/order/find-by-id/${orderId}`)
            .then((res) => {
                setOrderDetails(res.data);
                setIsEditModalOpen(true);
                document.body.classList.add("modal-open");
            })
            .catch((err) => {
                setError("Erro ao carregar detalhes do pedido: " + err)
            });
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        document.body.classList.remove("modal-open");
    };

    const openStatusModal = (orderId) => {
        setSelectedOrderId(orderId);
        setNewStatus("");
        setIsStatusModalOpen(true);
    };

    const closeStatusModal = () => {
        setIsStatusModalOpen(false);
    };

    const confirmStatusChange = () => {
        const attendant = JSON.parse(localStorage.getItem('attendant'));
        const attendantId = attendant?.id;

        if (!attendantId) {
            closeStatusModal();
            setError('Atendente não encontrado. Faça login novamente.');
            navigate('/login-attendant');
            return;
        }

        axios.post("http://localhost:8080/api/order/update-status", {
            orderId: selectedOrderId,
            attendantId: attendantId,
            status: newStatus
        })
            .then(() => {
                closeStatusModal();
                fetchOrders();
            })
            .catch(err => {
                closeStatusModal();
                let message = err?.response?.data?.message || "Erro inesperado.";;
                setError("Erro ao alterar status: " + message);
            });
    };

    const validate = () => {
        if (!initialDt || !finalDt) {
            setError("Ambas as datas são obrigatórias.");
            return false;
        }
        if (initialDt > today || finalDt > today || initialDt > finalDt) {
            setError("Datas inválidas.");
            return false;
        }
        setError("");
        return true;
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Pedidos</h2>

            <div className="d-flex justify-content-between align-items-end mb-3 gap-3 flex-wrap">
                <div>
                    <label className="form-label">Data Inicial:</label>
                    <input type="date" className="form-control" value={initialDt} max={today} onChange={(e) => setInitialDt(e.target.value)} />
                </div>
                <div>
                    <label className="form-label">Data Final:</label>
                    <input type="date" className="form-control" value={finalDt} max={today} onChange={(e) => setFinalDt(e.target.value)} />
                </div>
                <div>
                    <label className="form-label">Status:</label>
                    <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">Todos</option>
                        {statuses.filter(status => !["PAGAMENTO_PENDENTE", "NAO_PAGO", "PAGO"].includes(status))
                            .map((status, i) => (
                                <option key={i} value={status}>{status}</option>
                            ))}
                    </select>
                </div>
                <div>
                    <label className="form-label">Cliente:</label>
                    <input type="text" className="form-control" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} placeholder="Buscar por nome" />
                </div>
                <button className="btn btn-success" onClick={fetchOrders}>Pesquisar</button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                <table className="table table-striped table-bordered text-center align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Cliente</th>
                            <th>Status</th>
                            <th>Ultima Atualização</th>
                            <th>Preço</th>
                            <th>Data do Pedido</th>
                            <th>Detalhes</th>
                            <th>Alterar Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr><td colSpan="7">Nenhum pedido encontrado</td></tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.customerName}</td>
                                    <td>{order.status}</td>
                                    <td>{new Date(order.statusDt).toLocaleString()}</td>
                                    <td>R$ {order.price.toFixed(2)}</td>
                                    <td>{new Date(order.orderDt).toLocaleString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-link text-primary me-2"
                                            title="Editar"
                                            onClick={() => openEditModal(order.orderId)}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-link text-warning"
                                            title="Alterar Status"
                                            onClick={() => openStatusModal(order.orderId)}
                                            disabled={new Date(order.orderDt).toDateString() !== new Date().toDateString()}
                                        >
                                            <FontAwesomeIcon icon={faRotate} className="text-primary" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isEditModalOpen && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Detalhes do Pedido</h5>
                                <button type="button" className="btn-close" onClick={closeEditModal}></button>
                            </div>
                            <div className="modal-body">
                                {orderDetails ? (
                                    <>
                                        <div className="mb-3">
                                            <label className="form-label">Nome do Cliente</label>
                                            <input type="text" className="form-control" value={orderDetails.customerName} disabled />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Status</label>
                                            <input type="text" className="form-control" value={orderDetails.status} disabled />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Atendente</label>
                                            <input type="text" className="form-control" value={orderDetails.attendantName} disabled />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Data do Pedido</label>
                                            <input type="text" className="form-control" value={new Date(orderDetails.orderDt).toLocaleString()} disabled />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Valor Total</label>
                                            <input type="text" className="form-control" value={`R$ ${orderDetails.price.toFixed(2)}`} disabled />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Itens do Pedido</label>
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Produto</th>
                                                        <th>Quantidade</th>
                                                        <th>Preço Unitário</th>
                                                        <th>Categoria</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orderDetails.items.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>{item.productName}</td>
                                                            <td>{item.quantity}</td>
                                                            <td>R$ {item.unitPrice.toFixed(2)}</td>
                                                            <td>{item.category}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <p>Carregando detalhes do pedido...</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>Fechar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isStatusModalOpen && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Alterar Status</h5>
                                <button type="button" className="btn-close" onClick={closeStatusModal}></button>
                            </div>
                            <div className="modal-body">
                                <label className="form-label">Selecione o novo Status:</label>
                                <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                    <option value="">Selecione</option>
                                    {statuses.filter(status => !["PAGAMENTO_PENDENTE", "NAO_PAGO", "PAGO"].includes(status))
                                    .map((status, i) => (
                                        <option key={i} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={closeStatusModal}>Cancelar</button>
                                <button className="btn btn-primary" disabled={!newStatus} onClick={confirmStatusChange}>Salvar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderDashboard;
