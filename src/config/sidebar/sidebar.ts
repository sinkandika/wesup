export type UserRole = 
  | "admin"
  | "user"
  | "technician"
  | "supervisor";

export type SideBarItem = {
  label: string;
  href: string;
  icon: string;
  iconClassName?: string;
}

export const SideBarItems: Record<UserRole, SideBarItem[]> = {
  user: [
    {
      label: "Create Ticket",
      href: "/user/create-ticket",
      icon: "/create-ticket.svg",
      iconClassName: "w-4 ",
    },
    {
      label: "My Ticket",
      href: "/user/my-ticket",
      icon: "/my-ticket.svg",
      iconClassName: "w-5 h-5",
    },
  ],

  technician: [
    {
      label: "Assignments",
      href: "/technician/assignments",
      icon: "/assignment.svg",
      iconClassName: "w-4.5",
    },
    {
      label: "Ticket History",
      href: "/technician/ticket-history",
      icon: "/ticket-history.svg",
      iconClassName: "w-5",
    },
  ],

  supervisor: [
    {
      label: "Create Ticket",
      href: "/supervisor/create-ticket",
      icon: "/create-ticket.svg",
      iconClassName: "w-4.5",
    },
    {
      label: "My Ticket",
      href: "/supervisor/my-ticket",
      icon: "/my-ticket.svg",
      iconClassName: "w-5 h-5",
    },
    {
      label: "Ticket Review",
      href: "/supervisor/ticket-review",
      icon: "/ticket-review.svg",
      iconClassName: "w-3.5",
    },
    {
      label: "Activity",
      href: "/supervisor/ticket-activity",
      icon: "/audit-log.svg",
      iconClassName: "w-4.5",
    },
  ],

  admin: [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: "/assignment.svg",
      iconClassName: "w-5 h-5",
    },
  ]
}