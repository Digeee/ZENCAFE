# ZEN CAFE Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from Airbnb's warmth and elegance, combined with Shopify's clean e-commerce patterns and Notion's sophisticated minimalism. The design embodies Sri Lankan tea culture through subtle visual cues while maintaining modern refinement.

## Core Design Principles
- **Serene Minimalism**: Breathing room between elements creates a calm, focused browsing experience
- **Cultural Subtlety**: Ceylon-inspired aesthetics through imagery and product presentation, not overt decoration
- **Effortless Navigation**: Clear hierarchy guides customers from discovery to checkout seamlessly
- **Warmth & Elegance**: Inviting yet refined, like stepping into a premium tea house

## Typography System

**Primary Font**: Inter or DM Sans (clean, modern sans-serif via Google Fonts)
**Accent Font**: Playfair Display or Cormorant (elegant serif for headings and product names)

**Hierarchy**:
- Hero Headlines: 4xl to 6xl (Accent font, medium weight)
- Section Headings: 3xl to 4xl (Accent font, medium weight)
- Subsections: xl to 2xl (Primary font, semibold)
- Product Titles: lg to xl (Accent font, medium)
- Body Text: base (Primary font, regular)
- Captions/Labels: sm (Primary font, medium)
- Navigation: sm to base (Primary font, medium)

## Layout System

**Spacing**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, and 24 for consistent rhythm
- Section padding: py-16 to py-24
- Component spacing: gap-6 to gap-8
- Element padding: p-4 to p-6
- Micro spacing: space-y-2, space-y-4

**Container Widths**:
- Full sections: w-full with max-w-7xl inner container
- Content sections: max-w-6xl
- Product grids: max-w-7xl
- Forms/Cart: max-w-2xl

**Grid Systems**:
- Product Cards: 1 column mobile, 2 columns tablet (md:), 3-4 columns desktop (lg:)
- Feature Sections: 2-3 columns on desktop, single column mobile
- Order History: Single column with card layout

## Component Library

### Navigation
**Main Header**: 
- Sticky navigation with backdrop blur
- Logo left, main nav center (Home, Menu, About, Contact)
- Right side: Search icon, Account icon, Cart badge with item count
- Mobile: Hamburger menu with slide-in drawer
- Height: h-16 to h-20

**Footer**:
- Four column layout desktop (About, Quick Links, Contact, Newsletter)
- Social media icons
- Store hours and location
- Newsletter signup with inline form
- Copyright and legal links
- Dark background section

### Hero Section
**Homepage Hero**:
- Full-width image showcasing Ceylon tea gardens or coffee preparation (80vh height)
- Centered overlay with headline and subheadline
- Primary CTA button with blurred background (backdrop-blur-md)
- Subtle gradient overlay for text legibility

### Product Components
**Product Card**:
- Square image with hover scale effect (transform scale-105)
- Product name (Accent font)
- Short description (2 lines max)
- Price (bold, prominent)
- "Add to Cart" button on hover/always visible on mobile
- Category badge (subtle, top-right corner)

**Product Detail Page**:
- Two-column layout (image left, details right) on desktop
- Large product image with thumbnail gallery
- Product name, description, price, origin story
- Quantity selector with + - buttons
- Add to Cart primary button
- Brewing suggestions or tasting notes

### Cart & Checkout
**Cart Drawer**:
- Slide-in from right side
- Item list with thumbnails, quantities, remove option
- Subtotal calculation
- Primary "Checkout" button
- Secondary "Continue Shopping" link

**Checkout Form**:
- Single page layout with clear steps
- Sections: Contact Info, Delivery Address, Order Review
- Form fields with floating labels
- Order summary sidebar (sticky on desktop)
- Place Order primary button

### Dashboard Components
**Customer Dashboard**:
- Sidebar navigation (Orders, Profile, Settings)
- Order cards with status badges (Pending/Processing/Completed)
- Order details expandable accordion
- Clean table layout for order items

**Admin Dashboard**:
- Sidebar with sections (Products, Orders, Messages, Analytics)
- Product management table with inline edit
- Order management with status dropdown
- Simple metrics cards (Total Orders, Revenue, Products)

### Forms
**Input Fields**:
- Border-bottom style initially, full border on focus
- Floating labels
- Clear error states with red border and helper text
- Success states with green checkmark

**Buttons**:
- Primary: Medium size with rounded corners (rounded-lg), semibold text
- Secondary: Outline style with transparent background
- Text buttons for tertiary actions
- On images: backdrop-blur-md with semi-transparent white/dark background

### Contact Section
**Contact Page**:
- Two-column layout (form left, info right)
- Form fields: Name, Email, Phone, Message
- Right column: Store location, hours, phone, email
- Optional: Embedded map placeholder
- Success message after submission

## Page Layouts

### Homepage
1. **Hero Section** (80vh): Full-width image with Ceylon tea estate or coffee brewing, centered headline "Discover Ceylon's Finest Coffee & Tea", CTA "Explore Menu"
2. **Featured Products**: 3-column grid showcasing bestsellers with "Shop Now" links
3. **About Section**: Two-column layout with image and story about Sri Lankan sourcing
4. **Categories**: 3 cards (Coffee, Tea, Pastries) with imagery and links
5. **Testimonials**: 2-3 customer quotes in elegant cards
6. **Newsletter Signup**: Full-width section with centered form

### Menu Page
- Category filter tabs at top (All, Coffee, Tea, Pastries)
- Search bar (right-aligned)
- Product grid: 3-4 columns desktop, responsive
- Load more or pagination at bottom

### Product Detail Page
- Breadcrumb navigation
- Two-column layout with large image gallery
- Product information and add to cart
- Related products section below

## Images

**Hero Images**:
- Homepage: Aerial view of Ceylon tea plantations with morning mist
- Menu Page: Close-up of coffee beans or tea leaves with shallow depth of field
- About Page: Tea picker in traditional attire (authentic, respectful)

**Product Images**:
- High-quality product photography on neutral backgrounds
- Lifestyle shots showing brewing process for detail pages
- Consistent lighting and styling across all product shots

**Category Images**:
- Coffee: Fresh coffee beans with brewing equipment
- Tea: Loose leaf tea with traditional Ceylon teacup
- Pastries: Freshly baked goods with coffee/tea pairing

**Background Images**:
- Subtle texture overlays (tea leaf patterns, minimal)
- Avoid busy backgrounds that compete with content

## Responsive Breakpoints
- Mobile: base (< 768px) - single column, stacked layouts
- Tablet: md (768px - 1024px) - 2 columns where appropriate
- Desktop: lg (1024px+) - full grid layouts, sidebars visible

## Accessibility
- Maintain 4.5:1 contrast ratio for all text
- Focus states with visible outlines (ring-2)
- Keyboard navigation support for all interactive elements
- Form labels always visible
- Alt text for all product images
- Loading states with skeleton screens

## Animations
Use sparingly and purposefully:
- Page transitions: Simple fade-in
- Product cards: Hover scale (scale-105) with smooth transition
- Cart drawer: Slide-in from right
- Button interactions: Built-in hover/active states
- Image loading: Fade-in once loaded
- No scroll-triggered animations to maintain performance

## Visual Refinements
- Subtle shadows on cards (shadow-sm to shadow-md)
- Rounded corners on cards and buttons (rounded-lg to rounded-xl)
- Dividers between sections using thin lines or spacing
- Badge elements for sale/new items using pill shapes
- Icons from Heroicons for consistent style throughout