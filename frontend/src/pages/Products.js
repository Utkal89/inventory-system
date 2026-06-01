import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Package } from 'lucide-react';

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(
    product || { name: '', sku: '', price: '', quantity: '' }
  );
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.name || !form.sku || form.price === '' || form.quantity === '') {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const data = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) };
      if (product) {
        await updateProduct(product.id, data);
        toast.success('Product updated');
      } else {
        await createProduct(data);
        toast.success('Product created');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          {product ? 'Edit Product' : 'New Product'}
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={14} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Product Name</label>
            <input name="name" value={form.name} onChange={handle} placeholder="e.g. Wireless Keyboard" />
          </div>
          <div className="form-group">
            <label>SKU / Code</label>
            <input name="sku" value={form.sku} onChange={handle} placeholder="e.g. WK-001" />
          </div>
          <div className="form-group">
            <label>Price ($)</label>
            <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handle} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label>Quantity in Stock</label>
            <input name="quantity" type="number" min="0" value={form.quantity} onChange={handle} placeholder="0" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | product obj

  const load = () => getProducts().then(setProducts).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /><span>Loading products…</span></div>;

  return (
    <div>
      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Products ({products.length})</h2>
          <button className="btn btn-primary" onClick={() => setModal('create')}>
            <Plus size={15} /> Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <p>No products yet. Add your first product!</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="td-primary">{p.name}</td>
                    <td className="td-mono">{p.sku}</td>
                    <td className="td-mono">${p.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-danger' : p.quantity <= 5 ? 'badge-warning' : 'badge-success'}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(p)}>
                          <Pencil size={13} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>
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
