# Mr. Feast Website Knowledge Base

## Brand
Mr. Feast is a restaurant website focused on Fast Food, Pakistani-style charcoal BBQ, Sweets, Desserts and Special Deals. Main hero message: “Taste That Brings Everyone Together.”

## Menu and current sample prices
Fast Food: Classic Burger Rs.450; Zinger Burger Rs.550; Chicken Pizza Rs.850; Chicken Shawarma Rs.350; Fries Rs.250; Club Sandwich Rs.550.
BBQ: Chicken Tikka Rs.450; Malai Boti Rs.600; Seekh Kebab Rs.550; Chicken Wings Rs.550; BBQ Platters Rs.1,350.
Sweets: Gulab Jamun Rs.220; Rasmalai Rs.280; Kheer Rs.250; Brownies Rs.300.
Desserts: Ice Cream Rs.250; Chocolate Lava Cake Rs.450; Cheesecake Rs.500; Waffles Rs.450; Sundaes Rs.350.

## Deals
Deals are database-managed. Admin can add, edit, delete and replace each deal picture. The public deal grid is centered and responsive so the page structure remains stable as deal count changes.

## Reviews
Reviews are database-managed. Admin can add and remove customer reviews. Only active database reviews are displayed publicly.

## Ordering
Customers add menu items or deals to the cart. Checkout requires customer name, contact number and email address; notes are optional. Orders are saved in PostgreSQL and enter status `queue`. Order cancellation is intentionally not available in this phase. WhatsApp ordering is intentionally removed for now.

Order email notification is supported when Railway variables `ORDER_EMAIL` and `RESEND_API_KEY` are configured. Optional `ORDER_FROM_EMAIL` can define the sender. Without those variables, the order is still stored and visible in Kitchen/Owner dashboards.

## Admin
Private route: `/admin`. Password protected. Password field includes show/hide eye control. Admin manages menu pictures, deals and reviews, and has links to Kitchen and Owner dashboards.

## Kitchen Dashboard
Private route: `/kitchen`. Uses admin login. Shows three operational stages: Order in Queue, Order in Cooking, Order Ready. Operator can move Queue → Cooking → Ready → Completed.

## Owner Dashboard
Private route: `/owner`. Uses admin login. Shows counts for Queue, Cooking, Ready and Completed, item/deal quantity figures across orders, and a separate completed-orders list.

## Contact / business details
Exact address, opening hours, phone and final order email are not yet confirmed in website data and must not be invented.

## Assistant rules
The Mr. Feast Assistant must answer only from information actually present on the website/knowledge base and current database-driven deals. It may explain menu items, sample prices, deals and ordering steps. If requested information is not present, it must say it does not have that information and must not guess, invent, infer or provide unrelated general knowledge.

## Temporarily removed / later phase
WhatsApp functionality is removed for now and may be restored later. Order cancellation is not implemented in the current phase and may be considered later.