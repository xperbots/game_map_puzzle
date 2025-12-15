# Changelog

All notable changes to the "PinPin China" project will be documented in this file.

## [0.2.0] - 2025-12-14

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
