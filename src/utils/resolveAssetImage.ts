import type { ImageMetadata } from "astro";

type AssetModule = { default: string | ImageMetadata };

const assetImages = import.meta.glob<AssetModule>(
  "/src/assets/images/**/*.{png,jpg,jpeg,webp,avif,gif,svg}",
  { eager: true }
);

const assetPathToBuiltUrl = Object.fromEntries(
  Object.entries(assetImages).map(([path, module]) => {
    const value =
      typeof module.default === "string"
        ? module.default
        : module.default.src;

    return [path.replace(/^\/src\/assets\//, "assets/"), value];
  })
);

const normalizeAssetPath = (value: string) => {
  const cleaned = value.replace(/^\.\//, "").replace(/^\//, "");
  const assetsIndex = cleaned.indexOf("assets/");
  return assetsIndex === -1 ? null : cleaned.slice(assetsIndex);
};

export const resolveAssetImage = (image: string | ImageMetadata) => {
  if (typeof image !== "string") {
    return image.src;
  }

  const normalized = normalizeAssetPath(image);
  if (!normalized) {
    return image;
  }

  return assetPathToBuiltUrl[normalized] ?? image;
};
