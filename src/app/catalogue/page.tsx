'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  Package,
  Check,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { ProductItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';

export default function CataloguePage() {
  const { selectedTenant } = useApp();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Product State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCat, setNewProdCat] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdStock, setNewProdStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdCat, setEditProdCat] = useState('');
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdStock, setEditProdStock] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadProducts = async (tenantId?: string) => {
    setIsLoading(true);
    try {
      const param = tenantId ? `?tenantId=${tenantId}` : '';
      const res = await fetch(`/api/products${param}`);
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTenant) {
      loadProducts(selectedTenant.id);
    }
  }, [selectedTenant]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice.trim() || !selectedTenant) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          name: newProdName.trim(),
          price: newProdPrice.trim(),
          category: newProdCat.trim() || 'General',
          description: newProdDesc.trim(),
          inStock: newProdStock,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewProdName('');
        setNewProdPrice('');
        setNewProdCat('');
        setNewProdDesc('');
        setNewProdStock(true);
        await loadProducts(selectedTenant.id);
      } else {
        alert(data.error || 'Failed to add product');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditProduct = (p: ProductItem) => {
    setEditingProduct(p);
    setEditProdName(p.name);
    setEditProdPrice(p.price);
    setEditProdCat(p.category || 'General');
    setEditProdDesc(p.description || '');
    setEditProdStock(p.inStock);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editProdName.trim() || !editProdPrice.trim() || !selectedTenant) return;

    setIsUpdating(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          tenantId: selectedTenant.id,
          name: editProdName.trim(),
          price: editProdPrice.trim(),
          category: editProdCat.trim() || 'General',
          description: editProdDesc.trim(),
          inStock: editProdStock,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        setEditingProduct(null);
        await loadProducts(selectedTenant.id);
      } else {
        alert(data.error || 'Failed to update product');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from the catalogue?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && selectedTenant) {
        await loadProducts(selectedTenant.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111B21] tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#075E54]" />
            Product &amp; Service Catalogue ({selectedTenant?.name})
          </h2>
          <p className="text-xs text-[#667781] mt-1">
            Gemini AI references this live database to quote exact prices, specifications, and availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => selectedTenant && loadProducts(selectedTenant.id)}
            className="p-2.5 rounded-xl border border-[#E9EDEF] bg-white hover:bg-[#F0F2F5] text-[#111B21] text-xs font-semibold transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-[#667781]" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#00A884] hover:bg-[#075E54] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product / Service</span>
          </button>
        </div>
      </div>

      {/* Explanatory Banner (FLAT WHATSAPP PALETTE - NO GRADIENT) */}
      <div className="p-4 rounded-xl bg-[#D9FDD3]/50 border border-[#25D366]/40 text-xs text-[#075E54] flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#00A884] flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Instant AI Sync:</strong> Whenever a WhatsApp customer asks about items or pricing, Gemini AI scans this table and replies immediately with accurate numbers, colors, specs, and in-stock statuses!
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[#667781] text-sm">
          Loading catalogue items from Supabase...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-dashed border-[#E9EDEF] rounded-2xl p-8">
          <Package className="w-12 h-12 text-[#667781]/40 mx-auto mb-3" />
          <h4 className="font-bold text-[#111B21] text-sm">No products in catalogue yet</h4>
          <p className="text-xs text-[#667781] mt-1 mb-4">
            Add items so your Gemini AI bot can answer pricing inquiries for {selectedTenant?.name}.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#00A884] hover:bg-[#075E54] text-white rounded-xl text-xs font-semibold cursor-pointer transition"
          >
            Add First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl border border-[#E9EDEF] bg-white hover:border-[#8696A0] transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] bg-[#F0F2F5] text-[#111B21] px-2 py-0.5 rounded font-medium border border-[#E9EDEF]">
                    {p.category || 'General'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        p.inStock
                          ? 'bg-[#D9FDD3] text-[#075E54]'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <button
                      onClick={() => handleOpenEditProduct(p)}
                      className="text-[#667781] hover:text-[#00A884] p-1 rounded hover:bg-[#F0F2F5] transition"
                      title="Edit product details"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="text-[#667781] hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition"
                      title="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-[#111B21] text-base mb-1">{p.name}</h4>
                <p className="text-[#075E54] font-extrabold text-sm mb-2">{p.price}</p>
                <p className="text-xs text-[#667781] leading-relaxed line-clamp-3">
                  {p.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E9EDEF] flex items-center justify-between text-[11px] text-[#667781]">
                <span className="flex items-center gap-1 text-[#00A884] font-medium">
                  <Check className="w-3.5 h-3.5" /> AI Grounded
                </span>
                <span className="text-[10px]">ID: {p.id.slice(0, 10)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD PRODUCT / SERVICE */}
      {showAddModal && selectedTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                Add Product to {selectedTenant.name}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Product / Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple iPhone 15 (128GB)"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Price <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $799 or Rs. 150,000"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Web Development, Hosting..."
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Description, Specs &amp; Options
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Features, turnaround time, deliverables..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full p-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="stockCheckbox"
                  checked={newProdStock}
                  onChange={(e) => setNewProdStock(e.target.checked)}
                  className="rounded text-[#00A884] focus:ring-[#00A884]"
                />
                <label htmlFor="stockCheckbox" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Item is currently in stock and available for order
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#00A884] hover:bg-[#075E54] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {isSubmitting ? 'Adding...' : 'Add to Catalogue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT / SERVICE */}
      {showEditModal && selectedTenant && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Pencil className="w-5 h-5 text-emerald-600" />
                Edit Product Details
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Product / Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple iPhone 15 (128GB)"
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Price <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $799 or Rs. 150,000"
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Web Development, Hosting..."
                    value={editProdCat}
                    onChange={(e) => setEditProdCat(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Description, Specs &amp; Options
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Colors, specs, storage capacity, warranty..."
                  value={editProdDesc}
                  onChange={(e) => setEditProdDesc(e.target.value)}
                  className="w-full p-2.5 bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl text-xs text-[#111B21] focus:bg-white focus:border-[#00A884] focus:ring-1 focus:ring-[#00A884] focus:outline-none transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editStockCheckbox"
                  checked={editProdStock}
                  onChange={(e) => setEditProdStock(e.target.checked)}
                  className="rounded text-[#00A884] focus:ring-[#00A884]"
                />
                <label htmlFor="editStockCheckbox" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Item is currently in stock and available for order
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-[#00A884] hover:bg-[#075E54] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
