import { Branch, MenuItem, Employee, LoyaltyCustomer, TaxConfig, ReceiptSettings } from "./types";

export const DEFAULT_BRANCHES: Branch[] = [
  {
    id: "branch-1",
    name: "Downtown Main Street",
    address: "123 Gourmet Ave, Downtown",
    phone: "+1 (555) 100-2001",
    isActive: true
  },
  {
    id: "branch-2",
    name: "Uptown Bistro & Lounge",
    address: "789 Heights Blvd, Uptown",
    phone: "+1 (555) 300-4002",
    isActive: true
  },
  {
    id: "branch-3",
    name: "Westside Express Delivery",
    address: "45 Velocity Way, Westside",
    phone: "+1 (555) 500-6003",
    isActive: true
  }
];

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  // Burgers
  {
    id: "menu-burger-1",
    name: "Signature Truffle Burger",
    category: "Burgers",
    price: 16.50,
    description: "Angus beef, black truffle aioli, wild mushrooms, aged swiss, brioche bun",
    branches: ["branch-1", "branch-2"],
    ingredients: [
      { inventoryId: "inv-beef-patty", quantityNeeded: 1 },
      { inventoryId: "inv-bun-brioche", quantityNeeded: 1 },
      { inventoryId: "inv-swiss-cheese", quantityNeeded: 2 },
      { inventoryId: "inv-truffle-oil", quantityNeeded: 0.05 }
    ]
  },
  {
    id: "menu-burger-2",
    name: "Spicy Volcano Burger",
    category: "Burgers",
    price: 14.90,
    description: "Crispy chicken breast, ghost pepper jack cheese, jalapeño slaw, sriracha mayo",
    branches: ["branch-1", "branch-2", "branch-3"],
    ingredients: [
      { inventoryId: "inv-chicken-breast", quantityNeeded: 1 },
      { inventoryId: "inv-bun-brioche", quantityNeeded: 1 },
      { inventoryId: "inv-spicy-cheese", quantityNeeded: 1 },
      { inventoryId: "inv-jalapeno", quantityNeeded: 0.1 }
    ]
  },
  // Pizzas
  {
    id: "menu-pizza-1",
    name: "Stone-Baked Margherita",
    category: "Pizza",
    price: 13.90,
    description: "San Marzano marinara, fresh mozzarella di bufala, organic sweet basil, extra virgin olive oil",
    branches: ["branch-1", "branch-2"],
    ingredients: [
      { inventoryId: "inv-dough", quantityNeeded: 1 },
      { inventoryId: "inv-moz-cheese", quantityNeeded: 0.2 },
      { inventoryId: "inv-tomato-sauce", quantityNeeded: 0.15 },
      { inventoryId: "inv-basil", quantityNeeded: 0.05 }
    ]
  },
  {
    id: "menu-pizza-2",
    name: "Florentine Prosciutto & Fig",
    category: "Pizza",
    price: 18.00,
    description: "Prosciutto di Parma, black mission figs, wild arugula, caramelized onions, balsamic reduction",
    branches: ["branch-1", "branch-2"],
    ingredients: [
      { inventoryId: "inv-dough", quantityNeeded: 1 },
      { inventoryId: "inv-prosciutto", quantityNeeded: 0.1 },
      { inventoryId: "inv-figs", quantityNeeded: 0.08 },
      { inventoryId: "inv-arugula", quantityNeeded: 0.05 }
    ]
  },
  // Sides
  {
    id: "menu-side-1",
    name: "Garlic Parmesan Truffle Fries",
    category: "Sides",
    price: 7.50,
    description: "Thick cut Idaho potatoes, white truffle oil, shaved pecorino, parsley",
    branches: ["branch-1", "branch-2", "branch-3"],
    ingredients: [
      { inventoryId: "inv-potatoes", quantityNeeded: 0.3 },
      { inventoryId: "inv-peco-cheese", quantityNeeded: 0.03 },
      { inventoryId: "inv-truffle-oil", quantityNeeded: 0.02 }
    ]
  },
  {
    id: "menu-side-2",
    name: "Crispy Brussels Sprouts",
    category: "Sides",
    price: 8.90,
    description: "Flash fried brussels sprouts, maple-mustard glaze, toasted pecans, crispy bacon crumbles",
    branches: ["branch-1", "branch-2"],
    ingredients: [
      { inventoryId: "inv-brussels", quantityNeeded: 0.25 },
      { inventoryId: "inv-pecans", quantityNeeded: 0.03 },
      { inventoryId: "inv-bacon", quantityNeeded: 0.05 }
    ]
  },
  // Drinks
  {
    id: "menu-drink-1",
    name: "Manual Pour-Over Coffee",
    category: "Beverages",
    price: 5.50,
    description: "Single-origin Ethiopian Yirgacheffe, floral notes, citrus highlights, brewed to order",
    branches: ["branch-1", "branch-2"],
    ingredients: [
      { inventoryId: "inv-coffee-beans", quantityNeeded: 0.02 }
    ]
  },
  {
    id: "menu-drink-2",
    name: "Artisan Iced Matcha Latte",
    category: "Beverages",
    price: 6.20,
    description: "Ceremonial grade Japanese Uji matcha whisked with organic oat milk and raw agave",
    branches: ["branch-1", "branch-2", "branch-3"],
    ingredients: [
      { inventoryId: "inv-matcha-powder", quantityNeeded: 0.005 },
      { inventoryId: "inv-oat-milk", quantityNeeded: 0.25 }
    ]
  },
  // Desserts
  {
    id: "menu-dessert-1",
    name: "Tahitian Vanilla Crème Brûlée",
    category: "Desserts",
    price: 9.50,
    description: "Rich custard base flavored with real Tahitian vanilla bean, topped with a layer of hardened caramelized sugar",
    branches: ["branch-1", "branch-2"],
    ingredients: [
      { inventoryId: "inv-cream", quantityNeeded: 0.15 },
      { inventoryId: "inv-sugar", quantityNeeded: 0.05 },
      { inventoryId: "inv-eggs", quantityNeeded: 2 }
    ]
  }
];

