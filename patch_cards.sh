for file in src/components/FeelsLikeCard.tsx src/components/HumidityCard.tsx src/components/PressureCard.tsx src/components/UVCard.tsx src/components/VisibilityCard.tsx src/components/WindCard.tsx; do
  # We extract the title and icon element
  TITLE=$(grep "type-card-title" "$file" | sed -E 's/.*>([^<]+)<\/span>.*/\1/')
  ICON_TAG=$(grep "<[A-Z].*strokeWidth={1.5}" "$file" | head -n 1 | sed -E 's/.*<([A-Z][a-zA-Z0-9]+).*/\1/')
  
  # Wait, it's easier to just use sed to replace the header block
  sed -i -z -E 's|<div className="flex items-center justify-between mb-2">\s*<span className="type-card-title[^"]*">([^<]+)</span>\s*<([A-Z][a-zA-Z0-9]+) className="w-[0-9] h-[0-9] text-slate-400" strokeWidth=\{1\.5\} />\s*</div>|<div className="flex items-center space-x-1.5 mb-3">\n        <\2 className="w-[18px] h-[18px] text-slate-300" strokeWidth={1.5} />\n        <span className="type-card-title text-[14px] font-medium text-white">\1</span>\n      </div>|g' "$file"
done
