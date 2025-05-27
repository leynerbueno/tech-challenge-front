import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { validateCPF } from '../../../utils/cpfUtils.js';

function CreateCustomer() {
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const cleanCPF = validateCPF(cpf);
            const res = await axios.post("http://localhost:8080/api/user/customer", {
                name,
                cpf: cleanCPF,
                email,
                anonymous: false
            });

            const customer = res.data;
            setId(customer.id);
            setName(customer.name);
            setCpf(customer.cpf);
            setEmail(customer.email);

            localStorage.setItem("customer", JSON.stringify(customer));

            setSuccess("Cliente cadastrado com sucesso!");

            navigate("/create-order")

        } catch (err) {
            let message = err?.response?.data?.message || "Erro inesperado.";;
            setError("Erro ao cadastrar cliente. " + message);
        }
    };

    return (
        <div className="d-flex vh-100 bg-light">
            <div className="d-none d-md-flex flex-column justify-content-center align-items-center bg-danger text-white w-50">
                <h1 className="display-4">Challenge</h1>
                <p className="lead text-center px-5">Crie sua conta para continuar com seu pedido</p>
            </div>

            <div className="d-flex flex-column justify-content-center align-items-center w-100 w-md-50 px-4">
                <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow" style={{ maxWidth: 350, width: "100%" }}>
                    <h4 className="mb-3 text-center">Cadastro de Cliente</h4>

                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="CPF"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        required
                    />

                    <input
                        type="email"
                        className="form-control mb-3"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <button type="submit" className="btn btn-danger w-100">
                        Cadastrar
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateCustomer;