export const DEFAULT_EMPLOYEES: Employee[] = [
  { id: "emp-1", name: "Sarah Jenkins", role: "Manager", phone: "+1 (555) 123-4567", email: "sarah@gourmet.com", isActive: true },
  { id: "emp-2", name: "David Miller", role: "Cashier", phone: "+1 (555) 234-5678", email: "david@gourmet.com", isActive: true },
  { id: "emp-3", name: "Elena Rostova", role: "Chef", phone: "+1 (555) 345-6789", email: "elena@gourmet.com", isActive: true },
  { id: "emp-4", name: "Marcus Cobb", role: "Waiter", phone: "+1 (555) 456-7890", email: "marcus@gourmet.com", isActive: true },
  { id: "emp-5", name: "Jessica Patel", role: "Cashier", phone: "+1 (555) 567-8901", email: "jessica@gourmet.com", isActive: true }
];

export const DEFAULT_LOYALTY_CUSTOMERS: LoyaltyCustomer[] = [
  { id: "lc-1", name: "Robert Downey", phone: "555-888-0001", email: "robert@rdj.com", pointsBalance: 750, createdAt: "2026-03-15T10:00:00Z" },
  { id: "lc-2", name: "Scarlett Johansson", phone: "555-888-0002", email: "scarlett@johansson.org", pointsBalance: 1200, createdAt: "2026-04-02T11:30:00Z" },
  { id: "lc-3", name: "Chris Evans", phone: "555-888-0003", email: "cap@avengers.gov", pointsBalance: 320, createdAt: "2026-05-12T09:15:00Z" }
];

export const DEFAULT_TAX_CONFIGS: TaxConfig[] = [
  { id: "tax-1", name: "State Sales Tax", rate: 0.0825, isEnabled: true }, // 8.25%
  { id: "tax-2", name: "City Service Charge", rate: 0.05, isEnabled: true }, // 5.0%
  { id: "tax-3", name: "Luxury Goods Tax", rate: 0.02, isEnabled: false } // 2.0%
];

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  shopName: "Gourmet Bistro & POS",
  address: "Headquarters: 100 Plaza Central, Ste 400",
  phone: "+1 (800) 555-0100",
  headerMessage: "Gourmet Dining Experience",
  footerMessage: "Thank you for dining with us! Come back soon."
};

