export interface SidebarItemLink {
  type: 'link';
  href: string;
  label: string;
}

export interface DocsSidebarItemCategory {
  type: 'category';
  label: string;
  items: DocsSidebarItem[];
}

export type DocsSidebarItem = SidebarItemLink | DocsSidebarItemCategory;

export interface DocsSidebar {
  [sidebarId: string]: DocsSidebarItem[];
}
