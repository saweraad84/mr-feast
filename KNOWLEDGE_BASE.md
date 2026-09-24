# Mr. Feast Website Knowledge Base

## Brand
Mr. Feast is a restaurant focused on Fast Food, Pakistani-style charcoal BBQ, Sweets, Desserts and Special Deals. Main hero message: “Taste That Brings Everyone Together.”

## Menu
Current menu includes burgers, pizza, shawarma, fries, sandwiches, charcoal BBQ, sweets and desserts. Menu prices and temporary availability are controlled from Main Admin. The assistant must treat the live menu catalog as the source of truth and must not offer an item that is disabled.

## Deals and reviews
Deals and reviews are database-managed from Main Admin. Only active deals and active reviews are shown publicly.

## Ordering
Customers can order for Pickup or Delivery when each option is enabled. The cart clearly shows delivery charge, minimum order, available payment methods and estimated service time. Delivery requires an address. Prices and totals are recalculated by the server from the current live catalog.

After an order is accepted, the customer receives an order number and a secure order-status link. Order statuses are Queue, Cooking, Ready, Completed or Cancelled. The assistant may look up an order when the customer provides the order number and the same email address used at checkout. The assistant must ask for explicit confirmation before placing an order.

## Reservations
Reservations use live table availability. Date, party size, duration and the configured table-reset buffer determine which start times are offered. Customer-facing start times use the configured slot interval, normally 15 minutes.

A new reservation is created with status Pending, not Confirmed. The customer receives a secure management link by email and may view the fields enabled by Main Admin. Customer cancellation through that secure link is available only when Main Admin allows it and the reservation is still Pending or Confirmed. The assistant must ask for explicit confirmation before creating a reservation.

## Restaurant availability
Main Admin can temporarily close Mr. Feast. When closed, customer ordering and reservations are unavailable and the public website displays “Temporarily Closed” with the configured reason when present.

## Contact / business details
Business name: Mr. Feast.
Address currently shown on the website: Street No. 03, Sector-E, Akhter Colony, Mr. Feast, Karachi.
Phone / WhatsApp currently shown on the website: +92 300 2010546.
Contact details, map query, displayed timings, hero content and trust information are configurable from Main Admin. The assistant should use live site configuration for current details rather than inventing them.

## Admin and dashboards
Main Admin: /admin
Reservation Admin: /reservation-admin.html
Reservation Calendar: /reservations-calendar.html
Kitchen Dashboard: /kitchen
Owner Dashboard: /owner

Main Admin controls restaurant open/close state, menu availability and prices, menu pictures, deals, delivery and checkout settings, reservation capacity/schedule/slot duration/buffer, reservation email settings, secure customer-link permissions, reviews, hero content, contact details/map and website analytics.

## Assistant rules
Answer only from live website configuration, live menu/deals, reservation availability, order lookup results and this knowledge base. Never invent prices, availability, hours, policies or customer/order information. Require explicit customer confirmation before creating an order or reservation.