// Initial inventory state for each branch to populate
export const getInitialInventoryList = (branchId: string) => [
  { id: `inv-beef-patty-${branchId}`, name: "Angus Beef Patty (Premium)", quantity: 120, unit: "pcs", reorderPoint: 20, unitPrice: 3.50, supplier: "Prime Meats Corp", branchId },
  { id: `inv-bun-brioche-${branchId}`, name: "Artisanal Brioche Buns", quantity: 150, unit: "pcs", reorderPoint: 25, unitPrice: 0.80, supplier: "Sweet Oven Bakery", branchId },
  { id: `inv-swiss-cheese-${branchId}`, name: "Aged Swiss Cheese Slices", quantity: 200, unit: "pcs", reorderPoint: 30, unitPrice: 0.40, supplier: "Valley Dairy Distributors", branchId },
  { id: `inv-chicken-breast-${branchId}`, name: "Free-range Chicken Breast", quantity: 80, unit: "pcs", reorderPoint: 15, unitPrice: 2.80, supplier: "Prime Meats Corp", branchId },
  { id: `inv-spicy-cheese-${branchId}`, name: "Ghost Pepper Jack Cheese Slices", quantity: 100, unit: "pcs", reorderPoint: 20, unitPrice: 0.45, supplier: "Valley Dairy Distributors", branchId },
  { id: `inv-tomato-sauce-${branchId}`, name: "San Marzano Pizza Sauce", quantity: 50, unit: "kg", reorderPoint: 10, unitPrice: 4.50, supplier: "Napolis Import", branchId },
  { id: `inv-moz-cheese-${branchId}`, name: "Fresh Mozzarella Log", quantity: 40, unit: "kg", reorderPoint: 8, unitPrice: 12.00, supplier: "Napolis Import", branchId },
  { id: `inv-dough-${branchId}`, name: "Sourdough Pizza Balls", quantity: 110, unit: "pcs", reorderPoint: 20, unitPrice: 1.20, supplier: "Sweet Oven Bakery", branchId },
  { id: `inv-potatoes-${branchId}`, name: "Idaho Russet Potatoes", quantity: 300, unit: "kg", reorderPoint: 50, unitPrice: 1.10, supplier: "Greens Farm Fresh", branchId },
  { id: `inv-coffee-beans-${branchId}`, name: "Ethiopian Coffee Beans (Medium)", quantity: 25, unit: "kg", reorderPoint: 5, unitPrice: 22.00, supplier: "Roaster Reserve Coffee", branchId },
  { id: `inv-oat-milk-${branchId}`, name: "Organic Oatly Milk Barista", quantity: 60, unit: "liters", reorderPoint: 12, unitPrice: 3.20, supplier: "Beverage Supply Co", branchId },
  { id: `inv-matcha-powder-${branchId}`, name: "Ceremonial Matcha Powder", quantity: 2, unit: "kg", reorderPoint: 0.5, unitPrice: 160.00, supplier: "Zen Tea Imports", branchId },
  { id: `inv-cream-${branchId}`, name: "Heavy Whipping Cream", quantity: 30, unit: "liters", reorderPoint: 8, unitPrice: 4.50, supplier: "Valley Dairy Distributors", branchId },
  { id: `inv-eggs-${branchId}`, name: "Pasture Raised Eggs (Tray of 30)", quantity: 15, unit: "pcs", reorderPoint: 3, unitPrice: 6.50, supplier: "Greens Farm Fresh", branchId },
  { id: `inv-prosciutto-${branchId}`, name: "Prosciutto di Parma Brand", quantity: 12, unit: "kg", reorderPoint: 3, unitPrice: 38.00, supplier: "Napolis Import", branchId },
  { id: `inv-figs-${branchId}`, name: "Black Mission Figs Dried", quantity: 10, unit: "kg", reorderPoint: 2, unitPrice: 18.00, supplier: "Greens Farm Fresh", branchId },
  { id: `inv-truffle-oil-${branchId}`, name: "White Truffle Oil (infused)", quantity: 5, unit: "liters", reorderPoint: 1, unitPrice: 90.00, supplier: "Specialty Chef Pantry", branchId },
  { id: `inv-basil-${branchId}`, name: "Fresh Italian Organic Basil", quantity: 8, unit: "kg", reorderPoint: 2, unitPrice: 15.00, supplier: "Greens Farm Fresh", branchId },
  { id: `inv-arugula-${branchId}`, name: "Fresh Baby Wild Arugula", quantity: 15, unit: "kg", reorderPoint: 3, unitPrice: 11.50, supplier: "Greens Farm Fresh", branchId },
  { id: `inv-jalapeno-${branchId}`, name: "Premium Jalapeño Peppers", quantity: 25, unit: "kg", reorderPoint: 5, unitPrice: 3.20, supplier: "Greens Farm Fresh", branchId }
];
