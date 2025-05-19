import { useEffect, useState } from "react";
import axios from "axios";
import "./CurrentOrders.css";

function TodayOrders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = () => {
            axios
                .get("http://localhost:8080/api/order-status/list-today-order-status/")
                .then((res) => setOrders(res.data))
                .catch((err) => console.error("Erro ao buscar pedidos:", err));
        };

        fetchOrders();

        const intervalId = setInterval(fetchOrders, 10000); // a cada 10 segundos

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-start bg-light pt-5">
            <div className="bg-white p-4 rounded shadow-sm w-75">
                <h2 className="text-center mb-4 display-6">Pedidos em Andamento</h2>
                <table className="table table-striped table-bordered rounded border border-secondary text-center">
                    <thead className="table-light">
                        <tr>
                            <th className="text-black fs-5">Pedido ID</th>
                            <th className="text-black fs-5">Status</th>
                            <th className="text-black fs-5">Data</th>
                            <th className="text-black fs-5">Cliente</th>
                            <th className="text-black fs-5">Tempo de Espera (min)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order.orderId}>
                                    <td>{order.orderId}</td>
                                    <td>{order.status}</td>
                                    <td>{new Date(order.orderDate).toLocaleString()}</td>
                                    <td>{order.clientId}</td>
                                    <td>{order.waitTimeMinutes} min</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">-</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TodayOrders;
