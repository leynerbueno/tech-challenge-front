import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
            <div className="bg-white p-5 rounded shadow text-center" style={{ width: 300 }}>
                <button className="btn btn-danger w-100 mb-3" onClick={() => navigate("/costumers")}>
                    Gerenciar Clientes
                </button>
                <button className="btn btn-danger w-100 mb-3" onClick={() => navigate("/attendants")}>
                    Gerenciar Atendentes
                </button>
                <button className="btn btn-danger w-100 mb-3" onClick={() => navigate("/products")}>
                    Gerenciar Produtos
                </button>
                <button
                    className="btn btn-sm btn-danger mt-4"
                    style={{ width: "50%" }}
                    onClick={() => navigate("/login")}
                >
                    Sair
                </button>
            </div>
        </div>
    );
}

export default Dashboard;