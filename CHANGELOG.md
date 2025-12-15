# Changelog

All notable changes to the "PinPin China" project will be documented in this file.

## [0.3.0] - 2025-12-14

### Added
- **Level 2 Hard Mode**: New gameplay scene "Magnetic Map (Hard)".
    - **No Borders**: Map background shows only the outer silhouette of China.
    - **Precision Snap**: Pieces require precise placement (<15% distance deviation) to snap.
    - **Conditional Labels**: Labels are hidden by default, appearing only after successful snap (except Municipality/SAR).
- **Transition System**: Implemented `TransitionScene` for smooth visual progression between levels (Celebration -> Fade Out -> Title Card).
- **Layering Strategy**: Established strict Z-index rules (Background -100, Map -1, Pieces 0+) to ensure visibility.

### Changed
- **Feedback Mechanics**: Refined `MapPiece` to support difficulty modes. In Hard Mode, "Yellow Tint" and specific visual hints are disabled during drag to increase difficulty, while keeping tactile feedback (Sound/Scale).
- **Snap Logic**: Migrated from simple bounding box overlap to **Euclidean Distance** check for more reliable snapping of irregular shapes.

### Fixed
- **Map Occlusion**: Fixed an issue where the map outline was occluded by the background by adjusting depth layers.
- **Snap Bug**: Resolved a regression where `ids-dropped` event was not emitted in Hard Mode, preventing snapping.
- **Red Flag Visibility**: Fixed an issue where the red flag texture would not appear due to tint not being reset to white.



### Added
- **Flag Completion Effect**: Level 1 now features a "Red Flag" completion mechanic. Snapped pieces reveal a portion of the Five-Star Red Flag, creating a unified visual upon completion.
- **Procedural Flag Generation**: `MapTextureGenerator` now dynamically generates flag textures aligned to the specific map content bounds of China.
- **Short Name Labels**: Implemented smart labelling logic. Most provinces use 2-character abbreviations (e.g., "新疆", "香港"), with "黑龙江" and "内蒙古" retaining full names.
- **High-Visibility Labels**: Labels are now rendered on a dedicated high-priority Scene Layer (Z-index 2000), ensuring they are never obscured by map pieces.

### Changed
- **Visual Style**: Updated the game color palette to "Soft Pastel" tones for a more modern and pleasant aesthetic.
- **Map Interaction**: Snapped pieces now lose their 3D depth and become flat, seamlessly integrating into the background flag.
- **Flag Alignment**: Calibrated flag star positions to align perfectly with the Xinjiang/Gansu region based on geographic content bounds.

### Fixed
- **Snap Feedback Bug**: Fixed an issue where manually snapped pieces would display a yellow "failure" tint instead of the correct red flag texture.
- **Label Overlap**: Solved issues where large pieces (like Inner Mongolia) would cover the labels of adjacent smaller pieces.

## [0.1.0] - 2025-12-13
### Added
- **Level 1 Core Gameplay**: "Magnetic Map" mechanics with drag-and-drop snapping.
- **Map Data Pipeline**: Tools to convert GeoJSON to optimized GameJSON.
- **Core Architecture**: `GameScene`, `MapPiece`, `MapSlot` implementation details.
- **Procedural Texture Generation**: Initial implementation of 3D extruded shapes for provinces.
