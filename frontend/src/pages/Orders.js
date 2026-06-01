import React, { useEffect, useState } from 'react';
import { getOrders, getOrder, createOrder, deleteOrder, getCustomers, getProducts } from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, ShoppingCart, Eye, Minus } from 'lucide-react';

function OrderModal({ onClose, onSave }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getCustomers(), getProducts()])
      .then(([c, p]) => { setCustomers(c); setProducts(p); })
      .catch(console.error);
  }, []);

  const addItem = () => setItems(prev => [...prev, { product_id: '', quantity: 1 }]);
  const removeItem = i => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => setItems(prev =>
    prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item)
  );

  const calcTotal = () => {
    return items.reduce((sum, item) => {
      const product = products.find(p => p.id === parseInt(item.product_id));
      if (product && item.quantity > 0) sum += product.price * item.quantity;
      return sum;
    }, 0);
  };

  const submit = async e => {
    e.preventDefault();
    if (!customerId) { toast.error('Select a customer'); return; }
    const validItems = items.filter(i => i.product_id && i.quantity > 0);
    if (validItems.length === 0) { toast.error('Add at least one item'); return; }
    setLoading(true);
    try {
      await createOrder({
        customer_id: parseInt(customerId),
        items: validItems.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
      });
      toast.success('Order placed!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          New Order
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Customer</label>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
              <option value="">Select customer…</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Order Items</label>
            <div className="order-items-section">
              {items.map((item, i) => (
                <div key={i} className="order-item-row">
                  <select
                    value={item.product_id}
                    onChange={e => updateItem(i, 'product_id', e.target.value)}
                  >
                    <option value="">Select product…</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                        {p.name} (${p.price.toFixed(2)}) — {p.quantity} left
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', e.target.value)}
                    placeholder="Qty"
                  />
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(i)} disabled={items.length === 1}>
                    <Minus size={13} />
                  </button>
                </div>
              ))}
              <button type="button" className="add-item-btn" onClick={addItem}>
                + Add Another Item
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Total</span>
              <span style={{ fontFamily: 'Space Mono', fontWeight: 700, color: 'var(--accent)' }}>
                ${calcTotal().toFixed(2)}
              </span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Placing…' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderDetailModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrder(orderId).then(setOrder).catch(console.error);
  }, [orderId]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          Order #{orderId}
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>
        {!order ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <>
            <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Customer</p>
              <p style={{ fontWeight: 600 }}>{order.customer?.name}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{order.customer?.email}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td className="td-primary">{item.product?.name || `Product #${item.product_id}`}</td>
                    <td>{item.quantity}</td>
                    <td className="td-mono">${item.unit_price.toFixed(2)}</td>
                    <td className="td-mono">${(item.unit_price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: 'Space Mono', fontWeight: 700, color: 'var(--accent)', fontSize: 16 }}>
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const load = () => getOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Cancel order #${id}? Stock will be restored.`)) return;
    try {
      await deleteOrder(id);
      toast.success('Order cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /><span>Loading orders…</span></div>;

  return (
    <div>
      {showCreate && (
        <OrderModal onClose={() => setShowCreate(false)} onSave={() => { setShowCreate(false); load(); }} />
      )}
      {detailId && (
        <OrderDetailModal orderId={detailId} onClose={() => setDetailId(null)} />
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Orders ({orders.length})</h2>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New Order
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={48} />
            <p>No orders yet.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="td-mono">#{o.id}</td>
                    <td className="td-primary">{o.customer?.name || `Customer #${o.customer_id}`}</td>
                    <td>{o.items?.length || 0} item(s)</td>
                    <td className="td-mono" style={{ color: 'var(--accent)' }}>${o.total_amount.toFixed(2)}</td>
                    <td><span className="badge badge-success">{o.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDetailId(o.id)}>
                          <Eye size={13} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
