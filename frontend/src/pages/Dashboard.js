import React, { useEffect, useState } from 'react';
import { getDashboard } from '../api';
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading">
      <div className="spinner" />
      <span>Loading dashboard…</span>
    </div>
  );

  const stats = [
    { label: 'Total Products', value: data?.total_products ?? 0, icon: Package, color: 'purple' },
    { label: 'Total Customers', value: data?.total_customers ?? 0, icon: Users, color: 'green' },
    { label: 'Total Orders', value: data?.total_orders ?? 0, icon: ShoppingCart, color: 'amber' },
    { label: 'Low Stock Items', value: data?.low_stock_products?.length ?? 0, icon: AlertTriangle, color: 'red' },
  ];

  return (
    <div>
      <div className="stats-grid">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className={`stat-icon ${color}`}>
              <Icon size={20} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {data?.low_stock_products?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ color: 'var(--warning)' }}>
              ⚠ Low Stock Alert
            </h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock Left</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map(p => (
                  <tr key={p.id}>
                    <td className="td-primary">{p.name}</td>
                    <td className="td-mono">{p.sku}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {p.quantity} left
                      </span>
                    </td>
                    <td className="td-mono">${p.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data?.low_stock_products?.length === 0 && (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--success)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
            <p style={{ fontWeight: 600 }}>All products are well stocked!</p>
          </div>
        </div>
      )}
    </div>
  );
}
