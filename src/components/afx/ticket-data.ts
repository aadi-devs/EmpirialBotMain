export type TicketStatus = "Open" | "Claimed" | "Closed";
export type TicketCategory =
  | "General Support"
  | "Payout Desk"
  | "Mentorship Inquiry"
  | "VIP Access";

export type TicketMessage = {
  id: string;
  author: string;
  role: "member" | "staff";
  content: string;
  time: string;
};

export type Ticket = {
  id: string;
  number: string;
  member: string;
  avatar: string;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  created: string;
  createdLabel: string;
  assignee: string | null;
  preview: string;
  unread: number;
  messages: TicketMessage[];
};

export const categories: TicketCategory[] = [
  "General Support",
  "Payout Desk",
  "Mentorship Inquiry",
  "VIP Access",
];

export const staffMembers = ["@nova", "@kai", "@sable", "@mira"];

export const initialTickets: Ticket[] = [
  {
    id: "AFX-0042",
    number: "0042",
    member: "mira.fx",
    avatar: "M",
    category: "Payout Desk",
    subject: "First payout timeline",
    status: "Open",
    created: "2026-11-18T09:42:00Z",
    createdLabel: "12 min ago",
    assignee: null,
    preview: "Just submitted my first request — what happens next?",
    unread: 2,
    messages: [
      { id: "m1", author: "mira.fx", role: "member", content: "Hey team! I just submitted my first payout request and wanted to check what happens next.", time: "09:42" },
      { id: "m2", author: "mira.fx", role: "member", content: "My account ID is AFX-8831. Verification is already complete.", time: "09:44" },
    ],
  },
  {
    id: "AFX-0041",
    number: "0041",
    member: "chartnomad",
    avatar: "C",
    category: "Mentorship Inquiry",
    subject: "November cohort availability",
    status: "Claimed",
    created: "2026-11-18T09:18:00Z",
    createdLabel: "36 min ago",
    assignee: "@nova",
    preview: "Are there still spots for the next mentorship cohort?",
    unread: 0,
    messages: [
      { id: "m3", author: "chartnomad", role: "member", content: "Are there still spots for the next mentorship cohort?", time: "09:18" },
      { id: "m4", author: "@nova", role: "staff", content: "Let me check the latest cohort schedule for you.", time: "09:23" },
      { id: "m5", author: "chartnomad", role: "member", content: "Thank you! I’m flexible with the start date.", time: "09:26" },
    ],
  },
  {
    id: "AFX-0040",
    number: "0040",
    member: "nfx.aria",
    avatar: "N",
    category: "VIP Access",
    subject: "Private room access",
    status: "Open",
    created: "2026-11-18T08:56:00Z",
    createdLabel: "58 min ago",
    assignee: null,
    preview: "My role updated, but the private channels are still locked.",
    unread: 1,
    messages: [
      { id: "m6", author: "nfx.aria", role: "member", content: "My role updated, but the private channels are still locked.", time: "08:56" },
    ],
  },
  {
    id: "AFX-0039",
    number: "0039",
    member: "pixelpip",
    avatar: "P",
    category: "General Support",
    subject: "Dashboard showing zero volume",
    status: "Claimed",
    created: "2026-11-18T08:24:00Z",
    createdLabel: "1 hr ago",
    assignee: "@kai",
    preview: "The weekly volume widget reset overnight — is that expected?",
    unread: 0,
    messages: [
      { id: "m7", author: "pixelpip", role: "member", content: "The weekly volume widget reset overnight — is that expected?", time: "08:24" },
      { id: "m8", author: "@kai", role: "staff", content: "The weekly view refreshes at UTC midnight; I can help verify your range.", time: "08:29" },
    ],
  },
  {
    id: "AFX-0038",
    number: "0038",
    member: "rookie.risk",
    avatar: "R",
    category: "General Support",
    subject: "Risk limits clarification",
    status: "Open",
    created: "2026-11-18T07:50:00Z",
    createdLabel: "2 hrs ago",
    assignee: null,
    preview: "Can I adjust position sizing after a funded account is active?",
    unread: 0,
    messages: [
      { id: "m9", author: "rookie.risk", role: "member", content: "Can I adjust position sizing after a funded account is active?", time: "07:50" },
    ],
  },
  {
    id: "AFX-0037",
    number: "0037",
    member: "tape.reader",
    avatar: "T",
    category: "Payout Desk",
    subject: "KYC document accepted",
    status: "Closed",
    created: "2026-11-17T18:12:00Z",
    createdLabel: "Yesterday",
    assignee: "@sable",
    preview: "Got it, thanks for the quick turnaround.",
    unread: 0,
    messages: [
      { id: "m10", author: "tape.reader", role: "member", content: "Can you confirm my updated ID document was received?", time: "18:12" },
      { id: "m11", author: "@sable", role: "staff", content: "Your updated ID was received and approved. You’re all set for your payout request.", time: "18:35" },
      { id: "m12", author: "tape.reader", role: "member", content: "Got it, thanks for the quick turnaround.", time: "18:41" },
    ],
  },
  {
    id: "AFX-0036",
    number: "0036",
    member: "atlas.x",
    avatar: "A",
    category: "Mentorship Inquiry",
    subject: "Session replay library",
    status: "Closed",
    created: "2026-11-17T14:03:00Z",
    createdLabel: "Yesterday",
    assignee: "@mira",
    preview: "Found it — I was looking under the wrong tab.",
    unread: 0,
    messages: [
      { id: "m13", author: "atlas.x", role: "member", content: "Where are the session replays posted?", time: "14:03" },
      { id: "m14", author: "@mira", role: "staff", content: "Open Resources → Replay Archive in your member dashboard.", time: "14:10" },
      { id: "m15", author: "atlas.x", role: "member", content: "Found it — I was looking under the wrong tab.", time: "14:15" },
    ],
  },
];

export const cannedReplies = [
  { label: "Payout rules", content: "Payout requests are reviewed by our team after the account passes verification. You can find the full eligibility rules in #payout-guidelines." },
  { label: "Mentorship", content: "Our next mentorship cohort dates are posted in #mentorship-updates. I can share the current schedule once spots are confirmed." },
  { label: "KYC info", content: "Please submit your government-issued ID through your secure member dashboard under Account → Verification. Never share identity documents in this chat." },
];
