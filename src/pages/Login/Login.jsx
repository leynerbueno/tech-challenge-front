import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
    const [cpf, setCpf] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            //ALTERAR URL PARA URL REAL
            const res = await axios.post("http://localhost:8080/login", { cpf });
            if (res.status === 200) {
                navigate("/dashboard");
            }

        } catch (err) {
            setError("CPF inválido ou erro na autenticação");
            navigate("/dashboard");
        }
    };

    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow" style={{ width: 300 }}>
                <h3 className="mb-3 text-center">Login Atendente</h3>
                <input
                    type="text"
                    placeholder="Digite seu CPF"
                    className="form-control mb-3"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    required
                />
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-danger w-100">Entrar</button>
            </form>
        </div>
    );
}

export default Login;