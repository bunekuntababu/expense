// App.jsx
import React, { useState } from 'react';
import LoginPage from './LoginPage';
import { Trash2, UserPlus, Plus, FileText, Edit2, Check, X } from 'lucide-react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);


  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitAmong: [],
    customSplits: {} // New field for custom split amounts
  });

  // Add login handler
  const handleLogin = (username) => {
    setCurrentUser(username);
    setIsLoggedIn(true);
  };

  // Add logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    // Reset other states if needed
    setMembers([]);
    setExpenses([]);
  };

  // If not logged in, show login page
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Add new member
  const handleAddMember = (e) => {
    e.preventDefault();
    if (newMember.trim() && !members.includes(newMember.trim())) {
      setMembers([...members, newMember.trim()]);
      setNewMember('');
    }
  };

  // Remove member
  const handleRemoveMember = (memberToRemove) => {
    setMembers(members.filter(member => member !== memberToRemove));
    setExpenses(expenses.filter(expense => expense.paidBy !== memberToRemove));
  };

  // Initialize equal splits
  const initializeEqualSplits = (amount, selectedMembers) => {
    const splitAmount = amount / selectedMembers.length;
    const splits = {};
    selectedMembers.forEach(member => {
      splits[member] = splitAmount;
    });
    return splits;
  };

  // Add new expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (expenseForm.description && expenseForm.amount && expenseForm.paidBy && expenseForm.splitAmong.length > 0) {
      const newExpense = {
        ...expenseForm,
        id: Date.now(),
        amount: parseFloat(expenseForm.amount),
        customSplits: initializeEqualSplits(parseFloat(expenseForm.amount), expenseForm.splitAmong)
      };
      setExpenses([...expenses, newExpense]);
      setExpenseForm({
        description: '',
        amount: '',
        paidBy: '',
        splitAmong: [],
        customSplits: {}
      });
    }
  };

  // Start editing expense
  const startEditingExpense = (expense) => {
    setEditingExpenseId(expense.id);
  };

  // Save edited splits
  const saveEditedSplits = (expenseId) => {
    const expense = expenses.find(e => e.id === expenseId);
    const totalSplit = Object.values(expense.customSplits).reduce((sum, amount) => sum + amount, 0);
    
    // Check if splits add up to total amount
    if (Math.abs(totalSplit - expense.amount) > 0.01) {
      alert('Split amounts must add up to the total expense amount!');
      return;
    }
    
    setEditingExpenseId(null);
  };

  // Update split amount
  const updateSplitAmount = (expenseId, member, newAmount) => {
    setExpenses(expenses.map(expense => {
      if (expense.id === expenseId) {
        return {
          ...expense,
          customSplits: {
            ...expense.customSplits,
            [member]: parseFloat(newAmount) || 0
          }
        };
      }
      return expense;
    }));
  };

  // Calculate balances using custom splits
  const calculateBalances = () => {
    const balances = {};
    members.forEach(member => {
      balances[member] = 0;
    });

    expenses.forEach(expense => {
      const paidBy = expense.paidBy;
      balances[paidBy] += expense.amount;
      
      Object.entries(expense.customSplits).forEach(([person, splitAmount]) => {
        balances[person] -= splitAmount;
      });
    });

    return balances;
  };

  // Generate summary text
  const generateSummaryText = () => {
    const balances = calculateBalances();
    let summary = "Expense Split Summary\n\n";
    
    Object.entries(balances).forEach(([person, amount]) => {
      if (amount > 0) {
        summary += `${person} is owed $${amount.toFixed(2)}\n`;
      } else if (amount < 0) {
        summary += `${person} owes $${Math.abs(amount).toFixed(2)}\n`;
      } else {
        summary += `${person} is settled up\n`;
      }
    });

    return summary;
  };

  // Share summary
  const handleShare = () => {
    const summary = generateSummaryText();
    navigator.clipboard.writeText(summary)
      .then(() => alert('Summary copied to clipboard!'))
      .catch(() => alert('Failed to copy summary'));
  };

  // Calculate remaining amount for split
  const calculateRemaining = (expense) => {
    const totalSplit = Object.values(expense.customSplits).reduce((sum, amount) => sum + amount, 0);
    return expense.amount - totalSplit;
  };

  return (
    <body className='body'>
    {/* Add logout button to header */}
    <div className='header'>
        {/* <div className="user-info">
          <span>Welcome, {currentUser}</span>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div> */}
      </div>
    <div className="container">
      <h1>Expense Splitter</h1>

      {/* Add Members Section */}
      <div className="section">
        <h2>Group Members</h2>
        <form onSubmit={handleAddMember} className="member-form">
          <input
            type="text"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            placeholder="Enter member name"
          />
          <button type="submit" className="btn btn-primary">
            <UserPlus size={20} /> Add Member
          </button>
        </form>
        <div className="members-list">
          {members.map(member => (
            <div key={member} className="member-tag">
              <span>{member}</span>
              <button
                onClick={() => handleRemoveMember(member)}
                className="btn-icon"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Expense Section */}
      {members.length > 0 && (
        <div className="section">
          <h2>Add Expense</h2>
          <form onSubmit={handleAddExpense} className="expense-form">
            <div className="form-row">
              <input
                type="text"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                placeholder="Description"
              />
              <input
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                placeholder="Amount"
                className="amount-input"
                step="0.01"
              />
            </div>
            <div className="form-row">
              <select
                value={expenseForm.paidBy}
                onChange={(e) => setExpenseForm({...expenseForm, paidBy: e.target.value})}
              >
                <option value="">Paid by</option>
                {members.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
            </div>
            <div className="split-section">
              <p>Split among:</p>
              <div className="checkbox-group">
                {members.map(member => (
                  <label key={member} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={expenseForm.splitAmong.includes(member)}
                      onChange={(e) => {
                        const newSplitAmong = e.target.checked
                          ? [...expenseForm.splitAmong, member]
                          : expenseForm.splitAmong.filter(m => m !== member);
                        setExpenseForm({...expenseForm, splitAmong: newSplitAmong});
                      }}
                    />
                    {member}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-success">
              <Plus size={20} /> Add Expense
            </button>
          </form>
        </div>
      )}

      {/* Expenses List */}
      {expenses.length > 0 && (
        <div className="section">
          <h2>Expenses</h2>
          <div className="expenses-list">
            {expenses.map(expense => (
              <div key={expense.id} className="expense-card">
                <div className="expense-header">
                  <div>
                    <h3>{expense.description}</h3>
                    <p className="expense-details">
                      Paid by {expense.paidBy} • Total: ${expense.amount.toFixed(2)}
                    </p>
                  </div>
                  {editingExpenseId !== expense.id ? (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => startEditingExpense(expense)}
                    >
                      <Edit2 size={16} /> Edit Split
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button 
                        className="btn btn-success"
                        onClick={() => saveEditedSplits(expense.id)}
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => setEditingExpenseId(null)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="splits-list">
                  {expense.splitAmong.map(member => (
                    <div key={member} className="split-item">
                      <span>{member}</span>
                      {editingExpenseId === expense.id ? (
                        <input
                          type="number"
                          value={expense.customSplits[member]}
                          onChange={(e) => updateSplitAmount(expense.id, member, e.target.value)}
                          className="split-amount-input"
                          step="0.01"
                        />
                      ) : (
                        <span>${expense.customSplits[member].toFixed(2)}</span>
                      )}
                    </div>
                  ))}
                  {editingExpenseId === expense.id && (
                    <div className="remaining-amount">
                      Remaining: ${calculateRemaining(expense).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Section */}
      {expenses.length > 0 && (
        <div className="section">
          <h2>Summary</h2>
          <div className="summary-card">
            {Object.entries(calculateBalances()).map(([person, amount]) => (
              <div key={person} className="summary-row">
                <span>{person}</span>
                <span className={amount > 0 ? 'positive' : amount < 0 ? 'negative' : ''}>
                  {amount > 0 ? `Gets back $${amount.toFixed(2)}` : 
                   amount < 0 ? `Owes $${Math.abs(amount).toFixed(2)}` : 
                   'Settled up'}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={handleShare}
            className="btn btn-primary"
          >
            <FileText size={20} /> Copy Summary
          </button>
        </div>
      )}
    </div>
    </body>
  );
}

export default App;