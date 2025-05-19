import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";

function ProductDashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [editData, setEditData] = useState({
        id: "",
        name: "",
        description: "",
        price: "",
        category: "",
        status: "DISPONIVEL",
        image: ""
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        setLoading(true);
        axios
            .get("http://localhost:8080/api/product/list")
            .then((res) => setProducts(res.data))
            .catch((err) => console.error("Erro ao carregar produtos:", err))
            .finally(() => setLoading(false));
    };

    if (loading) return <div className="text-center mt-5">Carregando produtos...</div>;

    const handleDelete = () => {
        if (!selectedProductId) return;
        axios
            .delete(`http://localhost:8080/api/product/delete/${selectedProductId}`)
            .then(() => {
                fetchProducts();
                setSelectedProductId(null);
                const modalEl = window.bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal"));
                modalEl.hide();
            })
            .catch((err) => console.error("Erro ao excluir produto:", err));
    };

    const handleEditSubmit = () => {
        axios
            .post(`http://localhost:8080/api/product/save`, editData)
            .then(() => {
                fetchProducts();
                const modalEl = window.bootstrap.Modal.getInstance(document.getElementById("editModal"));
                modalEl.hide();
            })
            .catch((err) => console.error("Erro ao atualizar produto:", err));
    };

    const openAddModal = () => {
        setSelectedProductId(null);
        setEditData({
            id: "",
            name: "",
            description: "",
            price: "",
            category: "",
            status: "DISPONIVEL",
            image: ""
        });
        const modal = new window.bootstrap.Modal(document.getElementById("editModal"));
        modal.show();
    };

    const openEditModal = (product) => {
        setSelectedProductId(product.id);
        setEditData({ ...product });
        const modal = new window.bootstrap.Modal(document.getElementById("editModal"));
        modal.show();
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Lista de Produtos</h2>
            <div className="d-flex justify-content-end mb-2">
                <button className="btn btn-success" onClick={openAddModal}>Adicionar</button>
            </div>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <table className="table table-striped table-bordered rounded border border-secondary text-center align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Nome</th>
                            <th>Descrição</th>
                            <th>Preço</th>
                            <th>Categoria</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.name}</td>
                                    <td>{product.description}</td>
                                    <td>R$ {product.price.toFixed(2)}</td>
                                    <td>{product.category}</td>
                                    <td>
                                        <span
                                            className={`badge ${product.status === "DISPONIVEL" ? "bg-success" : "bg-danger"}`}
                                            style={{ padding: "0.5em 1em", fontWeight: "600" }}
                                        >
                                            {product.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-link text-primary me-2"
                                            title="Editar"
                                            onClick={() => openEditModal(product)}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </button>
                                        <button
                                            className="btn btn-link text-danger"
                                            title="Excluir"
                                            onClick={() => {
                                                setSelectedProductId(product.id);
                                                const modal = new window.bootstrap.Modal(document.getElementById("confirmDeleteModal"));
                                                modal.show();
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Exclusão */}
            <div className="modal fade" id="confirmDeleteModal" tabIndex="-1" aria-labelledby="confirmDeleteModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title">Confirmar Exclusão</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div className="modal-body">Tem certeza que deseja excluir este produto?</div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>Sim, Excluir</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Edição e Adição */}
            <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">{editData.id ? "Editar Produto" : "Adicionar Produto"}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Nome</label>
                                <input type="text" className="form-control" name="name" value={editData.name} onChange={handleEditChange} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Descrição</label>
                                <textarea className="form-control" name="description" value={editData.description} onChange={handleEditChange} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Preço</label>
                                <input type="number" className="form-control" name="price" value={editData.price} onChange={handleEditChange} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Categoria</label>
                                <input type="text" className="form-control" name="category" value={editData.category} onChange={handleEditChange} />
                            </div>
                            <div className="form-check form-switch mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="statusSwitch"
                                    checked={editData.status === "DISPONIVEL"}
                                    onChange={(e) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            status: e.target.checked ? "DISPONIVEL" : "INDISPONIVEL",
                                        }))
                                    }
                                />
                                <label className="form-check-label" htmlFor="statusSwitch">
                                    {editData.status === "DISPONIVEL" ? "Disponível" : "Indisponível"}
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-primary" onClick={handleEditSubmit}>Salvar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDashboard;
