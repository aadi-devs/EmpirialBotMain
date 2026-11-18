import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  initialTickets,
  categories,
  cannedReplies,
  type Ticket,
  type TicketStatus,
  type TicketCategory
} from "@/components/afx/ticket-data";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Search,
  Filter,
  Send,
  Download,
  Lock,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Bot,
  Server,
  Terminal,
  BarChart3,
  Sparkles,
  Layers,
  Copy,
  RefreshCw,
  X
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: AFXDashboard,
});

function AFXDashboard() {
  // Authentication & Admin Simulation State
  const [isAdmin, setIsAdmin] = useState(true);
  const [activeTab, setActiveTab] = useState<"tickets" | "deployer" | "security" | "analytics">("tickets");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Ticket Data State
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(initialTickets[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Chat Drawer State
  const [replyText, setReplyText] = useState("");
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchSearch =
        t.number.includes(searchQuery) ||
        t.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.preview.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "All" || t.category === selectedCategory;
      const matchStatus = selectedStatus === "All" || t.status === selectedStatus;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [tickets, searchQuery, selectedCategory, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "Open").length;
    const claimed = tickets.filter(t => t.status === "Claimed").length;
    const closed = tickets.filter(t => t.status === "Closed").length;
    return { total, open, claimed, closed };
  }, [tickets]);

  // Handler: Send Reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      author: "@itsmevictus. (COO)",
      role: "staff" as const,
      content: replyText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updated = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          messages: [...t.messages, newMsg],
          preview: replyText.trim(),
          status: t.status === "Open" ? ("Claimed" as TicketStatus) : t.status,
          assignee: t.assignee || "@itsmevictus."
        };
      }
      return t;
    });

    setTickets(updated);
    setSelectedTicket(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMsg],
      preview: replyText.trim(),
      status: prev.status === "Open" ? ("Claimed" as TicketStatus) : prev.status,
      assignee: prev.assignee || "@itsmevictus."
    } : null);
    setReplyText("");
  };

  // Handler: Claim Ticket
  const handleClaim = () => {
    if (!selectedTicket) return;
    const updated = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return { ...t, status: "Claimed" as TicketStatus, assignee: "@itsmevictus." };
      }
      return t;
    });
    setTickets(updated);
    setSelectedTicket(prev => prev ? { ...prev, status: "Claimed", assignee: "@itsmevictus." } : null);
  };

  // Handler: Close Ticket
  const handleClose = () => {
    if (!selectedTicket) return;
    const updated = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return { ...t, status: "Closed" as TicketStatus };
      }
      return t;
    });
    setTickets(updated);
    setSelectedTicket(prev => prev ? { ...prev, status: "Closed" } : null);
  };

  // Handler: Download HTML Transcript
  const handleDownloadTranscript = () => {
    if (!selectedTicket) return;
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Transcript #${selectedTicket.number}</title><style>body{background:#0F172A;color:#F8FAFC;font-family:sans-serif;padding:32px}.box{background:#1E293B;padding:24px;border-radius:8px;border:1px solid #334155}.msg{margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #334155}.staff{color:#E11D48;font-weight:bold}.member{color:#38BDF8;font-weight:bold}.time{font-size:12px;color:#94A3B8;margin-left:8px}</style></head><body><div class="box"><h2>Empirial [AFX] Ticket #${selectedTicket.number}</h2><p>Member: ${selectedTicket.member} | Category: ${selectedTicket.category}</p><hr style="border-color:#334155">`;
    selectedTicket.messages.forEach(m => {
      html += `<div class="msg"><span class="${m.role}">${m.author}</span><span class="time">${m.time}</span><div style="margin-top:6px">${m.content}</div></div>`;
    });
    html += `</div></body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${selectedTicket.number}-transcript.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText("/ticket-panel");
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // ==========================================
  // ACCESS DENIED SCREEN (When non-admin logs in)
  // ==========================================
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#090D16] p-4 text-slate-100">
        <div className="glass-panel w-full max-w-md rounded-xl border border-red-900/50 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/60 text-red-500 ring-2 ring-red-500/30">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">403 ▍Access Restricted</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            You are authenticated via Discord as <span className="font-mono font-medium text-slate-200">@regular_member</span>.
          </p>
          <div className="mt-4 rounded-lg border border-red-900/40 bg-red-950/20 p-3 text-xs text-red-300">
            <strong>Permission Check Failed:</strong> Only accounts possessing the Discord <code>ADMINISTRATOR (0x8)</code> permission on <strong>Empirial [ AFX ]</strong> are authorized to access this dashboard.
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => setIsAdmin(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500"
            >
              <ShieldCheck className="h-4 w-4" />
              Switch to Administrator Account (@itsmevictus.)
            </button>
            <p className="mt-2 text-xs text-slate-500">
              Simulating Discord OAuth2 Role-Based Access Control (RBAC).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN ADMIN TICKET COMMAND DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      {/* TOP STATUS BAR */}
      <header className="border-b border-slate-800/80 bg-[#0F172A]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center font-black text-white shadow-lg shadow-red-600/20">
              AFX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-wide text-white">EMPIRIAL [AFX]</h1>
                <span className="text-xs px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/40 font-mono">TICKET COMMAND</span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Guild: <span className="font-mono text-slate-300">1439121933001035808</span> • Gate: <span className="text-emerald-400 font-semibold">ADMINISTRATOR (0x8)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Simulation Switcher */}
            <button
              onClick={() => setIsAdmin(false)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition flex items-center gap-1.5"
              title="Test what non-admins see"
            >
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Simulate Non-Admin</span>
            </button>

            {/* Authenticated Staff User Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80">
              <div className="h-7 w-7 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">
                V
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-200">itsmevictus.</div>
                <div className="text-[10px] text-emerald-400 font-mono">COO • ADMINISTRATOR</div>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 text-sm border-t border-slate-800/50">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`py-3 font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "tickets"
                ? "border-red-500 text-red-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Ticket Queue ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab("deployer")}
            className={`py-3 font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "deployer"
                ? "border-red-500 text-red-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bot className="h-4 w-4" />
            Discord Panel Deployer
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`py-3 font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "security"
                ? "border-red-500 text-red-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Admin Security Gate
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-3 font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === "analytics"
                ? "border-red-500 text-red-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Staff Analytics
          </button>
        </div>
      </header>

      {/* CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* KPI STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Total Inquiries</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span>↑ 12%</span> vs last week
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Open & Pending</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.open}</div>
            <div className="text-[11px] text-slate-400 mt-1">Requires attention</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Claimed / Active</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{stats.claimed}</div>
            <div className="text-[11px] text-slate-400 mt-1">Under staff review</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Avg Resolution</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">18.4m</div>
            <div className="text-[11px] text-emerald-400 mt-1">Fast turnaround</div>
          </div>
        </div>

        {/* TAB 1: TICKETS VIEW */}
        {activeTab === "tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* TICKET LIST / KANBAN COLUMN */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Filter & Search Bar */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-64">
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search #ticket, user, issue..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="All">All Departments</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="Claimed">Claimed</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <div className="flex border border-slate-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("kanban")}
                      className={`px-2.5 py-1 text-xs font-medium ${viewMode === "kanban" ? "bg-red-600 text-white" : "bg-slate-900 text-slate-400"}`}
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-2.5 py-1 text-xs font-medium ${viewMode === "table" ? "bg-red-600 text-white" : "bg-slate-900 text-slate-400"}`}
                    >
                      Table
                    </button>
                  </div>
                </div>
              </div>

              {/* TICKET ITEMS */}
              {viewMode === "kanban" ? (
                <div className="flex flex-col gap-3">
                  {filteredTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 rounded-xl border cursor-pointer transition flex items-start justify-between gap-4 ${
                        selectedTicket?.id === ticket.id
                          ? "bg-slate-800/90 border-red-500/80 shadow-lg shadow-red-950/20"
                          : "glass-panel border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-200 shrink-0">
                          {ticket.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-red-400">#{ticket.number}</span>
                            <span className="text-xs font-semibold text-slate-200">{ticket.member}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              ticket.category === "Payout Desk" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" :
                              ticket.category === "Mentorship Inquiry" ? "bg-indigo-950 text-indigo-400 border border-indigo-800/40" :
                              ticket.category === "VIP Access" ? "bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-800/40" :
                              "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}>
                              {ticket.category}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-white mt-1">{ticket.subject}</div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{ticket.preview}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                            <span>{ticket.createdLabel}</span>
                            {ticket.assignee && (
                              <span className="text-amber-400 font-medium">Assigned: {ticket.assignee}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded font-semibold ${
                          ticket.status === "Open" ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700" :
                          ticket.status === "Claimed" ? "bg-amber-900/60 text-amber-300 border border-amber-700" :
                          "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}>
                          {ticket.status}
                        </span>
                        {ticket.unread > 0 && (
                          <span className="h-5 w-5 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {ticket.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredTickets.length === 0 && (
                    <div className="glass-panel p-8 text-center rounded-xl text-slate-400 text-sm">
                      No tickets matching your filter criteria.
                    </div>
                  )}
                </div>
              ) : (
                /* TABLE VIEW */
                <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-3">Ticket</th>
                        <th className="p-3">Member</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Assignee</th>
                        <th className="p-3">Age</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredTickets.map(ticket => (
                        <tr
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`hover:bg-slate-800/60 cursor-pointer ${selectedTicket?.id === ticket.id ? "bg-slate-800/90 font-medium" : ""}`}
                        >
                          <td className="p-3 font-mono text-red-400 font-bold">#{ticket.number}</td>
                          <td className="p-3 text-slate-200">{ticket.member}</td>
                          <td className="p-3">{ticket.category}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              ticket.status === "Open" ? "text-emerald-400" :
                              ticket.status === "Claimed" ? "text-amber-400" : "text-slate-400"
                            }`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{ticket.assignee || "—"}</td>
                          <td className="p-3 text-slate-500">{ticket.createdLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* LIVE TICKET CHAT DRAWER */}
            <div className="lg:col-span-5 sticky top-24">
              {selectedTicket ? (
                <div className="glass-panel rounded-xl border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl">
                  {/* Drawer Header */}
                  <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-red-400">#{selectedTicket.number}</span>
                        <span className="text-sm font-semibold text-white">{selectedTicket.member}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedTicket.subject}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownloadTranscript}
                        className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Download HTML Transcript"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleClose}
                        disabled={selectedTicket.status === "Closed"}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 disabled:opacity-50 text-white font-medium transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Ticket Details Sub-bar */}
                  <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      Department: <span className="text-slate-200 font-medium">{selectedTicket.category}</span>
                    </div>
                    <div>
                      Assignee:{" "}
                      {selectedTicket.assignee ? (
                        <span className="text-amber-400 font-semibold">{selectedTicket.assignee}</span>
                      ) : (
                        <button onClick={handleClaim} className="text-red-400 hover:underline font-medium">
                          Claim ticket
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {selectedTicket.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                          msg.role === "staff"
                            ? "self-end bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-br-none shadow-md"
                            : "self-start bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75">
                          <span className="font-semibold">{msg.author}</span>
                          <span>{msg.time}</span>
                        </div>
                        <div>{msg.content}</div>
                      </div>
                    ))}
                  </div>

                  {/* Canned Quick Replies */}
                  <div className="p-2 border-t border-slate-800/60 bg-slate-900/40 flex gap-2 overflow-x-auto">
                    {cannedReplies.map(cr => (
                      <button
                        key={cr.label}
                        onClick={() => setReplyText(cr.content)}
                        className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap"
                      >
                        ⚡ {cr.label}
                      </button>
                    ))}
                  </div>

                  {/* Reply Input */}
                  <form onSubmit={handleSendReply} className="p-3 border-t border-slate-800 bg-slate-900/90 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type reply to post directly to Discord channel..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send
                    </button>
                  </form>
                </div>
              ) : (
                <div className="glass-panel p-12 text-center rounded-xl text-slate-400">
                  Select a ticket to inspect live chat and send replies.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DISCORD PANEL DEPLOYER */}
        {activeTab === "deployer" && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-xl border border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bot className="h-5 w-5 text-red-500" />
                AFX Discord Ticket Panel Deployer
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                This panel is dispatched directly to your Discord support channel (e.g. <code>#create-ticket</code>) via your bot.
              </p>

              {/* Discord Visual Preview Mock */}
              <div className="mt-6 rounded-xl bg-[#2B2D31] p-5 border border-slate-700 font-sans shadow-xl">
                <div className="border-l-4 border-[#E11D48] pl-4 py-1">
                  <h3 className="font-bold text-white text-base">🏛️ ▍𝐄𝐌𝐏𝐈𝐑𝐈𝐀𝐋 [ 𝐀𝐅𝐗 ] 𝐒𝐔𝐏𝐏𝐎𝐑𝐓 𝐃𝐄𝐒𝐊</h3>
                  <p className="text-xs text-[#DBDEE1] mt-2 leading-relaxed">
                    Welcome to the <strong>Empirial [ ᴀғx ]</strong> Private Support Hub.<br /><br />
                    Please select the appropriate department below to initiate a private, one-on-one inquiry with our staff team.<br /><br />
                    💰 <strong>Payout Desk</strong> — Payout inquiries, eligibility, & verification<br />
                    🎓 <strong>Mentorship</strong> — Private mentorship cohorts & technical curriculum<br />
                    💎 <strong>VIP Access</strong> — Private trading room & role verification<br />
                    🎫 <strong>General</strong> — Account help, server inquiries, & reports<br /><br />
                    <em>All tickets are strictly confidential and encrypted in our internal logs.</em>
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="px-3 py-1.5 rounded bg-[#248046] text-white text-xs font-semibold flex items-center gap-1.5 shadow">
                      💰 Payout Desk
                    </button>
                    <button className="px-3 py-1.5 rounded bg-[#5865F2] text-white text-xs font-semibold flex items-center gap-1.5 shadow">
                      🎓 Mentorship
                    </button>
                    <button className="px-3 py-1.5 rounded bg-[#4E5058] text-white text-xs font-semibold flex items-center gap-1.5 shadow">
                      💎 VIP Access
                    </button>
                    <button className="px-3 py-1.5 rounded bg-[#4E5058] text-white text-xs font-semibold flex items-center gap-1.5 shadow">
                      🎫 General Support
                    </button>
                  </div>
                </div>
              </div>

              {/* Bot Command Instruction */}
              <div className="mt-6 bg-slate-900 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Slash Command to Deploy in Discord:</div>
                  <div className="font-mono text-sm text-red-400 font-bold mt-1">/ticket-panel</div>
                </div>
                <button
                  onClick={handleCopyCommand}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedCmd ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN SECURITY GATE */}
        {activeTab === "security" && (
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-xl border border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Discord OAuth2 Role-Based Access Control (RBAC)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                How our system blocks unauthorized members and grants access only to confirmed administrators.
              </p>

              <div className="mt-6 flex flex-col gap-4 text-xs">
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <div className="h-6 w-6 rounded bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">1</div>
                  <div>
                    <div className="font-semibold text-white">OAuth2 Scopes Requested</div>
                    <div className="text-slate-400 mt-0.5"><code>identify</code>, <code>guilds</code>, <code>guilds.members.read</code></div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <div className="h-6 w-6 rounded bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">2</div>
                  <div>
                    <div className="font-semibold text-white">Bitwise Permission Verification</div>
                    <div className="text-slate-400 mt-0.5">
                      The backend verifies <code>(permissions & 0x8) === 0x8</code> (Administrator) on Guild <code>1439121933001035808</code>.
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-3">
                  <div className="h-6 w-6 rounded bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">3</div>
                  <div>
                    <div className="font-semibold text-white">Non-Admin Hard Block (403 Forbidden)</div>
                    <div className="text-slate-400 mt-0.5">
                      Any user lacking Administrator privileges is immediately redirected to the access-restricted gate and blocked from reading ticket data.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-xl border border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
                Department Ticket Distribution
              </h2>
              <div className="mt-6 flex flex-col gap-4 text-xs">
                {categories.map(cat => {
                  const count = tickets.filter(t => t.category === cat).length;
                  const pct = Math.round((count / tickets.length) * 100);
                  return (
                    <div key={cat} className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-200">{cat}</span>
                        <span className="text-slate-400">{count} tickets ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
