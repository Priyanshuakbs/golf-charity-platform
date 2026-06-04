# Quick Responsive Design Reference

## 🎯 TL;DR - What Changed

### Files Modified:
1. ✅ `tailwind.config.js` - Added breakpoints (xs, sm, md, lg, xl, 2xl)
2. ✅ `src/styles/index.css` - Added responsive utilities
3. ✅ `src/pages/Dashboard.jsx` - Fixed 2-col layout → responsive
4. ✅ `src/pages/Home.jsx` - Fixed hardcoded grids → responsive classes
5. ✅ `src/pages/DrawResults.jsx` - Fixed sticky sidebar → responsive

---

## 🚀 How to Build Mobile-First

### DO ✅
```jsx
// Start mobile, enhance for larger screens
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {items}
</div>

// Use clamp() for fluid scaling
<h1 style={{ fontSize: 'clamp(24px, 5vw, 48px)' }}>
  Responsive Heading
</h1>

// Use responsive CSS classes
<style>{`
  .my-grid {
    display: grid;
    grid-template-columns: 1fr;
  }
  @media (min-width: 768px) {
    .my-grid { grid-template-columns: repeat(2, 1fr); }
  }
`}</style>
```

### DON'T ❌
```jsx
// Don't hardcode column counts
<div style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>

// Don't use fixed widths for full-width content
<div style={{ width: '1200px' }}>

// Don't use only md: breakpoint (skip sm:)
<div className="grid md:grid-cols-3">  // Missing sm:

// Don't use inline media queries in styles
<div style={{ '@media (max-width: 768px)': { ... } }}>
```

---

## 📱 Breakpoints Quick Reference

```
Breakpoint | Name | Example Device
-----------|------|----------------
375px      | xs   | iPhone SE
640px      | sm   | iPhone 12/13
768px      | md   | iPad Mini
1024px     | lg   | iPad Pro / Small Laptop
1280px     | xl   | Desktop
1536px     | 2xl  | Large Desktop
```

**Use in Tailwind**: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`

---

## 🎨 Common Responsive Patterns

### Responsive Grid
```jsx
{/* Auto-fit grid - fills width */}
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  
{/* Fixed columns with fallback */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
```

### Responsive Sidebar
```jsx
{/* Mobile: stacked, Desktop: sidebar */}
<div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
  <aside>{/* Sidebar */}</aside>
  <main>{/* Content */}</main>
</div>
```

### Responsive Form
```jsx
{/* Stack on mobile, row on tablet+ */}
<form className="flex flex-col sm:flex-row gap-4">
  <input className="flex-1" />
  <button className="w-full sm:w-auto">Submit</button>
</form>
```

### Responsive Typography
```jsx
{/* Scales 24px → 48px based on viewport */}
<h1 style={{ fontSize: 'clamp(24px, 5vw, 48px)' }}>
  Mobile to Desktop
</h1>
```

---

## ✨ New CSS Utilities

### Responsive Classes (in `index.css`)
```css
.gap-responsive    /* Scales gap 0.5rem → 1.5rem */
.p-responsive      /* Scales padding 1rem → 2rem */
.grid-auto-fit     /* Auto-fit grid minmax(300px, 1fr) */
.flex-col-mobile   /* Column on mobile, row on sm+ */
.text-responsive   /* Scales font 0.875rem → 1rem */
```

### Example Usage
```jsx
<div className="grid grid-auto-fit gap-responsive p-responsive">
  {/* Responsive grid with fluid spacing */}
</div>
```

---

## 🎯 Component Checklist

When creating new components, ensure:

- [ ] Mobile-first (1 column default)
- [ ] Uses Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
- [ ] No hardcoded grid columns
- [ ] Touch targets ≥44px on mobile
- [ ] Text readable at default zoom
- [ ] Forms full-width on mobile
- [ ] Tables have horizontal scroll on mobile
- [ ] Images use proper `max-width` or responsive classes

---

## 🧪 Quick Mobile Test

```bash
# Check on different screen sizes
1. Open DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Test: 375px, 640px, 768px, 1024px, 1280px
4. Check orientation: portrait and landscape
5. Test on real device or emulator
```

---

## 🔗 File Locations

```
frontend/
├── tailwind.config.js .............. Breakpoints & Tailwind config
├── src/
│   ├── styles/
│   │   └── index.css ............... Responsive utilities & classes
│   ├── components/
│   │   └── Navbar.jsx .............. Mobile hamburger menu ✓
│   └── pages/
│       ├── Dashboard.jsx ........... Responsive 2-col layout ✓
│       ├── DrawResults.jsx ......... Responsive sidebar ✓
│       ├── Home.jsx ................ Responsive grids ✓
│       └── admin/
│           └── AdminUsers.jsx ...... Table with horizontal scroll ✓
└── RESPONSIVE_DESIGN_GUIDE.md ...... Full documentation
```

---

## 💡 Tips & Tricks

### Use calc() for complex responsive values
```css
width: calc(100% - clamp(1rem, 5vw, 2rem) * 2);
```

### Container queries (if using modern CSS)
```css
@container (min-width: 400px) {
  /* Styles when container is 400px+ */
}
```

### Safe area insets for notched phones
```jsx
<div className="pt-safe-top pb-safe-bottom px-safe-left pr-safe-right">
  {/* Content with safe area padding */}
</div>
```

### Responsive images
```jsx
<img
  srcSet="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 640px) 100vw, 800px"
  src="large.jpg"
  alt="Responsive"
/>
```

---

## 🐛 Common Issues & Fixes

### Issue: Text too small on mobile
**Fix**: Use `clamp()` for fluid sizing
```jsx
fontSize: 'clamp(14px, 2vw, 18px)'
```

### Issue: Sidebar overlaps content on mobile
**Fix**: Use responsive grid with stacking
```jsx
className="grid grid-cols-1 lg:grid-cols-[250px_1fr]"
```

### Issue: Buttons hard to tap on mobile
**Fix**: Ensure min 44×44px with `py-3 px-4` and full width
```jsx
className="w-full sm:w-auto py-3 px-4"
```

### Issue: Long words break on mobile
**Fix**: Use `break-words` or `overflow-hidden text-ellipsis`
```jsx
className="break-words"
```

---

**Version**: 1.0  
**Last Updated**: June 2026  
**Questions?** Check `RESPONSIVE_DESIGN_GUIDE.md` for detailed docs
