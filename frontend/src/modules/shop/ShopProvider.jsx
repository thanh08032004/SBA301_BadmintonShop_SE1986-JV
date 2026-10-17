import { apiFetch } from "../../shared/utils/apiFetch";
import { useEffect, useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { ShopContext } from "./ShopContext";
export default function ShopProvider({ children }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function request(action) {
    const res = await apiFetch(
      "/api/shop",
      action
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action),
          }
        : {},
    );
    const result = await res.json();
    if (!res.ok) throw new Error(result.message);
    setData(result);
    return result;
  }
  useEffect(() => {
    let active = true;
    apiFetch("/api/shop")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active)
          setError("Không tải được dữ liệu. Hãy khởi động ứng dụng bằng npm run dev rồi thử lại.");
      });
    return () => {
      active = false;
    };
  }, []);
  async function act(action) {
    setBusy(true);
    setError("");
    try {
      return await request(action);
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setBusy(false);
    }
  }
  return (
    <ShopContext.Provider value={{ data, busy, act, refresh: () => act(null) }}>
      {error && (
        <Alert variant="danger" className="m-3">
          {error}{" "}
          {!data && (
            <Button
              onClick={() =>
                request()
                  .then(() => setError(""))
                  .catch(() => {})
              }
            >
              Thử lại
            </Button>
          )}
        </Alert>
      )}
      {data
        ? children
        : !error && (
            <div className="p-5 text-center">
              <Spinner animation="border" />
              <p>Đang tải cửa hàng…</p>
            </div>
          )}
    </ShopContext.Provider>
  );
}
