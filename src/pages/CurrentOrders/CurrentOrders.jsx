import { useEffect, useState } from "react";
import axios from "axios";
import "./CurrentOrders.css";

function TodayOrders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = () => {
            axios
                .get("http://localhost:8080/api/order/list-today-orders")
                .then((res) => setOrders(res.data))
                .catch((err) => {
                    let message = err?.response?.data?.message || "Erro inesperado.";;
                    setError("Erro ao buscar pedidos: ", message)
                });
        };

        fetchOrders();

        const intervalId = setInterval(fetchOrders, 10000); // a cada 10 segundos
        console.log(orders);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-start bg-light pt-5">
            <div className="bg-white p-4 rounded shadow-sm w-75">
                <h2 className="text-center mb-4 display-6">Pedidos em Andamento</h2>
                <table className="table table-striped table-bordered rounded border border-secondary text-center">
                    <thead className="table-light">
                        <tr>
                            <th className="text-black fs-5">Cliente</th>
                            <th className="text-black fs-5">Status</th>
                            <th className="text-black fs-5">Tempo de Espera (min)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order.orderId}>
                                    <td>{order.customerName}</td>
                                    <td>{order.status}</td>
                                    <td>{order.waitTimeMinutes} min</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TodayOrders;
