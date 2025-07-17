import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import API from "../backendRouting";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
function Cart() {
  const [data, setData] = useState([]);

  const getCookie = Cookies.get("userInfo");
  const tokenn = getCookie ? JSON.parse(getCookie) : null;
  const fetchProduct = async () => {
    try {
      const dataa = await axios.get(`${API.FETCHPRODUCT.url}`, {
        headers: {
          Authorization: `Bearer ${tokenn.token}`,
        },
      });
      console.log(dataa, "all product data");

      setData(dataa.data.body);
    } catch (error) {
      console.log(error, "error in fetching al product");
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);
  const total = data.reduce(
    (sum, item) => sum + item?.productId?.price * item.quantity,
    0
  );

  const incFunction = async (id, quant) => {
    const increment = await axios.put(
      `${API.UPDATECART.url}/${id}`,
      { quantity: quant + 1 },
      {
        headers: {
          Authorization: `Bearer ${tokenn.token}`,
        },
      }
    );
    // console.log(increment, "increment");
    fetchProduct();
  };

  const decFunction = async (id, quant) => {
    if (quant <= 1) return; // prevent reducing below 1
    try {
      const decrement = await axios.put(
        `${API.UPDATECART.url}/${id}`,
        { quantity: quant - 1 },
        {
          headers: {
            Authorization: `Bearer ${tokenn.token}`,
          },
        }
      );
      fetchProduct();
    } catch (error) {
      console.log(error);
      toast.error("Failed to decrease quantity");
    }
  };
  const deleteCartItem = async (id) => {
    try {
      const deleteItem = await axios.delete(
        `${API.DELETESINGLECART.url}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${tokenn.token}`,
          },
        }
      );
      // console.log(deleteItem ,"item deleted")
      if (deleteItem.data.status === 200) {
        toast.success(deleteItem.data.msg);
        fetchProduct();
      } else {
        toast.error(deleteItem.data.msg);
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Delete cartItem error");
    }
  };
  return (
    <section
      className="py-5"
      style={{ background: "#F9F3EC", minHeight: "100vh" }}
    >
      <div className="container">
        <h1 className="display-4 fw-bold mb-4 text-center">Shopping Cart</h1>
        <div className="table-responsive mb-5">
          <table className="table table-bordered table-hover align-middle bg-white rounded-4 shadow">
            <thead className="table-primary">
              <tr>
                <th scope="col">Image</th>
                <th scope="col">Product Name</th>
                <th scope="col">Unit Price</th>
                <th scope="col">Quantity</th>
                <th scope="col">Subtotal</th>
                <th scope="col">Remove</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr>
                  {/* {console.log(item?.productId?.image, "jhjhhhhhh")} */}
                  <td>
                    <img
                      src={`http://localhost:4444/Image/productImage/${item?.productId?.image}`}
                      alt={item?.productId?.name}
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: "cover",
                        borderRadius: "12px",
                        border: "2px solid #DEAD6F",
                      }}
                    />
                  </td>
                  <td>{item?.productId?.name}</td>
                  <td>₹{item?.productId?.price}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled={item.quantity <= 1}
                        onClick={() => {
                          decFunction(item._id, item.quantity);
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={item.quantity}
                        min={1}
                        readOnly
                        style={{ width: 60 }}
                      />
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          incFunction(item._id, item.quantity);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>₹{item?.productId?.price * item.quantity}</td>
                  <td>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => {
                        deleteCartItem(item?._id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end">
          <div className="card p-4 shadow" style={{ minWidth: 320 }}>
            <h4 className="fw-bold mb-3">Cart Summary</h4>
            <div className="d-flex justify-content-between mb-2">
              <span>Total Items:</span>
              <span>{data.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span>Total Price:</span>
              <span className="fw-bold text-primary fs-5">₹{total}</span>
            </div>
            <button className="btn btn-dark w-100 rounded-3 py-2 mt-2">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Cart;
