import { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { validateCPF } from '../../../utils/cpfUtils.js';



function AttendantDashboard() {
    const [attendants, setAttendants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAttendantId, setSelectedAttendantId] = useState(null);
    const [error, setError] = useState(null);
    const [editData, setEditData] = useState({
        id: "",
        name: "",
        cpf: "",
        email: ""
    });

    useEffect(() => {
        fetchAttendants();
    }, []);

    const fetchAttendants = () => {
        setLoading(true);
        axios
            .get("http://localhost:8080/api/user/attendant/list")
            .then((res) => setAttendants(res.data))
            .catch((err) => {
                let message = err?.response?.data?.message || "Erro inesperado.";
                console.error("Erro ao carregar atendentes:", message)
            })
            .finally(() => setLoading(false));
    };


    const handleDelete = () => {
        if (!selectedAttendantId) return;
        axios
            .delete(`http://localhost:8080/api/user/attendant/delete/${selectedAttendantId}`)
            .then(() => {
                fetchAttendants();
                const modalEl = window.bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal"));
                modalEl.hide();
                setSelectedAttendantId(null);
            })
            .catch((err) => {
                const modalEl = window.bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal"));
                modalEl.hide();
                let message = err?.response?.data?.message || "Erro inesperado.";;
                setError("Erro ao excluir atendente: " + message);
            });
    };

    const handleEditSubmit = async () => {
        try {
            if (!editData.id) {
                const isValid = validateCPF(editData.cpf);
                if (!isValid) {
                    setError("CPF inválido.");
                    return;
                }
            }

            if (editData.id) {
                await axios.post(`http://localhost:8080/api/user/attendant/update`, editData);
            } else {
                await axios.post(`http://localhost:8080/api/user/attendant`, editData);
            }

            fetchAttendants();
            const modalEl = window.bootstrap.Modal.getInstance(document.getElementById("editModal"));
            modalEl.hide();
        } catch (err) {
            let message = err?.response?.data?.message || "Erro inesperado.";
            setError("Erro ao salvar atendente: " + message);
            const modalEl = window.bootstrap.Modal.getInstance(document.getElementById("editModal"));
            modalEl.hide();
        }
    };


    const openAddModal = () => {
        setSelectedAttendantId(null);
        setEditData({
            id: "",
            name: "",
            cpf: "",
            email: ""
        });
        const modal = new window.bootstrap.Modal(document.getElementById("editModal"));
        modal.show();
    };

    const openEditModal = (attendant) => {
        setSelectedAttendantId(attendant.id);
        setEditData({ ...attendant });
        const modal = new window.bootstrap.Modal(document.getElementById("editModal"));
        modal.show();
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) return <div className="text-center mt-5">Carregando atendentes...</div>;

    return (
        <div className="container mt-5">
            {error && (
                <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
            )}
            <h2 className="text-center mb-4">Lista de Atendentes</h2>

            <div className="d-flex justify-content-end mb-2">
                <button className="btn btn-success" onClick={openAddModal}>Adicionar</button>
            </div>

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <table className="table table-striped table-bordered rounded border border-secondary text-center align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendants.length === 0 ? (
                            <tr>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                        ) : (
                            attendants.map((attendant) => (
                                <tr key={attendant.id}>
                                    <td>{attendant.name}</td>
                                    <td>{attendant.email}</td>
                                    <td>
                                        <button
                                            className="btn btn-link text-primary me-2"
                                            title="Editar"
                                            onClick={() => openEditModal(attendant)}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </button>
                                        <button
                                            className="btn btn-link text-danger"
                                            title="Excluir"
                                            onClick={() => {
                                                setSelectedAttendantId(attendant.id);
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
                        <div className="modal-body">Tem certeza que deseja excluir este atendente?</div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>Sim, Excluir</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Edição e Adição*/}
            <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title">{editData.id ? "Editar Atendente" : "Adicionar Atendente"}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Nome</label>
                                <input type="text" className="form-control" name="name" value={editData.name} onChange={handleEditChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">CPF</label>
                                {editData.id ? (
                                    <input
                                        className="form-control"
                                        name="cpf"
                                        value="###.###.###-##"
                                        disabled
                                    />
                                ) : (
                                    <input
                                        className="form-control"
                                        name="cpf"
                                        value={editData.cpf}
                                        onChange={handleEditChange}
                                        required
                                    />
                                )}

                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control" name="email" value={editData.email} onChange={handleEditChange} required />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={handleEditSubmit}>Salvar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AttendantDashboard;
