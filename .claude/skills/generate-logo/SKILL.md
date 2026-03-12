---
name: generate-logo
description: Generate professional logos using Nano Banana Pro. Use when the user asks to create a logo, make a logo, design a logo, generate branding, create an app icon, or needs visual identity for a project.
---

# Generate Logo Skill

Create professional logos and brand marks using Nano Banana Pro (Gemini Pro image model).

## Quick Start

```bash
# Simple logo generation
nano-banana generate "minimalist logo for a coffee shop called Bean There, modern, clean lines" --pro -o logo.png

# App icon style
nano-banana generate "app icon for a fitness tracking app, gradient purple to blue, simple geometric shape" --pro -o icon.png

# Wordmark logo
nano-banana generate "wordmark logo for tech startup called 'Nexus', futuristic font, clean white background" --pro -o wordmark.png
```

## How to Use

When user requests a logo:

### 1. Gather Requirements

Ask about:
- **Company/product name** (if text needed in logo)
- **Industry/purpose** (tech, food, fitness, etc.)
- **Style preference** (minimalist, playful, corporate, vintage)
- **Color preferences** (or let AI decide)
- **Type** (icon only, wordmark, combination mark)
- **Background** (transparent, white, colored)

### 2. Craft the Prompt

Build a detailed prompt with:

```
[TYPE] logo for [NAME/PURPOSE], [STYLE KEYWORDS], [COLORS], [BACKGROUND], professional quality, vector-style, suitable for branding
```

### 3. Generate with Pro Model

Always use `--pro` for logos - quality matters for branding:

```bash
nano-banana generate "YOUR_PROMPT" --pro -o logo.png
```

## Prompt Templates

### Minimalist Tech Logo
```
minimalist logo for [COMPANY], clean geometric shapes,
modern tech aesthetic, [COLOR] accent on white background,
professional, scalable, vector-style
```

### Playful Startup Logo
```
friendly approachable logo for [COMPANY], rounded shapes,
vibrant [COLORS], modern playful style, suitable for app icon,
clean white background
```

### Corporate Professional Logo
```
professional corporate logo for [COMPANY], elegant typography,
[INDUSTRY] industry, sophisticated [COLOR] palette,
clean minimal design, white background
```

### Vintage/Retro Logo
```
vintage style logo for [COMPANY], retro aesthetic,
hand-crafted feel, [ERA] inspired, warm [COLORS],
badge or emblem style
```

### Abstract Symbol Logo
```
abstract symbol logo representing [CONCEPT],
geometric minimalist style, [COLORS],
no text, iconic memorable shape, white background
```

## Examples

**User:** "Create a logo for my app called TaskFlow"
```bash
nano-banana generate "minimalist app logo for TaskFlow, flowing abstract checkmark shape, gradient blue to teal, clean modern style, suitable for app icon, white background" --pro -o taskflow-logo.png
```

**User:** "I need a logo for a bakery called Sweet Rise"
```bash
nano-banana generate "warm friendly logo for Sweet Rise bakery, rising sun or wheat motif, golden yellow and warm brown colors, slightly vintage artisan feel, clean cream background" --pro -o sweetrise-logo.png
```

**User:** "Make me a logo for a dev tool"
```bash
nano-banana generate "developer tool logo, abstract code brackets forming geometric shape, electric blue and dark gray, minimalist tech aesthetic, monospace-inspired, white background" --pro -o devtool-logo.png
```

## Pro Tips

1. **Always use --pro** - Logos need high quality
2. **Request white/transparent backgrounds** - Easier to use in different contexts
3. **Include "vector-style"** - Gets cleaner, more scalable results
4. **Generate multiple variations** - Run 2-3 times with slight prompt tweaks
5. **Be specific about style** - "minimalist modern" beats "cool looking"
6. **Mention the use case** - "suitable for app icon" or "works at small sizes"

## Common Style Keywords

| Category | Keywords |
|----------|----------|
| Modern | minimalist, clean, geometric, sleek, contemporary |
| Friendly | playful, rounded, approachable, warm, inviting |
| Corporate | professional, elegant, sophisticated, refined |
| Tech | futuristic, digital, abstract, innovative |
| Vintage | retro, classic, artisan, handcrafted, nostalgic |
| Bold | strong, impactful, dynamic, powerful |

## Output

After generation:
1. Display the logo using the media block
2. Offer to generate variations if needed
3. Suggest next steps (icon sizes, favicon, etc.)

```media
src: ./logo.png
caption: Generated logo for [PROJECT]
```

## Limitations

- Text rendering in logos can be hit or miss - simple wordmarks work best
- Very detailed/complex logos may not generate well - keep it simple
- Colors may vary slightly - provide specific hex codes in prompt if critical
- No true vector output - result is PNG, would need vectorization for print
