import type { ThemeBackgroundConfig } from "@/types";

const PRESET_BACKGROUNDS: Record<string, string> = {
	aurora: "linear-gradient(135deg, #06131e 0%, #112a42 42%, #0b1220 100%)",
	ocean: "linear-gradient(135deg, #0b1f2d 0%, #103e5b 50%, #082032 100%)",
	sunset: "linear-gradient(135deg, #1f1d35 0%, #4c1d95 45%, #fb923c 100%)",
	forest: "linear-gradient(135deg, #051a17 0%, #0d3b33 50%, #0f172a 100%)",
	mist: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 48%, #cbd5e1 100%)",
	violet: "linear-gradient(135deg, #0f172a 0%, #312e81 46%, #4c1d95 100%)",
	glass: "linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)",
	midnight: "linear-gradient(135deg, #020617 0%, #111827 48%, #312e81 100%)",
	sunrise: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fdba74 100%)",
	mint: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #a7f3d0 100%)",
	pearl: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 55%, #dbeafe 100%)",
	apricot: "linear-gradient(135deg, #fff7ed 0%, #fdba74 58%, #fb7185 100%)",
	metal: "linear-gradient(135deg, #111827 0%, #374151 45%, #a78bfa 100%)",
	candy: "linear-gradient(135deg, #fdf2f8 0%, #dbeafe 52%, #c4b5fd 100%)",
	garden: "linear-gradient(135deg, #052e16 0%, #166534 50%, #14532d 100%)",
	nebula: "linear-gradient(135deg, #111827 0%, #312e81 50%, #7c3aed 100%)",
	glacier: "linear-gradient(135deg, #ecfeff 0%, #dbeafe 42%, #93c5fd 100%)",
	rose: "linear-gradient(135deg, #fff1f2 0%, #fbcfe8 52%, #fb7185 100%)",
	sapphire: "linear-gradient(135deg, #020617 0%, #164e63 52%, #0ea5e9 100%)",
	terracotta: "linear-gradient(135deg, #431407 0%, #9a3412 55%, #fed7aa 100%)",
	jade: "linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #99f6e4 100%)",
	linen: "linear-gradient(135deg, #fafaf9 0%, #e7e5e4 50%, #d6d3d1 100%)",
	coral: "linear-gradient(135deg, #164e63 0%, #0e7490 52%, #fb7185 100%)",
	ink: "linear-gradient(135deg, #171717 0%, #44403c 48%, #a8a29e 100%)",
	lavender: "linear-gradient(135deg, #faf5ff 0%, #ddd6fe 50%, #a78bfa 100%)",
	copper: "linear-gradient(135deg, #292524 0%, #92400e 45%, #fbbf24 100%)",
	lagoon: "linear-gradient(135deg, #042f2e 0%, #0891b2 45%, #bae6fd 100%)",
	boreal: "linear-gradient(135deg, #082f49 0%, #0f766e 50%, #164e63 100%)",
	sandstone: "linear-gradient(135deg, #fffbeb 0%, #fde68a 52%, #d97706 100%)",
	evergreen: "linear-gradient(135deg, #052e16 0%, #14532d 46%, #064e3b 100%)",
	"paper-blue": "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 48%, #94a3b8 100%)",
	"coral-dawn": "linear-gradient(135deg, #7c2d12 0%, #ea580c 45%, #fb7185 100%)",
	"ember-sky": "linear-gradient(135deg, #450a0a 0%, #c2410c 42%, #f97316 100%)",
	"orchid-night": "linear-gradient(135deg, #18181b 0%, #581c87 45%, #0e7490 100%)",
};

export function resolveThemeBackgroundValue(background?: ThemeBackgroundConfig): string {
	if (!background || background.mode === "none") return "none";
	if (background.mode === "upload" && background.image) return `url("${background.image}")`;
	if (background.mode === "gradient" && background.gradient) return background.gradient;
	if (background.mode === "solid" && background.solidColor) return "none";
	if (background.mode === "preset" && background.presetId) {
		return PRESET_BACKGROUNDS[background.presetId] ?? "none";
	}
	return "none";
}
