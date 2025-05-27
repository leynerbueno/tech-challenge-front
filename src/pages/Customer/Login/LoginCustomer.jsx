import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginCustomer.css";
import { validateCPF } from '../../../utils/cpfUtils.js';

function LoginCustomer() {
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const cleanCPF = validateCPF(cpf);
            setCpf(cleanCPF);
            const res = await axios.get(`http://localhost:8080/api/user/customer/cpf/${cleanCPF}`);

            const customer = res.data;
            setId(customer.id);
            setName(customer.name);
            setCpf(customer.cpf);
            setEmail(customer.email);

            localStorage.setItem("customer", JSON.stringify(customer));
            navigate("/create-order")

        } catch (err) {
            console.log(err?.response?.data?.message);
            setError("Usuário Inválido");
        }
    };

    const handleGuest = () => {
        navigate("/create-new-anonymous-customer");
    };

    const handleInsert = () => {
        navigate("/create-new-customer");
    };

    return (
        <div className="d-flex vh-100 bg-light">
            <div className="d-none d-md-flex flex-column justify-content-center align-items-center bg-danger text-white w-50">
                <h1 className="display-4">Challenge</h1>
                <p className="lead text-center px-4">Pronto para o desafio mais saboroso do dia?</p>
            </div>

            <div className="d-flex flex-column justify-content-center align-items-center w-100 w-md-50 px-4">
                <form onSubmit={handleLogin} className="bg-white p-4 rounded shadow" style={{ maxWidth: 350, width: "100%" }}>
                    <h4 className="mb-3 text-center">Identifique-se</h4>
                    <input
                        type="text"
                        placeholder="Digite seu CPF"
                        className="form-control mb-2"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        required
                    />
                    {error && <div className="alert alert-danger">{error}</div>}
                    <button type="submit" className="btn btn-danger w-100 mb-2">Entrar</button>
                </form>

                <div className="mt-3 text-center">
                    <button className="btn btn-outline-danger w-100 mb-2" onClick={handleInsert}>
                        Cadastre-se
                    </button>
                    <button className="btn btn-outline-danger w-100" onClick={handleGuest}>
                        Continuar sem se identificar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginCustomer;
