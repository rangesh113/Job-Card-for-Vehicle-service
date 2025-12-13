import { useEffect, useState, useRef } from "react";
import API from "../../api/api";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./CashierDashboard.css";

const ITEMS_PER_PAGE = 10;

const CashierDashboard = () => {
  const [view, setView] = useState("bills");
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editMode, setEditMode] = useState(false);

  // Inventory search states
  const [partSearch, setPartSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  const [items, setItems] = useState([]);
  const [item, setItem] = useState({
    name: "",
    price: "",
    quantity: 1,
    partId: null,
    partNumber: "",
    stockAvailable: 0
  });

  useEffect(() => {
    loadBills();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, bills]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadBills = async () => {
    try {
      const res = await API.get("/bills");
      setBills(res.data);
    } catch (err) {
      toast.error("Failed to load bills");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const res = await API.get("/bills/done-jobs");
      setJobs(res.data);
      setView("jobs");
    } catch (err) {
      toast.error("Failed to load jobs");
      console.error(err);
    }
  };

  const applyFilters = () => {
    let filtered = [...bills];
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(bill =>
        bill.jobCard?.customerName?.toLowerCase().includes(search) ||
        bill.jobCard?.vehicleNumber?.toLowerCase().includes(search) ||
        bill._id.toLowerCase().includes(search)
      );
    }
    setFilteredBills(filtered);
    setCurrentPage(1);
  };

  const searchParts = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    try {
      const res = await API.get(`/inventory/search?q=${query}&vehicleType=${selectedJob?.vehicleType || ""}`);
      setSearchResults(res.data);
      setShowSearchDropdown(true);
    } catch (err) {
      console.error("Failed to search parts:", err);
    }
  };

  const selectPart = (part) => {
    setItem({
      name: part.name,
      price: part.price,
      quantity: 1,
      partId: part.id,
      partNumber: part.partNumber,
      stockAvailable: part.stock
    });
    setPartSearch("");
    setShowSearchDropdown(false);
  };

  const addItem = () => {
    if (!item.name || !item.price) {
      toast.error("Please enter item name and price");
      return;
    }

    if (item.partId && item.quantity > item.stockAvailable) {
      toast.error(`Only ${item.stockAvailable} units available in stock`);
      return;
    }

    setItems([...items, { ...item }]);
    setItem({
      name: "",
      price: "",
      quantity: 1,
      partId: null,
      partNumber: "",
      stockAvailable: 0
    });
    toast.success("Item added");
  };

  const removeItem = (index) => {
    const confirmed = window.confirm("Remove this item?");
    if (!confirmed) return;
    setItems(items.filter((_, i) => i !== index));
    toast.success("Item removed");
  };

  const saveBill = async () => {
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const confirmed = window.confirm(
      editMode ? "Update this bill?" : "Create this bill?"
    );
    if (!confirmed) return;

    try {
      if (editMode && selectedBill) {
        await API.put(`/bills/${selectedBill._id}`, { items });
        toast.success("✅ Bill updated successfully!");
      } else {
        await API.post("/bills", {
          jobCardId: selectedJob._id,
          items
        });
        toast.success("✅ Bill created successfully!");
      }
      setItems([]);
      setSelectedJob(null);
      setSelectedBill(null);
      setEditMode(false);
      loadBills();
      setView("bills");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save bill";
      toast.error(errorMsg);
      console.error(err);
    }
  };

  const editBill = (bill) => {
    if (bill.paymentStatus === "PAID") {
      toast.error("Cannot edit paid bill");
      return;
    }
    setSelectedBill(bill);
    setSelectedJob(bill.jobCard);
    setItems(bill.items);
    setEditMode(true);
    setView("billing");
  };

  const deleteBill = async (billId) => {
    const bill = bills.find(b => b._id === billId);
    if (bill.paymentStatus === "PAID") {
      toast.error("Cannot delete paid bill");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this bill? This action cannot be undone.");
    if (!confirmed) return;

    try {
      await API.delete(`/bills/${billId}`);
      toast.success("✅ Bill deleted successfully!");
      loadBills();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete bill";
      toast.error(errorMsg);
      console.error(err);
    }
  };

  const togglePaymentStatus = async (billId) => {
    const bill = bills.find(b => b._id === billId);
    const newStatus = bill.paymentStatus === "PAID" ? "UNPAID" : "PAID";
    const confirmed = window.confirm(`Mark this bill as ${newStatus}?`);
    if (!confirmed) return;

    try {
      await API.put(`/bills/${billId}/toggle-payment`);
      toast.success(`✅ Bill marked as ${newStatus}!`);
      loadBills();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update payment status";
      toast.error(errorMsg);
      console.error(err);
    }
  };

  const downloadInvoice = (bill) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text("INVOICE", 105, 20, { align: "center" });

    // Company Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Vehicle Service Center", 105, 30, { align: "center" });
    doc.setFontSize(10);
    doc.text("Professional Workshop Management", 105, 36, { align: "center" });

    // Bill Info
    doc.setFontSize(10);
    doc.text(`Bill ID: #${bill._id.slice(-6).toUpperCase()}`, 20, 50);
    doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, 20, 56);
    doc.text(`Status: ${bill.paymentStatus}`, 20, 62);

    // Customer Info
    doc.text(`Customer: ${bill.jobCard?.customerName || "N/A"}`, 120, 50);
    doc.text(`Vehicle: ${bill.jobCard?.vehicleModel || "N/A"}`, 120, 56);
    doc.text(`Number: ${bill.jobCard?.vehicleNumber || "N/A"}`, 120, 62);

    // Items Table
    const tableData = bill.items.map((item, idx) => [
      idx + 1,
      item.name,
      item.partNumber || "-",
      item.quantity || 1,
      `₹${Number(item.price).toFixed(2)}`,
      `₹${(Number(item.price) * (item.quantity || 1)).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 75,
      head: [["#", "Item", "Part No.", "Qty", "Price", "Total"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [102, 126, 234] },
      styles: { fontSize: 10 }
    });

    // Total
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 85;
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(`Total Amount: ₹${Number(bill.totalAmount).toFixed(2)}`, 140, finalY);

    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.text("Thank you for your business!", 105, 280, { align: "center" });

    doc.save(`Invoice_${bill._id.slice(-6)}.pdf`);
    toast.success("Invoice downloaded!");
  };

  const goBack = () => {
    setView("bills");
    setSelectedJob(null);
    setSelectedBill(null);
    setItems([]);
    setEditMode(false);
  };

  const totalAmount = items.reduce((sum, i) => sum + (Number(i.price) * (i.quantity || 1)), 0);

  // Pagination
  const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="cashier-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cashier-container">
      <div className="dashboard-header">
        <h1>💰 Cashier Dashboard</h1>
        <p className="subtitle">Manage bills and generate invoices</p>
      </div>

      {/* BILLS LIST VIEW */}
      {view === "bills" && (
        <div className="bills-section">
          <div className="section-header">
            <h2>📋 All Bills</h2>
            <button className="btn btn-primary" onClick={loadJobs}>
              + Create New Bill
            </button>
          </div>

          <div className="search-section">
            <SearchBar
              onSearch={setSearchTerm}
              placeholder="Search by customer, vehicle number, or bill ID..."
            />
          </div>

          {filteredBills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>No Bills Found</h3>
              <p>Start by creating a new bill for completed jobs</p>
              <button className="btn btn-primary" onClick={loadJobs}>
                Create First Bill
              </button>
            </div>
          ) : (
            <>
              <div className="bills-grid">
                {paginatedBills.map((b) => (
                  <div key={b._id} className="bill-card">
                    <div className="bill-header">
                      <span className="bill-id">#{b._id.slice(-6).toUpperCase()}</span>
                      <span className={`status-badge ${b.paymentStatus.toLowerCase()}`}>
                        {b.paymentStatus === "PAID" ? "✓ PAID" : "⏳ PENDING"}
                      </span>
                    </div>
                    <div className="bill-details">
                      <p><strong>Customer:</strong> {b.jobCard?.customerName || "N/A"}</p>
                      <p><strong>Vehicle:</strong> {b.jobCard?.vehicleNumber || "N/A"}</p>
                      <p><strong>Date:</strong> {new Date(b.createdAt).toLocaleDateString()}</p>
                      <p className="bill-amount">₹{Number(b.totalAmount).toFixed(2)}</p>
                    </div>
                    <div className="bill-items">
                      <strong>Items ({b.items.length}):</strong>
                      <ul>
                        {b.items.slice(0, 3).map((item, idx) => (
                          <li key={idx}>{item.name} - ₹{Number(item.price).toFixed(2)}</li>
                        ))}
                        {b.items.length > 3 && <li>... and {b.items.length - 3} more</li>}
                      </ul>
                    </div>
                    <div className="bill-actions">
                      <button
                        className="btn-action btn-download"
                        onClick={() => downloadInvoice(b)}
                        title="Download Invoice"
                      >
                        📥
                      </button>
                      {b.paymentStatus !== "PAID" && (
                        <button
                          className="btn-action btn-edit"
                          onClick={() => editBill(b)}
                          title="Edit Bill"
                        >
                          ✏️
                        </button>
                      )}
                      <button
                        className="btn-action btn-toggle-payment"
                        onClick={() => togglePaymentStatus(b._id)}
                        title={b.paymentStatus === "PAID" ? "Mark as Unpaid" : "Mark as Paid"}
                      >
                        {b.paymentStatus === "PAID" ? "↩️" : "✅"}
                      </button>
                      {b.paymentStatus !== "PAID" && (
                        <button
                          className="btn-action btn-delete"
                          onClick={() => deleteBill(b._id)}
                          title="Delete Bill"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      )}

      {/* JOBS LIST VIEW */}
      {view === "jobs" && (
        <div className="jobs-section">
          <div className="section-header">
            <button className="btn btn-back" onClick={goBack}>
              ← Back to Bills
            </button>
            <h2>🔧 Completed Jobs</h2>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔧</div>
              <h3>No Completed Jobs</h3>
              <p>Waiting for technicians to complete their work</p>
            </div>
          ) : (
            <div className="jobs-grid">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="job-card"
                  onClick={() => {
                    setSelectedJob(job);
                    setEditMode(false);
                    setView("billing");
                  }}
                >
                  <div className="job-header">
                    <h3>{job.customerName}</h3>
                    <span className="vehicle-badge">{job.vehicleType}</span>
                  </div>
                  <div className="job-details">
                    <p><strong>Vehicle:</strong> {job.vehicleModel}</p>
                    <p><strong>Number:</strong> {job.vehicleNumber}</p>
                    <p><strong>Technician:</strong> {job.technician?.name || "N/A"}</p>
                  </div>
                  <button className="btn btn-select">Select →</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BILLING VIEW */}
      {view === "billing" && selectedJob && (
        <div className="billing-section">
          <div className="section-header">
            <button className="btn btn-back" onClick={goBack}>
              ← Back
            </button>
            <h2>{editMode ? "✏️ Edit Bill" : "💰 Create Bill"}</h2>
          </div>

          <div className="billing-container">
            {/* Job Info Card */}
            <div className="job-info-card">
              <h3>Job Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Customer</label>
                  <p>{selectedJob.customerName}</p>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <p>{selectedJob.customerPhone}</p>
                </div>
                <div className="info-item">
                  <label>Vehicle</label>
                  <p>{selectedJob.vehicleModel}</p>
                </div>
                <div className="info-item">
                  <label>Number</label>
                  <p>{selectedJob.vehicleNumber}</p>
                </div>
                <div className="info-item">
                  <label>Type</label>
                  <p>{selectedJob.vehicleType}</p>
                </div>
                <div className="info-item">
                  <label>Technician</label>
                  <p>{selectedJob.technician?.name || "N/A"}</p>
                </div>
              </div>

              {selectedJob.serviceNotes && (
                <div className="service-notes">
                  <label>Service Notes</label>
                  <p>{selectedJob.serviceNotes}</p>
                </div>
              )}

              {selectedJob.recommendations && (
                <div className="recommendations">
                  <label>Recommendations</label>
                  <p>{selectedJob.recommendations}</p>
                </div>
              )}
            </div>

            {/* Bill Items Card */}
            <div className="bill-items-card">
              <h3>Bill Items</h3>

              <div className="add-item-form">
                <div className="inventory-search-wrapper" ref={searchRef}>
                  <input
                    type="text"
                    placeholder="🔍 Search parts from inventory..."
                    value={partSearch}
                    onChange={(e) => {
                      setPartSearch(e.target.value);
                      searchParts(e.target.value);
                    }}
                    className="input-field"
                  />
                  {showSearchDropdown && searchResults.length > 0 && (
                    <div className="search-dropdown">
                      {searchResults.map((part) => (
                        <div
                          key={part.id}
                          className="search-result-item"
                          onClick={() => selectPart(part)}
                        >
                          <div className="part-info">
                            <strong>{part.name}</strong>
                            <span className="part-number">{part.partNumber}</span>
                          </div>
                          <div className="part-details">
                            <span className="part-price">₹{part.price}</span>
                            <span className={`stock-badge ${part.stock < 10 ? 'low-stock' : ''}`}>
                              {part.stock > 0 ? `${part.stock} in stock` : 'Out of stock'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Or enter custom item"
                  value={item.partId ? '' : item.name}
                  onChange={(e) => setItem({ ...item, name: e.target.value, partId: null })}
                  className="input-field"
                  disabled={!!item.partId}
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={item.price}
                  onChange={(e) => setItem({ ...item, price: e.target.value })}
                  className="input-field"
                  min="0"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => setItem({ ...item, quantity: parseInt(e.target.value) || 1 })}
                  className="input-field quantity-input"
                  min="1"
                />
                <button className="btn btn-add" onClick={addItem}>
                  + Add
                </button>
              </div>

              {items.length > 0 ? (
                <div className="items-list">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((i, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>
                            {i.name}
                            {i.partNumber && <div className="part-number-small">{i.partNumber}</div>}
                          </td>
                          <td>₹{Number(i.price).toFixed(2)}</td>
                          <td>{i.quantity || 1}</td>
                          <td>₹{(Number(i.price) * (i.quantity || 1)).toFixed(2)}</td>
                          <td>
                            <button
                              className="btn-remove"
                              onClick={() => removeItem(idx)}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="total-section">
                    <h3>Total: ₹{totalAmount.toFixed(2)}</h3>
                  </div>

                  <div className="action-buttons">
                    <button className="btn btn-success btn-large" onClick={saveBill}>
                      {editMode ? "💾 Update Bill" : "💰 Save Bill"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="empty-items">
                  <p>No items added yet. Start by searching or adding items above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierDashboard;
