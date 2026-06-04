const hexToRgb = hex =>
  hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16));

// We'll use a very simple script if chroma-js isn't there, but it's easier to just use oklch in CSS directly using modern CSS features if possible, OR we just eyeball the oklch, but it's better to just write the hex code since Tailwind supports hex variables!
// Wait! Tailwind v4 with CSS variables can just take the hex color if we define it without oklch, OR we can just use the hex!
// But wait, the standard shadcn CSS variables are expected to be in oklch(l c h) format without the `oklch` function wrapper in older versions, but here it's `oklch(0.75 0.13 156)`.
console.log("ready");
